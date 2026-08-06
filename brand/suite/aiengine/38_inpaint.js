/* ═══════════ Vastrangam AI Engine — inpainting engine (watermark eraser) ═══════════
   These six algorithms are the user's own, ported verbatim from their
   Vastrangam_Image_Studio_Pro.html so nothing they already had is lost. v2 shipped an
   Image Studio with none of this in it, which was a straight downgrade.

   PatchMatch carries their anti-bleed fix (bi-modal cluster detection stops a saree
   edge bleeding into a wall), and Telea is the classic fast-marching fill. Both are
   real implementations that run offline on the canvas — no model, no network.

   VINPAINT.run(imageData, mask, W, H, algo, radius, onProgress) → Promise */
var VINPAINT = (function () {
  'use strict';
  var progressCB = null;
  function showProgress(pct) { if (progressCB) { try { progressCB(pct); } catch (e) {} } }

async function inpaintPatchMatch(imgData, mask, W, H, radius) {
  const data = imgData.data;
  const m = new Uint8Array(mask);

  // Step 1: distance transform from known pixels (so we process edges first)
  const dist = new Float32Array(W * H);
  for (let i = 0; i < m.length; i++) dist[i] = m[i] ? 1e9 : 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!m[i]) continue;
      let d = dist[i];
      if (x > 0)              d = Math.min(d, dist[i-1] + 1);
      if (y > 0)              d = Math.min(d, dist[i-W] + 1);
      if (x > 0 && y > 0)     d = Math.min(d, dist[i-W-1] + 1.41);
      if (x < W-1 && y > 0)   d = Math.min(d, dist[i-W+1] + 1.41);
      dist[i] = d;
    }
  }
  for (let y = H-1; y >= 0; y--) {
    for (let x = W-1; x >= 0; x--) {
      const i = y * W + x;
      if (!m[i]) continue;
      let d = dist[i];
      if (x < W-1)               d = Math.min(d, dist[i+1] + 1);
      if (y < H-1)               d = Math.min(d, dist[i+W] + 1);
      if (x < W-1 && y < H-1)    d = Math.min(d, dist[i+W+1] + 1.41);
      if (x > 0   && y < H-1)    d = Math.min(d, dist[i+W-1] + 1.41);
      dist[i] = d;
    }
  }

  // Step 2: sort masked pixels by distance ASC (process boundary first)
  const px = [];
  for (let i = 0; i < m.length; i++) if (m[i]) px.push(i);
  px.sort((a,b) => dist[a] - dist[b]);

  const total = px.length;
  let lastReport = 0;

  // Patch-context size for matching (small but meaningful)
  const ctxR = Math.max(2, Math.floor(radius / 3));
  // Search window — bigger = better match, slower
  const searchR = Math.min(Math.max(radius * 4, 30), Math.min(W, H));

  // Pre-compute mask-known positions in concentric rings around each pixel
  // We'll do nearest-neighbor patch search in a window for speed

  for (let k = 0; k < total; k++) {
    const i = px[k];
    const x = i % W, y = (i / W) | 0;

    // Build the "known context" descriptor: average color in unmasked
    // pixels of a small ring around (x,y)
    // ANTI-BLEED FIX: collect samples, find dominant cluster, drop outliers
    // This prevents bleeding (e.g.) yellow saree pixels into a wall background
    // when the brush is near a strong color boundary.
    const sampR = [], sampG = [], sampB = [];
    for (let dy = -ctxR; dy <= ctxR; dy++) {
      for (let dx = -ctxR; dx <= ctxR; dx++) {
        const xx = x+dx, yy = y+dy;
        if (xx < 0 || xx >= W || yy < 0 || yy >= H) continue;
        const j = yy*W + xx;
        if (m[j]) continue;  // still masked
        const p = j*4;
        sampR.push(data[p]); sampG.push(data[p+1]); sampB.push(data[p+2]);
      }
    }
    let cR=0, cG=0, cB=0, cn=sampR.length;
    if (cn > 0) {
      // First pass: simple mean
      for (let s = 0; s < cn; s++) { cR += sampR[s]; cG += sampG[s]; cB += sampB[s]; }
      const meanR = cR/cn, meanG = cG/cn, meanB = cB/cn;

      // Bi-modal detection: if any sample is >50 dist from mean, we likely have
      // two clusters (e.g. wall + saree edge). Drop the cluster that's smaller.
      let nearR=0, nearG=0, nearB=0, nearN=0;
      let farR=0, farG=0, farB=0, farN=0;
      const SPLIT2 = 2500;  // 50²
      for (let s = 0; s < cn; s++) {
        const dr = sampR[s]-meanR, dg = sampG[s]-meanG, db = sampB[s]-meanB;
        const d2 = dr*dr + dg*dg + db*db;
        if (d2 < SPLIT2) {
          nearR += sampR[s]; nearG += sampG[s]; nearB += sampB[s]; nearN++;
        } else {
          farR += sampR[s]; farG += sampG[s]; farB += sampB[s]; farN++;
        }
      }
      // If outliers exist AND majority cluster is clear (60%+), use only majority
      if (farN > 0 && nearN >= cn * 0.6) {
        cR = nearR; cG = nearG; cB = nearB; cn = nearN;
      }
      // Otherwise stick with the simple mean (already in cR/cG/cB)
    }

    if (cn === 0) {
      // Fallback: use any nearby known pixel
      for (let r = ctxR+1; r <= searchR && cn === 0; r += 2) {
        for (let dy = -r; dy <= r && cn === 0; dy += 2) {
          for (let dx = -r; dx <= r && cn === 0; dx += 2) {
            const xx = x+dx, yy = y+dy;
            if (xx < 0 || xx >= W || yy < 0 || yy >= H) continue;
            const j = yy*W + xx;
            if (m[j]) continue;
            const p = j*4;
            cR = data[p]; cG = data[p+1]; cB = data[p+2]; cn = 1;
          }
        }
      }
    }

    if (cn === 0) continue;
    const tR = cR/cn, tG = cG/cn, tB = cB/cn;

    // Search in a window for best-matching patch — score by combined
    // (a) similarity of patch context to our known context, (b) distance penalty
    let best = null, bestScore = Infinity;
    const sx0 = Math.max(0, x - searchR);
    const sx1 = Math.min(W-1, x + searchR);
    const sy0 = Math.max(0, y - searchR);
    const sy1 = Math.min(H-1, y + searchR);
    // Sample candidate patches at a stride for speed
    const stride = Math.max(2, Math.floor(searchR / 25));

    for (let cy = sy0; cy <= sy1; cy += stride) {
      for (let cx = sx0; cx <= sx1; cx += stride) {
        const j = cy*W + cx;
        if (m[j]) continue;  // candidate must itself be known

        // Compare candidate's context to our context (small ring of known px)
        let sR=0, sG=0, sB=0, sn=0;
        for (let dy = -ctxR; dy <= ctxR; dy++) {
          for (let dx = -ctxR; dx <= ctxR; dx++) {
            const xx = cx+dx, yy = cy+dy;
            if (xx < 0 || xx >= W || yy < 0 || yy >= H) continue;
            const jj = yy*W + xx;
            if (m[jj]) continue;
            const p = jj*4;
            sR += data[p]; sG += data[p+1]; sB += data[p+2]; sn++;
          }
        }
        if (sn === 0) continue;
        const ssR = sR/sn, ssG = sG/sn, ssB = sB/sn;

        const dR = ssR - tR, dG = ssG - tG, dB = ssB - tB;
        const colorDiff = dR*dR + dG*dG + dB*dB;

        // Distance penalty (prefer nearby matches, but don't over-weight)
        const ddx = cx - x, ddy = cy - y;
        const distSq = ddx*ddx + ddy*ddy;
        const distPenalty = distSq * 0.02;

        const score = colorDiff + distPenalty;
        if (score < bestScore) {
          bestScore = score;
          best = j;
          // Early termination: if score is very low, stop searching
          if (bestScore < 100) break;
        }
      }
      if (best !== null && bestScore < 100) break;
    }

    if (best !== null) {
      const sp = best * 4;
      const dp = i * 4;
      data[dp]   = data[sp];
      data[dp+1] = data[sp+1];
      data[dp+2] = data[sp+2];
      data[dp+3] = 255;
      m[i] = 0;  // mark known so subsequent pixels can use it
    } else {
      // Fallback to context average
      const dp = i * 4;
      data[dp]   = tR | 0;
      data[dp+1] = tG | 0;
      data[dp+2] = tB | 0;
      data[dp+3] = 255;
      m[i] = 0;
    }

    // Yield occasionally
    if (k % 500 === 0) {
      const pct = 5 + Math.round(85 * k / total);
      if (pct - lastReport >= 4) { lastReport = pct; showProgress(pct); await new Promise(r=>setTimeout(r,0)); }
    }
  }

  // Final pass: smooth the seams VERY lightly only on previously-masked pixels
  // so we don't lose source quality elsewhere
  showProgress(92);
  await new Promise(r=>setTimeout(r,0));
  smoothMaskedPixels(data, mask, W, H, 1);
  showProgress(100);
}


