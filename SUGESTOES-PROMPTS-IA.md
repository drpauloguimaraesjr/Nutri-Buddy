# 🤖 SUGESTÕES DE PROMPTS DE IA PARA NUTRIBUDDY

## 📋 PROMPTS PARA VERIFICAÇÃO E TESTES

### 1. Verificação Completa do Sistema

```
Analise o sistema NutriBuddy e verifique se todos os recursos listados em 
CHECKLIST-COMPLETO-SISTEMA.md estão funcionando corretamente.

Para cada módulo:
1. Teste os endpoints listados
2. Verifique se retornam status 200/201
3. Teste casos de erro (401, 404, 500)
4. Verifique autenticação e autorização
5. Confirme que os dados são salvos no Firestore

Reporte:
- ✅ Funcionando corretamente
- ⚠️ Funcionando com avisos
- ❌ Não funcionando (com detalhes do erro)
- 📝 Sugestões de melhorias
```

### 2. Teste de Integrações

```
Crie e execute testes automatizados para verificar todas as integrações do NutriBuddy:

1. Firebase (Auth + Firestore)
   - Teste login/registro
   - Teste leitura/escrita no Firestore
   - Verifique regras de segurança

2. N8N
   - Teste conexão
   - Teste webhook recebido
   - Teste disparar workflow
   - Verifique histórico

3. WhatsApp
   - Teste geração de QR Code
   - Teste envio de mensagem
   - Teste recebimento
   - Verifique salvamento

4. Strava
   - Teste OAuth flow
   - Teste sincronização
   - Verifique importação de atividades

5. OpenAI/Google AI
   - Teste chat
   - Teste análise de refeições
   - Verifique respostas

Para cada integração, reporte:
- Status da conexão
- Endpoints funcionando
- Erros encontrados
- Tempo de resposta
```

### 3. Validação de Segurança

```
Analise a segurança do sistema NutriBuddy:

1. Autenticação
   - Verifique se tokens JWT são válidos
   - Teste expiração de tokens
   - Verifique renovação automática
   - Teste acesso sem token (deve retornar 401)

2. Autorização
   - Teste acesso entre roles (prescritor/patient)
   - Verifique se prescritores só veem seus pacientes
   - Teste acesso a dados de outros usuários (deve negar)
   - Verifique validação de conexões

3. Webhooks
   - Teste webhook secret
   - Verifique se webhooks sem secret são rejeitados
   - Teste rate limiting (se implementado)

4. Firestore Rules
   - Verifique regras de acesso
   - Teste escrita não autorizada
   - Teste leitura não autorizada

Reporte vulnerabilidades encontradas e sugestões de correção.
```

### 4. Teste de Performance

```
Teste a performance do sistema NutriBuddy:

1. Endpoints
   - Meça tempo de resposta de cada endpoint
   - Teste com diferentes volumes de dados
   - Verifique timeouts
   - Teste concorrência

2. Firestore
   - Verifique velocidade de queries
   - Teste com índices
   - Verifique paginação
   - Teste com grandes volumes

3. Frontend
   - Verifique tempo de carregamento
   - Teste renderização de listas grandes
   - Verifique lazy loading
   - Teste responsividade

4. Integrações
   - Meça tempo de resposta das APIs externas
   - Verifique retry logic
   - Teste fallbacks

Reporte:
- Tempos médios de resposta
- Bottlenecks identificados
- Sugestões de otimização
```

### 5. Análise de Código

```
Analise o código do NutriBuddy e identifique:

1. Qualidade do Código
   - Código duplicado
   - Funções muito grandes
   - Falta de tratamento de erros
   - Código morto/comentado

2. Boas Práticas
   - Estrutura de pastas
   - Nomenclatura
   - Comentários e documentação
   - Testes unitários (se existirem)

3. Segurança
   - Sanitização de inputs
   - SQL Injection (se aplicável)
   - XSS
   - CSRF

4. Manutenibilidade
   - Acoplamento
   - Coesão
   - Complexidade ciclomática

Forneça um relatório com:
- Problemas encontrados
- Nível de severidade
- Sugestões de correção
- Priorização
```

### 6. Geração de Testes Automatizados

```
Crie uma suíte de testes automatizados para o NutriBuddy:

1. Testes Unitários
   - Para cada função importante
   - Teste casos de sucesso
   - Teste casos de erro
   - Teste edge cases

2. Testes de Integração
   - Para cada endpoint
   - Teste fluxos completos
   - Teste com dados reais
   - Teste com dados inválidos

3. Testes E2E
   - Fluxos principais do usuário
   - Login → Dashboard → Ações
   - Prescritor → Criar plano → Paciente recebe

Use frameworks como:
- Jest (backend)
- React Testing Library (frontend)
- Playwright/Cypress (E2E)

Gere código de teste completo e executável.
```

