# 🧪 Guia de Testes - NutriBuddy

## 📋 Status dos Servidores

✅ **Backend:** http://localhost:3000 (Rodando)  
✅ **Frontend:** http://localhost:3001 (Rodando)

---

## ⚠️ IMPORTANTE: Criar Índices do Firestore PRIMEIRO

Antes de testar, você precisa criar os índices do Firestore para as novas coleções.

### Opção 1: Via Firebase Console (Recomendado) ✅

Quando você tentar acessar uma página nova, verá um erro no console. **Clique no link fornecido** e ele abrirá o Firebase Console com o índice pré-configurado. Clique em **"Create Index"**.

**Índices necessários para os novos módulos:**
1. `recipes` - userId + createdAt
2. `recipes` - userId + category + createdAt
3. `glucose` - userId + timestamp
4. `glucose` - userId + date
5. `measurements` - userId + createdAt (já criado)
6. `fasting` - userId + createdAt (já criado)
7. `fasting` - userId + status (já criado)

### Opção 2: Via Firebase CLI

```bash
# Na raiz do projeto
firebase deploy --only firestore:indexes
```

---

## 🧪 ROTEIRO DE TESTES

### 1️⃣ DASHBOARD (Principal)

**URL:** http://localhost:3001/dashboard

**Testes:**
- [ ] Página carrega sem erros
- [ ] Cards de resumo aparecem
- [ ] Balanço calórico visível
- [ ] Timer de jejum (se ativo)
- [ ] Ações rápidas funcionam

**Esperado:** Dashboard limpo com cards de estatísticas

---

### 2️⃣ REFEIÇÕES (com IA)

**URL:** http://localhost:3001/dashboard/meals

**Testes:**
- [ ] Lista de refeições carrega
- [ ] Botão "Nova Refeição" abre modal
- [ ] **Upload de foto funciona**
- [ ] Análise de IA retorna resultado
- [ ] Refeição salva com sucesso
- [ ] Editar refeição funciona
- [ ] Deletar refeição funciona

**Teste de IA:**
1. Clique em "Nova Refeição"
2. Faça upload de uma foto de comida
3. Aguarde análise (OpenAI Vision)
4. Verifique se detectou o alimento e estimou o peso
5. Salve a refeição

**Esperado:** IA identifica tipo de alimento + peso estimado

---

### 3️⃣ ÁGUA

**URL:** http://localhost:3001/dashboard/water

**Testes:**
- [ ] Barra de progresso visível
- [ ] Botões rápidos (200ml, 300ml, 500ml)
- [ ] Adicionar água funciona
- [ ] Progresso atualiza em tempo real
- [ ] Histórico aparece

**Teste rápido:**
1. Clique em "300ml"
2. Veja a barra atualizar
3. Verifique o total do dia

**Esperado:** Interface visual com barra de progresso

---

### 4️⃣ EXERCÍCIOS

**URL:** http://localhost:3001/dashboard/exercises

**Testes:**
- [ ] Lista de exercícios carrega
- [ ] Adicionar exercício funciona
- [ ] Tipos: Cardio, Força, Flexibilidade, Esporte
- [ ] Calorias calculadas automaticamente
- [ ] Deletar funciona

**Teste:**
1. Adicione "Corrida" - 30 min - Cardio
2. Verifique calorias estimadas
3. Veja na lista

**Esperado:** Cálculo automático de calorias queimadas

---

### 5️⃣ METAS

**URL:** http://localhost:3001/dashboard/goals

**Testes:**
- [ ] Meta ativa aparece
- [ ] Criar nova meta funciona
- [ ] Calorias, proteínas, carboidratos, gorduras
- [ ] Barras de progresso
- [ ] Editar meta funciona

**Teste:**
1. Crie meta: 2000 kcal, 150g prot, 200g carb, 60g gord
2. Verifique progresso
3. Edite valores

**Esperado:** Rastreamento visual de progresso

---

### 6️⃣ CHAT COM IA

**URL:** http://localhost:3001/dashboard/chat

