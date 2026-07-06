# Letrinhas Encantadas — Painel Web

Painel educacional para acompanhar o progresso de crianças com TEA (Transtorno do Espectro Autista) em jogos de alfabetização e linguagem.

## Sobre o projeto

O **Letrinhas Encantadas** é uma plataforma composta por um aplicativo mobile (usado pelas crianças) e este painel web (usado por educadores e administradores). O painel permite:

- Monitorar sessões de jogo em tempo real com gráficos e métricas
- Gerenciar perfis detalhados de crianças, incluindo informações sobre rotina, comunicação, necessidades sensoriais e dados médicos
- Gerenciar responsáveis e vincular crianças a eles
- Administrar o banco de palavras utilizado nos jogos
- Controlar o acesso de educadores à plataforma

### Tipos de jogo monitorados

| Chave | Nome |
|---|---|
| `READING` | Leitura |
| `VOWELS` | Vogais |
| `WORD_FORMATION` | Formação de Palavras |
| `PHRASE_BUILDER` | Construção de Frases |

### Perfis de acesso

| Perfil | Acesso |
|---|---|
| `ADMIN` | Todas as telas, incluindo palavras e educadores |
| `EDUCATOR` | Dashboard, relatórios, crianças e responsáveis |
| `PARENT` | Apenas o aplicativo mobile |

## Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS v4 + shadcn/ui
- **Estado / dados**: TanStack Query v5
- **Formulários**: React Hook Form + Zod
- **Gráficos**: Recharts
- **HTTP**: Axios com interceptors para JWT
- **Notificações**: Sonner
- **Linguagem**: TypeScript

## Pré-requisitos

- Node.js 20+
- API backend rodando em `http://localhost:3333` (variável `NEXT_PUBLIC_API_URL`)

## Instalação e execução

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local
# Edite NEXT_PUBLIC_API_URL se o backend estiver em outro endereço

# Iniciar em modo de desenvolvimento
npm run dev
```

O painel ficará disponível em [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3333` | URL base da API backend |

## Scripts

```bash
npm run dev    # Servidor de desenvolvimento (webpack)
npm run build  # Build de produção (webpack)
npm start      # Servidor de produção
npm run lint   # ESLint
```

## Estrutura de pastas

```
app/
  (dashboard)/         # Rotas protegidas (layout com sidebar)
    dashboard/         # Visão geral com métricas e gráficos
    children/          # Listagem de crianças
    responsaveis/      # Listagem e detalhes de responsáveis
    educators/         # Gestão de educadores (admin)
    words/             # Gestão de palavras dos jogos (admin)
    reports/           # Relatórios de progresso
  login/               # Tela de login pública
  forgot-password/     # Recuperação de senha
components/            # Componentes compartilhados e shadcn/ui
contexts/              # AuthContext e outros providers
lib/
  api.ts               # Cliente Axios com interceptors JWT
  types.ts             # Tipos TypeScript globais
  nav-items.ts         # Configuração de navegação por perfil
```

## Autenticação

O token JWT é armazenado no `localStorage` (chave `letrinhas:token`) e enviado automaticamente em todas as requisições pelo interceptor do Axios. O middleware também verifica o token via cookie para proteção de rotas no servidor, redirecionando para `/login` quando ausente.

## Deploy

O projeto está configurado para deploy na **Vercel** (`vercel.json`). Basta conectar o repositório e definir a variável `NEXT_PUBLIC_API_URL` apontando para o backend em produção.
