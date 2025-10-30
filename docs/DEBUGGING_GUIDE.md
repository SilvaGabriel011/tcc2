# 🔧 Guia de Debug - AgroInsight

## Sistema de Códigos de Erro Implementado

### 📋 **Estrutura de Códigos**

#### **Autenticação (AUTH-001 a AUTH-099)**
- `AUTH-001`: Credenciais inválidas
- `AUTH-002`: Usuário não encontrado  
- `AUTH-003`: Senha incorreta
- `AUTH-004`: Sessão expirada
- `AUTH-005`: Token inválido
- `AUTH-006`: Usuário já existe
- `AUTH-007`: Email inválido
- `AUTH-008`: Senha muito fraca
- `AUTH-009`: Erro ao criar usuário
- `AUTH-010`: Erro de redirecionamento

#### **Banco de Dados (DB-001 a DB-099)**
- `DB-001`: Conexão com banco falhou
- `DB-002`: Erro na query
- `DB-003`: Registro não encontrado
- `DB-004`: Violação de constraint
- `DB-005`: Timeout na operação

#### **Upload/Análise (UPLOAD-001 a UPLOAD-099)**
- `UPLOAD-001`: Arquivo não enviado
- `UPLOAD-002`: Formato de arquivo inválido
- `UPLOAD-003`: Arquivo muito grande
- `UPLOAD-004`: Erro ao processar CSV
- `UPLOAD-005`: Dados insuficientes
- `UPLOAD-006`: Colunas não identificadas

#### **API (API-001 a API-099)**
- `API-001`: Método não permitido
- `API-002`: Dados de entrada inválidos
- `API-003`: Parâmetros obrigatórios ausentes
- `API-004`: Rate limit excedido
- `API-005`: Erro interno do servidor

#### **Permissão (PERM-001 a PERM-099)**
- `PERM-001`: Acesso negado
- `PERM-002`: Permissão insuficiente
- `PERM-003`: Recurso não encontrado
- `PERM-004`: Operação não permitida

#### **Validação (VAL-001 a VAL-099)**
- `VAL-001`: Dados obrigatórios ausentes
- `VAL-002`: Formato de dados inválido
- `VAL-003`: Valor fora do intervalo permitido
- `VAL-004`: Tipo de dados incorreto

## 🛠️ **Ferramentas de Debug Implementadas**

### **1. Componente de Diagnóstico**
- **Localização**: `/components/debug/error-diagnostic.tsx`
- **Funcionalidade**: Verifica automaticamente:
  - Status da sessão
  - Conexão com banco de dados
  - Funcionamento das APIs
  - Sistema de autenticação
- **Visível apenas em desenvolvimento**

### **2. Página de Debug**
- **URL**: `/debug`
- **Funcionalidades**:
  - Testes automatizados do sistema
  - Verificação de status da sessão
  - Teste de login manual
  - Links úteis para debug
- **Disponível apenas em desenvolvimento**

### **3. Logs Detalhados**
- **Console logs** com emojis para fácil identificação:
  - 🔐 Autenticação
  - 📊 Dashboard
  - 📝 Cadastro
  - ❌ Erros
  - ✅ Sucessos
  - 🌐 Requisições HTTP

### **4. Middleware de Debug**
- **Localização**: `/middleware.ts`
- **Funcionalidades**:
  - Log de todas as requisições
  - Verificação de autenticação
  - Headers de debug
  - Redirecionamentos automáticos

## 🚨 **Como Usar o Sistema de Debug**

### **Identificando Problemas**

1. **Verifique o Console do Navegador**
   - Procure por códigos de erro (ex: `[AUTH-001]`)
   - Observe os logs com emojis para rastrear o fluxo

2. **Use a Página de Debug**
   - Acesse `/debug` em desenvolvimento
   - Execute os testes automatizados
   - Verifique o status da sessão

3. **Componente de Diagnóstico**
   - Aparece automaticamente na página de login
   - Mostra status em tempo real dos sistemas

### **Soluções Comuns**

#### **Problema: Página preta com 404 após login**
- **Possíveis causas**:
  - `AUTH-010`: Erro de redirecionamento
  - Middleware bloqueando acesso
  - Sessão não criada corretamente

- **Como debugar**:
  1. Verifique console para logs de redirecionamento
  2. Acesse `/debug` para testar login
  3. Verifique se `/dashboard` existe e está acessível

#### **Problema: Login não funciona**
- **Códigos relacionados**: `AUTH-001`, `AUTH-002`, `AUTH-003`
- **Como debugar**:
  1. Verifique credenciais no console
  2. Teste com contas demo
  3. Verifique conexão com banco de dados

#### **Problema: APIs não respondem**
- **Códigos relacionados**: `API-005`, `DB-001`
- **Como debugar**:
  1. Execute testes na página `/debug`
  2. Verifique logs do servidor
  3. Teste endpoints individualmente

## 📊 **Monitoramento em Tempo Real**

### **Console Logs Estruturados**
```
🔐 Tentando fazer login... { email: "user@example.com" }
✅ Login bem-sucedido, redirecionando...
👤 Sessão obtida: { user: { email: "user@example.com", role: "USER" } }
📊 Dashboard - Status da sessão: authenticated
```

### **Códigos de Erro com Contexto**
```
[AUTH-002] Usuário não encontrado. Verifique o email informado.
[DB-001] Erro de conexão. Tente novamente em alguns minutos.
[UPLOAD-002] Formato de arquivo inválido. Apenas arquivos CSV são aceitos.
```

## 🔧 **Próximos Passos para Melhorias**

1. **Implementar sistema de métricas**
2. **Adicionar alertas automáticos**
3. **Criar dashboard de monitoramento**
4. **Implementar retry automático para falhas temporárias**
5. **Adicionar testes automatizados**

## 📞 **Suporte**

Para problemas não cobertos por este guia:
1. Verifique os logs no console
2. Use a página `/debug` para testes
3. Consulte o código de erro específico
4. Verifique a documentação da API em `/api/test`
