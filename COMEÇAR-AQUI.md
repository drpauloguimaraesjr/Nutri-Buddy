# 🎯 COMECE AQUI - NutriBuddy

Guia rápido para escolher seu caminho:

---

## 🚀 Você quer rodar **ONLINE** (recomendado)?

**→ Vá para:** [`DEPLOY-RAPIDO.md`](DEPLOY-RAPIDO.md)

✅ API rodando 24/7  
✅ Sem depender do computador  
✅ HTTPS automático  
✅ Pronto para produção

---

## 🖥️ Você quer rodar **LOCALMENTE** (desenvolvimento)?

**→ Vá para:** [`INSTALACAO-RAPIDA.md`](INSTALACAO-RAPIDA.md)

✅ Testar antes de publicar  
✅ Desenvolvimento rápido  
✅ Com ngrok para testar N8N

---

## 📚 Documentação Completa

### Setup Firebase

1. **Primeira vez?** → [`COMO-OBTER-CREDENCIAIS-FIREBASE.md`](COMO-OBTER-CREDENCIAIS-FIREBASE.md)
2. **Já tem conta?** → [`CONFIGURACAO-RAPIDA-FIREBASE.md`](CONFIGURACAO-RAPIDA-FIREBASE.md)

### N8N

1. **N8N Cloud** → [`N8N-CLOUD-SETUP-RAPIDO.md`](N8N-CLOUD-SETUP-RAPIDO.md)
2. **Configurar variáveis** → [`CONFIGURAR-VARIAVEIS-N8N.md`](CONFIGURAR-VARIAVEIS-N8N.md)
3. **Gerar tokens** → [`GERAR-TOKEN-COMANDO.md`](GERAR-TOKEN-COMANDO.md)

### Frontend

1. **Replit** → [`INSTRUCOES-REPLIT.md`](INSTRUCOES-REPLIT.md)
2. **Replit HTML** → [`frontend-replit.html`](frontend-replit.html)

### Troubleshooting

- **Problemas com Firebase Auth** → [`HABILITAR-FIREBASE-AUTH.md`](HABILITAR-FIREBASE-AUTH.md)
- **Problemas com N8N** → [`CORRIGIR-N8N-AGORA.md`](CORRIGIR-N8N-AGORA.md)
- **Configurar ngrok** → [`NGROK-SETUP-AGORA.md`](NGROK-SETUP-AGORA.md)

---

## 🗺️ Fluxo Completo

```
1. Setup Firebase ──┐
                    ├──→ 2. Deploy API (Railway/Render)
2. Configurar N8N ──┘      ↓
                          3. Atualizar N8N
                             ↓
                          4. Testar
                             ↓
                          5. Frontend (Opcional)
                             ↓
                          ✅ Pronto!
```

---

## ⚡ Quick Start

**Para quem tem pressa:**

```bash
# 1. Clone o projeto
git clone [seu-repo]

# 2. Configure
cp env.example .env
# Edite .env com credenciais Firebase

# 3. Instale
npm install

# 4. Rode
npm start
```

**Depois:** Deploy em Railway (veja `DEPLOY-RAPIDO.md`)

---

## 📖 Arquivos Principais

| Arquivo | Para que serve |
|---------|---------------|
| `DEPLOY-RAPIDO.md` | ⭐ Deploy online rápido |
| `DEPLOY-ONLINE-COMPLETO.md` | Todas opções de hospedagem |
| `ATUALIZAR-N8N-PRODUCAO.md` | Conectar N8N à API online |
| `INSTALACAO-RAPIDA.md` | Setup local |
| `README.md` | Documentação completa da API |
| `INDICE-ARQUIVOS.txt` | Lista de todos arquivos |

---

## ❓ Precisa de Ajuda?

1. Veja `TROUBLESHOOTING.md` (se existir)
2. Verifique logs do servidor
3. Teste endpoints com curl
4. Confirme variáveis de ambiente

---

## ✅ Checklist Final

Antes de ir para produção, verifique:

- [ ] Firebase configurado
- [ ] API deployada e respondendo
- [ ] N8N conectado à URL pública
- [ ] Workflows testados
- [ ] HTTPS funcionando
- [ ] Logs sem erros

---

**Escolha seu caminho acima e comece! 🚀**

