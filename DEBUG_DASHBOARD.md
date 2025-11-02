# 🔍 Debug do Dashboard - Valores Incorretos

## 🎯 Problema Reportado

Os valores exibidos no Dashboard não condizem com os dados reais.

---

## 🔎 Possíveis Causas

### 1. **Normalização de Nomes de Empresas**

A função `normalizeCompanyName` pode estar categorizando empresas incorretamente:

```typescript
// Lógica atual:
if (normalized.includes('fortaleza')) return 'churrasco_fortaleza';
if (normalized.includes('cariri')) return 'churrasco_cariri';
// Dados legados sem especificação vão para Cariri
if (normalized.includes('churrasco') || normalized.includes('companhia')) return 'churrasco_cariri';
```

**Verificar:**
- ✅ Se "Companhia do Churrasco" (legado) está indo para Cariri
- ✅ Se "Companhia do Churrasco Cariri" está sendo reconhecida
- ✅ Se "Companhia do Churrasco Fortaleza" está sendo reconhecida
- ✅ Se "Johnny Rockets" está sendo reconhecida

### 2. **Filtro de Período**

O filtro usa diferentes campos de data dependendo do tipo:
- **Despesas**: Prioriza `data_vencimento`, depois `data`, depois `data_pagamento`
- **Receitas**: Usa `data`

**Verificar:**
- ⚠️ Se as receitas têm o campo `data` preenchido corretamente
- ⚠️ Se as despesas estão usando a data correta (vencimento vs pagamento)

### 3. **Estrutura dos Dados de Receitas**

As receitas podem ter propriedades diferentes:

**Verificar:**
- ⚠️ Se receitas têm `empresa` ou `company`
- ⚠️ Se receitas têm `valor` preenchido
- ⚠️ Se receitas têm `data` no formato correto (YYYY-MM-DD)

---

## 🛠️ Como Debugar

### **Passo 1: Verificar Console do Navegador**

Após fazer commit e rodar a aplicação, abra o Console do navegador (F12) e procure por:

```
🎯 DASHBOARD CARDS DEBUG
Total de despesas recebidas: X
Total de receitas recebidas: Y
```

E depois:

```
Churrasco Cariri: { totalDespesas: X, totalReceitas: Y, despesas: N, receitas: M }
Churrasco Fortaleza: { totalDespesas: X, totalReceitas: Y, despesas: N, receitas: M }
Johnny: { totalDespesas: X, totalReceitas: Y, despesas: N, receitas: M }
```

### **Passo 2: Verificar Empresas Reconhecidas**

Procure por:

```
🔍 DEBUG: Empresas encontradas:
- Nome da Empresa (normalizado: churrasco_cariri)
- Nome da Empresa (normalizado: churrasco_fortaleza)
- Nome da Empresa (normalizado: johnny)
```

### **Passo 3: Verificar Filtros de Data**

Procure por:

```
=== FILTRO DE PERÍODO: MONTH ===
Total de dados para filtrar: X
Filtro MÊS - De: DD/MM/YYYY até: DD/MM/YYYY
Dados filtrados para month: Y de X
```

---

## 📊 Dados Esperados vs Encontrados

### **Formato Esperado - Despesas:**
```json
{
  "id": 123,
  "empresa": "Companhia do Churrasco Cariri",
  "data_vencimento": "2025-11-15",
  "data": "2025-11-01",
  "valor": 1000,
  "valor_total": 1050,
  "categoria": "INSUMOS"
}
```

### **Formato Esperado - Receitas:**
```json
{
  "id": 456,
  "empresa": "Companhia do Churrasco Cariri",
  "data": "2025-11-01",
  "valor": 5000,
  "categoria": "VENDAS"
}
```

---

## ⚠️ Pontos de Atenção

### 1. **Dados Legados**

**Problema:** Dados antigos com "Companhia do Churrasco" (sem especificar Cariri ou Fortaleza) devem ir para Cariri.

**Solução Atual:** A normalização coloca dados legados em `churrasco_cariri`:
```typescript
if (normalized.includes('churrasco') || normalized.includes('companhia')) 
  return 'churrasco_cariri';
```

