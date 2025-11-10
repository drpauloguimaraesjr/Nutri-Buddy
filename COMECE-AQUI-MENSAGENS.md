# 🚀 COMECE AQUI - Sistema de Mensagens

## ⚡ Setup Rápido (5 minutos)

```bash
# 1. Execute o script de setup
bash setup-messages.sh

# 2. Configure Firebase Token
node generate-token.js
# Copie o token gerado

# 3. Configure N8N
nano ~/.n8n/.env
# Cole: FIREBASE_TOKEN=seu-token-aqui
# Cole: PRESCRIBER_EMAIL=seu-email@example.com

# 4. Inicie tudo
```

**Terminal 1:**
```bash
node server.js
```

**Terminal 2:**
```bash
cd frontend && npm run dev
```

**Terminal 3:**
```bash
cd ~/.n8n && docker-compose up -d
```

---

## 🌐 Acesse

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Backend | http://localhost:3000 | API |
| Frontend (Prescritor) | http://localhost:3001/messages | Kanban |
| Frontend (Paciente) | http://localhost:3001/chat | Chat |
| N8N | http://localhost:5678 | Automação |

**Login N8N:**
- User: `admin`
- Pass: `nutribuddy123`

---

## 📋 Checklist Rápido

### Firebase (5 min)
- [ ] Acesse Firebase Console
- [ ] Vá em Firestore → Rules
- [ ] Cole as rules do `SETUP-SISTEMA-MENSAGENS.md`
- [ ] Publique
- [ ] Vá em Firestore → Indexes
- [ ] Crie os 3 índices (ver `SETUP-SISTEMA-MENSAGENS.md`)
- [ ] Aguarde índices ficarem "Enabled" (5-10 min)

### N8N (10 min)
- [ ] Acesse http://localhost:5678
- [ ] Login (admin / nutribuddy123)
- [ ] Import workflow: `n8n-workflows/1-autoresposta-inicial.json`
- [ ] Import workflow: `n8n-workflows/2-analise-sentimento.json`
- [ ] Import workflow: `n8n-workflows/3-sugestoes-resposta.json`
- [ ] Import workflow: `n8n-workflows/4-followup-automatico.json`
- [ ] Import workflow: `n8n-workflows/5-resumo-diario.json`
- [ ] Ative cada workflow (toggle verde)

### Teste (5 min)
- [ ] Como paciente: Acesse http://localhost:3001/chat
- [ ] Envie uma mensagem: "Olá, tenho uma dúvida"
- [ ] Como prescritor: Acesse http://localhost:3001/messages
- [ ] Verifique card na coluna "Novas"
- [ ] Clique no card e responda
- [ ] ✅ Sucesso!

---

## 📚 Documentação

| Arquivo | Quando Usar |
|---------|-------------|
| `SISTEMA-MENSAGENS-README.md` | **Visão geral do sistema** |
| `SETUP-SISTEMA-MENSAGENS.md` | **Setup detalhado passo a passo** |
| `GUIA-USO-MENSAGENS.md` | **Como usar no dia a dia** |
| `SISTEMA-MENSAGENS-ESTRUTURA.md` | Arquitetura técnica |
| `IMPLEMENTACAO-COMPLETA-MENSAGENS.md` | O que foi implementado |

---

## ❓ Problemas Comuns

### "Cannot find module './routes/messages'"
```bash
ls -la routes/messages.js
# Se não existir, recrie o arquivo
```

### "Firestore permission denied"
- Verifique se as Rules foram publicadas
- Verifique se usuário está logado
- Verifique role do usuário em `users` collection

### "N8N não responde"
```bash
docker ps  # Verificar se está rodando
docker logs nutribuddy-n8n -f  # Ver logs
```

### Chat não atualiza
- Abra F12 → Console
- Verifique se há erros
- Verifique se backend está rodando
- Limpe cache (Ctrl+Shift+R)

---

## 🎯 O que Você Tem Agora

### ✅ Backend (19 endpoints)
- Conversas (CRUD completo)
- Mensagens (envio/recebimento)
- Templates de resposta
- Webhooks para N8N

### ✅ Frontend
**Para Prescritores:**
- Dashboard Kanban visual
- 4 colunas (Novas, Em Atend., Aguard., Resolv.)
- Chat integrado
- Estatísticas

**Para Pacientes:**
- Chat limpo e simples
- Status de leitura
- Histórico completo

### ✅ Automações N8N
1. Auto-resposta em 2 min
2. Análise de urgência com IA
3. Sugestões de resposta
4. Follow-up automático (7 dias)
5. Resumo diário por email

### ✅ Documentação
- Setup completo
- Guia de uso
- Troubleshooting
- Arquitetura
- Scripts de instalação

---

## 💡 Dicas Importantes

### Para Desenvolvimento
```bash
# Terminal 1: Backend com auto-reload
npm run dev  # se tiver configurado
# ou
nodemon server.js

# Terminal 2: Frontend com auto-reload
cd frontend && npm run dev

# Terminal 3: Logs N8N
docker logs nutribuddy-n8n -f
```

### Para Produção
Ver `SETUP-SISTEMA-MENSAGENS.md` seção "Produção"

---

## 📞 Precisa de Ajuda?

1. ✅ **Leia primeiro:** `SETUP-SISTEMA-MENSAGENS.md`
2. ✅ **Troubleshooting:** Seção no final do SETUP
3. ✅ **Logs:** Console do navegador (F12)
4. ✅ **Backend logs:** Terminal onde rodou `node server.js`
5. ✅ **N8N logs:** `docker logs nutribuddy-n8n -f`

---

## 🎉 Pronto!

Seu sistema de mensagens está **100% implementado** e pronto para uso!

**Próximo passo:** Execute `bash setup-messages.sh` e siga as instruções.

---

**Dúvidas?** Leia a documentação completa em `SISTEMA-MENSAGENS-README.md`

**Desenvolvido com ❤️ para NutriBuddy**