/* ----- Smart Background Fill ------------------------------------------------
 * Optimized for catalog/product images with clean borders and solid background
 * areas (cream borders, plain walls, solid fabric panels).
 *
 * Strategy:
 *   1. For each masked pixel, sample a TIGHT ring of immediate neighbors
 *      (only 4-8px around the brush stroke) — never pulls from far away
 *   2. Filter out outliers: only use neighbor pixels whose colors are within
 *      a tight cluster (similar hues) — discards mixed-color zones
 *   3. Use median-color filling (more stable than mean) + tiny noise
 *   4. Final 2-px Gaussian blur on the seam line for invisible blending
 *
 * Result: clean, consistent fill that perfectly matches the surrounding
 * solid color. Won't smudge dark photo edges into cream borders.
 *
 * v2 — OPTIMIZED for speed (5-10× faster than v1):
 *   - No sort/median (was the bottleneck — 3 sorts per pixel)
 *   - Single-pass mean computation
 *   - Typed arrays instead of allocating sample arrays per pixel
 *   - Yield every 200 pixels (was 1000) for responsive UI
 *   - Cap samples at first 12 found
 *   - Skip outlier filter when sample count is low
 */
async function inpaintSmartBgFill(imgData, mask, W, H, radius) {
  const data = imgData.data;
  const m = new Uint8Array(mask);
  const N = W * H;

  // 1) Distance-from-known transform (chamfer, two passes)
  const dist = new Float32Array(N);
  for (let i = 0; i < N; i++) dist[i] = m[i] ? 1e9 : 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!m[i]) continue;
      let d = dist[i];
      if (x > 0)            d = Math.min(d, dist[i-1] + 1);
      if (y > 0)            d = Math.min(d, dist[i-W] + 1);
      if (x > 0 && y > 0)   d = Math.min(d, dist[i-W-1] + 1.41);
      if (x < W-1 && y > 0) d = Math.min(d, dist[i-W+1] + 1.41);
      dist[i] = d;
    }
  }
  for (let y = H-1; y >= 0; y--) {
    for (let x = W-1; x >= 0; x--) {
      const i = y * W + x;
      if (!m[i]) continue;
      let d = dist[i];
      if (x < W-1)             d = Math.min(d, dist[i+1] + 1);
      if (y < H-1)             d = Math.min(d, dist[i+W] + 1);
      if (x < W-1 && y < H-1)  d = Math.min(d, dist[i+W+1] + 1.41);
      if (x > 0   && y < H-1)  d = Math.min(d, dist[i+W-1] + 1.41);
      dist[i] = d;
    }
  }

  // 2) Sort masked pixels by distance ascending (boundary first)
  const px = [];
  for (let i = 0; i < N; i++) if (m[i]) px.push(i);
  px.sort((a, b) => dist[a] - dist[b]);

  // 3) Pre-allocated sample buffers (reused per pixel — no GC pressure)
  const MAX_SAMPLES = 12;
  const sR = new Uint8Array(MAX_SAMPLES);
  const sG = new Uint8Array(MAX_SAMPLES);
  const sB = new Uint8Array(MAX_SAMPLES);

  const total = px.length;
  let lastReport = 0;

  // Process pixels in distance order. ~5-10× faster than v1.
  for (let k = 0; k < total; k++) {
    const i = px[k];
    const x = i % W, y = (i / W) | 0;

    // Collect up to 12 unmasked-neighbor colors from rings around (x,y)
    let nS = 0;
    ringLoop:
    for (let r = 1; r <= 4; r++) {
      // Walk perimeter of ring at radius r (8r points max)
      // Top edge
      let yy = y - r;
      if (yy >= 0 && yy < H) {
        for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= W) continue;
          const j = yy * W + xx;
          if (m[j]) continue;
          const p = j * 4;
          sR[nS] = data[p]; sG[nS] = data[p+1]; sB[nS] = data[p+2];
          if (++nS >= MAX_SAMPLES) break ringLoop;
        }
      }
      // Bottom edge
      yy = y + r;
      if (yy >= 0 && yy < H) {
        for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= W) continue;
          const j = yy * W + xx;
          if (m[j]) continue;
          const p = j * 4;
          sR[nS] = data[p]; sG[nS] = data[p+1]; sB[nS] = data[p+2];
          if (++nS >= MAX_SAMPLES) break ringLoop;
        }
      }
      // Left + right edges (excluding corners already covered)
      for (let dy = -r + 1; dy <= r - 1; dy++) {
        yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        // Left
        let xx = x - r;
        if (xx >= 0 && xx < W) {
          const j = yy * W + xx;
          if (!m[j]) {
            const p = j * 4;
            sR[nS] = data[p]; sG[nS] = data[p+1]; sB[nS] = data[p+2];
            if (++nS >= MAX_SAMPLES) break ringLoop;
          }
        }
        // Right
        xx = x + r;
        if (xx >= 0 && xx < W) {
          const j = yy * W + xx;
          if (!m[j]) {
            const p = j * 4;
            sR[nS] = data[p]; sG[nS] = data[p+1]; sB[nS] = data[p+2];
            if (++nS >= MAX_SAMPLES) break ringLoop;
          }
        }
      }
      if (nS >= 6) break;  // good enough — stop expanding
    }

    if (nS === 0) continue;  // surrounded by mask, fill later

    // Single-pass mean
    let mR = 0, mG = 0, mB = 0;
    for (let s = 0; s < nS; s++) { mR += sR[s]; mG += sG[s]; mB += sB[s]; }
    mR /= nS; mG /= nS; mB /= nS;

    // Outlier filter: drop samples >40 from mean, recompute mean
    // (only if we have enough samples to make filtering worthwhile)
    let fR = mR, fG = mG, fB = mB;
    if (nS >= 4) {
      let aR = 0, aG = 0, aB = 0, aN = 0;
      const TOL2 = 1600;  // ~40²
      for (let s = 0; s < nS; s++) {
        const dr = sR[s] - mR, dg = sG[s] - mG, db = sB[s] - mB;
        if (dr*dr + dg*dg + db*db < TOL2) {
          aR += sR[s]; aG += sG[s]; aB += sB[s]; aN++;
        }
      }
      if (aN >= 2) { fR = aR / aN; fG = aG / aN; fB = aB / aN; }
    }

    // Tiny noise (mimics natural texture)
    const noise = (Math.random() - 0.5) * 4;

    const p = i * 4;
    data[p]   = Math.max(0, Math.min(255, (fR + noise) | 0));
    data[p+1] = Math.max(0, Math.min(255, (fG + noise) | 0));
    data[p+2] = Math.max(0, Math.min(255, (fB + noise) | 0));
    data[p+3] = 255;
    m[i] = 0;  // mark known so subsequent pixels can sample from it

    // Yield every 200 pixels for smooth UI
    if ((k & 0xFF) === 0) {
      const pct = 5 + Math.round(85 * k / total);
      if (pct - lastReport > 3) {
        lastReport = pct;
        showProgress(pct);
        await new Promise(r => setTimeout(r, 0));
      }
    }
  }

  // 4) Gentle 1-px smoothing on previously-masked pixels
  showProgress(95);
  await new Promise(r => setTimeout(r, 0));
  smoothMaskedPixels(data, mask, W, H, 1);
  showProgress(100);
}
/* ----- Algorithm 2: Smart Color Fill ------------------------------------- */
/* User dabs on a logo that's a fairly distinct color. We expand the painted
   region to include all connected pixels with similar color (flood-fill-ish),
   then run PatchMatch on that expanded mask. */
