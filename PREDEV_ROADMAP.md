# 🚀 AgroInsight - Roadmap de Melhorias (pre.dev)

**Gerado em:** 30 de Outubro de 2025  
**Ferramenta:** pre.dev Fast Spec  
**Status Atual:** Fase 2 completa (Dark Mode implementado)

---

## 📋 Executive Summary

O pre.dev analisou o AgroInsight e identificou oportunidades de melhoria em **5 áreas principais**:

1. **Performance e Escalabilidade** (Crítico)
2. **Experiência do Usuário** (Alto)
3. **Qualidade de Código** (Médio)
4. **Segurança Avançada** (Médio)
5. **Features Novas** (Baixo)

---

## ✅ STATUS ATUAL (O que já temos)

### Implementado com Sucesso:
- ✅ Análise estatística automática de CSV (60+ variáveis)
- ✅ Visualizações avançadas (BoxPlot, Histograma, Dispersão, Pizza)
- ✅ Diagnóstico IA com Gemini Pro
- ✅ Sistema de referências (Crossref + SciELO)
- ✅ 12 calculadoras zootécnicas
- ✅ Dark/Light mode completo
- ✅ Autenticação NextAuth + RBAC
- ✅ Isolamento de dados por usuário
- ✅ Download CSV/PDF

---

## 🎯 MILESTONE 1: Performance e Infraestrutura (CRÍTICO)

### Problemas Identificados:
❌ **SQLite em produção** (não escalável)  
❌ **Sem rate limiting** (APIs externas)  
❌ **Sem cache** (requests repetidas)  
❌ **Sem validação de tamanho de arquivo**  
❌ **Sem monitoramento/logging**

### 📦 Recomendações - Priority: HIGH

#### 1.1 Migrar para PostgreSQL + Vercel
```bash
# Stack recomendada pelo pre.dev:
- Database: PostgreSQL (Supabase/Neon/Vercel Postgres)
- Hosting: Vercel (deploy automático)
- Error Monitoring: Sentry
```

**Benefícios:**
- Escalabilidade automática
- Backup automático
- Deploy contínuo
- Monitoramento de erros

**Tasks:**
- [ ] Criar database PostgreSQL
- [ ] Atualizar Prisma schema para Postgres
- [ ] Migrar dados SQLite → Postgres
- [ ] Configurar Vercel deployment
- [ ] Adicionar Sentry para error tracking

---

#### 1.2 Implementar Rate Limiting
```typescript
// Criar middleware de rate limiting
// /middleware.ts

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for')
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 })
  }
}
```

**Tasks:**
- [ ] Instalar @upstash/ratelimit
- [ ] Configurar Redis (Upstash)
- [ ] Criar middleware de rate limiting
- [ ] Aplicar em APIs críticas (upload, diagnóstico, referências)
- [ ] Adicionar mensagens de erro amigáveis

---

#### 1.3 Implementar Cache com Redis
```typescript
// /lib/cache.ts
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function getCached<T>(key: string): Promise<T | null> {
  return await redis.get(key)
}

export async function setCache(key: string, value: any, ttl: number = 3600) {
  await redis.set(key, value, { ex: ttl })
}
```

**Onde aplicar:**
- Resultados de análises (1 hora)
- Referências científicas (24 horas)
- Diagnósticos IA (1 hora)

**Tasks:**
- [ ] Configurar Upstash Redis
- [ ] Criar módulo de cache
- [ ] Implementar cache em `/api/analise/resultados`
- [ ] Implementar cache em `/api/referencias/search`
- [ ] Implementar cache em `/api/analise/diagnostico`

---

#### 1.4 Validação de Upload
```typescript
// /lib/validation.ts
export const uploadConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: ['text/csv', 'application/vnd.ms-excel'],
  maxRows: 100000,
}

export function validateFile(file: File) {
  if (file.size > uploadConfig.maxFileSize) {
    throw new Error('Arquivo muito grande. Máximo: 50MB')
  }
  
  if (!uploadConfig.allowedTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo inválido. Use CSV.')
  }
}
```

**Tasks:**
- [ ] Criar módulo de validação
- [ ] Adicionar validação no frontend (React Dropzone)
- [ ] Adicionar validação no backend (API)
- [ ] Limitar número de linhas (100k)
- [ ] Adicionar mensagens de erro descritivas

---

## 🎨 MILESTONE 2: UX/UI Improvements (ALTO)

### 2.1 Landing Page + Onboarding
**Problema:** Usuários entram direto no login, sem contexto

