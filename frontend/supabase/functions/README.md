# Lander 360 - Edge Functions

Este diretório contém todas as Edge Functions do Supabase para o sistema Lander 360.

## Funções Disponíveis

### Analytics
- **spotify-metrics** - Métricas do Spotify (followers, popularity, top tracks)
- **youtube-metrics** - Métricas do YouTube (subscribers, views, videos)
- **instagram-metrics** - Métricas do Instagram via Meta Graph API
- **tiktok-metrics** - Métricas do TikTok via API oficial
- **social-metrics** - Agregador de todas as métricas sociais

### AI
- **ai-gateway** - Gateway para OpenAI, Claude e Gemini

### Comunicação
- **send-email** - Envio de emails via Resend

### Contratos
- **autentique-signature** - Assinatura digital via Autentique

### Calendário
- **google-calendar-sync** - Sincronização com Google Calendar

## Deploy

Para fazer deploy das funções:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Vincular ao projeto
supabase link --project-ref rlinswqockcnijhojnth

# Deploy de todas as funções
supabase functions deploy

# Ou deploy individual
supabase functions deploy spotify-metrics
```

## Secrets Necessários

Adicione estes secrets no Supabase Dashboard > Project Settings > Edge Functions > Manage Secrets:

```
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
YOUTUBE_API_KEY
META_APP_ID
META_APP_SECRET
META_ACCESS_TOKEN
TIKTOK_CLIENT_KEY
TIKTOK_CLIENT_SECRET
OPENAI_API_KEY
CLAUDE_API_KEY
GEMINI_API_KEY
RESEND_API_KEY
AUTENTIQUE_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```
# Deploy trigger Mon Dec 22 00:58:50 UTC 2025