async function inpaintSmartColorFill(imgData, mask, W, H, radius) {
  const data = imgData.data;

  // Pick the dominant color from the painted area
  let r=0,g=0,b=0,n=0;
  for (let i=0;i<mask.length;i++) {
    if (mask[i]) {
      const p = i*4;
      r += data[p]; g += data[p+1]; b += data[p+2]; n++;
    }
  }
  if (!n) return;
  r /= n; g /= n; b /= n;

  // Expand mask: for any unmasked pixel within a small distance of a masked pixel,
  // and whose color is similar to the painted color, mark it masked too.
  const expanded = new Uint8Array(mask);
  const tolerance = 60; // color distance squared threshold (per channel ~24)
  const expandR = Math.max(8, radius);

  // Find pixels near painted area
  for (let y=0; y<H; y++) {
    for (let x=0; x<W; x++) {
      const i = y*W + x;
      if (mask[i]) continue;  // already painted
      // Check if any pixel in expandR window is painted
      let near = false;
      const x0 = Math.max(0, x - expandR), x1 = Math.min(W-1, x + expandR);
      const y0 = Math.max(0, y - expandR), y1 = Math.min(H-1, y + expandR);
      outer: for (let yy = y0; yy <= y1; yy += 2) {
        for (let xx = x0; xx <= x1; xx += 2) {
          if (mask[yy*W + xx]) { near = true; break outer; }
        }
      }
      if (!near) continue;
      // Color similar to dominant?
      const p = i*4;
      const dr = data[p] - r, dg = data[p+1] - g, db = data[p+2] - b;
      const cd = dr*dr + dg*dg + db*db;
      if (cd < tolerance * tolerance) expanded[i] = 1;
    }
  }

  // Now run PatchMatch with expanded mask
  await inpaintPatchMatch(imgData, expanded, W, H, radius);
}