**Solução:** Criar landing page informativa

**Páginas a criar:**
- [ ] `/` - Landing page com hero section
- [ ] `/features` - Lista de funcionalidades
- [ ] `/pricing` - Planos (Free/Pro/Enterprise)
- [ ] `/demo` - Análise demo sem login
- [ ] `/contact` - Formulário de contato

**Componentes:**
```tsx
// /app/page.tsx
export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </>
  )
}
```

---

### 2.2 Preview de CSV antes de Análise
**Problema:** Usuário não vê os dados antes de analisar

**Solução:**
```tsx
// Adicionar em /app/dashboard/analise/page.tsx

{uploadedFile && (
  <div className="mt-4 bg-card rounded-lg p-4">
    <h3>Preview do Arquivo</h3>
    <div className="overflow-x-auto">
      <table>
        <thead>
          {/* Primeiras 5 colunas */}
        </thead>
        <tbody>
          {/* Primeiras 10 linhas */}
        </tbody>
      </table>
    </div>
    <p className="text-sm">Mostrando 10 de {totalRows} linhas</p>
  </div>
)}
```

**Tasks:**
- [ ] Adicionar parse parcial com PapaParse
- [ ] Mostrar preview (10 linhas, todas colunas)
- [ ] Adicionar contagem de linhas/colunas
- [ ] Detectar tipos de colunas (número/texto)

---

### 2.3 Notificações Toast
**Problema:** Feedback visual limitado

**Solução:** Implementar sistema de notificações

```bash
npm install sonner
```

```tsx
// /components/toast-provider.tsx
import { Toaster } from 'sonner'

export function ToastProvider() {
  return <Toaster position="top-right" />
}

// Uso:
import { toast } from 'sonner'

toast.success('Análise concluída!')
toast.error('Erro ao fazer upload')
toast.loading('Processando...')
```

**Tasks:**
- [ ] Instalar sonner
- [ ] Adicionar ToastProvider no layout
- [ ] Substituir alerts por toasts
- [ ] Adicionar em uploads, análises, downloads

---

### 2.4 Loading States Melhores
**Problema:** Spinners genéricos

**Solução:** Skeletons e progress bars

```tsx
// /components/skeleton.tsx
export function AnalysisLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}
```

**Tasks:**
- [ ] Criar componentes Skeleton
- [ ] Adicionar progress bar em uploads
- [ ] Adicionar skeleton em resultados
- [ ] Adicionar skeleton em referências

---

## 🧪 MILESTONE 3: Testes e Qualidade (MÉDIO)

### 3.1 Testes Unitários (Vitest)
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Arquivos a testar:**
- [ ] `/lib/dataAnalysis.ts` (funções estatísticas)
- [ ] `/lib/auth.ts` (autenticação)
- [ ] Calculadoras (12 funções)
- [ ] Validações

**Exemplo:**
```typescript
// /lib/__tests__/dataAnalysis.test.ts
import { calculateMean, detectOutliers } from '../dataAnalysis'

describe('dataAnalysis', () => {
  test('calculateMean', () => {
    expect(calculateMean([1, 2, 3, 4, 5])).toBe(3)
  })
  
  test('detectOutliers', () => {
    const data = [1, 2, 3, 100]
    const outliers = detectOutliers(data)
    expect(outliers).toContain(100)
  })
})
```

---

### 3.2 Testes E2E (Playwright)
```bash
npm install -D @playwright/test
```

**Fluxos a testar:**
- [ ] Signup → Login → Upload CSV → Ver resultados
- [ ] Pesquisar referências → Salvar → Ver salvos
- [ ] Usar calculadora → Ver resultado
- [ ] Gerar diagnóstico IA

---

### 3.3 CI/CD com GitHub Actions
```yaml
# /.github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test
      - run: npm run build
```

**Tasks:**
- [ ] Criar workflow de testes
- [ ] Configurar auto-deploy no Vercel
- [ ] Adicionar badge no README

---

## 🔒 MILESTONE 4: Segurança Avançada (MÉDIO)

### 4.1 Adicionar Features de Segurança

**Tasks:**
- [ ] **Password Reset Flow** (email com token)
- [ ] **2FA (Two-Factor Auth)** (opcional)
- [ ] **Session Timeout** (30 minutos)
- [ ] **CSRF Protection** (tokens)
- [ ] **Input Sanitization** (XSS prevention)

---

