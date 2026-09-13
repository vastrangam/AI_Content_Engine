# What no amount of code closes

**85 lines of the specification need something a repository cannot hold.** Not because they are hard — because each one needs an account, a licence, a provider or a
piece of rented infrastructure that somebody has to arrange.

This is the list to work through **before a live demonstration**, not after. Several of
these take weeks of somebody else’s verification and no amount of preparation here
shortens them.

---

## What to arrange, in rough order of how long it takes

| What is needed | Lines it unblocks |
|---|---:|
| A mail domain and a sending provider | 21 |
| Live audio and video infrastructure | 15 |
| A payment gateway, acquirer or card terminal | 9 |
| A telephony carrier and a number | 4 |
| Marketplace, courier and social platform credentials | 6 |
| A bank feed or card issuer relationship | 3 |
| A government portal registration | 2 |
| An outside identity provider | 3 |
| Storage somebody pays for | 1 |
| A domain, a host, and something deployed | 6 |
| App-store accounts or software on each device | 3 |
| An accredited e-signature provider | 2 |
| Somebody else’s credentials, generally | 10 |

**Start with a domain and a host.** Several of the others cannot even begin until
something is running somewhere a person can reach, and a mail domain needs weeks of
sending before it is trusted.

---

## A mail domain and a sending provider

**21 lines depend on this.** Days to set up, weeks to earn a sending reputation. Nothing that sends or receives email works before this, and a new domain that sends in volume on day one goes to spam.

| # | Section | Line | Why it cannot be coded around |
|---:|---|---|---|
| 2 | Master application hub | Email | Business email means hosting mailboxes on a domain with deliverability and spam reputation — infrastructure, not a feature. |
| 4 | Marketing | Open tracking | Needs a sending domain with reputation and a provider that reports opens. |
| 4 | Marketing | Click tracking | Same: a tracked link is served by the sending provider. |
| 4 | Marketing | Bounce tracking | Bounces are reported by the sending provider. |
| 5 | Customer support / helpdesk | Email-to-ticket | Needs a mailbox the system can read, on a real domain. |
| 14 | Recruitment | Email | Needs a sending domain and provider. |
| 19 | Email | Custom domains | Needs a registrar, DNS and mail records. |
| 19 | Email | Mailboxes | Hosting mail is infrastructure with deliverability and spam reputation attached. |
| 19 | Email | Aliases | Hosting mail is infrastructure with deliverability and spam reputation attached. |
| 19 | Email | Groups | Hosting mail is infrastructure with deliverability and spam reputation attached. |
| 19 | Email | Shared mailboxes | Hosting mail is infrastructure with deliverability and spam reputation attached. |
| 19 | Email | Inbox | Hosting mail is infrastructure with deliverability and spam reputation attached. |
| 19 | Email | Sent | Hosting mail is infrastructure with deliverability and spam reputation attached. |
| 19 | Email | Drafts | Hosting mail is infrastructure with deliverability and spam reputation attached. |
| 19 | Email | Spam | Spam filtering is judged against a sending reputation nobody has built yet. |
| 19 | Email | Email security | SPF, DKIM and DMARC are DNS on a domain nobody has pointed yet. |
| 23 | Shared team inbox | Shared inboxes | Needs hosted mail on a real domain. |
| 23 | Shared team inbox | Team email | Hosting mail is infrastructure with deliverability and spam reputation attached. |
| 25 | Workflow automation | Send email | Needs a sending domain and provider. |
| 28 | Business analytics | Email reports | Needs a sending domain and provider. |
| 30 | AI agents | Send messages | Sending needs a mail or messaging provider. |

---

## Live audio and video infrastructure

**15 lines depend on this.** Rented, not built — media servers, bandwidth and relays. The scheduling and record half of meetings needs none of it and is in the backlog instead.