**Testes:**
- [ ] Interface de chat carrega
- [ ] Enviar mensagem funciona
- [ ] IA responde (OpenAI GPT-4o-mini)
- [ ] Histórico de conversas
- [ ] Contexto personalizado do usuário

**Teste:**
1. Pergunte: "Quantas calorias devo comer hoje?"
2. Pergunte: "Qual o melhor alimento rico em proteína?"
3. Veja se IA responde contextualmente

**Esperado:** Assistente nutricional inteligente

---

### 7️⃣ JEJUM INTERMITENTE ⏱️

**URL:** http://localhost:3001/dashboard/fasting

**Testes:**
- [ ] Timer circular visível
- [ ] Escolher tipo de jejum (16:8, 18:6, etc)
- [ ] Iniciar jejum funciona
- [ ] Timer atualiza a cada segundo
- [ ] Progresso circular anima
- [ ] Finalizar jejum funciona
- [ ] Estatísticas corretas
- [ ] Histórico aparece

**Teste:**
1. Escolha jejum "16:8"
2. Clique "Iniciar Jejum"
3. Veja timer rodar em tempo real
4. Aguarde 1 minuto
5. Finalize o jejum
6. Verifique histórico

**Esperado:** Timer circular animado em tempo real

---

### 8️⃣ MEDIDAS CORPORAIS 📏

**URL:** http://localhost:3001/dashboard/measurements

**Testes:**
- [ ] Última medida aparece
- [ ] IMC calculado automaticamente
- [ ] Adicionar medida funciona
- [ ] Peso, altura, circunferências
- [ ] Gráfico de evolução do peso
- [ ] Histórico completo

**Teste:**
1. Adicione peso: 75kg, altura: 175cm
2. Adicione circunferências (cintura, peito, etc)
3. Verifique IMC calculado
4. Veja gráfico de evolução

**Esperado:** Gráfico visual + cálculo automático de IMC

---

### 9️⃣ RELATÓRIOS 📊

**URL:** http://localhost:3001/dashboard/reports

**Testes:**
- [ ] 5 gráficos aparecem:
  - [ ] Evolução Peso + IMC (linha)
  - [ ] Calorias diárias (barra)
  - [ ] Distribuição macros (pizza)
  - [ ] Consumo água (barra)
  - [ ] Macros ao longo do tempo (linha)
- [ ] Filtros de período funcionam (semana, mês, ano)
- [ ] Cards de resumo estatístico
- [ ] Gráficos responsivos

**Teste:**
1. Mude filtro para "7 dias"
2. Veja todos os gráficos atualizarem
3. Passe mouse sobre gráficos (tooltips)

**Esperado:** 5 gráficos interativos com Recharts

---

### 🔟 RECEITAS 📖 (NOVO)

**URL:** http://localhost:3001/dashboard/recipes

**Testes:**
- [ ] Grid de receitas carrega
- [ ] Botão "Nova Receita" abre modal
- [ ] Adicionar receita completa:
  - [ ] Nome, descrição, porções
  - [ ] Ingredientes (adicionar/remover)
  - [ ] Modo de preparo (passos)
  - [ ] Categoria, tags
- [ ] Cálculo nutricional automático
- [ ] Filtros por categoria funcionam
- [ ] Busca funciona
- [ ] **Usar receita proporcional:**
  - [ ] Abrir detalhes da receita
  - [ ] Escolher quantas porções usar (ex: 0.5, 1, 2)
  - [ ] Criar refeição automaticamente
  - [ ] Valores nutricionais proporcionais
- [ ] Favoritar receita funciona
- [ ] Deletar funciona

**Teste Completo:**
1. **Criar Receita:**
   - Nome: "Frango com Batata Doce"
   - Porções: 2
   - Ingredientes:
     - 200g Peito de Frango (300 kcal, 60g prot)
     - 150g Batata Doce (120 kcal, 2g prot, 28g carb)
   - Modo de preparo:
     - "Grelhe o frango"
     - "Asse a batata doce"
   - Categoria: Almoço
   - Tags: low-carb, fit

