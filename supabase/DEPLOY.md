# Deploying the Align scheduling backend

What this is: a Postgres schema (`devices`, `call_schedules`), a per-minute
`pg_cron` job (`dispatch_due_calls`) that finds due calls and invokes the
`send-call` edge function, which sends an APNs VoIP push so the phone rings.

Prereqs: a Supabase project; CLI at `~/.local/bin/supabase` (v2.105+).

```sh
cd /Users/suyeoncha/Documents/Projects/align
SB=~/.local/bin/supabase

# 1. Authenticate (one-time; opens a browser, stores token locally)
$SB login

# 2. Link the project (asks for the DB password you set at creation)
$SB link --project-ref <PROJECT_REF>

# 3. Push schema + cron dispatcher
$SB db push
#   If it errors on extensions, enable pg_cron + pg_net once in the dashboard
#   (Database -> Extensions), then re-run.

# 4. APNs secrets for the send-call function
$SB secrets set \
  APNS_KEY="$(cat ~/Downloads/AuthKey_3R5BG278WJ.p8)" \
  APNS_KEY_ID=3R5BG278WJ \
  APNS_TEAM_ID=UTXA7352UW \
  APNS_BUNDLE_ID=com.syncha.align

# 5. Deploy the functions
$SB functions deploy send-call register-token save-schedule

# 6. Vault secrets the cron dispatcher reads (SQL editor or psql):
#   select vault.create_secret('https://<PROJECT_REF>.supabase.co', 'project_url');
#   select vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');

# 7. App env -> .env.local
#   EXPO_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
#   EXPO_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
```

Manual test once deployed:
```sh
# insert a device row (or let the app register), then:
curl -X POST "https://<PROJECT_REF>.supabase.co/functions/v1/send-call" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" -H "apikey: <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"device_id":"suyeon-iphone","kind":"morning"}'
```