| # | Section | Line | Why it cannot be coded around |
|---:|---|---|---|
| 2 | Master application hub | Webinars | Needs live video infrastructure — media servers and bandwidth, not application code. |
| 2 | Master application hub | Meetings | Needs live audio/video infrastructure. |
| 4 | Marketing | Video | Live video needs media infrastructure. |
| 4 | Marketing | Screen sharing | Live video is media infrastructure — servers, bandwidth and relays, not application code. |
| 4 | Marketing | Recording | Needs the live video layer first. |
| 21 | Team chat | Audio calls | Needs live media infrastructure. |
| 21 | Team chat | Video calls | Live video is media infrastructure — servers, bandwidth and relays, not application code. |
| 21 | Team chat | Screen sharing | Live video is media infrastructure — servers, bandwidth and relays, not application code. |
| 22 | Video meetings | Meetings | Live video is media infrastructure — servers, bandwidth and turn relays, not application code. |
| 22 | Video meetings | Video | Live video is media infrastructure — servers, bandwidth and relays, not application code. |
| 22 | Video meetings | Audio | Live video is media infrastructure — servers, bandwidth and relays, not application code. |
| 22 | Video meetings | Screen sharing | Live video is media infrastructure — servers, bandwidth and relays, not application code. |
| 22 | Video meetings | Recording | Recording needs the live media layer that does not exist to record. |
| 22 | Video meetings | Webinar mode | Needs the live video layer first. |
| 29 | AI platform | Summarize meetings | There is no meeting layer to summarise. |

---

## A payment gateway, acquirer or card terminal

**9 lines depend on this.** Needs a registered business, bank details and their compliance review. Budget weeks, and nothing in checkout or POS card payment works until it clears.

| # | Section | Line | Why it cannot be coded around |
|---:|---|---|---|
| 2 | Master application hub | Payments | Taking a payment needs a licensed gateway and its credentials. |
| 8 | Billing and subscriptions | Payment retries | A retry is a second attempt against a payment gateway. |
| 11 | E-commerce | Checkout | Checkout ends at a payment gateway, which needs a licence and credentials. |
| 11 | E-commerce | Payment | Taking money needs a licensed payment gateway and its credentials. |
| 11 | E-commerce | Payments | Taking money needs a licensed payment gateway and its credentials. |
| 12 | POS | Payments | Needs a gateway or a card terminal. |
| 12 | POS | Card | Needs a terminal and an acquirer. |
| 12 | POS | UPI | Needs a registered VPA and a provider. |
| 25 | Workflow automation | Payment received | The event comes from a gateway. |

---

## A telephony carrier and a number

**4 lines depend on this.** A number and a provider. Quick to arrange, and the only thing that makes calls real rather than logged.

| # | Section | Line | Why it cannot be coded around |
|---:|---|---|---|
| 2 | Master application hub | Telephony | Needs a telephony carrier and a number. No software substitutes for one. |
| 3 | CRM | Calls | Logging a call is possible; placing one needs a carrier. |
| 5 | Customer support / helpdesk | Phone tickets | A ticket raised on a call needs a telephony carrier and a number. |
| 11 | E-commerce | Tracking | Tracking numbers come from the carrier’s API. |

---

## Marketplace, courier and social platform credentials

**6 lines depend on this.** One account and one review per platform, and the reviews are the slow part — a social publishing app can wait weeks for approval. Start the ones that matter first.

| # | Section | Line | Why it cannot be coded around |
|---:|---|---|---|
| 4 | Marketing | Social accounts | Connecting an account needs each platform’s API credentials and app review. |
| 4 | Marketing | Comments | Reading comments needs platform credentials. |
| 4 | Marketing | Mentions | Reading mentions needs each platform’s credentials and its rate limits. |
| 4 | Marketing | Social listening | Needs paid listening APIs. |
| 5 | Customer support / helpdesk | Social tickets | Needs platform credentials. |
| 14 | Recruitment | Job boards | Posting to a board needs that board’s account and API. |

---

## A bank feed or card issuer relationship

**3 lines depend on this.** The bank decides, not you. The matching half of reconciliation needs no feed at all and can be built against an imported statement first.

