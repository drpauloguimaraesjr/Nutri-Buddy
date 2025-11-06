# ✅ CHECKLIST DE SETUP - NUTRIBUDDY

> Use este checklist para garantir que tudo está configurado corretamente

---

## 📋 FASE 1: PREPARAÇÃO

- [ ] Node.js instalado (versão 16+)
- [ ] npm instalado
- [ ] Git instalado (opcional)
- [ ] Conta Firebase criada
- [ ] Projeto Firebase criado
- [ ] Firestore habilitado no Firebase
- [ ] Authentication habilitado no Firebase

---

## 📋 FASE 2: CONFIGURAÇÃO

### Arquivos de Ambiente:

- [ ] Arquivo `.env` existe na raiz
- [ ] `PORT` configurado no `.env`
- [ ] `FIREBASE_PROJECT_ID` configurado
- [ ] `FIREBASE_CLIENT_EMAIL` configurado
- [ ] `FIREBASE_PRIVATE_KEY` configurado
- [ ] `WEBHOOK_SECRET` configurado
- [ ] `CORS_ORIGIN` configurado

### Frontend:

- [ ] Pasta `frontend/` existe
- [ ] Arquivo `frontend/.env.local` existe
- [ ] `NEXT_PUBLIC_API_URL` configurado
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` configurado
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` configurado
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` configurado

### Dependências:

- [ ] `node_modules/` existe na raiz
- [ ] `frontend/node_modules/` existe
- [ ] Todos os pacotes instalados sem erros

---

## 📋 FASE 3: VALIDAÇÃO

### Scripts:

- [ ] Script `SETUP-COMPLETO-NUTRIBUDDY.sh` executável
- [ ] Script `INICIAR-TUDO.sh` executável
- [ ] Script `PARAR-TUDO.sh` executável
- [ ] Validação executada sem erros críticos

### Testes Básicos:

- [ ] Backend pode ser iniciado (`npm start`)
- [ ] Backend responde em `http://localhost:3000`
- [ ] `/api/health` retorna status 200
- [ ] Frontend pode ser iniciado (`cd frontend && npm run dev`)
- [ ] Frontend abre em `http://localhost:3001`

---

## 📋 FASE 4: FUNCIONALIDADES

### Autenticação:

- [ ] Página de login acessível
- [ ] Página de registro acessível
- [ ] Consegue criar novo usuário
- [ ] Consegue fazer login
- [ ] Consegue fazer logout

### Dashboard:

- [ ] Dashboard carrega após login
- [ ] Estatísticas são exibidas
- [ ] Cards de resumo aparecem
- [ ] Navegação funciona

### Refeições:

- [ ] Página de refeições acessível
- [ ] Modal de adicionar refeição abre
- [ ] Consegue adicionar refeição
- [ ] Refeição aparece na lista
- [ ] Consegue editar refeição
- [ ] Consegue deletar refeição

### Água:

- [ ] Página de água acessível
- [ ] Botões de adicionar água funcionam
- [ ] Contador de água atualiza
- [ ] Histórico de água aparece

### Exercícios:

- [ ] Página de exercícios acessível
- [ ] Formulário de exercício funciona
- [ ] Consegue adicionar exercício
- [ ] Exercícios aparecem na lista

### Jejum:

- [ ] Página de jejum acessível
- [ ] Consegue iniciar jejum
- [ ] Timer funciona
- [ ] Consegue parar jejum
- [ ] Histórico aparece

### Chat IA:

- [ ] Página de chat acessível
- [ ] Consegue enviar mensagem
- [ ] IA responde (se configurado)
- [ ] Histórico de conversa funciona

---

## 📋 FASE 5: OPCIONAL

### N8N:

- [ ] N8N instalado
- [ ] N8N rodando em `http://localhost:5678`
- [ ] Workflow importado
- [ ] Credenciais configuradas
- [ ] Webhook funcionando

### WhatsApp:

- [ ] WhatsApp configurado (se usar)
- [ ] QR Code gerado
- [ ] Conexão estabelecida
- [ ] Mensagens funcionando

### Strava:

- [ ] Integração Strava configurada (se usar)
- [ ] OAuth funcionando
- [ ] Atividades sincronizando

---

## 📋 FASE 6: PRODUÇÃO (Deploy)

### Deploy Backend:

- [ ] Serviço escolhido (Railway/Render/Heroku)
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado
- [ ] URL de produção funcionando
- [ ] Health check respondendo

### Deploy Frontend:

- [ ] Serviço escolhido (Vercel/Netlify)
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado
- [ ] Site acessível
- [ ] Conecta ao backend

### Configurações Finais:

- [ ] CORS configurado para produção
- [ ] Domínio customizado (opcional)
- [ ] SSL/HTTPS ativo
- [ ] Firebase rules em produção
- [ ] Backups configurados

---

## 🎯 STATUS GERAL

### ✅ PRONTO PARA USO LOCAL

Marque quando tiver completado:
- [x] Fases 1, 2, 3
- [x] Backend funcionando
- [x] Frontend funcionando
- [x] Funcionalidades básicas testadas

### ✅ PRONTO PARA PRODUÇÃO

Marque quando tiver completado:
- [ ] Fase 6 completa
- [ ] Deploys realizados
- [ ] Domínios configurados
- [ ] Segurança verificada

---

## 🐛 TROUBLESHOOTING

Se algo não funcionar, verifique:

### Backend não inicia:
```bash
# Verificar logs
npm start

# Verificar porta
lsof -i :3000

# Verificar .env
cat .env
```

### Frontend não conecta:
```bash
# Verificar .env.local
cat frontend/.env.local

# Verificar se backend está rodando
curl http://localhost:3000/api/health

# Ver logs do frontend
tail -f logs/frontend-*.log
```

### Firebase error:
```bash
# Testar conexão Firebase
node test-firebase-auth.js

# Verificar credenciais
# Baixar novamente o JSON do Firebase
```

---

## 📊 RELATÓRIOS

### Último Relatório de Setup:
```bash
# Ver último relatório
ls -lt RELATORIO-SETUP-*.txt | head -1 | xargs cat
```

### Executar Nova Validação:
```bash
./SETUP-COMPLETO-NUTRIBUDDY.sh
```

---

## ✨ TUDO PRONTO!

Quando todos os itens críticos estiverem marcados:

- ✅ FASE 1 completa
- ✅ FASE 2 completa
- ✅ FASE 3 completa
- ✅ FASE 4 completa (pelo menos funcionalidades básicas)

**Seu NutriBuddy está pronto para uso!** 🎉

---

## 📞 SUPORTE

Se ainda tiver problemas:

1. **Consulte a documentação:**
   - README-INICIO-RAPIDO.md
   - GUIA-SETUP-VISUAL.md
   - README.md

2. **Verifique arquivos específicos:**
   - COMO-RODAR-TUDO.md
   - TROUBLESHOOTING-*.md
   - ERROS-E-SOLUCOES.md

3. **Execute validação:**
   ```bash
   ./SETUP-COMPLETO-NUTRIBUDDY.sh
   ```

4. **Verifique logs:**
   ```bash
   tail -f logs/backend-*.log
   tail -f logs/frontend-*.log
   ```

---

**Data de criação:** $(date)  
**Última validação:** Execute `./SETUP-COMPLETO-NUTRIBUDDY.sh` para atualizar

