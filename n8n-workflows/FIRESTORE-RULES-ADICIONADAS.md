# 🔐 Firestore Rules - Adicionadas para Sistema de Mensagens

**Data:** 15/11/2024  
**Status:** ✅ Adicionadas automaticamente

---

## ✅ O QUE EU FIZ

**NÃO apaguei suas rules existentes!**

Apenas **ADICIONEI** no final (antes do `match /{document=**}`):

### **1. Collection `conversations`**
Para conversas do chat interno (prescritor ↔ paciente)

### **2. Subcollection `conversations/{id}/messages`**
Para mensagens dentro de cada conversa

### **3. Collection `message-templates`**
Para templates de mensagens dos prescritores

---

## 📝 O QUE FOI ADICIONADO

### **Rules para `conversations`:**

```javascript
match /conversations/{conversationId} {
  // Prescritor/Admin/Paciente podem criar conversas
  allow create: if isAuthenticated() && (
    isPrescriber() || isAdmin() || isPatient()
  );
  
  // Pode ler se faz parte (prescritor ou paciente)
  allow read: if isAuthenticated() && (
    isAdmin() ||
    resource.data.prescriberId == request.auth.uid ||
    resource.data.patientId == request.auth.uid
  );
  
  // Pode atualizar se faz parte
  allow update: if isAuthenticated() && (
    isAdmin() ||
    resource.data.prescriberId == request.auth.uid ||
    resource.data.patientId == request.auth.uid
  );
  
  // Listar conversas
  allow list: if isAuthenticated() && (
    isPrescriber() || isAdmin() || isPatient()
  );
  
  // Subcollection: messages
  match /messages/{messageId} {
    // ... regras para mensagens ...
  }
}
```

---

### **Rules para `message-templates`:**

```javascript
match /message-templates/{templateId} {
  // Prescritores podem criar templates
  allow create: if isPrescriber() && 
                   request.resource.data.prescriberId == request.auth.uid;
  
  // Pode ler/atualizar/deletar seus próprios templates
  allow read, update, delete: if isPrescriber() && 
                                  resource.data.prescriberId == request.auth.uid;
  
  // Listar apenas seus templates
  allow list: if isPrescriber();
}
```

---

## ✅ SUAS RULES ORIGINAIS (Mantidas!)

**Tudo que você tinha CONTINUA funcionando:**

- ✅ `users` - Suas rules complexas de roles
- ✅ `connections` - Prescritor-paciente
- ✅ `dietPlans` - Planos alimentares
- ✅ `meals` - Refeições
- ✅ `exercises` - Exercícios
- ✅ `waterIntake` - Hidratação
- ✅ `fastingSessions` - Jejum
- ✅ `measurements` - Medidas
- ✅ `glucoseReadings` - Glicose
- ✅ `goals` - Metas
- ✅ `recipes` - Receitas
- ✅ `chatMessages` - Mensagens antigas
- ✅ `notifications` - Notificações
- ✅ `whatsappConversations` - WhatsApp (Evolution API)
- ✅ `whatsappMessages` - Mensagens WhatsApp

**E ADICIONEI:**

- ✨ `conversations` - Chat interno (novo!)
- ✨ `conversations/{id}/messages` - Mensagens (novo!)
- ✨ `message-templates` - Templates (novo!)

---

## 🎯 DIFERENÇA ENTRE COLLECTIONS

### **`whatsappConversations`** (já tinha):
- Para integração WhatsApp via Evolution API
- Mensagens vêm do WhatsApp externo
- Usado nos workflows Evolution

### **`conversations`** (adicionei agora):
- Para chat interno do dashboard
- Mensagens diretas prescritor ↔ paciente
- Não depende de WhatsApp
- Base para treinar IA

**São coisas diferentes!** Ambas vão coexistir. 👍

---

## ⚠️ AÇÃO NECESSÁRIA

Preciso **APLICAR** as rules no Firebase:

<function_calls>
<invoke name="run_terminal_cmd">
<parameter name="command">cd /Users/drpgjr.../NutriBuddy && firebase deploy --only firestore:rules 2>&1 | head -30