2. **Usar Receita:**
   - Abra a receita criada
   - Escolha "1.5 porções"
   - Veja cálculo proporcional
   - Clique "Adicionar Refeição"
   - Verifique em `/dashboard/meals`

**Esperado:** Receita salva + uso proporcional criando refeição automática

---

### 1️⃣1️⃣ GLICEMIA (Freestyle Libre) 🩸 (NOVO)

**URL:** http://localhost:3001/dashboard/glucose

**Testes:**
- [ ] Última leitura aparece com cor
- [ ] Classificação automática (Normal, Hipo, Diabetes)
- [ ] Gráfico de evolução
- [ ] Linhas de referência (70, 99, 125 mg/dL)
- [ ] Adicionar leitura manual:
  - [ ] Valor (ex: 95 mg/dL)
  - [ ] Data/hora
  - [ ] Observações
- [ ] **Importar Freestyle Libre:**
  - [ ] Modal de importação CSV
  - [ ] Colar dados
  - [ ] Importar múltiplas leituras
- [ ] Médias diárias
- [ ] Filtros de período (7, 14, 30 dias)
- [ ] Estatísticas (média, min, max, % normal)

**Teste Manual:**
1. Clique "Nova Leitura"
2. Adicione: 95 mg/dL, agora
3. Veja classificação: "Normal" (verde)
4. Adicione: 140 mg/dL
5. Veja classificação: "Diabetes" (vermelho)
6. Verifique gráfico atualizado

**Teste Importação CSV:**
1. Clique "Importar Libre"
2. Cole dados CSV:
```
timestamp,value
2024-11-03T08:00:00,90
2024-11-03T10:00:00,102
2024-11-03T12:00:00,95
2024-11-03T14:00:00,88
```
3. Clique "Importar"
4. Veja 4 leituras adicionadas
5. Verifique gráfico com todas

**Esperado:** Gráfico com linhas de referência + importação CSV funcional

---

### 1️⃣2️⃣ CLUBE DE BENEFÍCIOS 🎁 (NOVO)

**URL:** http://localhost:3001/dashboard/benefits

**Testes:**
- [ ] Cards de estatísticas aparecem
- [ ] Grid com 12 marcas:
  - [ ] Growth Supplements
  - [ ] FitFood
  - [ ] Nike
  - [ ] iHerb
  - [ ] Adidas
  - [ ] Drogasil
  - [ ] E mais...
- [ ] Filtros por categoria funcionam
- [ ] Busca funciona
- [ ] Botão "Destaques" funciona
- [ ] Clicar "Acessar Oferta" abre marca
- [ ] Desconto + Cashback visíveis
- [ ] Guia "Como Funciona"

**Teste:**
1. Filtre por "Suplementos"
2. Busque "Growth"
3. Veja desconto: 15% + 5% cashback
4. Clique "Acessar Oferta" (abre em nova aba)
5. Teste botão "Destaques" (mostra só favoritos)

**Esperado:** Catálogo de marcas com descontos visíveis

---

### 1️⃣3️⃣ PWA (Instalação) 📱 (NOVO)

**Testes Desktop:**
- [ ] Abra no Chrome
- [ ] Veja ícone **⊕** na barra de endereços
- [ ] Clique para instalar
- [ ] App aparece como aplicativo desktop
- [ ] Abre em janela separada

**Testes Offline:**
- [ ] DevTools > Application > Service Workers
- [ ] Marque "Offline"
- [ ] Recarregue página
- [ ] Veja página offline customizada
- [ ] Desmarque "Offline"
- [ ] App volta a funcionar

**Testes Mobile (se tiver):**
- [ ] Android Chrome: Menu > "Adicionar à tela inicial"
- [ ] iOS Safari: Compartilhar > "Adicionar à Tela de Início"
- [ ] Ícone aparece na tela inicial
- [ ] Abre como app nativo

**Lighthouse Audit:**
- [ ] DevTools > Lighthouse
- [ ] Selecione "Progressive Web App"
- [ ] Run audit
- [ ] Pontuação PWA ≥ 90

**Esperado:** App instalável + funciona offline

---