/* ----- Algorithm 3: Boundary Patch (fast) -------------------------------- */
async function inpaintBoundaryPatch(imgData, mask, W, H, radius) {
  const data = imgData.data;
  const m = new Uint8Array(mask);
  let remaining = 0;
  for (let i = 0; i < m.length; i++) if (m[i]) remaining++;
  if (!remaining) return;
  const total = remaining;
  let lastReport = 0;

  function avgColor(cx, cy, win) {
    let r=0,g=0,b=0,n=0;
    const x0 = Math.max(0, cx - win), x1 = Math.min(W-1, cx + win);
    const y0 = Math.max(0, cy - win), y1 = Math.min(H-1, cy + win);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const i = y * W + x;
        if (!m[i]) {
          const p = i * 4;
          r += data[p]; g += data[p+1]; b += data[p+2]; n++;
        }
      }
    }
    return n === 0 ? null : [r/n, g/n, b/n];
  }

  let safety = 0;
  while (remaining > 0 && safety < 500) {
    safety++;
    const layer = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (!m[i]) continue;
        if ((x > 0   && !m[i-1]) || (x < W-1 && !m[i+1]) ||
            (y > 0   && !m[i-W]) || (y < H-1 && !m[i+W])) layer.push(i);
      }
    }
    if (!layer.length) break;
    for (const i of layer) {
      const x = i % W, y = (i / W) | 0;
      let est = null;
      for (let r = radius; r <= radius * 6 && !est; r += radius) est = avgColor(x, y, r);
      if (!est) continue;
      const p = i * 4;
      data[p] = est[0]|0; data[p+1] = est[1]|0; data[p+2] = est[2]|0; data[p+3] = 255;
      m[i] = 0; remaining--;
    }
    const pct = 5 + Math.round(90 * (1 - remaining / total));
    if (pct - lastReport > 4) { lastReport = pct; showProgress(pct); await new Promise(r=>setTimeout(r,0)); }
  }
  smoothMaskedPixels(data, mask, W, H, 1);
  showProgress(100);
}

