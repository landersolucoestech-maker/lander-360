# 🔍 AUDITORIA TÉCNICA CRÍTICA - LANDER 360

**Data:** Junho 2025  
**Autor:** Arquiteto de Software Sênior / CTO  
**Escopo:** Análise completa de arquitetura, segurança, escalabilidade e dívida técnica

---

## 📊 RESUMO EXECUTIVO

| Área | Severidade | Status |
|------|------------|--------|
| **Segurança - Autenticação** | 🔴 CRÍTICO | Proteção de rotas DESABILITADA |
| **Segurança - CORS** | 🟠 ALTO | Configuração permissiva |
| **Arquitetura** | 🟡 MÉDIO | Backend obsoleto, dualidade de sistemas |
| **Escalabilidade** | 🟠 ALTO | Queries sem paginação, sem índices explícitos |
| **Dívida Técnica** | 🟡 MÉDIO | Código duplicado, arquivos muito grandes |
| **Qualidade de Código** | 🟢 BOM | Tipagem forte, padrões consistentes |

---

## 🔴 FALHAS CRÍTICAS DE SEGURANÇA

### 1. PROTEÇÃO DE ROTAS COMPLETAMENTE DESABILITADA

**Arquivo:** `/src/components/auth/ProtectedRoute.tsx`

```typescript
// CÓDIGO ATUAL - CRÍTICO
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>;  // ⚠️ NENHUMA VERIFICAÇÃO!
}
```

**Impacto:** QUALQUER usuário não autenticado pode acessar QUALQUER página do sistema, incluindo:
- Dashboard financeiro
- Contratos confidenciais
- Dados de artistas
- Configurações administrativas
- Gestão de usuários

**Correção URGENTE:**
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

### 2. CORS PERMISSIVO NAS EDGE FUNCTIONS

**Arquivo:** `/supabase/functions/_shared/cors.ts`

```typescript
// CÓDIGO ATUAL - RISCO
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // ⚠️ PERMITE QUALQUER ORIGEM
  ...
};
```

**Impacto:** Qualquer site malicioso pode fazer requests às suas Edge Functions se tiver um token válido.

**Recomendação:** Restringir a domínios específicos:
```typescript
const ALLOWED_ORIGINS = [
  'https://seu-dominio.com',
  'https://preview.emergentagent.com',
];
```

### 3. CONTENT SECURITY POLICY DESATUALIZADA

**Arquivo:** `/src/lib/security.ts` (linha 14)

```typescript
'connect-src': ["'self'", 'https://dkrrfnpvqrpakngigxsb.supabase.co'],
// ⚠️ APONTA PARA PROJETO ANTIGO! Deveria ser rlinswqockcnijhojnth
```

---

## 🟠 RISCOS ALTOS

### 4. SCRAPING FRÁGIL NO SPOTIFY

**Arquivo:** `/supabase/functions/spotify-metrics/index.ts` (linha 49-68)

```typescript
async function getMonthlyListeners(artistId: string): Promise<number> {
  const response = await fetch(`https://open.spotify.com/artist/${artistId}`);
  const html = await response.text();
  const match = html.match(/(\d[\d,.]*)\s*(?:monthly listeners|ouvintes mensais)/i);
  // ⚠️ SCRAPING HTML - Extremamente frágil!
}
```

**Problemas:**
- Spotify pode mudar o HTML a qualquer momento, quebrando a função
- Sem tratamento de rate limiting do Spotify
- User-Agent genérico pode ser bloqueado

**Recomendação:** Usar apenas a API oficial do Spotify ou remover essa funcionalidade.

### 5. QUERIES SEM PAGINAÇÃO

**Arquivo:** `/src/services/artists.ts` (e outros)

```typescript
static async getAll(): Promise<Artist[]> {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('created_at', { ascending: false });
  // ⚠️ SEM LIMIT! Carrega TODOS os registros
}
```

**Impacto:** Com 1000+ artistas, a aplicação ficará lenta e consumirá muita memória.

**Correção:**
```typescript
static async getAll(page = 1, pageSize = 20): Promise<PaginatedResult<Artist>> {
  const from = (page - 1) * pageSize;
  const { data, error, count } = await supabase
    .from('artists')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);
  
  return { data, count, page, pageSize };
}
```

### 6. ERROS IGNORADOS SILENCIOSAMENTE

**Arquivo:** `/supabase/functions/create-user/index.ts` (linha 40, 49)

```typescript
if (profileError) console.error('Profile error:', profileError);
// ⚠️ Erro apenas logado, operação considerada "sucesso"

if (roleError) console.error('Role error:', roleError);
// ⚠️ Idem
```

**Impacto:** Usuários podem ser criados sem profile ou sem roles, causando comportamento indefinido.

---

## 🟡 PROBLEMAS DE ARQUITETURA

### 7. BACKEND PYTHON OBSOLETO

**Diretório:** `/app/backend/`

```
/app/backend/
├── requirements.txt  (vazio ou mínimo)
└── server.py        (não utilizado)
```

**Situação:** Todo o backend está nas Edge Functions do Supabase. O diretório `/app/backend` é código morto.

**Recomendação:** Remover completamente ou documentar como "deprecated".

### 8. DUALIDADE NO SISTEMA DE ROLES

**Problema:** O sistema busca roles de DUAS fontes diferentes:

```typescript
// useUserRole.ts
// 1. Primeiro tenta user_roles table
const { data } = await supabase.from('user_roles').select('role');

