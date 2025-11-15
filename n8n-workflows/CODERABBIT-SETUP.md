## 🚀 Integração do CodeRabbit

Use este passo a passo para ligar o CodeRabbit ao repositório e começar a receber revisões automáticas em português.

### 1. Instalar o GitHub App
1. Acesse [https://coderabbit.ai](https://coderabbit.ai) e faça login com a conta do GitHub da organização.
2. Clique em **Add repositories** e escolha **Only select repositories**.
3. Selecione este repositório (`NutriBuddy/n8n-workflows`) e finalize com **Install & Authorize**.
4. Confirme que o app ficou listado em *Settings ▸ Integrations ▸ GitHub Apps* no repositório.

> Referência oficial: [Quickstart](https://docs.coderabbit.ai/getting-started/quickstart)

### 2. Configuração aplicada
- O arquivo `.coderabbit.yaml` já está na raiz com idioma `pt-BR`, perfil de revisão assertivo e filtros voltados para JS/JSON/MD/Sh.
- Instruções específicas:
  - Workflows `EVOLUTION-*` → garantir sequências do n8n e limites da Evolution API.
  - Arquivos `CODIGO-BACKEND-*` → focar em segurança de tokens e logs.
  - Arquivos `CODIGO-FRONTEND-*` → validar estados de carregamento/erro e evitar chaves expostas.
- Ferramentas extras habilitadas: `shellcheck` (scripts `.sh`) e `markdownlint`.

> Referência oficial: [Configuration reference](https://docs.coderabbit.ai/reference/configuration)

### 3. Como validar
1. Abra/atualize um PR contra `main` (ou `develop`); CodeRabbit deve aparecer em “Checks”.
2. Verifique se o comentário principal vem em português e inclui o “High level summary”.
3. Ajuste as labels/título; palavras `wip`/`draft` no título pausam a revisão automaticamente.

### 4. Operação contínua
- Resolva os comentários do CodeRabbit normalmente e re-rodará ao dar “Re-run” ou fazer push.
- Mantenha `.coderabbit.yaml` atualizado conforme forem surgindo novas áreas críticas.
- Caso precise pausar o bot em um PR específico, adicione a label `wip` ou coloque `draft` no título.