/* ----- Algorithm 4: Telea -------------------------------------------------- */
async function inpaintTelea(imgData, mask, W, H) {
  const data = imgData.data;
  const m = new Uint8Array(mask);
  const dist = new Float32Array(W * H);
  for (let i = 0; i < m.length; i++) dist[i] = m[i] ? 1e9 : 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!m[i]) continue;
      let d = dist[i];
      if (x > 0)            d = Math.min(d, dist[i-1] + 1);
      if (y > 0)            d = Math.min(d, dist[i-W] + 1);
      if (x > 0 && y > 0)   d = Math.min(d, dist[i-W-1] + 1.41);
      if (x < W-1 && y > 0) d = Math.min(d, dist[i-W+1] + 1.41);
      dist[i] = d;
    }
  }
  for (let y = H-1; y >= 0; y--) {
    for (let x = W-1; x >= 0; x--) {
      const i = y * W + x;
      if (!m[i]) continue;
      let d = dist[i];
      if (x < W-1)             d = Math.min(d, dist[i+1] + 1);
      if (y < H-1)             d = Math.min(d, dist[i+W] + 1);
      if (x < W-1 && y < H-1)  d = Math.min(d, dist[i+W+1] + 1.41);
      if (x > 0   && y < H-1)  d = Math.min(d, dist[i+W-1] + 1.41);
      dist[i] = d;
    }
  }
  const px = [];
  for (let i = 0; i < m.length; i++) if (m[i]) px.push(i);
  px.sort((a,b) => dist[a] - dist[b]);

  const winR = 5;
  for (let k = 0; k < px.length; k++) {
    const i = px[k];
    const x = i % W, y = (i / W) | 0;
    let r=0,g=0,b=0,wsum=0;
    const x0 = Math.max(0, x - winR), x1 = Math.min(W-1, x + winR);
    const y0 = Math.max(0, y - winR), y1 = Math.min(H-1, y + winR);
    for (let yy = y0; yy <= y1; yy++) {
      for (let xx = x0; xx <= x1; xx++) {
        const j = yy * W + xx;
        if (m[j]) continue;
        const dx = xx-x, dy = yy-y;
        const dd = dx*dx + dy*dy;
        if (dd === 0) continue;
        const w = 1 / dd;
        const p = j * 4;
        r += data[p] * w; g += data[p+1] * w; b += data[p+2] * w;
        wsum += w;
      }
    }
    if (wsum > 0) {
      const p = i * 4;
      data[p]   = (r / wsum) | 0;
      data[p+1] = (g / wsum) | 0;
      data[p+2] = (b / wsum) | 0;
      data[p+3] = 255;
      m[i] = 0;
    }
    if (k % 5000 === 0) {
      const pct = 5 + Math.round(90 * k / px.length);
      showProgress(pct); await new Promise(r=>setTimeout(r,0));
    }
  }
  showProgress(100);
}

