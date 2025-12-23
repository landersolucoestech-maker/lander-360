# 🔴 AUDITORIA TÉCNICA COMPLETA - LANDER 360º

**Data:** 23/12/2024  
**Sistema:** Lander 360º - Plataforma de Gestão Musical  
**Stack:** React + TypeScript + Supabase (PostgreSQL)

---

## 1️⃣ ARQUITETURA DO SISTEMA

### PROBLEMAS CRÍTICOS

#### 1.1. Frontend-Only Architecture com Lógica de Negócio Exposta
- **PROBLEMA:** Toda a lógica de negócio está no frontend (services/, hooks/). Não existe backend separado.
- **CONSEQUÊNCIA:** 
  - Regras de negócio podem ser manipuladas via DevTools
  - Cálculos de royalties, splits e valores financeiros são feitos no navegador
  - Qualquer usuário com conhecimento técnico pode alterar dados
- **CORREÇÃO:** Implementar backend (FastAPI/Node) para lógica crítica: cálculos financeiros, validações de contratos, automações

#### 1.2. Ausência de Camada de API Própria
- **PROBLEMA:** Acesso direto ao Supabase via client-side SDK
- **CONSEQUÊNCIA:** 
  - Toda política de segurança depende exclusivamente de RLS
  - Impossível implementar rate limiting, cache de aplicação ou transformações de dados
  - Logs de auditoria podem ser burlados
- **CORREÇÃO:** Criar API Gateway intermediária antes de ir para produção

#### 1.3. Acoplamento Excessivo entre Módulos
- **PROBLEMA:** `AuthContext.tsx` centraliza permissões mas depende de busca em múltiplas tabelas (`user_roles`, `profiles.roles`, `profiles.role_display`)
- **CONSEQUÊNCIA:** 
  - Falha de uma tabela quebra todo o sistema de autenticação
  - Permissões inconsistentes entre fontes de dados
  - Fallback para 'leitor' em erro mascara problemas graves
- **CORREÇÃO:** Normalizar fonte única de roles; eliminar fallbacks silenciosos

#### 1.4. Separação Incorreta de Domínios
- **PROBLEMA:** Não existe distinção clara entre:
  - GRAVADORA (fonogramas, masters, distribuição)
  - EDITORA (obras, publishing, direitos autorais)
  - PRODUTORA (projetos, produção artística)
  - DISTRIBUIÇÃO (lançamentos, plataformas)
- **CONSEQUÊNCIA:** 
  - `music_registry` mistura conceitos de OBRA e FONOGRAMA (tem ISRC + ISWC na mesma tabela)
  - Impossível separar royalties de fonograma vs royalties de composição
  - Um mesmo registro pode ser obra E fonograma simultaneamente
- **CORREÇÃO:** Separar completamente `works` (ISWC, composição) de `phonograms` (ISRC, gravação)

---

## 2️⃣ MODELAGEM DE DADOS

### PROBLEMAS CRÍTICOS

#### 2.1. music_registry: Entidade Híbrida OBRA + FONOGRAMA
- **PROBLEMA:** Tabela `music_registry` possui campos:
  - `isrc` (identificador de FONOGRAMA)
  - `iswc` (identificador de OBRA)
  - `writers[]` (compositores - atributo de OBRA)
  - `publishers[]` (editoras - atributo de OBRA)
  - `bpm`, `duration`, `genre` (atributos de FONOGRAMA)
- **CONSEQUÊNCIA:**
  - Impossível rastrear múltiplos fonogramas de uma mesma obra
  - Impossível calcular royalties de composição separado de master
  - Sistema não suporta versões cover, remixes com obra de terceiros
  - Relatórios ECAD/ABRAMUS serão incorretos
- **CORREÇÃO OBRIGATÓRIA:**
  ```sql
  -- Separar em duas tabelas
  CREATE TABLE works (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    iswc TEXT,
    writers JSONB,      -- [{name, role, share_percentage, ipi}]
    publishers JSONB,   -- [{name, share_percentage}]
    ...
  );
  
  CREATE TABLE phonograms (
    id UUID PRIMARY KEY,
    work_id UUID REFERENCES works(id),  -- Relação N:1 (vários fonogramas podem vir de 1 obra)
    title TEXT NOT NULL,
    isrc TEXT,
    master_owner TEXT,
    duration INTEGER,
    ...
  );
  ```

