# 🐰 CodeRabbit no Cursor/VSCode

## Instalação da Extensão

### 1. Instalar extensão
1. No Cursor/VSCode, abra a aba de **Extensions** (⇧⌘X no Mac)
2. Pesquise por **"CodeRabbit"**
3. Clique em **Install** na extensão oficial da CodeRabbit
4. Aguarde a instalação finalizar

### 2. Autenticar
1. Após instalar, clique no ícone do CodeRabbit na barra lateral (coelho)
2. Clique em **"Sign in"** 
3. Vai abrir o navegador pedindo autorização
4. Faça login com a mesma conta GitHub que usou no app
5. Autorize e volte pro editor

### 3. Como usar

#### Revisar arquivo atual
1. Abra qualquer arquivo (`.js`, `.json`, `.jsx`, etc)
2. Clique com botão direito no editor
3. Selecione **"CodeRabbit: Review Current File"**
4. Aguarde alguns segundos
5. Sugestões aparecem inline + painel lateral

#### Revisar mudanças antes de commitar
1. Faça suas alterações locais
2. Abra o painel do CodeRabbit (ícone lateral)
3. Clique em **"Review Changes"**
4. Ele analisa apenas o diff (o que você modificou)
5. Corrige antes de fazer commit/push

#### Chat com o CodeRabbit
1. Clique no ícone do CodeRabbit
2. Digite perguntas sobre o código:
   - "Este workflow n8n está seguro?"
   - "Como posso otimizar esta função?"
   - "Há bugs neste componente React?"
3. Recebe respostas em português (por causa do `.coderabbit.yaml`)

## Comandos úteis (Command Palette)

Aperte `⇧⌘P` (Mac) ou `Ctrl+Shift+P` (Win/Linux) e digite:

- `CodeRabbit: Review Current File` - analisa arquivo aberto
- `CodeRabbit: Review Changes` - analisa apenas mudanças locais
- `CodeRabbit: Chat` - abre chat interativo
- `CodeRabbit: Clear Cache` - limpa cache se der problema

## Vantagens vs GitHub PR

| GitHub PR | Extensão IDE |
|-----------|--------------|
| Revisa após push | Revisa **antes** de commitar |
| Precisa criar PR | Usa direto no editor |
| Feedback público | Feedback privado |
| Toda mudança | Apenas o que você quer |

## Dicas

- **Use antes de commitar**: evita pushes com bugs
- **Pergunte no chat**: "explique este workflow n8n" funciona muito bem
- **Combine com GitHub**: extensão local + bot nos PRs = revisão completa
- **Atalhos personalizados**: você pode criar keybindings para comandos do CodeRabbit

## Troubleshooting

**Extensão não aparece?**
- Reinicie o Cursor/VSCode após instalar
- Verifique se está logado (ícone do coelho deve estar verde)

**Não analisa nada?**
- Garanta que o `.coderabbit.yaml` está na raiz
- Faça logout/login novamente na extensão
- Limpe cache: `CodeRabbit: Clear Cache`

**Responde em inglês?**
- O `.coderabbit.yaml` já tem `language: pt-BR`
- Se não funcionar, adicione no chat: "responda sempre em português"

## Recursos extras

- [Documentação oficial da extensão](https://docs.coderabbit.ai/guides/install-vscode)
- [Atalhos de teclado](https://docs.coderabbit.ai/guides/keyboard-shortcuts)
- [Integração com CLI](https://docs.coderabbit.ai/guides/cli)