/* ----- Algorithm 5: Fast Blur -------------------------------------------- */
async function inpaintBlur(imgData, mask, W, H, radius) {
  const data = imgData.data;
  const m = new Uint8Array(mask);
  const iters = 6;
  for (let iter = 0; iter < iters; iter++) {
    const data2 = new Uint8ClampedArray(data);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (!m[i]) continue;
        let r=0,g=0,b=0,n=0;
        const x0 = Math.max(0, x - radius), x1 = Math.min(W-1, x + radius);
        const y0 = Math.max(0, y - radius), y1 = Math.min(H-1, y + radius);
        for (let yy = y0; yy <= y1; yy++) {
          for (let xx = x0; xx <= x1; xx++) {
            const j = yy * W + xx;
            if (m[j] && iter < 3) continue;
            const p = j * 4;
            r += data[p]; g += data[p+1]; b += data[p+2]; n++;
          }
        }
        if (n > 0) {
          const p = i * 4;
          data2[p] = (r/n)|0; data2[p+1] = (g/n)|0; data2[p+2] = (b/n)|0;
        }
      }
    }
    for (let i = 0; i < data.length; i++) data[i] = data2[i];
    showProgress(5 + Math.round(95 * (iter + 1) / iters));
    await new Promise(r => setTimeout(r, 0));
  }
}