#### 2.2. Tabela `phonograms` Existe mas Está Desconectada
- **PROBLEMA:** Existe tabela `phonograms` com `work_id` referenciando `music_registry`, mas parece não ser usada consistentemente
- **CONSEQUÊNCIA:** Duplicação de dados e inconsistência entre registros

#### 2.3. Splits/Shares Mal Modelados
- **PROBLEMA:** 
  - Tabela `pending_shares` tem campos `participant_name`, `participant_role`, `share_percentage` sem FK para participante
  - Não existe tabela `participants` ou `rightsholders` normalizada
  - `music_registry.participants` é JSON sem estrutura definida
- **CONSEQUÊNCIA:**
  - Impossível rastrear participações do mesmo autor em múltiplas obras
  - Impossível gerar relatórios por titular de direitos
  - Duplicação de nomes com variações (João Silva, João da Silva, J. Silva)
- **CORREÇÃO:** Criar tabela `rightsholders` e junction table para participações

#### 2.4. Contratos Sem Vínculo com Obras/Fonogramas
- **PROBLEMA:** Tabela `contracts` tem `artist_id` e `project_id` mas não tem vínculo direto com obras ou fonogramas
- **CONSEQUÊNCIA:**
  - Impossível determinar quais obras estão cobertas por qual contrato
  - Impossível validar período de vigência por obra
  - Contratos de edição não podem referenciar obras específicas

#### 2.5. Releases.tracks é JSON não normalizado
- **PROBLEMA:** Campo `tracks` em `releases` é JSON ao invés de relação N:N
- **CONSEQUÊNCIA:**
  - Impossível query por track individual
  - Impossível vincular track a fonograma existente
  - Duplicação de dados de track entre releases

#### 2.6. Campos Duplicados e Inconsistentes
- **PROBLEMA:**
  - `artists.email` e `artist_sensitive_data.email` - duplicado
  - `artists.phone` e `artist_sensitive_data.phone` - duplicado
  - `contracts.start_date`, `contracts.effective_from` - mesmo conceito
  - `contracts.end_date`, `contracts.effective_to` - mesmo conceito
  - `releases.release_date`, `releases.actual_release_date`, `releases.planned_release_date` - confuso
- **CONSEQUÊNCIA:** Dados inconsistentes entre tabelas

#### 2.7. Ausência de Campos Críticos
- **FALTANDO EM `phonograms`:**
  - `p_line` (copyright de fonograma)
  - `explicit_content` (conteúdo explícito)
  - `primary_artist_id[]` (artistas principais)
  - `featuring_artist_id[]` (participações)
  - `producer_id` (produtor fonográfico)

- **FALTANDO EM `releases`:**
  - `c_line` (copyright de arte)
  - `territories[]` (territórios de distribuição)
  - `preorder_date`
  - `original_release_date` (para re-releases)

- **FALTANDO EM `contracts`:**
  - `territories[]` (territórios do contrato)
  - `renewal_terms` (termos de renovação)
  - `exclusivity_type` (exclusivo/não-exclusivo)
  - `option_periods[]` (períodos opcionais)

---

## 3️⃣ PERMISSÕES, SETORES E FUNÇÕES

### PROBLEMAS CRÍTICOS

#### 3.1. Sistema de Roles com Múltiplas Fontes de Verdade
- **PROBLEMA:** AuthContext.tsx busca roles de:
  1. `user_roles.role`
  2. `profiles.roles[]`
  3. `profiles.role_display`
- **CONSEQUÊNCIA:** 
  - Usuário pode ter roles diferentes dependendo de qual fonte responde primeiro
  - Erro 400 em `user_roles` é silenciado e sistema assume role errado

#### 3.2. Fallback Silencioso para 'leitor'
- **PROBLEMA:** `fetchUserRoles` retorna `['leitor']` em caso de erro
- **CONSEQUÊNCIA:** 
  - Administrador pode perder acesso se houver erro de rede
  - Usuário malicioso pode forçar erro para ganhar acesso não autorizado a telas de leitura

#### 3.3. canAccess() Permite por Padrão
- **PROBLEMA:** Em `createCanAccess`:
  ```typescript
  // Se o módulo não está na lista de nenhuma role, permite por padrão
  const allConfiguredModules = Object.values(rolePermissions).flat();
  if (!allConfiguredModules.includes(module)) {
    return true;  // ❌ PERIGOSO
  }
  ```
