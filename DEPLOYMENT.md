# Deployment — medhava.com

A runbook. Every command here runs on **your** machine or **your** VPS; nothing in this repository
can reach your servers, your registrar or your Meta account.

Your setup: domain at BigRock, Hostinger shared hosting for `@medhava.com` mail, a **4 GB / 2 vCPU**
Hostinger VPS for everything technical.

| Host | Points at | Serves |
|---|---|---|
| `medhava.com`, `www` | VPS | the marketing site — static |
| `app.medhava.com` | VPS | the Node app, password-gated |
| `n8n.medhava.com` | VPS | n8n |
| MX | Hostinger shared hosting | `@medhava.com` mail |

---

## Stage 0 · Start the slow clocks first

These wait on other people. Nothing you build makes them faster.

1. **Meta Business verification + Interakt.** Needs a Meta Business Manager account, a verified
   business (GST certificate or utility bill), and **a phone number not currently active on
   WhatsApp**. Templates are approved individually afterwards. Days to weeks.
2. **Point BigRock at Hostinger.** In BigRock, set the domain's nameservers to the ones Hostinger
   gives you. One panel then manages both the VPS A-record and the mail MX records. Usually hours;
   allow 48.

---

## Stage 1 · The VPS, and the site live

### 1.1 Secure the box before anything else listens on it

```bash
ssh root@YOUR_VPS_IP
adduser medhava && usermod -aG sudo medhava
rsync --archive --chown=medhava:medhava ~/.ssh /home/medhava   # your key comes with you

# password login off — do this only after you have confirmed key login works in a SECOND terminal
sudo sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl reload ssh

sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable
sudo apt update && sudo apt install -y fail2ban unattended-upgrades nginx certbot python3-certbot-nginx rsync
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

> Keep the second terminal open until key login is confirmed. Locking yourself out of a fresh VPS
> costs an hour; locking yourself out of a running one costs a day.

### 1.2 Swap — 4 GB needs it

Not for speed. So that loading a model cannot OOM-kill n8n.

```bash
sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo sysctl -w vm.swappiness=10 && echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
free -h
```

### 1.3 DNS

In the Hostinger DNS panel: `A` record for `@`, `www`, `app` and `n8n` → your VPS IP. Leave the MX
records pointing at Hostinger mail. Wait for `dig +short medhava.com` to return the VPS IP.

### 1.4 nginx and TLS

```bash
sudo mkdir -p /var/www/medhava && sudo chown -R medhava:medhava /var/www/medhava
# copy the three files from deploy/nginx/ to /etc/nginx/sites-available/, then:
sudo ln -s /etc/nginx/sites-available/medhava.com.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d medhava.com -d www.medhava.com
sudo systemctl status certbot.timer     # auto-renewal
```

### 1.5 Publish the site

From your laptop, with the repo cloned:

`deploy/publish-site.sh` uses `rsync` and `ssh` — both standard, but install `rsync` if your
machine lacks it (this container did).

```bash
npm ci
export MEDHAVA_HOST=medhava@YOUR_VPS_IP
./deploy/publish-site.sh
curl -sSI https://medhava.com | head -1          # expect 200
curl -sS https://medhava.com | grep -c "Industry packs"   # the real page, not a placeholder
```

**medhava.com is live.** Everything below can take its time.

---

## Stage 2 · The services

### 2.1 Postgres — on Supabase, not on this VPS

Deliberate. Supabase's free tier gives Postgres 16, 500 MB, 50k monthly active users and daily
backups, and keeps ~400 MB of RAM on the VPS free for Ollama. Load `core/schema.postgres.sql` into
a new Supabase project. It is ordinary Postgres — moving it onto the VPS later is a `pg_dump` and a
connection string, not a migration project.

### 2.2 n8n

```bash
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker medhava   # log out and back in
mkdir -p ~/n8n && cd ~/n8n
```

`docker-compose.yml`:

```yaml
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: unless-stopped
    ports: ['127.0.0.1:5678:5678']       # localhost only; nginx is the front door
    environment:
      - N8N_HOST=n8n.medhava.com
      - WEBHOOK_URL=https://n8n.medhava.com/
      - N8N_PROTOCOL=https
      - GENERIC_TIMEZONE=Asia/Kolkata
    volumes: ['./data:/home/node/.n8n']
    mem_limit: 512m