| # | Section | Line | Why it cannot be coded around |
|---:|---|---|---|
| 6 | Finance and accounting | Bank feeds | A feed is the bank’s own credentialed connection, or an aggregator’s. |
| 7 | Expense management | Corporate cards | Needs a card issuer relationship. |
| 7 | Expense management | Card transactions | The transaction feed is the card issuer’s, released under their agreement. |

---

## A government portal registration

**2 lines depend on this.** GST e-invoicing and e-way bills come from the portal under registered credentials. Required by law above a turnover threshold, so this one has a deadline attached.

| # | Section | Line | Why it cannot be coded around |
|---:|---|---|---|
| 6 | Finance and accounting | E-invoicing | An IRN comes from the government portal and needs registered credentials. |
| 6 | Finance and accounting | E-way bills | Same portal, same credential requirement. |

---

## An outside identity provider

**3 lines depend on this.** Decide this BEFORE the mobile app. Changing the sign-on model afterwards means reissuing every credential that was ever handed out.

| # | Section | Line | Why it cannot be coded around |
|---:|---|---|---|
| 1 | Platform architecture | OAuth | OAuth is against somebody else’s identity provider and needs a registered application and secret. |
| 2 | Master application hub | SSO | Single sign-on is against an outside identity provider and needs a registered application with it. |
| 26 | Integration platform | OAuth | Against somebody else’s provider, needing a registered application. |

---

## Storage somebody pays for

**1 line depend on this.** Holding customers’ files is a running cost with backups attached, not a feature that gets written once.

| # | Section | Line | Why it cannot be coded around |
|---:|---|---|---|
| 18 | Document management | Cloud storage | Storing customers’ files needs storage somewhere deployed, with its cost and its backups. |

---

## A domain, a host, and something deployed

**6 lines depend on this.** The first thing on the list, because several others cannot even start until something is running somewhere a person can reach.

| # | Section | Line | Why it cannot be coded around |
|---:|---|---|---|
| 1 | Platform architecture | Backups | A backup needs a running system and somewhere to put it. Nothing is deployed. |
| 2 | Master application hub | Monitoring | Needs something deployed to monitor. |
| 4 | Marketing | Custom domains | Needs a domain and a host that serves it. |
| 11 | E-commerce | Domains | Needs a registrar and a host. |
| 24 | Low-code app builder | Custom domains | Needs a registrar and a host. |
| 24 | Low-code app builder | App deployment | Needs somewhere to deploy to. |

---

## App-store accounts or software on each device

**3 lines depend on this.** Apple and Google both charge and both verify identity, which takes days and blocks release. Start the verification long before the app is ready.

| # | Section | Line | Why it cannot be coded around |
|---:|---|---|---|
| 2 | Master application hub | Endpoint management | Needs an agent installed on every device — a fleet, not a repository. |
| 18 | Document management | Desktop synchronization | Needs a desktop client installed on each machine. |
| 18 | Document management | Mobile access | Needs a mobile app and the store accounts to release it. |

---

## An accredited e-signature provider

**2 lines depend on this.** Not a cryptographic problem — a legal one. The provider stands behind the audit trail, which is the part that makes a signature hold up.

| # | Section | Line | Why it cannot be coded around |
|---:|---|---|---|
| 2 | Master application hub | E-signatures | A signature with legal standing needs an accredited provider and an audit trail they stand behind. |
| 31 | Contract management | E-signature | A signature with legal standing needs an accredited provider that stands behind the audit trail. |

---

## Somebody else’s credentials, generally

**10 lines depend on this.** The catch-all: every remaining line needs an account with a service this repository must never hold a secret for. Keys are entered at run time, never committed.

