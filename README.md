# Assistente Pessoal · Personal OS

> Workspace pessoal inteligente de produtividade e gestão executiva desenhado para profissionais com foco em mitigação de sobrecarga cognitiva e TDAH.

![Personal OS](https://img.shields.io/badge/Personal%20OS-v1.2.0-315DFF?style=for-the-badge)
![Deploy](https://img.shields.io/badge/Vercel-Production-000000?style=for-the-badge&logo=vercel)
![Database](https://img.shields.io/badge/MongoDB%20Atlas-Serverless-47A248?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)

🌐 **Deploy em Produção:** [https://adhd-project-manager.vercel.app](https://adhd-project-manager.vercel.app)

---

## ⚡ Principais Funcionalidades

### 1. 🤖 Assistente IA & Copiloto Executivo
- **Conversação Estratégica**: Apoio na organização semanal e diária sem sobrecarga.
- **Execução Real de Ações**: Crie tarefas, conclua pendências, quebre tarefas em micro-ações mecânicas e inicie blocos de foco diretamente pelo chat.
- **Comandos Naturais**: Aceita instruções diretas como *"Me ajude a planejar a semana"*, *"Criar tarefa no Littera"*, *"Fatiar tarefa difícil"*.

### 2. 🔒 Estacionamento de Dopamina (Motor Backend + MongoDB Atlas)
- **Captura Anti-Dispersão**: Ao digitar uma ideia súbita (ex: *"Tive uma ideia de app..."*), o motor serverless intercepta a entrada.
- **Estruturação por IA**: Sintetiza hipótese, MVP e tópicos objetivos.
- **Blindagem no Banco**: Força a gravação no MongoDB Atlas com `isLocked: true`, `category: 'parking'` e critérios claros de destrancamento futuro.
- **Trava Física Animada**: Componente visual que simula o cadeado fechando com som mecânico (*CH-LACK*) sintetizado via Web Audio API, proporcionando alívio cognitivo sem dispersar o foco do Littera/Aura.

### 3. ⚖️ Regra da Substituição (Trade-off de Projetos)
- Trava rígida de no máximo **2 projetos ativos simultâneos** (ex: *Littera* e *Aura*).
- Desbloquear um 3º projeto dispara o **Modal de Trade-off**, obrigando a seleção de qual projeto ativo voltará para o Arquivo Morto para liberar a vaga.

### 4. ⏱️ Bloco de Foco de 45 Minutos & Anti-Paralisia
- Timer integrado de 45 minutos associado exclusivamente às tarefas de projetos destrancados.
- **Validação de Micro-ação**: Alerta tarefas vagas ou longas (> 45 min) e oferece o botão **"Fatiar com IA"** para dividi-las em micro-etapas mecânicas de 15 a 25 minutos.
- **Sintetizador de Ruído Marrom**: Gerador de áudio integrado via Web Audio API para bloqueio de distrações auditivas.

### 5. 🎨 Design System: Experimental Hybrid Workspace
- Estética Soft Tech inspirada em *Linear*, *Raycast* e *Framer*.
- Modos **Híbrido**, **Escuro** e **Claro**.
- Alta legibilidade em modo escuro (zero letras azuis ilegíveis sobre superfícies grafite).

---

## 🌐 Endpoints Serverless (Vercel)

| Rota | Método | Descrição |
| :--- | :--- | :--- |
| `/api/test-db` | `GET` | Diagnóstico de conexão com MongoDB Atlas, ping administrativo e latência. |
| `/api/dopamine-dump` | `POST` | Motor de captura de ideias, estruturação por IA e arquivamento com cadeado `isLocked: true`. |
| `/api/health` | `GET` | Healthcheck do serviço. |

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+
- Conta no MongoDB Atlas (ou MongoDB local)

### Configuração
1. Clone o repositório:
```bash
git clone https://github.com/BrunoPinho99/assistente-pessoal.git
cd assistente-pessoal
```

2. Instale as dependências:
```bash
npm install
```

3. Crie o arquivo `.env` na raiz:
```env
MONGODB_URI="mongodb+srv://<usuario>:<senha>@cluster0.xxxxx.mongodb.net/personal-os?retryWrites=true&w=majority"
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse a aplicação em `http://localhost:3000`.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript 5, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend & Serverless**: Vercel Serverless Functions, Express (standalone), Node.js ESM.
- **Banco de Dados**: MongoDB Atlas Cloud, Mongoose 8+ (com connection pooling global para Lambda/Serverless).
- **Design Tokens & Audio**: Web Audio API nativa (Ruído Marrom, Tons de Foco e Trava de Cadeado).
