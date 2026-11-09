# Assistente Pessoal · Personal OS

> Workspace pessoal inteligente de produtividade e gestão executiva desenhado para profissionais com foco em mitigação de sobrecarga cognitiva e TDAH.

![Personal OS](https://img.shields.io/badge/Personal%20OS-v1.0.0-315DFF?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)

---

## ⚡ Principais Funcionalidades

### 1. 🤖 Assistente IA & Copiloto Executivo
- **Conversação Estratégica**: Apoio na organização semanal e diária sem sobrecarga.
- **Execução Real de Ações**: Crie tarefas, conclua pendências, quebre tarefas em micro-ações mecânicas e inicie blocos de foco diretamente pelo chat.
- **Comandos Naturais**: Aceita instruções diretas como *"Me ajude a planejar a semana"*, *"Criar tarefa no Littera"*, *"Fatiar tarefa difícil"*.

### 2. 🔒 Estacionamento de Dopamina (Proteção de Foco)
- Captura ideias impulsivas de novos negócios e produtos antes que contaminem a atenção do dia.
- Estruturação automática de escopo e arquivamento imediato com status `locked: true` no Arquivo Morto.

### 3. ⚖️ Regra da Substituição (Trade-off de Projetos)
- Trava dura de no máximo **2 projetos ativos simultâneos** (ex: *Littera* e *Aura*).
- Desbloquear um 3º projeto dispara o **Modal de Trade-off**, obrigando o congelamento de um projeto ativo para liberar a vaga.

### 4. ⏱️ Bloco de Foco de 45 Minutos & Anti-Paralisia
- Timer integrado de 45 minutos associado às tarefas prioritárias.
- **Validação de Micro-ação**: Alerta tarefas vagas ou longas (> 45 min) e oferece o botão **"Fatiar com IA"** para dividi-las em micro-etapas mecânicas de 15 a 25 minutos.
- **Sintetizador de Ruído Marrom**: Gerador de áudio integrado via Web Audio API para bloqueio de distrações auditivas.

### 5. 🎨 Design System: Experimental Hybrid Workspace
- Estética Soft Tech inspirada em *Linear*, *Raycast* e *Framer*.
- Modos **Híbrido**, **Escuro** e **Claro**.
- Alta legibilidade em modo escuro (zero letras azuis ilegíveis sobre superfícies grafite).

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/BrunoPinho99/assistente-pessoal.git

# Acesse o diretório
cd assistente-pessoal

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse a aplicação em `http://localhost:3000` (ou na porta configurada pelo Vite).

### Build de Produção
```bash
npm run build
```

---

## 🛠️ Tecnologias Utilizadas
- **Frontend:** React 18, TypeScript, Vite
- **Estilização:** Tailwind CSS, PostCSS
- **Ícones:** Lucide React
- **Áudio:** Web Audio API (Ruído Marrom nativo sem dependências externas)
- **Efeitos:** Canvas Confetti

---

## 👤 Autor
Desenvolvido por **Bruno Pinho** ([@BrunoPinho99](https://github.com/BrunoPinho99)).
