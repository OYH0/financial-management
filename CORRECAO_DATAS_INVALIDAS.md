# 🔧 Correção de Datas Inválidas - Dashboard

## 🎯 Problema Identificado

Através da análise dos logs do console, identifiquei que algumas receitas no banco de dados possuem **datas com anos mal formatados**:

```
❌ INCORRETO: 20225-09-23  (ano com 5 dígitos)
✅ CORRETO:   2025-09-23   (ano com 4 dígitos)
```

**Exemplo real encontrado:**
```
[RECEITA] Usando data: 20225-09-23 
Empresa: Companhia do Churrasco Cariri 
Descrição: SALDO DO DIA 
Valor: 1551.2
```

Esse erro estava causando:
- ❌ Receitas não sendo contabilizadas corretamente nos filtros
- ❌ Dashboard mostrando valores incorretos para outubro
- ❌ Filtros de período ignorando essas receitas

---

## ✅ Solução Implementada

Implementei uma **solução em duas camadas**:

### 1️⃣ Correção no Banco de Dados (Permanente)

**Arquivo criado:** `CORRIGIR_DATAS_INVALIDAS.sql`

**Como executar:**
1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor** > **New query**
3. Cole o conteúdo do arquivo `CORRIGIR_DATAS_INVALIDAS.sql`
4. Clique em **Run**

Este SQL vai:
- Corrigir todas as datas nas tabelas `receitas` e `despesas`
- Substituir `20225-` por `2025-` em todos os campos de data
- Executar queries de verificação para garantir que tudo foi corrigido

### 2️⃣ Sanitização no Frontend (Preventiva)

**Arquivo modificado:** `src/components/dashboard/utils.ts`

Adicionei uma função `sanitizeDate()` que:
- ✅ Detecta automaticamente anos com 5 dígitos (ex: 20225, 20226, etc)
- ✅ Corrige para o formato correto (2025, 2026, etc)
- ✅ Exibe um aviso no console quando faz a correção
- ✅ Previne erros futuros caso novos dados inválidos sejam inseridos

**Exemplo do log que você verá:**
```
⚠️ Data corrigida: 20225-09-23 -> 2025-09-23
```

---

## 📋 Próximos Passos

### PASSO 1: Executar a correção no banco de dados
```bash
# Execute o SQL no Supabase Dashboard conforme instruções acima
```

### PASSO 2: Reiniciar o servidor de desenvolvimento
```bash
npm run dev
```

### PASSO 3: Verificar o Dashboard
1. Acesse o **Dashboard**
2. Selecione **Outubro 2025** no filtro personalizado
3. Verifique se os valores de receitas agora aparecem corretamente

### PASSO 4: Verificar os logs
Abra o **Console do navegador** e procure por:
- ✅ Mensagens `⚠️ Data corrigida:` (se ainda houver dados inválidos)
- ✅ Mensagens `[RECEITA] Usando data:` (para ver as datas sendo processadas)
- ✅ Totais de receitas por empresa

---

## 🧪 Como Verificar se Está Funcionando

1. **No Dashboard:**
   - Selecione "Outubro 2025" no filtro personalizado
   - Os cards das empresas devem mostrar:
     - **Churrasco Cariri:** ~R$ 455.211,72 em receitas
     - **Johnny Rockets:** ~R$ 205.560,58 em receitas
     - **Churrasco Fortaleza:** R$ 0,00 (sem receitas no período)

2. **No Console:**
   - Verifique os logs de processamento de receitas
   - Não deve haver mais mensagens sobre datas com ano `20225`
   - Todas as datas devem estar no formato `2025-MM-DD` ou `DD/MM/YYYY`

3. **No Supabase (Opcional):**
   ```sql
   -- Verificar se ainda existem datas inválidas
   SELECT * FROM receitas WHERE data LIKE '20225-%';
   SELECT * FROM despesas WHERE data LIKE '20225-%';
   
   -- Ambas devem retornar 0 registros
   ```

---

## 🎉 Resultado Esperado

Após aplicar essas correções:
- ✅ Dashboard mostra valores corretos para todos os meses
- ✅ Filtros de período funcionam corretamente
- ✅ Todas as receitas são contabilizadas
- ✅ Novos dados inválidos são automaticamente corrigidos pelo frontend

---

## 📝 Arquivos Criados/Modificados

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `CORRIGIR_DATAS_INVALIDAS.sql` | SQL | Script para corrigir dados no banco |
| `supabase/migrations/20251102000001_fix_invalid_dates.sql` | Migração | Versão da migração para histórico |
| `src/components/dashboard/utils.ts` | TypeScript | Função de sanitização de datas |
| `CORRECAO_DATAS_INVALIDAS.md` | Documentação | Este documento |

---

## ❓ Dúvidas?

Se após executar os passos acima os valores ainda estiverem incorretos:
1. Verifique os logs do console
2. Confirme que o SQL foi executado com sucesso no Supabase
3. Verifique se há outros anos inválidos (ex: 20226, 20227, etc)

**Próximo passo:** Execute o SQL no Supabase Dashboard e depois reinicie o servidor! 🚀