- **CONSEQUÊNCIA:** Qualquer módulo novo ou não configurado é acessível por todos

#### 3.4. Artista Pode Acessar Todos os Dados
- **PROBLEMA:** Role `artista` tem permissões mas filtro é aplicado apenas via `useArtistFilter()` no frontend
- **CONSEQUÊNCIA:** 
  - Artista pode manipular requests e ver dados de outros artistas
  - RLS no Supabase parece não filtrar por artista automaticamente
- **CORREÇÃO:** Implementar RLS que filtre por `artist_id` vinculado ao `user_id`

#### 3.5. RLS Genérico Demais
- **PROBLEMA:** Script `supabase_security_fix.sql` apenas habilita RLS mas políticas são genéricas
- **CONSEQUÊNCIA:** 
  - `USING (auth.uid() IS NOT NULL)` permite qualquer usuário logado ver tudo
  - Não existe filtragem por tenant, artista ou projeto

#### 3.6. Ausência de Permissões por Ação
- **PROBLEMA:** `defaultRolePermissions` define arrays mas não são verificados nas mutations
- **CONSEQUÊNCIA:** 
  - Frontend mostra botão de editar mas backend não valida
  - `financeiro` tem `['view', 'create', 'edit']` mas nada impede delete via Supabase direto

---

## 4️⃣ EXPERIÊNCIA DO USUÁRIO (UX/UI)

### PROBLEMAS

#### 4.1. Navegação Confusa para Artista
- **PROBLEMA:** Artista vê menu com termos empresariais (Dashboard, Contratos, Financeiro) ao invés de termos personalizados
- **CONSEQUÊNCIA:** Atrito e confusão para usuário final
- **CORREÇÃO PARCIAL:** `artistModeNavTitles` existe mas não é aplicado consistentemente

#### 4.2. Telas Sobrecarregadas
- **PROBLEMA:** Página de Contratos tem 40+ campos no formulário
- **CONSEQUÊNCIA:** Usuário precisa rolar muito; alta taxa de abandono

#### 4.3. Falta de Wizard para Fluxos Complexos
- **PROBLEMA:** Criar lançamento envolve: cadastrar obra → cadastrar fonograma → cadastrar release → definir shares → enviar para distribuição
- **CONSEQUÊNCIA:** Usuário não sabe a sequência correta; dados incompletos

#### 4.4. Estados de Loading Genéricos
- **PROBLEMA:** "Carregando contratos..." sem indicação de progresso ou erro
- **CONSEQUÊNCIA:** Usuário não sabe se está carregando ou travou

#### 4.5. Mensagens de Erro Técnicas
- **PROBLEMA:** Erros do Supabase são exibidos diretamente (`PGRST201`)
- **CONSEQUÊNCIA:** Usuário não entende o problema

---

## 5️⃣ FLUXOS DE NEGÓCIO (MÚSICA NA VIDA REAL)

### PROBLEMAS CRÍTICOS

#### 5.1. Cadastro de Artistas
- **CORRETO:** Separação de dados sensíveis em `artist_sensitive_data`
- **PROBLEMA:** Não existe workflow de onboarding; artista não consegue se auto-cadastrar com dados mínimos
- **FALTANDO:** 
  - Validação de CPF/CNPJ
  - Verificação de conta bancária
  - Assinatura de termos de uso

#### 5.2. Cadastro de Obras
- **PROBLEMA:** `music_registry` mistura obra e fonograma
- **CONSEQUÊNCIA:**
  - Impossível cadastrar obra sem gravação
  - Impossível indicar que versão X é cover de obra Y
  - Publishers e writers são arrays de texto, não entidades
- **CORREÇÃO:** Separar cadastro de OBRA (composição) de FONOGRAMA (gravação)

#### 5.3. Fluxo de Lançamento
- **PROBLEMA:** Releases não têm workflow de aprovação
- **FALTANDO:**
  - Status: rascunho → validação → aprovado → enviado → live → takedown
  - Checklist de validação: arte, metadados, áudio, splits
  - Integração com distribuidoras para envio automatizado

#### 5.4. Gestão de Splits/Shares
- **PROBLEMA:** 
  - `pending_shares` é tabela auxiliar sem estrutura
  - Shares ficam dentro de `releases.tracks` como JSON
- **CONSEQUÊNCIA:**
  - Impossível gerar statement de royalties por titular
  - Impossível validar se soma de shares = 100%
  - Alteração de share requer edição manual

