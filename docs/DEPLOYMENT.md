# Deployment

## Platform
Hosted on **Railway** at **https://munshijee.ideageek.pk/**

## Environment Variables

Set the following in Railway's environment settings:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for NextAuth session signing |
| `NEXTAUTH_URL` | Set to `https://munshijee.ideageek.pk` |
| `ADMIN_EMAIL` | Super admin seed email |
| `ADMIN_PASSWORD` | Super admin seed password |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Token used to verify Meta WhatsApp webhook |

## WhatsApp Webhook

The webhook endpoint is live at:
```
https://munshijee.ideageek.pk/api/webhooks/whatsapp
```

### Meta Dashboard Configuration
| Field | Value |
|---|---|
| Callback URL | `https://munshijee.ideageek.pk/api/webhooks/whatsapp` |
| Verify token | Value of `WHATSAPP_WEBHOOK_VERIFY_TOKEN` on Railway |

## Deploying Changes

Railway auto-deploys on push to `main`. No manual steps needed after `git push`.
