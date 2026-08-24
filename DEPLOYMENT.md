# Deployment — running the platform

**This describes a design.** It is how the platform is deployed and run once it is built. Nothing
here claims to already be running.

It is written for whoever operates the platform. A business *using* the platform deploys nothing —
it signs up in a browser. If you are looking for how a customer gets set up, that is the tenant
guide, and it contains no commands at all.

---

## What this document deliberately does not contain

An earlier version of it opened with **verify a Meta business account** and ended with **connect a
WhatsApp provider**. Both were wrong here, and wrong in an instructive way.

Those are a **customer's** accounts. A business's conversations with its own customers belong to that
business. The platform holds no messaging account, no marketplace seller account and no payment
account of its own — it provides the place for a customer to plug theirs in. Nobody deploying this
platform needs any of them, and a deployment document that starts there is answering a question
nobody asked.

---

## The one rule this document obeys

**No layer here is welded to one supplier.** Every choice below names what it is, and what else
would do. The application is packaged as an ordinary container with nothing host-specific inside it,
which is the single decision that keeps every other option open.

If moving the platform to a different host is ever hard, something host-specific has leaked in, and
that is a bug rather than a fact of life.

---

## 1 · What has to exist before anything is deployed

| What | Default | Also works |
|---|---|---|
| Somewhere to run containers | A virtual server you control | A managed container platform · a machine in your own building |
| A database | PostgreSQL | A managed Postgres service · Postgres you run yourself |
| A place for files | An S3-compatible object store | Any other S3-compatible provider · a self-hosted one · server disk with an off-box copy |
| A domain, with DNS you can edit | Any registrar | Any other — nameservers can be pointed anywhere |
| A certificate | Let's Encrypt, renewed automatically | Any certificate authority |

Prices and free-tier limits change every few months, so none is quoted here. Check them at the source
before committing money — a figure copied into a document is a figure somebody budgets from a year
later.

---

## 2 · Secure the machine before anything listens on it

In this order, and the order matters.

1. Create a normal user with administrator rights. Stop using the root account.
2. Put your SSH key on it and confirm you can sign in with it.
3. **Open a second terminal and confirm key sign-in works there too.** Only then turn password
   sign-in off. If the key is wrong and you have already closed your only working session, you are
   locked out of your own machine.
4. Allow only the ports you actually use — the SSH port, and the two web ports. Deny the rest.
5. Turn on automatic security updates.
6. Install something that blocks repeated failed sign-in attempts.

**Done when:** password sign-in is off, you are certain you can still get in, and the machine is
answering on nothing you did not intend.

---

## 3 · Give it room to breathe

Add swap space — space on disk the machine can use when memory runs short. Not for speed. It is so
that one service having a bad minute cannot cause the machine to kill another one outright.

**Done when:** swap shows up in the machine's memory report.

---

## 4 · Point the names at the machine

Four names, all pointing at the same machine, each serving something different.

| Name | Serves |
|---|---|
| the bare domain and `www` | The public site |
| `app` | The application, behind sign-in |
| Whatever you use for internal tools | Internal only, never public |

Mail is separate and should stay separate: point mail records at whoever provides your mailboxes, not
at this machine. Running your own mail server is a full-time job that has nothing to do with this
platform.

**Done when:** each name resolves to the machine, checked from a connection that is not yours.

---

## 5 · Put a web server in front, and get certificates

The web server accepts connections, holds the certificates, and passes requests to the application.
Keeping it separate from the application means the application never has to know about certificates,
ports or redirects.

Configure it to refuse plain unencrypted connections, and to renew certificates by itself.

**Done when:** every name loads over an encrypted connection, and renewal has been tested rather than
assumed.

---

## 6 · Release without anybody noticing

The rules that make a release boring:

- **Build the container once**, and move that exact container between environments. Rebuilding per
  environment means the thing you tested is not the thing you released.
- **Upload to a temporary name, then move it into place.** A visitor mid-request never sees a
  half-written file.
- **Keep the previous version ready.** Going back should be one command, and it should have been
  practised before anybody depends on it.
- **Run the checks before the release, not after.** A check that runs after is a report, not a gate.

**Done when:** a release can be done in the middle of a working day without anybody being warned, and
undone just as quickly.

---

## 7 · Settings and keys

Every key, password and connection string lives outside the code, in settings the service reads at
startup.

- Readable only by the account the service runs as.
- Never committed. Not once, not temporarily — a key committed once is in every copy of that history
  forever.
- Different values per environment, so a practice copy can never reach real data.

**Nothing in this platform ever asks anyone for a marketplace, bank or account password.** Every
outside connection uses a key the customer creates and can withdraw. That is a promise the product
makes, and it holds here too.

**Done when:** a search of the entire history finds no key, and that search runs automatically on
every change.

---

## 8 · Backups, and proving them

- Back up the database on a schedule, and copy it **off the machine**. A backup that lives only on
  the machine it protects is not a backup.
- Back up the settings and the web server configuration too. Restoring data onto a machine nobody
  can reconfigure is half a recovery.
- **Restore one.** Into a scratch environment, deliberately, before anybody needs it. An untested
  backup is a belief.

**Done when:** a restore has actually been done and checked, and it is repeated on a schedule.

---

## 9 · Watching it

Three questions, answerable without guessing:

| Question | What answers it |
|---|---|
| Is it up? | An uptime check from outside your own network |
| Is it broken? | Error reports, grouped, with enough detail to act on |
| Is it slow, and where? | Timing recorded per operation |

Keep the format standard so the tool reading it can be replaced without changing what the platform
emits.

**Done when:** a failure can be traced from a user's click to the operation that failed, without
adding new logging first.

---

## 10 · Environments

At least two, and they must not share anything.

| | Practice | Live |
|---|---|---|
| Data | Realistic, never real | Real |
| Who can reach it | The team | Customers |
| Keys | Its own, valueless | Its own, guarded |

**Done when:** a change can be taken end to end somewhere no customer can see, and nothing in the
practice copy can reach anything real.

---

## 11 · The health check

Whenever something feels wrong, in this order:

1. Does the public site answer?
2. Does the application answer, and does it correctly refuse an unauthenticated request?
3. Are the services running?
4. How much memory and swap is in use, under real load?
5. Is the database reachable, and how long is it taking to answer?

The fourth is the one to watch on a small machine. Swap touched occasionally is fine. Swap in
constant use means something is too big for the machine — and the fix is a bigger machine or a
smaller workload, not patience.

---

## What this costs

| | |
|---|---|
| The machine | Depends on size and provider — check current pricing |
| The database | Free tiers exist and are real; check current limits |
| File storage | Charged by what you store and what you serve |
| Domain and certificates | The domain is yearly; certificates are free |
| Anything a customer connects | The customer's own account, and the customer's own cost |

No figure is quoted from memory. Every one of these changes, and a stale price in a document is worse
than no price, because somebody plans around it.

---

*This document describes how the platform is run. How a business gets set up **on** it is the tenant
guide — which contains no commands, because that reader has no terminal.*