| # | Section | Line | Why it cannot be coded around |
|---:|---|---|---|
| 1 | Platform architecture | Integrations | Every live integration needs a third party’s credentials, and this repository must never hold one. |
| 1 | Platform architecture | Third-party integrations | Needs live credentials per provider. |
| 2 | Master application hub | Integration platform | A connector is only real when it holds a live credential for the service it connects to. |
| 4 | Marketing | Publishing | Posting to a platform needs its credentials. |
| 20 | Calendar | Calendar synchronization | Syncing to an outside calendar needs that provider’s credentials. |
| 22 | Video meetings | Calendar integration | Needs an outside calendar provider’s credentials. |
| 25 | Workflow automation | Send SMS | Needs an SMS provider and a registered sender. |
| 26 | Integration platform | API keys | A key is issued by the service being integrated with. |
| 27 | Data preparation | API ingestion | Ingesting from a service needs its credentials. |
| 28 | Business analytics | External databases | Needs the other database’s credentials. |

---

## What this list is not

**It is not a list of excuses.** Every line here is a real capability somebody would
reasonably expect, and each is genuinely blocked on something outside this repository —
the reason is printed beside it so the judgement can be disagreed with line by line.

**It is not fixed.** The moment a payment gateway is signed or a domain is pointed, the
lines it unblocks stop being constraints and become ordinary work. That is why they are
grouped by what they need: each group is one decision, not a list of separate defeats.

**And it is not the gap.** The gap is in `MASTER_SPEC_COVERAGE.xlsx` — these 85 are
counted separately there precisely so they do not sit among the uncovered looking like
work somebody forgot to schedule.

---

## Every technical word above, in plain language

**11 words.** Every technical term this document uses, in plain
language, with an everyday comparison. Nothing here assumes you already know any of them.


### platform

One piece of software that many separate businesses use at the same time, each seeing only its own information.

*Ek badi building jisme bahut saare offices hain. Building ek hai, par har office ki chaabi alag — koi kisi aur ke office mein nahin ghus sakta.*

### database

Where all the information is kept, arranged so any of it can be found instantly and nothing gets lost.

*Ek badi almari jisme har cheez apne fix khaane mein rakhi hai — dhoondhne ke liye poori almari palatni nahin padti.*

### backup

A copy of everything, kept somewhere else, so a mistake or a failure does not lose your work.

*Zaroori kaagzaat ki photocopy, doosri jagah rakhi hui. Asli jal jaaye toh bhi kaam nahin rukta.*

### audit trail

An automatic record of every change — what changed, who changed it, and when.

*Har entry ke saath naam aur time apne aap likha jaata hai. Baad mein koi bole "maine nahin kiya", toh register bata deta hai.*

### API

The agreed way two pieces of software talk to each other, so one can ask the other for something and get a predictable answer.

*Waiter. Aap kitchen mein nahin jaate — waiter ko order dete ho, wahi khaana le aata hai. Waiter badal jaaye toh bhi order dene ka tarika wahi rehta hai.*

### storage

Where files are kept — photographs, invoices, scanned documents. Different from the database, which keeps information rather than files.

*Almari ke bagal wala godown. Register almari mein, par bade dabbe aur photo godown mein.*

### queue

A waiting line for work that does not have to finish this second — sending a hundred messages, building a big report.

*Darzi ki dukaan ka parchi system. Kaam parchi pe likh ke lag gaya line mein; customer khada intezaar nahin karta.*

### job

One piece of work taken off the queue and done in the background.

*Line mein se uthayi gayi ek parchi, ab uska kaam ho raha hai.*

### deployment

Putting a new version of the software in place so people start using it.

*Nayi dukaan kholna ya purani ko naya roop dena — jab tak shutter nahin uthta, customer ko farq nahin padta.*

### model

The piece of artificial intelligence that reads or writes text, tags a photograph, or answers a question.

*Ek bahut padha-likha assistant. Kaam accha karta hai, par har baat pe usse poochho toh kharcha aur waqt dono lagta hai.*

### provider

A company whose service the system uses — for messages, for payments, for artificial intelligence, for delivery.

*Supplier. Ek supplier maal na de toh doosre se le lo — kaam nahin rukna chahiye.*