#### 5.5. Fluxo de Contrato
- **PROBLEMA:**
  - Contrato não gera automaticamente releases permitidos
  - Não existe vínculo contrato → obras incluídas
  - Vigência não bloqueia operações fora do período
- **FALTANDO:**
  - Workflow: rascunho → revisão jurídica → enviado para assinatura → assinado → vigente → encerrado
  - Alertas de vencimento
  - Renovação automática

#### 5.6. Fluxo Financeiro
- **PROBLEMA:**
  - Transações financeiras são genéricas (`financial_transactions`)
  - Não existe separação entre:
    - Royalties de streaming
    - Royalties de sync
    - Adiantamentos
    - Reembolsos
    - Pagamentos a terceiros
- **CONSEQUÊNCIA:**
  - Impossível gerar relatório de royalties por fonte
  - Impossível reconciliar com relatórios de distribuidoras

#### 5.7. Importação de Relatórios de Distribuidoras
- **OBSERVAÇÃO:** Existem tabelas `royalty_distrokid`, `royalty_onerpm_*`
- **PROBLEMA:** 
  - Estrutura diferente por distribuidora (não normalizado)
  - Não existe matching automático com obras cadastradas
  - ISRCs dos relatórios não são cruzados com ISRCs do catálogo

---

## 6️⃣ DISTRIBUIÇÃO DIGITAL & INTEGRAÇÕES

### PROBLEMAS CRÍTICOS

#### 6.1. Ausência de Integração Real com Distribuidoras
- **PROBLEMA:** 
  - Não existe API de envio para DistroKid, ONErpm, CD Baby, etc.
  - Sistema apenas gerencia dados localmente
- **CONSEQUÊNCIA:** 
  - Operador precisa lançar manualmente em cada plataforma
  - Dados de status são manuais e podem ficar desatualizados

#### 6.2. Tabela `distributions` Subutilizada
- **PROBLEMA:** Existe tabela `distributions` com `platform` e `status` mas não é usada para tracking real
- **CONSEQUÊNCIA:** Status de distribuição por plataforma é chute, não dado real

#### 6.3. White-Label Não Preparado
- **PROBLEMA:** 
  - Hardcoded: "LANDER RECORDS" no código
  - Não existe tabela `tenants` ou `organizations`
  - Configurações não são por empresa
- **CONSEQUÊNCIA:** Sistema não pode ser licenciado para outras gravadoras

#### 6.4. Territórios Não Implementados
- **PROBLEMA:** 
  - Não existe campo `territories` em releases
  - Não existe conceito de lançamento por região
- **CONSEQUÊNCIA:** Impossível fazer release específico para Brasil vs Mundial

---

## 7️⃣ SEGURANÇA & COMPLIANCE

### PROBLEMAS CRÍTICOS

#### 7.1. Dados Financeiros Expostos no Frontend
- **PROBLEMA:** Todos os dados financeiros são buscados via client-side
- **CONSEQUÊNCIA:** 
  - Qualquer usuário logado pode ver transações de outros via DevTools
  - CPF, dados bancários, valores de contratos podem vazar

#### 7.2. Audit Logs com Policy `USING (false)`
- **PROBLEMA:** `CREATE POLICY deny_all_audit_logs ... USING (false)` bloqueia leitura
- **CONSEQUÊNCIA:** 
  - Administrador não consegue ver logs de auditoria pelo sistema
  - Logs só acessíveis via SQL direto no Supabase

#### 7.3. Sem Criptografia de Dados Sensíveis
- **PROBLEMA:** 
  - `artist_sensitive_data.cpf_cnpj` é texto plano
  - `artist_sensitive_data.pix_key` é texto plano
  - Dados bancários em texto plano
- **CONSEQUÊNCIA:** Vazamento de dados = exposição total

#### 7.4. LGPD Não Implementada
- **FALTANDO:**
  - Consentimento de uso de dados
  - Exportação de dados do titular
  - Anonimização em exclusão
  - Log de acesso a dados pessoais

#### 7.5. Sem Rate Limiting
- **PROBLEMA:** Acesso direto ao Supabase não tem throttling
- **CONSEQUÊNCIA:** 
  - Possível exfiltração massiva de dados
  - DDoS no banco de dados

---

## 8️⃣ PERFORMANCE & ESCALABILIDADE

### PROBLEMAS