// 2. Se falhar, usa profiles.roles
const { data: profileData } = await supabase.from('profiles').select('roles');
```

**Impacto:**
- Inconsistência de dados
- Bugs difíceis de rastrear
- Manutenção duplicada

**Recomendação:** Escolher UMA fonte de verdade e migrar todos os dados.

### 9. ARQUIVO DE TIPOS GIGANTE

**Arquivo:** `/src/integrations/supabase/types.ts`
**Tamanho:** 5124 linhas

**Problemas:**
- Difícil de navegar
- Tempo de compilação aumentado
- Gerado automaticamente (difícil customização)

**Recomendação:** Se possível, modularizar em arquivos separados por domínio.

---

## 📈 ESCALABILIDADE

### 10. AUSÊNCIA DE ÍNDICES EXPLÍCITOS

O schema SQL não define índices customizados. As buscas em tabelas grandes serão lentas.

**Tabelas críticas que precisam de índices:**
```sql
-- financial_transactions (busca por data, artista)
CREATE INDEX idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_artist ON financial_transactions(artist_id);

-- releases (busca por artista, data de lançamento)
CREATE INDEX idx_releases_artist ON releases(artist_id);
CREATE INDEX idx_releases_date ON releases(release_date);

-- audit_logs (busca por usuário, data)
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);
```

### 11. FALTA DE ESTRATÉGIA DE CACHE

Apenas o React Query está fazendo cache local. Para escalabilidade:
- Considerar Redis para cache de dados frequentes
- Implementar cache em Edge Functions para métricas do Spotify/YouTube
- Cache de resultados de AI (ai-gateway)

---

## ✅ PONTOS POSITIVOS

### Sistema de Permissões RBAC Robusto
- 7 perfis bem definidos
- Permissões granulares por módulo
- Matriz de permissões clara

### Segurança de Senhas
- Lista de 200+ senhas vazadas conhecidas
- Verificação de força de senha
- Detecção de padrões comuns

### Sanitização de Inputs
```typescript
export function sanitizeInputEnhanced(input: string): string {
  return input
    .replace(/[<>'"&]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .trim()
    .slice(0, 1000);
}
```

### Rate Limiting no Frontend
```typescript
export const authRateLimiter = createRateLimiter(5, 15 * 60 * 1000);
// 5 tentativas por 15 minutos
```

### Error Boundary Global
Proteção contra crashes não tratados no React.

### Validação de Upload de Arquivos
- Tipos permitidos explícitos
- Limite de 25MB

---

## 🛠️ RECOMENDAÇÕES PRIORIZADAS

### Prioridade 1 - URGENTE (Esta semana)

| # | Tarefa | Esforço |
|---|--------|---------|
| 1 | **Reativar ProtectedRoute** | 30 min |
| 2 | Restringir CORS nas Edge Functions | 1 hora |
| 3 | Atualizar CSP com domínio correto | 15 min |
| 4 | Tratar erros em create-user | 30 min |

### Prioridade 2 - ALTA (Este mês)

| # | Tarefa | Esforço |
|---|--------|---------|
| 5 | Implementar paginação em todos os services | 4 horas |
| 6 | Criar índices no banco de dados | 2 horas |
| 7 | Unificar sistema de roles | 3 horas |
| 8 | Refatorar getMonthlyListeners (Spotify) | 2 horas |

### Prioridade 3 - MÉDIA (Este trimestre)

| # | Tarefa | Esforço |
|---|--------|---------|
| 9 | Remover backend Python obsoleto | 30 min |
| 10 | Modularizar types.ts | 4 horas |
| 11 | Implementar cache em Edge Functions | 8 horas |
| 12 | Adicionar rate limiting nas Edge Functions | 4 horas |

---

## 📋 CHECKLIST DE CORREÇÕES

```
[ ] 1. ProtectedRoute reativada com verificação de auth
[ ] 2. CORS restrito a domínios autorizados
[ ] 3. CSP atualizada com novo domínio Supabase
[ ] 4. Erros tratados corretamente em create-user
[ ] 5. Paginação implementada em services
[ ] 6. Índices criados nas tabelas principais
[ ] 7. Sistema de roles unificado
[ ] 8. Scraping do Spotify removido/substituído
[ ] 9. Backend Python removido
[ ] 10. Types.ts modularizado
```

---

## 🎯 CONCLUSÃO

O **Lander 360** possui uma base sólida com boas práticas de segurança parcialmente implementadas (sistema de permissões, sanitização, rate limiting), mas apresenta **falhas críticas** que precisam de atenção imediata:

1. **A proteção de rotas DESABILITADA é o problema mais grave** - qualquer pessoa pode acessar o sistema sem autenticação.

2. A arquitetura serverless com Supabase Edge Functions é adequada para o escopo do projeto, mas precisa de melhorias em tratamento de erros e cache.

3. O schema de banco de dados é completo (83 tabelas), mas necessita de índices para escalar.

4. O código frontend é bem organizado e tipado, com padrões consistentes.

**Recomendação final:** Corrigir os itens de Prioridade 1 ANTES de qualquer uso em produção.

---

*Relatório gerado como parte da auditoria técnica solicitada.*
