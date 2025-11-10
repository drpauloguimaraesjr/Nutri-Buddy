# 🐳 Configurar WEBHOOK_SECRET no Docker (N8N)

## 🎯 Verificar se N8N está rodando em Docker

Primeiro, veja se seu N8N está rodando em container:

```bash
docker ps | grep n8n
```

Se aparecer algo, está rodando em Docker! ✅

---

## ✅ Método 1: Reiniciar Container com Variável

### Passo 1: Parar o container atual

```bash
# Descobrir o nome/ID do container
docker ps | grep n8n

# Parar o container (substitua CONTAINER_ID)
docker stop CONTAINER_ID
```

### Passo 2: Iniciar com a variável

```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e WEBHOOK_SECRET=nutribuddy-secret-2024 \
  -v ~/.n8n:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

**Substitua** se você tiver outras configurações (volumes, network, etc)

---

## ✅ Método 2: Usando Docker Compose (RECOMENDADO)

Se você usa `docker-compose.yml`:

### Passo 1: Editar docker-compose.yml

```yaml
version: '3.8'

services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - WEBHOOK_SECRET=nutribuddy-secret-2024
      # Suas outras variáveis aqui
    volumes:
      - ~/.n8n:/home/node/.n8n
```

### Passo 2: Reiniciar o serviço

```bash
docker-compose down
docker-compose up -d
```

---

## ✅ Método 3: Adicionar Variável em Container Rodando

**ATENÇÃO:** Este método NÃO persiste após reiniciar o container!

```bash
# Entrar no container
docker exec -it CONTAINER_ID /bin/sh

# Dentro do container, adicionar variável
export WEBHOOK_SECRET=nutribuddy-secret-2024

# Verificar
echo $WEBHOOK_SECRET

# Sair
exit
```

Você precisará **reiniciar o N8N** dentro do container para ele pegar a variável.

---

## ✅ Método 4: Usando Arquivo .env (Docker Compose)

### Passo 1: Criar arquivo .env

```bash
cd /caminho/onde/esta/docker-compose.yml
nano .env
```

### Passo 2: Adicionar no .env

```bash
WEBHOOK_SECRET=nutribuddy-secret-2024
```

### Passo 3: Referenciar no docker-compose.yml

```yaml
version: '3.8'

services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    env_file:
      - .env
    volumes:
      - ~/.n8n:/home/node/.n8n
```

### Passo 4: Reiniciar

```bash
docker-compose down
docker-compose up -d
```

---

## 🔍 Verificar se a Variável Foi Configurada

### Método 1: Verificar no container

```bash
# Entrar no container
docker exec -it CONTAINER_ID /bin/sh

# Ver variáveis
env | grep WEBHOOK

# Ou
echo $WEBHOOK_SECRET

# Sair
exit
```

### Método 2: Ver logs do container

```bash
docker logs CONTAINER_ID
```

### Método 3: Inspecionar container

```bash
docker inspect CONTAINER_ID | grep WEBHOOK
```

---

## 📋 Exemplo Completo com Docker Run

Se você iniciou o N8N com `docker run`, use este comando completo:

```bash
# Parar container antigo
docker stop n8n
docker rm n8n

# Iniciar novo com todas as configs
docker run -d \
  --name n8n \
  --restart always \
  -p 5678:5678 \
  -e WEBHOOK_SECRET=nutribuddy-secret-2024 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=sua-senha \
  -v ~/.n8n:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

---

## 📋 Exemplo Completo com Docker Compose

**Arquivo: `docker-compose.yml`**

```yaml
version: '3.8'

services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      # Webhook Secret para NutriBuddy
      - WEBHOOK_SECRET=nutribuddy-secret-2024
      
      # Autenticação básica (opcional)
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=sua-senha
      
      # Configurações gerais
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - NODE_ENV=production
      
      # Webhook URL (se usar produção)
      - WEBHOOK_URL=https://seu-dominio.com
    volumes:
      - ~/.n8n:/home/node/.n8n
    networks:
      - nutribuddy-network

networks:
  nutribuddy-network:
    driver: bridge
```

