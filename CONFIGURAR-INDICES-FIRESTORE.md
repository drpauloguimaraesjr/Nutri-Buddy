# 🔥 Configurar Índices do Firestore

## ⚠️ Por que preciso disso?

Quando você usa **queries compostas** no Firestore (filtrando por campo + ordenando), o Firebase precisa que você crie **índices** para otimizar as consultas.

---

## 🚀 Como Criar os Índices

### Opção 1: Clique nos Links (Automático) ✅

Quando o backend retornar um erro como este:

```json
{
  "success": false,
  "error": "The query requires an index. You can create it here: https://console.firebase.google.com/..."
}
```

**BASTA CLICAR NO LINK!** Ele vai:
1. Abrir o Firebase Console
2. Preencher automaticamente os campos do índice
3. Você só precisa clicar em **"Criar Índice"**

---

### Opção 2: Manual no Console Firebase

Se preferir criar manualmente:

1. Acesse: https://console.firebase.google.com
2. Vá em **Firestore Database**
3. Aba **Indexes** (Índices)
4. Clique em **Create Index**

---

## 📋 Índices Necessários para NutriBuddy

### 1. **measurements** (Medidas Corporais)
```
Collection ID: measurements
Fields indexed:
  - userId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

### 2. **fasting** (Jejum Intermitente)
```
Collection ID: fasting
Fields indexed:
  - userId (Ascending)
  - status (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

### 3. **meals** (Refeições) - Se ainda não criado
```
Collection ID: meals
Fields indexed:
  - userId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

### 4. **water** (Água)
```
Collection ID: water
Fields indexed:
  - userId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

### 5. **exercises** (Exercícios)
```
Collection ID: exercises
Fields indexed:
  - userId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

### 6. **goals** (Metas)
```
Collection ID: goals
Fields indexed:
  - userId (Ascending)
  - isActive (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

---

## ⏱️ Tempo de Criação

Após criar um índice:
- **Status:** "Building" (Construindo)
- **Tempo:** Pode levar **alguns minutos** (dependendo do tamanho do banco)
- **Quando pronto:** Status muda para **"Enabled"** ✅

---

## 🔧 Script para Listar Índices Necessários

Crie um arquivo `firestore.indexes.json` na raiz do projeto:

```json
{
  "indexes": [
    {
      "collectionGroup": "measurements",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "fasting",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "meals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "water",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "exercises",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "goals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### Aplicar via Firebase CLI

```bash
# Instalar Firebase CLI (se ainda não tiver)
npm install -g firebase-tools

# Login
firebase login

# Aplicar índices
firebase deploy --only firestore:indexes
```

---

## ✅ Como Verificar se os Índices Estão Criados

### Via Console
1. Acesse: https://console.firebase.google.com
2. Vá em **Firestore Database** → **Indexes**
3. Verifique se todos os 6 índices estão com status **"Enabled"**

### Via Testes de API
Após criar os índices, teste as rotas:

```bash
# Testar Measurements
curl "http://localhost:3000/api/measurements?userId=test123"

# Testar Fasting
curl "http://localhost:3000/api/fasting/history?userId=test123"

# Testar Meals
curl "http://localhost:3000/api/meals?userId=test123"
```

Se retornar `{"success": true, ...}` → **Índice criado com sucesso!** ✅

---

## 🐛 Problemas Comuns

### 1. "Query requires an index"
**Solução:** Clique no link fornecido ou crie o índice manualmente.

### 2. "Index is still building"
**Solução:** Aguarde alguns minutos. Índices grandes podem levar até 10-15 minutos.

### 3. "Permission denied"
**Solução:** Verifique se você tem permissões de **Editor** ou **Owner** no projeto Firebase.

---

## 🎯 Resumo Rápido

1. ✅ Rode a API
2. ✅ Veja o erro com o link do índice
3. ✅ Clique no link
4. ✅ Clique em **"Create Index"**
5. ✅ Aguarde construção (alguns minutos)
6. ✅ Teste novamente a API

**Pronto!** 🚀

---

**Importante:** Índices são criados **UMA VEZ** e depois ficam permanentes. Você não precisa recriá-los a cada deploy.