## 🔥 TESTES DE INTEGRAÇÃO

### OpenAI Vision (Análise de Fotos)

1. Vá em `/dashboard/meals`
2. Clique "Nova Refeição"
3. Faça upload de foto de comida
4. Aguarde análise
5. **Verifique:**
   - ✅ Tipo de alimento identificado
   - ✅ Peso estimado em gramas
   - ✅ Análise de tamanho do prato
   - ✅ Referências visuais
   - ✅ Calorias estimadas

### OpenAI Chat (Assistente IA)

1. Vá em `/dashboard/chat`
2. Pergunte: "Qual minha meta de calorias?"
3. Pergunte: "Me sugira uma refeição rica em proteínas"
4. **Verifique:**
   - ✅ Respostas contextual com seus dados
   - ✅ Sugestões personalizadas
   - ✅ Histórico de conversas salvo

### Firebase Storage (Upload de Fotos)

1. Vá em `/dashboard/meals`
2. Adicione refeição com foto
3. Salve
4. Recarregue página
5. **Verifique:**
   - ✅ Foto aparece na lista
   - ✅ URL pública funciona
   - ✅ Foto persiste após reload

---

## 🐛 TROUBLESHOOTING

### Erro: "The query requires an index"

**Solução:**
1. Copie o link do erro
2. Abra no navegador
3. Clique "Create Index"
4. Aguarde 2-5 minutos
5. Recarregue a página

### Backend não responde

```bash
# Reiniciar backend
cd /Users/drpgjr.../NutriBuddy
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Frontend com erro 500

```bash
# Reiniciar frontend
cd /Users/drpgjr.../NutriBuddy/frontend
lsof -ti:3001 | xargs kill -9
rm -rf .next
npm run dev
```

### OpenAI não funciona

**Verifique:**
```bash
# Backend .env
grep OPENAI_API_KEY .env
```

Se vazio, adicione:
```
OPENAI_API_KEY=sk-proj-...
```

### Firebase Auth erro

**Verifique:**
```bash
# Frontend .env.local
cat frontend/.env.local
```

Se vazio, siga `CONFIGURAR-FRONTEND.md`

---

## ✅ CHECKLIST FINAL

### Módulos Core (17)
- [ ] Dashboard
- [ ] Refeições (com IA)
- [ ] Água
- [ ] Exercícios
- [ ] Metas
- [ ] Chat IA
- [ ] Jejum Intermitente
- [ ] Medidas Corporais
- [ ] Relatórios
- [ ] **Receitas** (novo)
- [ ] **Glicemia** (novo)
- [ ] **Benefícios** (novo)
- [ ] Auth (Login/Google)
- [ ] OpenAI Vision
- [ ] OpenAI Chat
- [ ] Firebase Storage
- [ ] **PWA** (novo)

### Funcionalidades Especiais
- [ ] Upload de fotos funciona
- [ ] IA analisa fotos (tipo + peso)
- [ ] Chat IA contextualizado
- [ ] Timer de jejum em tempo real
- [ ] Gráficos interativos
- [ ] Receitas com uso proporcional
- [ ] Importação Freestyle Libre
- [ ] PWA instalável
- [ ] Funciona offline

---

## 🎯 RESULTADO ESPERADO

Após testar tudo, você deve ter:

✅ **17 módulos funcionais**  
✅ **IA analisando fotos**  
✅ **Chat inteligente**  
✅ **Relatórios visuais**  
✅ **Receitas proporcionais**  
✅ **Glicemia monitorada**  
✅ **App instalável**  
✅ **Offline funcional**  

---

## 📞 SUPORTE

Se algo não funcionar:

1. Verifique índices Firestore
2. Verifique logs do backend (terminal)
3. Verifique console do browser (F12)
4. Consulte documentação:
   - `CONFIGURAR-OPENAI.md`
   - `CONFIGURAR-PWA.md`
   - `CONFIGURAR-INDICES-FIRESTORE.md`

---

**BOA SORTE NOS TESTES! 🚀**

Se encontrar bugs, me avise que corrijo! 😊

