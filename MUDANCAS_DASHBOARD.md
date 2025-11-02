# 📊 Mudanças no Dashboard - Separação de Empresas + Receitas

## ✅ O que foi implementado:

### 1. 🏢 **Separação de Companhia do Churrasco**

**Antes:**
- 2 cards: "Companhia do Churrasco" (agrupado) + "Johnny Rockets"

**Agora:**
- 3 cards: "Companhia do Churrasco Cariri" + "Companhia do Churrasco Fortaleza" + "Johnny Rockets"

### 2. 💰 **Adição de Receitas nos Cards**

**Antes:**
- Apenas "Total Despesas"

**Agora:**
- **Receitas** (em verde)
- **Despesas** (em vermelho)
- **Lucro/Prejuízo** (verde se positivo, vermelho se negativo)

### 3. 📐 **Layout Responsivo**

**Desktop:**
```
┌─────────────┬─────────────┬─────────────┐
│   Cariri    │  Fortaleza  │   Johnny    │
└─────────────┴─────────────┴─────────────┘
```

**Tablet:**
```
┌─────────────┬─────────────┐
│   Cariri    │  Fortaleza  │
├─────────────┴─────────────┤
│         Johnny             │
└───────────────────────────┘
```

**Mobile:**
```
┌───────────────┐
│    Cariri     │
├───────────────┤
│   Fortaleza   │
├───────────────┤
│    Johnny     │
└───────────────┘
```

---

## 🔧 Como funciona agora:

### **Normalização de Empresas:**

```typescript
// Fortaleza
"Companhia do Churrasco Fortaleza" → churrasco_fortaleza

// Cariri
"Companhia do Churrasco Cariri" → churrasco_cariri
"Companhia do Churrasco" (legado) → churrasco_cariri  // ⚠️ IMPORTANTE!

// Johnny
"Johnny Rockets" → johnny
```

### **Cálculo de Lucro/Prejuízo:**

```
Lucro = Total Receitas - Total Despesas

Se Lucro >= 0: texto verde
Se Lucro < 0: texto vermelho (prejuízo)
```

---

## 🎯 O que verificar AGORA:

### **Passo 1: Execute a aplicação**

```bash
npm run dev
```

### **Passo 2: Abra o Dashboard**

Navegue até a página inicial (Dashboard)

### **Passo 3: Abra o Console do Navegador**

Pressione `F12` ou `Ctrl+Shift+I` e vá para a aba "Console"

### **Passo 4: Procure pelos logs**

Você deve ver algo assim:

```
🎯 DASHBOARD CARDS DEBUG
Total de despesas recebidas: X
Total de receitas recebidas: Y

🔍 DEBUG: Empresas encontradas:
- Companhia do Churrasco Cariri (normalizado: churrasco_cariri)
- Companhia do Churrasco Fortaleza (normalizado: churrasco_fortaleza)
- Johnny Rockets (normalizado: johnny)

Churrasco Cariri: {
  totalDespesas: 10000,
  totalReceitas: 15000,
  despesas: 25,
  receitas: 18
}
Churrasco Fortaleza: {
  totalDespesas: 8000,
  totalReceitas: 12000,
  despesas: 20,
  receitas: 15
}
Johnny: {
  totalDespesas: 5000,
  totalReceitas: 7000,
  despesas: 15,
  receitas: 10
}
```

### **Passo 5: Compare com os dados reais**

#### **Para Despesas:**
1. Vá para a página de **Despesas**
2. Filtre por empresa "Companhia do Churrasco Cariri"
3. Veja o total exibido no card de estatísticas
4. Compare com o valor no Dashboard

#### **Para Receitas:**
1. Vá para a página de **Receitas**
2. Filtre por empresa "Companhia do Churrasco Cariri"
3. Veja o total exibido no card de estatísticas
4. Compare com o valor no Dashboard

---

## 🐛 Se os valores não estiverem corretos:

### **Problema 1: Receitas não aparecem**

**Possível causa:** Receitas podem ter nome de empresa diferente.

**Verificar:**
1. Abra o Console
2. Procure por "Total de receitas recebidas: 0"
3. Se for 0, o problema está na fonte de dados (hook useReceitas)

**Solução temporária:**
Execute no SQL Editor do Supabase:
```sql
SELECT DISTINCT empresa FROM receitas WHERE data >= '2025-11-01';
```

Isso mostrará os nomes exatos das empresas nas receitas.

### **Problema 2: Valores duplicados**

**Possível causa:** Dados legados sendo contados em mais de um card.

**Verificar:**
1. No console, procure por "Empresas encontradas"
2. Veja se há nomes duplicados ou variações

**Solução:**
Se houver variações como:
- "Churrasco"
- "Companhia"
- "Companhia do Churrasco"

Todos devem ir para **Cariri** (dados legados).

### **Problema 3: Valores muito diferentes**

**Possível causa:** Filtro de período está pegando datas erradas.

**Verificar:**
1. No console, procure por "FILTRO DE PERÍODO"
2. Veja o intervalo de datas
3. Verifique se condiz com o período selecionado

**Exemplo:**
```
=== FILTRO DE PERÍODO: MONTH ===
Filtro MÊS - De: 01/11/2025 até: 30/11/2025
Dados filtrados para month: 50 de 100
```

---

## 📊 Exemplo Visual do Card

```
┌─────────────────────────────────────┐
│ Companhia do Churrasco Cariri ✅    │
│ Novembro 2025                       │
├─────────────────────────────────────┤
│ Receitas       │ Despesas           │
│ R$ 15.000,00   │ R$ 10.000,00       │
├─────────────────────────────────────┤
│ Lucro/Prejuízo                      │
│ R$ 5.000,00 ✅ (verde)              │
├─────────────────────────────────────┤
│ Por Categoria                       │
│ Insumos:    R$ 4.000,00             │
│ Variáveis:  R$ 3.000,00             │
│ Fixas:      R$ 2.000,00             │
│ Atrasados:  R$ 1.000,00             │
├─────────────────────────────────────┤
│ [Gráfico de linha]                  │
└─────────────────────────────────────┘
```

---

## 📝 Checklist Final

- [ ] Dashboard mostra 3 cards
- [ ] Card Cariri aparece com nome correto
- [ ] Card Fortaleza aparece com nome correto
- [ ] Card Johnny aparece com nome correto
- [ ] Receitas aparecem em verde
- [ ] Despesas aparecem em vermelho
- [ ] Lucro/Prejuízo está calculado corretamente
- [ ] Console mostra logs de debug
- [ ] Valores condizem com páginas de Despesas e Receitas
- [ ] Camerino não aparece no Dashboard
- [ ] Dados legados aparecem em Cariri

---

## 🆘 Se ainda houver problemas

**Me envie:**

1. ✅ Screenshot do Dashboard
2. ✅ Screenshot da página de Despesas (com filtro de Cariri)
3. ✅ Screenshot da página de Receitas (com filtro de Cariri)
4. ✅ Cópia completa dos logs do Console (F12)
5. ✅ Resultado da query SQL:

```sql
SELECT 
  empresa, 
  COUNT(*) as total_despesas, 
  SUM(valor_total) as soma_despesas 
FROM despesas 
WHERE data_vencimento >= '2025-11-01' 
  AND data_vencimento <= '2025-11-30'
GROUP BY empresa;
```

```sql
SELECT 
  empresa, 
  COUNT(*) as total_receitas, 
  SUM(valor) as soma_receitas 
FROM receitas 
WHERE data >= '2025-11-01' 
  AND data <= '2025-11-30'
GROUP BY empresa;
```

Com essas informações, posso identificar exatamente onde está o problema! 🎯