### 4.2 Audit Log Viewer
```tsx
// /app/dashboard/admin/audit-logs/page.tsx
export default function AuditLogsPage() {
  return (
    <div>
      <h1>Audit Logs</h1>
      <Filters />
      <Table>
        <thead>
          <tr>
            <th>User</th>
            <th>Action</th>
            <th>Timestamp</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{log.user.name}</td>
              <td>{log.action}</td>
              <td>{log.timestamp}</td>
              <td><ViewButton /></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}
```

**Tasks:**
- [ ] Criar página de audit logs
- [ ] Adicionar filtros (usuário, ação, data)
- [ ] Paginação
- [ ] Export CSV/PDF

---

## 🆕 MILESTONE 5: Features Novas (BAIXO)

### 5.1 Admin Dashboard
- [ ] Visão geral (usuários ativos, análises, storage)
- [ ] Gerenciar usuários (ativar/desativar)
- [ ] Gerenciar projetos
- [ ] Configurações globais

---

### 5.2 Presets de Análise
**Ideia:** Salvar configurações de análise

```typescript
// Exemplo:
const preset = {
  name: 'Análise Bovina',
  columns: ['peso', 'idade', 'raça'],
  filters: { raça: 'Nelore' },
  charts: ['boxplot', 'histogram']
}
```

**Tasks:**
- [ ] Criar modelo Preset no Prisma
- [ ] CRUD de presets
- [ ] Aplicar preset ao fazer upload
- [ ] Compartilhar presets entre usuários

---

### 5.3 API Pública (Opcional)
**Ideia:** Permitir integração externa

```typescript
// POST /api/v1/analyze
{
  "apiKey": "...",
  "data": [...],
  "options": {...}
}

// Response:
{
  "analysisId": "...",
  "stats": {...},
  "charts": [...]
}
```

---

### 5.4 Notificações por Email
**Ideia:** Avisar quando análise está pronta

**Tasks:**
- [ ] Integrar Resend ou SendGrid
- [ ] Email de boas-vindas
- [ ] Email de análise concluída
- [ ] Email de diagnóstico pronto

---

## 📊 PRIORIZAÇÃO

### 🔥 FAZER AGORA (Próximas 2 semanas)
1. ✅ Validação de upload (1 dia)
2. ✅ Rate limiting básico (1 dia)
3. ✅ Preview de CSV (2 dias)
4. ✅ Toast notifications (1 dia)
5. ✅ Migração Postgres + Vercel (3 dias)

### ⭐ FAZER EM SEGUIDA (1 mês)
6. Cache com Redis (2 dias)
7. Landing page (1 semana)
8. Testes unitários básicos (1 semana)
9. Sentry monitoring (1 dia)
10. Skeletons e loading states (2 dias)

### 💡 FAZER DEPOIS (2-3 meses)
11. Testes E2E
12. Admin dashboard
13. Presets de análise
14. Password reset
15. Audit log viewer

---

## 📈 MÉTRICAS DE SUCESSO

**Performance:**
- [ ] Tempo de upload < 3s (50MB)
- [ ] Tempo de análise < 5s (10k linhas)
- [ ] TTI (Time to Interactive) < 2s

**UX:**
- [ ] Taxa de conclusão de análise > 80%
- [ ] Tempo médio de uso > 10 min
- [ ] NPS (Net Promoter Score) > 50

**Qualidade:**
- [ ] Cobertura de testes > 70%
- [ ] Zero crashes críticos/mês
- [ ] Uptime > 99.5%

---

## 🔗 RECURSOS

**Documentação:**
- [Especificação completa pre.dev](https://api.pre.dev/s/PUNqivRd)
- [DARK_MODE_GUIDE.md](./DARK_MODE_GUIDE.md)
- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)

**Stack Recomendada:**
- Database: PostgreSQL (Supabase/Neon)
- Hosting: Vercel
- Monitoring: Sentry
- Cache: Upstash Redis
- Email: Resend
- Testing: Vitest + Playwright

---

## 🎯 PRÓXIMOS PASSOS

**Semana 1-2:**
1. ✅ Implementar validação de upload
2. ✅ Adicionar rate limiting
3. ✅ Criar preview de CSV
4. ✅ Adicionar toast notifications

**Semana 3-4:**
5. ✅ Migrar para PostgreSQL
6. ✅ Deploy no Vercel
7. ✅ Adicionar Sentry
8. ✅ Implementar cache básico

**Mês 2:**
9. Criar landing page
10. Adicionar testes unitários
11. Melhorar loading states
12. Implementar password reset

---

**Gerado automaticamente por pre.dev**  
**Última atualização:** 30/10/2025