```

```bash
docker compose up -d
sudo certbot --nginx -d n8n.medhava.com
```

Set the owner account on first visit. It is reachable from the internet — do this immediately.

### 2.3 Ollama — and what 4 GB actually gives you

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2:3b
ollama run llama3.2:3b "reply with the single word OK" --verbose   # read the tokens/sec
```

**Be honest with yourself about the number that prints.** On 2 shared vCPU with no GPU, a 3B model
at Q4 typically manages single-digit tokens per second. That is genuinely useful for classifying,
tagging and short summaries. It is slow for drafting long copy.

A 7B model needs ~4.4 GB and **will not fit** alongside n8n and the app. Do not pull one and hope.

When drafting quality matters, Module 01's Provider Router falls through to a paid model with a
spend ceiling in front of it — refusing over the ceiling rather than warning. That is what it is for.

Keep Ollama bound to localhost (it is by default). Never open 11434 to the internet.

### 2.4 The app

```bash
sudo mkdir -p /srv/medhava && sudo chown medhava:medhava /srv/medhava
cd /srv/medhava && git clone YOUR_REPO app && cd app/app && npm ci --omit=dev
```

Create `/srv/medhava/app/.env`, `chmod 600`:

```
PORT=3000
APP_PASSWORD=<a long random string>
# model keys are optional — the app asks for one at runtime if none is set
```

```bash
sudo cp deploy/medhava-app.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now medhava-app
sudo certbot --nginx -d app.medhava.com
curl -sSI https://app.medhava.com | head -1     # expect 401 — gated
```

> **What this is.** 16 of 113 apps work, and they run on their own storage rather than the shared
> core. This is a private demo you can use and test, not the product. Rewiring them onto the core
> is Module 01's first job.

### 2.5 Backups, from day one

Nightly `pg_dump` from Supabase plus `/srv/medhava/app/.env`, `~/n8n/data` and `/etc/nginx`, copied
**off the box**. A backup that lives only on the machine it protects is not a backup.

---

## Stage 3 · WhatsApp, when verification clears

Wire Interakt behind the existing `WhatsAppService` interface, so swapping to Wati or AiSensy stays
a config change. Get templates approved before scheduling anything.

This is the first line you genuinely pay for: `brand/site/tools.js` records it as one of only three
capabilities with **no free path at all** — roughly ₹1,500–3,000/month plus Meta's per-conversation
charge.

---

## What this costs

| | |
|---|---|
| VPS 4 GB, shared hosting | check Hostinger's current pricing — do not take a figure from this file |
| Domain | already yours |
| Supabase · GitHub · n8n · Ollama · nginx · certbot · Sentry dev tier | **₹0** |
| Interakt + Meta conversations | ~₹1,500–3,000/mo + per conversation |

Every free line above stays free until a trigger written down in `brand/site/tools.js` fires, and
`brand/site/checktools.js` fails the build if a paid tool ever appears without naming the free
option it replaced and the condition that forced it.

---

## Security, non-negotiable

From `CLAUDE.md` §4, and true of this runbook:

- **No key is ever committed.** `app/.env` and `app/data/` are gitignored and stay that way.
- **Nothing here asks for a marketplace, bank or account password** — not the software, not this
  document. The product's promise is that it never will.
- Aadhaar, PAN, bank and UPI details may be read into memory for a computation and are never
  written into a committed file.
- Before pushing: scan the diff for keys.

---

## Health check

```bash
ssh medhava@VPS 'free -m; systemctl is-active medhava-app nginx ollama; docker ps --format "{{.Names}} {{.Status}}"'
curl -sSI https://medhava.com     | head -1     # 200
curl -sSI https://app.medhava.com | head -1     # 401
curl -sSI https://n8n.medhava.com | head -1     # 401 or 302
```

`free -m` is the one to watch on 4 GB. Occasional swap is fine; constant swap means the model is too
big for the box — resize the VPS or drop to a smaller model rather than let it limp.
