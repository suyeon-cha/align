# VoIP Call Scheduler

This dev scaffold sends Apple PushKit VoIP pushes for the native CallKit path.

## Required APNs environment

Set these locally, not in Git:

```sh
export APNS_AUTH_KEY_PATH=/absolute/path/AuthKey_XXXXXXXXXX.p8
export APNS_KEY_ID=XXXXXXXXXX
export APNS_TEAM_ID=XXXXXXXXXX
export APNS_BUNDLE_ID=com.syncha.align
export APNS_ENV=production
```

For the EAS `development-device` build, use `production` because that profile is signed for internal/ad hoc distribution. Use `sandbox` only for a local Xcode/device development build signed with a development provisioning profile.

## Capture the phone's VoIP token

Run:

```sh
npm run voip:server
```

Add this to `.env.local`, replacing the IP with your Mac's LAN IP:

```sh
EXPO_PUBLIC_VOIP_TOKEN_ENDPOINT=http://192.168.x.x:8787/voip-token
```

Restart Metro, open the app, and the phone will POST its VoIP token to `.voip-token.json`.

## Send a test call

Send now:

```sh
npm run voip:send
```

Schedule for the next local 02:35:

```sh
npm run voip:send -- --at 02:35
```

Or with the dev server running:

```sh
curl "http://localhost:8787/call"
curl "http://localhost:8787/call?at=02:35"
```
