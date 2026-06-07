-- A device can be claimed (linked to a user) before its VoIP push token
-- registers. The token is filled in moments later by register-token.
alter table public.devices alter column voip_token drop not null;
