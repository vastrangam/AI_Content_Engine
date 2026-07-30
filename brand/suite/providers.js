/* Medhava — Connectors: the no-lock-in layer, shared by every app in every module.

   THE RULE THIS ENFORCES
   No Medhava app may depend on one outside service. Every capability an app needs
   (books, channels, AI text, AI images, video, automation, courier, payments,
   messaging, storage, GST, printing, scanning) is declared as a CAPABILITY with a
   list of interchangeable PROVIDERS. You pick one; you can change it any time.

   Three guarantees, each checked by a self-test at every launch:
     1. Every capability has several alternatives — never one.
     2. Every capability has a BUILT-IN or MANUAL option, so the app works with
        nothing connected at all.
     3. Every capability has an option you can HOST YOURSELF, so you are never
        forced to send your data to somebody else's cloud.

   kind: 'built-in'  ships inside Medhava, needs nothing
         'self-host' you run it on your own machine or server
         'cloud'     somebody else's service, via a revocable scoped API key
         'manual'    a human does it, or a CSV goes in and out
*/
(function () {
  var P = function (id, name, kind, note) { return { id: id, name: name, kind: kind, note: note || '' }; };

  var CAPS = [
    { id: 'ledger', name: 'Books & ledger', what: 'Where the accounting entries actually live.', providers: [
      P('medhava_books', 'Medhava Books', 'built-in', 'The ledger inside Medhava. Nothing else needed.'),
      P('tally', 'Tally', 'cloud', 'Two-way sync via XML/ODBC.'),
      P('busy', 'BUSY', 'cloud', 'Two-way sync.'),
      P('marg', 'Marg', 'cloud', 'Two-way sync.'),
      P('zoho_books', 'Zoho Books', 'cloud', 'API sync.'),
      P('quickbooks', 'QuickBooks', 'cloud', 'API sync.'),
      P('erpnext', 'ERPNext', 'self-host', 'Run it on your own server.'),
      P('csv_ledger', 'CSV in / CSV out', 'manual', 'Export a file, hand it to your CA.') ] },

    { id: 'channels', name: 'Sales channels', what: 'Where orders and returns come from.', providers: [
      P('manual_orders', 'Type them in', 'manual', 'No integration at all. Works on day one.'),
      P('csv_orders', 'CSV import', 'manual', 'Download from any panel, drop the file in.'),
      P('amazon', 'Amazon', 'cloud', 'SP-API, scoped key.'),
      P('flipkart', 'Flipkart', 'cloud', 'Seller API, scoped key.'),
      P('myntra', 'Myntra', 'cloud', 'Partner API, scoped key.'),
      P('meesho', 'Meesho', 'cloud', ''), P('ajio', 'Ajio', 'cloud', ''),
      P('nykaa', 'Nykaa', 'cloud', ''), P('jiomart', 'JioMart', 'cloud', ''),
      P('shopify', 'Shopify', 'cloud', ''), P('woocommerce', 'WooCommerce', 'self-host', 'Your own WordPress store.'),
      P('medusa', 'Medusa / self-hosted store', 'self-host', 'Your own storefront, your own server.') ] },

    { id: 'ai_text', name: 'AI writing', what: 'Titles, descriptions, replies, summaries.', providers: [
      P('templates', 'Medhava templates', 'built-in', 'Rule-based text. No AI, no internet, no cost.'),
      P('ollama', 'Ollama (on your own machine)', 'self-host', 'A local model. Nothing leaves your computer.'),
      P('llama', 'Llama (self-hosted)', 'self-host', 'Your own GPU or server.'),
      P('mistral_self', 'Mistral (self-hosted)', 'self-host', ''),
      P('claude', 'Anthropic Claude', 'cloud', ''), P('openai', 'OpenAI GPT', 'cloud', ''),
      P('gemini', 'Google Gemini', 'cloud', ''), P('mistral', 'Mistral (cloud)', 'cloud', ''),
      P('deepseek', 'DeepSeek', 'cloud', ''), P('groq', 'Groq', 'cloud', ''),
      P('write_it', 'Write it yourself', 'manual', 'The app still does everything else.') ] },

    { id: 'ai_image', name: 'AI images', what: 'Product shots, banners, catalogue images.', providers: [
      P('upload_img', 'Upload your own', 'manual', 'Your photographer, your phone. Always available.'),
      P('sd_self', 'Stable Diffusion (self-hosted)', 'self-host', 'ComfyUI or Automatic1111 on your own machine.'),
      P('flux_self', 'Flux (self-hosted)', 'self-host', ''),
      P('flux', 'Flux (cloud)', 'cloud', ''), P('midjourney', 'Midjourney', 'cloud', ''),
      P('dalle', 'OpenAI images', 'cloud', ''), P('imagen', 'Google Imagen', 'cloud', ''),
      P('firefly', 'Adobe Firefly', 'cloud', ''), P('canva', 'Canva', 'cloud', ''),
      P('studio', 'Medhava Image Studio', 'built-in', 'Crop, resize, watermark, channel-size presets — no AI needed.') ] },

    { id: 'ai_video', name: 'Video', what: 'Reels, product videos, ads.', providers: [
      P('upload_vid', 'Upload your own', 'manual', 'Shot on a phone is fine.'),
      P('ffmpeg', 'Medhava video templates (FFmpeg)', 'built-in', 'Stills + music + text, rendered locally.'),
      P('comfy_vid', 'ComfyUI video (self-hosted)', 'self-host', ''),
      P('runway', 'Runway', 'cloud', ''), P('pika', 'Pika', 'cloud', ''),
      P('luma', 'Luma', 'cloud', ''), P('kling', 'Kling', 'cloud', ''),
      P('veo', 'Google Veo', 'cloud', ''), P('sora', 'OpenAI Sora', 'cloud', '') ] },

    { id: 'automation', name: 'Automation', what: '"If this happens, do that."', providers: [
      P('medhava_rules', 'Medhava Rules', 'built-in', 'The rule engine inside Medhava. No outside tool.'),
      P('n8n', 'n8n (self-hosted)', 'self-host', 'Your own n8n instance.'),
      P('nodered', 'Node-RED (self-hosted)', 'self-host', ''),
      P('windmill', 'Windmill (self-hosted)', 'self-host', ''),
      P('airflow', 'Apache Airflow', 'self-host', ''),
      P('n8n_cloud', 'n8n Cloud', 'cloud', ''), P('make', 'Make', 'cloud', ''),
      P('zapier', 'Zapier', 'cloud', ''), P('pipedream', 'Pipedream', 'cloud', ''),
      P('cron', 'Cron + webhook', 'self-host', 'The simplest possible option.'),
      P('do_it', 'Do it by hand', 'manual', '') ] },

    { id: 'courier', name: 'Shipping & couriers', what: 'Labels, tracking, delivery.', providers: [
      P('manual_awb', 'Type the AWB in', 'manual', 'Any courier, no integration.'),
      P('own_delivery', 'Your own delivery', 'built-in', 'Own rider, own van, counter pickup.'),
      P('delhivery', 'Delhivery', 'cloud', ''), P('bluedart', 'Blue Dart', 'cloud', ''),
      P('dtdc', 'DTDC', 'cloud', ''), P('ecom', 'Ecom Express', 'cloud', ''),
      P('xpressbees', 'XpressBees', 'cloud', ''), P('indiapost', 'India Post', 'cloud', ''),
      P('shiprocket', 'Shiprocket (aggregator)', 'cloud', ''), P('nimbus', 'NimbusPost (aggregator)', 'cloud', '') ] },

    { id: 'payments', name: 'Payments', what: 'Taking money in.', providers: [
      P('cash', 'Cash / bank transfer', 'manual', 'Record it yourself. Always works.'),
      P('upi_direct', 'UPI direct (your own VPA)', 'built-in', 'A QR code. No gateway, no commission.'),
      P('razorpay', 'Razorpay', 'cloud', ''), P('payu', 'PayU', 'cloud', ''),
      P('cashfree', 'Cashfree', 'cloud', ''), P('phonepe', 'PhonePe', 'cloud', ''),
      P('paytm', 'Paytm', 'cloud', ''), P('stripe', 'Stripe', 'cloud', ''),
      P('ccavenue', 'CCAvenue', 'cloud', '') ] },

    { id: 'messaging', name: 'Customer messaging', what: 'Order updates, reminders, follow-ups.', providers: [
      P('copy_paste', 'Copy the message and send it yourself', 'manual', 'From your own phone.'),
      P('wa_cloud', 'WhatsApp Cloud API', 'cloud', ''), P('gupshup', 'Gupshup', 'cloud', ''),
      P('interakt', 'Interakt', 'cloud', ''), P('msg91', 'MSG91', 'cloud', ''),
      P('twilio', 'Twilio', 'cloud', ''), P('smtp_msg', 'Email instead (any SMTP)', 'self-host', ''),
      P('chatwoot', 'Chatwoot (self-hosted)', 'self-host', '') ] },

    { id: 'email', name: 'Email sending', what: 'Invoices, statements, reports.', providers: [
      P('download_send', 'Download the PDF and email it yourself', 'manual', ''),
      P('smtp', 'Any SMTP server', 'self-host', 'Your own mail server or your existing mailbox.'),
      P('ses', 'Amazon SES', 'cloud', ''), P('sendgrid', 'SendGrid', 'cloud', ''),
      P('postmark', 'Postmark', 'cloud', ''), P('mailgun', 'Mailgun', 'cloud', ''),
      P('zoho_mail', 'Zoho Mail', 'cloud', ''), P('brevo', 'Brevo', 'cloud', '') ] },

    { id: 'storage', name: 'Files & backups', what: 'Where backups and documents are kept.', providers: [
      P('this_device', 'This device', 'built-in', 'The browser on this machine. The default.'),
      P('usb', 'A USB drive', 'manual', ''),
      P('minio', 'MinIO (self-hosted)', 'self-host', 'Your own S3-compatible store.'),
      P('nextcloud', 'Nextcloud (self-hosted)', 'self-host', ''),
      P('gdrive', 'Google Drive', 'cloud', ''), P('dropbox', 'Dropbox', 'cloud', ''),
      P('onedrive', 'OneDrive', 'cloud', ''), P('s3', 'Amazon S3', 'cloud', ''),
      P('b2', 'Backblaze B2', 'cloud', '') ] },

    { id: 'gst', name: 'GST & returns', what: 'Filing, e-invoice, e-way bill.', providers: [
      P('ca_manual', 'Your CA files it', 'manual', 'You hand over a report. How most businesses work.'),
      P('medhava_gst', 'Medhava GST returns', 'built-in', 'Works out GSTR-1 and 3B and writes the JSON for you to upload yourself.'),
      P('offline_util', 'GST offline utility (your own machine)', 'self-host', 'The government’s own desktop tool. Nothing goes through a third party.'),
      P('gstn', 'GSTN portal direct', 'cloud', ''), P('cleartax', 'ClearTax', 'cloud', ''),
      P('tally_gst', 'Tally', 'cloud', ''), P('busy_gst', 'BUSY', 'cloud', ''),
      P('zoho_gst', 'Zoho Books', 'cloud', ''), P('marg_gst', 'Marg', 'cloud', '') ] },

    { id: 'printing', name: 'Printing', what: 'Invoices, labels, counter bills.', providers: [
      P('browser_print', 'Browser print / PDF', 'built-in', 'Works on every device, every printer.'),
      P('escpos', 'Any ESC/POS thermal printer', 'self-host', 'The standard almost every till printer speaks.'),
      P('zebra', 'Zebra label printer', 'self-host', ''), P('tvs', 'TVS printer', 'self-host', ''),
      P('no_printer', 'No printer — share the PDF', 'manual', '') ] },

    { id: 'barcode', name: 'Barcode & scanning', what: 'Picking, packing, stock counts.', providers: [
      P('type_it', 'Type the code', 'manual', 'Always available.'),
      P('phone_cam', 'Phone camera', 'built-in', 'No hardware to buy.'),
      P('usb_scanner', 'USB scanner', 'self-host', 'Any keyboard-wedge scanner.'),
      P('bt_scanner', 'Bluetooth scanner', 'self-host', ''),
      P('zebra_gun', 'Zebra / Honeywell gun', 'self-host', '') ] }
  ];

  var byId = {}; CAPS.forEach(function (c) { byId[c.id] = c; });
  function cap(id) { return byId[id]; }
  function prov(capId, pid) { var c = cap(capId); if (!c) return null;
    var m = c.providers.filter(function (p) { return p.id === pid; }); return m[0] || null; }
  /* the default is always something that needs nothing outside Medhava */
  function defaultOf(capId) { var c = cap(capId);
    var b = c.providers.filter(function (p) { return p.kind === 'built-in'; })[0];
    return (b || c.providers.filter(function (p) { return p.kind === 'manual'; })[0] || c.providers[0]).id; }

  function seed(DB, uses) { DB.prov = DB.prov || {};
    (uses || []).forEach(function (id) { if (cap(id) && !DB.prov[id]) DB.prov[id] = defaultOf(id); }); }
  function active(DB, capId) { return (DB.prov || {})[capId] || defaultOf(capId); }

  var KIND = { 'built-in': ['grn', 'built in'], 'self-host': ['blu', 'you host it'],
               'cloud': ['amb', 'their cloud'], 'manual': ['gray', 'by hand'] };

  function view(H, DB, uses) {
    uses = (uses || []).filter(function (id) { return !!cap(id); });
    var alts = uses.reduce(function (s, id) { return s + cap(id).providers.length; }, 0);
    var noNet = uses.filter(function (id) { var k = prov(id, active(DB, id)); return k && (k.kind === 'built-in' || k.kind === 'manual'); }).length;

    return H.head('Connectors · Alternatives', 'Connectors',
      'Everything this app touches, and every alternative you can use for it. Nothing is locked to one company.') +
      H.note('<b>The promise, in one line:</b> no Medhava app depends on any single outside service. ' +
        'Every capability below has a built-in or by-hand option, and at least one option you can run on your own machine.') +
      H.kpis([
        { l: 'Capabilities used', v: uses.length, d: 'by this app', icon: 'layers', tone: 'teal' },
        { l: 'Alternatives available', v: alts, d: 'to choose from', icon: 'sync', tone: 'blue' },
        { l: 'Outside services required', v: 0, d: 'none, ever', cls: 'g', icon: 'check', tone: 'green' },
        { l: 'Running with nothing connected', v: noNet + ' / ' + uses.length, d: 'right now', cls: noNet === uses.length ? 'g' : '', icon: 'shield', tone: 'peach' }
      ], '') +
      H.panel('At a glance', H.table([
        { label: 'Capability', align: 'l', fmt: function (r) { return '<b>' + H.esc(r.name) + '</b><div class="hint">' + H.esc(r.what) + '</div>'; } },
        { label: 'You are using', align: 'l', fmt: function (r) { var p = prov(r.id, active(DB, r.id));
          return H.esc(p.name) + ' ' + H.tag(KIND[p.kind][1], KIND[p.kind][0]); } },
        { label: 'Alternatives', fmt: function (r) { return cap(r.id).providers.length; }, cellcls: 'mono' },
        { label: 'Works with nothing connected', align: 'l', fmt: function (r) {
          return cap(r.id).providers.some(function (p) { return p.kind === 'built-in' || p.kind === 'manual'; })
            ? H.tag('yes', 'grn') : H.tag('no', 'red'); } },
        { label: 'Can you host it yourself', align: 'l', fmt: function (r) {
          return cap(r.id).providers.some(function (p) { return p.kind === 'self-host' || p.kind === 'built-in'; })
            ? H.tag('yes', 'grn') : H.tag('no', 'red'); } }
      ], uses.map(function (id) { return cap(id); }))) +
      uses.map(function (id) {
        var c = cap(id), a = active(DB, id);
        return H.panel(H.esc(c.name) + ' <span class="badge">' + c.providers.length + ' choices</span>',
          '<p class="hint">' + H.esc(c.what) + ' Click any one to switch. Your figures do not change — only where the data comes from.</p>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          c.providers.map(function (p) {
            return '<button class="btn sm' + (p.id === a ? ' p' : '') + '" data-act="connpick" data-c="' + id + '" data-p="' + p.id + '">' +
              H.esc(p.name) + '</button>';
          }).join('') + '</div>' +
          H.table([
            { label: 'Option', align: 'l', fmt: function (p) { return (p.id === a ? '<b>' + H.esc(p.name) + '</b>' : H.esc(p.name)); } },
            { label: 'Kind', align: 'l', fmt: function (p) { return H.tag(KIND[p.kind][1], KIND[p.kind][0]); } },
            { label: 'Note', align: 'l', fmt: function (p) { return H.esc(p.note || '—'); } },
            { label: '', align: 'l', fmt: function (p) { return p.id === a ? H.tag('in use', 'grn') : ''; } }
          ], c.providers));
      }).join('') +
      H.panel('Two things worth knowing',
        '<p><b>Switching a provider never changes a figure.</b> The arithmetic lives in Medhava, not in the service. ' +
        'Move from one courier to another and your shipping records stay exactly as they were — only new labels come from somewhere else.</p>' +
        '<p><b>Cloud services are connected with a scoped, revocable key — never your account password.</b> ' +
        'A key can be limited to just what it needs and cancelled in one click, from their side, without changing your login. ' +
        'Medhava will never ask you for a marketplace or bank password.</p>');
  }

  function actions(K) {
    return {
      connpick: function (b) { var DB = K.DB, c = b.getAttribute('data-c'), p = b.getAttribute('data-p');
        if (!prov(c, p)) return; DB.prov = DB.prov || {}; DB.prov[c] = p;
        K.save(); K.toast('Switched to ' + prov(c, p).name); K.render(); }
    };
  }

  function tests(t, DB, uses) {
    uses = (uses || []).filter(function (id) { return true; });
    t('every capability this app uses is a known one', uses.every(function (id) { return !!cap(id); }));
    t('no capability offers only one choice', uses.every(function (id) { return cap(id).providers.length >= 3; }));
    t('every capability works with nothing connected (built-in or by hand)', uses.every(function (id) {
      return cap(id).providers.some(function (p) { return p.kind === 'built-in' || p.kind === 'manual'; }); }));
    t('every capability has an option you can host yourself', uses.every(function (id) {
      return cap(id).providers.some(function (p) { return p.kind === 'self-host' || p.kind === 'built-in'; }); }));
    t('exactly one provider is active per capability', uses.every(function (id) {
      return !!prov(id, active(DB, id)); }));
    t('the default provider never needs an outside service', uses.every(function (id) {
      var p = prov(id, defaultOf(id)); return p.kind === 'built-in' || p.kind === 'manual'; }));
    t('no single company is unavoidable across capabilities', (function () {
      if (uses.length < 2) return true;
      var counts = {};
      uses.forEach(function (id) { cap(id).providers.forEach(function (p) { counts[p.name] = (counts[p.name] || 0) + 1; }); });
      /* a company appearing in every capability would be a hidden dependency */
      return !Object.keys(counts).some(function (n) { return counts[n] >= uses.length && uses.length > 1; });
    })());
    if (uses.length) {
      var id = uses[0], c = cap(id), was = active(DB, id);
      var other = c.providers.filter(function (p) { return p.id !== was; })[0];
      var before = JSON.stringify(Object.keys(DB).filter(function (k) { return k !== 'prov'; }).sort()
        .map(function (k) { return [k, DB[k]]; }));
      DB.prov[id] = other.id;
      t('switching a provider changes which one is active', active(DB, id) === other.id);
      t('switching a provider changes nothing else in your data',
        JSON.stringify(Object.keys(DB).filter(function (k) { return k !== 'prov'; }).sort()
          .map(function (k) { return [k, DB[k]]; })) === before);
      DB.prov[id] = was;
    }
  }

  var API = { CAPS: CAPS, cap: cap, prov: prov, defaultOf: defaultOf, seed: seed, active: active,
              view: view, actions: actions, tests: tests };
  if (typeof window !== 'undefined') window.MedhavaProviders = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
