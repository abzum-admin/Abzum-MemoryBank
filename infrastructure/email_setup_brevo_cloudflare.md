# Email Setup — Brevo + Cloudflare + Gmail

> **Status:** Setup complete
> **Saves:** `memory/abzum-email-setup-brevo-cloudflare-2026-04-03.md`

---

## What Was Set Up

`felix@abzum.com` configured as a "Send As" in Gmail via Brevo SMTP relay.

### Key Details

| Component | Setting |
|---|---|
| SMTP Server | `smtp-relay.brevo.com:587` |
| SMTP User | `a70105001@smtp-brevo.com` |
| SMTP Key | `bskNjyp5FAurZQb` |
| Domain | `abzum.com` (verified in Brevo + Cloudflare) |
| SPF Record | Brevo + Cloudflare + Google |
| Inbound Route | `felix@abzum.com` → `abzum.felixstanley@gmail.com` |
| Email Routing | Cloudflare Email Routes (free) |

### Brevo Resources
- SMTP Settings: https://app.brevo.com/settings/keys/smtp
- Sender Domains: https://app.brevo.com/senders/domain/list
- Senders: https://app.brevo.com/senders/list

### Cloudflare Resources
- Email Routing: https://dash.cloudflare.com/b1176596c41683ca634a6c62ae7650ad/abzum.com/email/routing/routes

---

## Full Documentation
See: `memory/abzum-email-setup-brevo-cloudflare-2026-04-03.md`