#### 8.1. Queries Sem Paginação em Várias Páginas
- **PROBLEMA:** `useContracts()`, `useArtists()` carregam todos os registros
- **CONSEQUÊNCIA:** 
  - Com 10.000 artistas, página vai travar
  - Memória do navegador estoura

#### 8.2. Joins N+1
- **PROBLEMA:** Para buscar contratos com artistas, faz query separada para cada artista
- **CONSEQUÊNCIA:** 100 contratos = 101 queries

#### 8.3. Sem Cache de Dados Estáticos
- **PROBLEMA:** Listas de gêneros, status, tipos são buscadas do banco a cada render
- **CORREÇÃO:** Usar cache local ou constantes para dados que não mudam

#### 8.4. JSON em Campos que Deveriam Ser Tabelas
- **PROBLEMA:** `participants`, `tracks`, `writers`, `publishers` são JSON
- **CONSEQUÊNCIA:** 
  - Impossível indexar
  - Impossível fazer JOIN
  - Performance degradada em relatórios

---

## 9️⃣ GOVERNANÇA & OPERAÇÃO

### PROBLEMAS

#### 9.1. Ausência de Ambiente de Staging
- **PROBLEMA:** Não existe separação dev/staging/prod
- **CONSEQUÊNCIA:** Bugs vão direto para produção

#### 9.2. Sem Métricas de Negócio
- **PROBLEMA:** Dashboard mostra KPIs mas não são persistidos
- **FALTANDO:**
  - Histórico de crescimento de catálogo
  - Evolução de receita mensal
  - Taxa de conversão de contratos

#### 9.3. Sem Alertas Automatizados
- **FALTANDO:**
  - Contrato vencendo em 30 dias
  - Lançamento sem distribuição há X dias
  - Pagamento de royalties pendente
  - Split não fechado (soma ≠ 100%)

#### 9.4. Backup Dependente Apenas do Supabase
- **PROBLEMA:** Não existe backup próprio dos dados
- **CONSEQUÊNCIA:** Perda total se Supabase falhar

---

## 🔟 RECOMENDAÇÕES OBRIGATÓRIAS

### ❌ DEVE SER REFEITO DO ZERO

1. **Modelagem de Obra vs Fonograma**
   - Criar tabelas separadas `works` e `phonograms`
   - Migrar dados existentes com mapeamento
   - Tempo estimado: 2-3 semanas

2. **Sistema de Splits/Shares**
   - Criar tabela `rightsholders` normalizada
   - Criar junction table `work_shares` e `phonogram_shares`
   - Implementar validação de 100% no backend
   - Tempo estimado: 1-2 semanas

### ⚠️ CORREÇÕES CRÍTICAS ANTES DE LANÇAR

1. **Implementar Backend para Lógica Crítica**
   - Cálculo de royalties
   - Validação de contratos
   - Criação de usuários automatizada
   - Tempo: 3-4 semanas

2. **Corrigir Sistema de Permissões**
   - Fonte única de roles
   - RLS por artista
   - Eliminar fallbacks permissivos
   - Tempo: 1 semana

3. **Criptografar Dados Sensíveis**
   - CPF, CNPJ, dados bancários
   - Usar pgcrypto ou vault
   - Tempo: 3-5 dias

4. **Implementar LGPD Mínimo**
   - Termos de aceite
   - Exportação de dados
   - Tempo: 1 semana

5. **Separar Domínios no Schema**
   - Gravadora, Editora, Produtora, Distribuição
   - Tempo: 2 semanas

### ✅ PODE SER CORRIGIDO DEPOIS

1. Wizard de cadastro de lançamento
2. Integração com distribuidoras
3. Dashboard de métricas históricas
4. Multi-tenancy para white-label
5. Alertas automatizados
6. Importação automatizada de relatórios

---

## CONCLUSÃO

O sistema **NÃO ESTÁ PRONTO PARA PRODUÇÃO** com dados reais de artistas, contratos e valores financeiros.

**Principais bloqueadores:**
1. Modelagem de dados fundamentalmente errada (obra vs fonograma)
2. Segurança insuficiente (frontend-only, sem criptografia)
3. Permissões com falhas graves (fallbacks permissivos)
4. Ausência de backend para validações críticas

**Estimativa para MVP corrigido:** 8-12 semanas de desenvolvimento focado.

---
*Documento gerado para auditoria técnica. Não constitui garantia de funcionamento após correções.*
