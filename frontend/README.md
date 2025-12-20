# Lander 360

Sistema de gestão completo para gravadoras e artistas.

## Tecnologias

- **Frontend**: React + Vite + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Autenticação**: Supabase Auth

## Funcionalidades

- 🎵 Gestão de Artistas
- 📁 Projetos e Lançamentos
- 📝 Contratos e Templates
- 💰 Financeiro e Contabilidade
- 📅 Agenda de Eventos
- 📊 Relatórios e Métricas
- 🎯 Marketing e Campanhas
- 📱 CRM de Contatos
- 🔔 Notificações

## Como rodar

```bash
# Instalar dependências
yarn install

# Rodar em desenvolvimento
yarn dev

# Build para produção
yarn build
```

## Variáveis de Ambiente

Crie um arquivo `.env` com:

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anon
```