/* Light smoothing of just the previously-masked pixels (kills hard seams) */
function smoothMaskedPixels(data, mask, W, H, radius) {
  const data2 = new Uint8ClampedArray(data);
  const r = radius || 1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!mask[i]) continue;
      let R=0,G=0,B=0,n=0;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const xx = x+dx, yy = y+dy;
          if (xx < 0 || xx >= W || yy < 0 || yy >= H) continue;
          const j = (yy*W + xx) * 4;
          R += data[j]; G += data[j+1]; B += data[j+2]; n++;
        }
      }
      const p = i * 4;
      data2[p]   = (R/n)|0;
      data2[p+1] = (G/n)|0;
      data2[p+2] = (B/n)|0;
    }
  }
  for (let i = 0; i < data.length; i++) data[i] = data2[i];
}

// ======= UNDO =======

  function run(imgData, mask, W, H, algo, radius, onProgress) {
    progressCB = onProgress || null;
    radius = radius || 12;
    var fn = { patchmatch: inpaintPatchMatch, smartbg: inpaintSmartBgFill,
      smartcolor: inpaintSmartColorFill, boundary: inpaintBoundaryPatch,
      telea: inpaintTelea, blur: inpaintBlur }[algo] || inpaintPatchMatch;
    return Promise.resolve(algo === 'telea' ? fn(imgData, mask, W, H) : fn(imgData, mask, W, H, radius))
      .then(function () { progressCB = null; return imgData; });
  }
  var ALGOS = [
    { id: 'patchmatch', name: 'PatchMatch', note: 'best for textured backgrounds · anti-bleed' },
    { id: 'telea', name: 'Telea Inpainting', note: 'fast marching · smooth areas' },
    { id: 'smartbg', name: 'Smart BG Fill', note: 'rebuilds a plain studio backdrop' },
    { id: 'smartcolor', name: 'Smart Colour Fill', note: 'flat colour regions' },
    { id: 'boundary', name: 'Boundary Patch', note: 'edges and borders' },
    { id: 'blur', name: 'Fast Blur', note: 'quickest · softens the patch' }
  ];
  return { run: run, ALGOS: ALGOS, smoothMaskedPixels: smoothMaskedPixels };
})();