### 7. Documentação de API

```
Gere documentação completa da API do NutriBuddy:

Para cada endpoint, inclua:
1. Descrição
2. Método HTTP e URL
3. Headers necessários
4. Parâmetros (query, body, path)
5. Exemplo de requisição
6. Exemplo de resposta (sucesso)
7. Exemplo de resposta (erro)
8. Códigos de status possíveis
9. Autenticação necessária
10. Rate limits (se houver)

Formato:
- OpenAPI/Swagger
- Postman Collection
- Markdown com exemplos

Inclua também:
- Diagramas de fluxo
- Exemplos de integração
- Troubleshooting
```

### 8. Análise de Dados e Métricas

```
Analise os dados do NutriBuddy e gere métricas:

1. Uso da Plataforma
   - Usuários ativos
   - Endpoints mais usados
   - Horários de pico
   - Padrões de uso

2. Performance
   - Tempo médio de resposta
   - Taxa de erro
   - Disponibilidade
   - Throughput

3. Funcionalidades
   - Módulos mais usados
   - Funcionalidades menos usadas
   - Taxa de sucesso de integrações

4. Segurança
   - Tentativas de acesso não autorizado
   - Tokens inválidos
   - Webhooks rejeitados

Gere:
- Gráficos e visualizações
- Relatório executivo
- Recomendações de melhorias
```

### 9. Sugestões de Melhorias

```
Analise o NutriBuddy e sugira melhorias:

1. Funcionalidades
   - O que falta?
   - O que pode ser melhorado?
   - Novas integrações possíveis
   - Features que aumentariam valor

2. UX/UI
   - Melhorias na interface
   - Fluxos que podem ser simplificados
   - Acessibilidade
   - Mobile-first

3. Performance
   - Otimizações possíveis
   - Cache strategies
   - Lazy loading
   - Code splitting

4. Segurança
   - Melhorias de segurança
   - Compliance (LGPD, etc.)
   - Auditoria
   - Backup e recovery

Priorize as sugestões por:
- Impacto
- Facilidade de implementação
- ROI
```

### 10. Migração e Atualização

```
Planeje a migração/atualização do NutriBuddy:

1. Dependências
   - Identifique dependências desatualizadas
   - Verifique vulnerabilidades
   - Planeje atualização gradual
   - Teste compatibilidade

2. Banco de Dados
   - Estrutura atual
   - Migrações necessárias
   - Backup strategy
   - Rollback plan

3. APIs
   - Versões desatualizadas
   - Deprecations
   - Novas versões disponíveis
   - Breaking changes

4. Deploy
   - Estratégia de deploy
   - Zero-downtime
   - Feature flags
   - Monitoring

Forneça:
- Plano de migração passo a passo
- Checklist de verificação
- Plano de rollback
- Testes pós-migração
```

---

## 🎯 PROMPTS ESPECÍFICOS POR MÓDULO

### Prescritor-Paciente
```
Teste o sistema de roles prescritor-paciente:
1. Criar conta prescritor
2. Criar conta paciente
3. Prescritor envia convite
4. Paciente aceita convite
5. Prescritor cria plano alimentar
6. Paciente vê plano
7. Verificar isolamento de dados
```

### WhatsApp
```
Teste a integração WhatsApp:
1. Gerar QR Code
2. Escanear e conectar
3. Enviar mensagem de teste
4. Receber mensagem
5. Verificar salvamento no Firebase
6. Testar reconexão automática
```

### N8N
```
Teste a integração N8N:
1. Verificar status
2. Listar workflows
3. Disparar workflow manualmente
4. Enviar webhook
5. Verificar histórico
6. Testar conexão
```

---

## 💡 DICAS PARA USO

1. **Seja Específico:** Quanto mais detalhes, melhor a resposta
2. **Use Contexto:** Forneça arquivos relevantes
3. **Itere:** Use respostas para refinar prompts
4. **Combine:** Use múltiplos prompts para visão completa
5. **Valide:** Sempre teste as sugestões da IA

---

## 🔄 WORKFLOW SUGERIDO

1. **Verificação Completa** → Identificar problemas
2. **Testes Automatizados** → Validar correções
3. **Análise de Código** → Melhorar qualidade
4. **Documentação** → Facilitar manutenção
5. **Sugestões de Melhorias** → Planejar evolução

---

**Use estes prompts com ferramentas como:**
- ChatGPT/Claude para análise
- GitHub Copilot para código
- Cursor AI para edição
- Testes automatizados para validação



