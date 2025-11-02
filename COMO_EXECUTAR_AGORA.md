# ⚡ COMO EXECUTAR A MIGRAÇÃO AGORA

## 🚨 PROBLEMA DETECTADO

O Supabase CLI está instalado mas não está no PATH do PowerShell. 

## ✅ SOLUÇÃO RÁPIDA (ESCOLHA UMA)

### **OPÇÃO 1: Dashboard Supabase (MAIS RÁPIDO)** ⚡

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Menu lateral: **SQL Editor**
4. Clique: **New Query**
5. Copie TODO o conteúdo do arquivo: **`EXECUTAR_MIGRACAO.sql`**
6. Cole no editor
7. Clique: **RUN** (ou Ctrl+Enter)
8. Veja os resultados na parte inferior

**Tempo: 2 minutos** ⏱️

---

### **OPÇÃO 2: Supabase CLI via npx** 🛠️

Se tiver Node.js instalado:

```powershell
# No PowerShell (neste diretório):
npx supabase db push
```

**Tempo: 3 minutos** ⏱️

---

### **OPÇÃO 3: Adicionar Supabase ao PATH** 🔧

1. Encontre onde o Supabase CLI foi instalado
2. Adicione ao PATH do Windows:
   - Pesquise "Variáveis de Ambiente"
   - Edite PATH do sistema
   - Adicione o caminho do Supabase
3. Reabra o PowerShell
4. Execute: `supabase db push`

**Tempo: 10 minutos** ⏱️

---

## 🎯 RECOMENDAÇÃO

**Use a OPÇÃO 1** (Dashboard) - é mais rápido e visual! ✨

---

## ✅ APÓS EXECUTAR

Execute este comando para verificar se deu certo:

```powershell
# Verificar no código se está funcionando
npm run dev
```

Depois teste:
- `/receitas` - Editar uma receita
- `/companhia/cariri` - Ver se os dados aparecem

---

## 📝 LOGS ESPERADOS

Após executar a migração, você deve ver:

```
ANTES DA MIGRAÇÃO
empresa                      | total
----------------------------|-------
Companhia do Churrasco      | X
Churrasco                   | Y

DEPOIS DA MIGRAÇÃO  
empresa                            | total
----------------------------------|-------
Companhia do Churrasco Cariri     | X+Y
Companhia do Churrasco Fortaleza  | Z
```

---

## 🆘 PROBLEMAS?

Se der erro:
- Verifique se tem permissão no Supabase
- Verifique se as tabelas existem
- Me avise qual erro específico aparece

---

**🚀 Escolha a OPÇÃO 1 e execute agora!**

Depois me avise que executou para eu continuar com os próximos passos! 👍