### 2. **Camerino Filtrado**

O Camerino é **sempre filtrado** do Dashboard:
```typescript
const despesasSemCamerino = despesas.filter(despesa => {
  const empresa = despesa.empresa?.toLowerCase().trim() || '';
  return !empresa.includes('camerino');
});
```

### 3. **Receitas sem Empresa**

Se receitas não tiverem o campo `empresa`, elas **não aparecerão** no Dashboard.

---

## 🔧 Testes Recomendados

### **Teste 1: Verificar Receitas**

1. Vá para a página de **Receitas**
2. Verifique se todas as receitas têm empresa associada
3. Anote o total de receitas do mês atual
4. Compare com o valor no Dashboard

### **Teste 2: Verificar Despesas**

1. Vá para a página de **Despesas**
2. Filtre por empresa (Cariri, Fortaleza, Johnny)
3. Anote os totais de cada empresa
4. Compare com os valores no Dashboard

### **Teste 3: Verificar Período**

1. No Dashboard, selecione diferentes períodos:
   - Hoje
   - Esta Semana
   - Este Mês
   - Este Ano
   - Mês Personalizado
2. Verifique se os valores mudam corretamente

---

## 🐛 Possíveis Bugs Identificados

### **Bug Potencial 1: Receitas sem Normalização**

As receitas podem ter nomes de empresas diferentes dos esperados:

**Exemplos:**
- ❌ "Johnny" ao invés de "Johnny Rockets"
- ❌ "Churrasco" ao invés de "Companhia do Churrasco Cariri"
- ❌ "Companhia Cariri" ao invés de "Companhia do Churrasco Cariri"

**Solução:** Verificar no banco de dados os valores exatos do campo `empresa` nas receitas.

### **Bug Potencial 2: Data vs Data_Vencimento**

Para despesas, o filtro prioriza `data_vencimento`, mas as receitas usam `data`.

Isso pode causar discrepâncias se:
- Despesas forem filtradas por vencimento (novembro)
- Mas foram pagas em outubro
- As receitas são filtradas apenas por data de entrada

---

## 📝 Próximos Passos

1. **Fazer commit** das alterações atuais
2. **Executar** `npm run dev`
3. **Abrir** o Console do navegador (F12)
4. **Navegar** até o Dashboard
5. **Copiar** todos os logs do console
6. **Analisar** os dados retornados
7. **Comparar** com os dados esperados nas páginas de Despesas e Receitas

---

## 🎯 Checklist de Verificação

- [ ] Console mostra logs de debug do Dashboard
- [ ] Empresas são normalizadas corretamente
- [ ] Total de despesas condiz com página de Despesas
- [ ] Total de receitas condiz com página de Receitas
- [ ] Lucro/Prejuízo está correto (Receitas - Despesas)
- [ ] Câmerino está filtrado do Dashboard
- [ ] Filtro de período funciona corretamente
- [ ] Cariri inclui dados legados
- [ ] Fortaleza aparece separadamente
- [ ] Johnny Rockets aparece corretamente

---

## 💡 Dica

Execute este comando SQL no Supabase para verificar os nomes das empresas:

```sql
-- Ver todas as empresas distintas em despesas
SELECT DISTINCT empresa FROM despesas ORDER BY empresa;

-- Ver todas as empresas distintas em receitas
SELECT DISTINCT empresa FROM receitas ORDER BY empresa;

-- Contar despesas por empresa no mês atual
SELECT 
  empresa, 
  COUNT(*) as total, 
  SUM(valor_total) as soma 
FROM despesas 
WHERE data_vencimento >= '2025-11-01' 
  AND data_vencimento <= '2025-11-30'
GROUP BY empresa;

-- Contar receitas por empresa no mês atual
SELECT 
  empresa, 
  COUNT(*) as total, 
  SUM(valor) as soma 
FROM receitas 
WHERE data >= '2025-11-01' 
  AND data <= '2025-11-30'
GROUP BY empresa;
```