**Comandos:**

```bash
# Criar e iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f n8n

# Parar
docker-compose down

# Reiniciar apenas o N8N
docker-compose restart n8n
```

---

## 🧪 Testar se Funcionou

Após configurar e reiniciar:

### 1. Verificar variável no container

```bash
docker exec n8n env | grep WEBHOOK
```

Deve aparecer:
```
WEBHOOK_SECRET=nutribuddy-secret-2024
```

### 2. Testar no workflow

No N8N:
1. Crie um workflow teste
2. Adicione nó "Code"
3. Cole:
   ```javascript
   return { json: { secret: process.env.WEBHOOK_SECRET } };
   ```
4. Execute
5. Deve mostrar: `"secret": "nutribuddy-secret-2024"`

### 3. Testar com a API

```bash
curl -X PATCH http://localhost:3000/api/messages/conversations/test-123 \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: nutribuddy-secret-2024" \
  -d '{"tags": ["teste"]}'
```

Não deve dar erro de autenticação! ✅

---

## ❌ Problemas Comuns

### Problema: Variável não aparece

**Causa:** N8N não foi reiniciado

**Solução:**
```bash
docker restart n8n
# ou
docker-compose restart n8n
```

### Problema: "Container n8n not found"

**Causa:** Nome do container é diferente

**Solução:**
```bash
# Ver todos os containers
docker ps -a

# Use o nome correto
docker restart NOME_REAL_DO_CONTAINER
```

### Problema: Permissão negada

**Causa:** Precisa de sudo

**Solução:**
```bash
sudo docker restart n8n
```

### Problema: Porta 5678 já em uso

**Causa:** Outro container ou processo usando a porta

**Solução:**
```bash
# Ver o que está usando a porta
lsof -i :5678

# Matar processo se necessário
kill -9 PID

# Ou usar porta diferente
docker run -p 5679:5678 ...
```

---

## 🎯 Qual Método Usar?

| Método | Quando Usar | Persiste? |
|--------|-------------|-----------|
| **Docker Run** | Setup rápido, teste | ✅ Sim (se recriar com mesmos parâmetros) |
| **Docker Compose** | ✅ **RECOMENDADO** - Produção | ✅ Sim |
| **Arquivo .env** | Múltiplas variáveis | ✅ Sim |
| **exec + export** | Debug temporário | ❌ Não |

**Recomendação:** Use **Docker Compose** com arquivo `.env` para gerenciar tudo facilmente!

---

## 📚 Estrutura Recomendada

```
/Users/drpgjr.../NutriBuddy/
├── docker-compose.yml          # Configuração Docker
├── .env                        # Variáveis (não commitar!)
├── .env.example               # Template das variáveis
├── server.js                  # Backend
└── n8n-workflows/            # Workflows
    └── ...
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    container_name: nutribuddy-n8n
    restart: always
    ports:
      - "5678:5678"
    env_file:
      - .env
    volumes:
      - ~/.n8n:/home/node/.n8n
```

**.env:**
```bash
WEBHOOK_SECRET=nutribuddy-secret-2024
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=sua-senha-segura
```

**.env.example:**
```bash
WEBHOOK_SECRET=seu-secret-aqui
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=senha
```

---

## 🚀 Comandos Rápidos

```bash
# Iniciar tudo
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Reiniciar N8N
docker-compose restart n8n

# Parar tudo
docker-compose down

# Verificar variável
docker exec nutribuddy-n8n env | grep WEBHOOK

# Entrar no container
docker exec -it nutribuddy-n8n /bin/sh
```

---

## ✅ Checklist

- [ ] Container N8N identificado
- [ ] Método escolhido (Docker Run ou Compose)
- [ ] WEBHOOK_SECRET configurado
- [ ] Container reiniciado
- [ ] Variável verificada (docker exec)
- [ ] Testado no workflow
- [ ] Testado com API do backend
- [ ] Workflow v3-auth importado e funcionando

---

**Pronto! Agora seu N8N no Docker tem o WEBHOOK_SECRET configurado!** 🎉

