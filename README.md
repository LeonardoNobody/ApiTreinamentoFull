# 🧠 ApiTreinamentoFull

![.NET](https://img.shields.io/badge/.NET-8.0-blue?logo=dotnet)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-38b2ac?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Em%20Desenvolvimento-yellow)

> Projeto full stack de aprendizado, combinando **API REST em .NET** com um **frontend moderno em React + Tailwind CSS**.  
> O objetivo é praticar arquitetura real de aplicações: autenticação, integração front-back e envio de mensagens por e-mail.

---

## 🧩 Estrutura do Projeto

ApiTreinamentoFull/
├── backend/
│ └── ApiTreinamento/
│ ├── Controllers/ # Endpoints REST
│ ├── Models/ # Entidades e DTOs
│ ├── Services/ # Regras de negócio (ex: envio de e-mails)
│ ├── Program.cs
│ ├── appsettings.json
│ └── ApiTreinamento.csproj
│
├── frontend/
│ └── optiktrack-web/
│ ├── src/ # Componentes React e páginas
│ ├── public/
│ ├── package.json
│ ├── tailwind.config.js
│ └── vite.config.ts
│
├── package.json # Scripts para rodar tudo junto (monorepo)
├── .gitignore
└── README.md





  Tecnologias Utilizadas

 💻 **Backend (.NET - ApiTreinamento)**
- ASP.NET Core 8+
- Entity Framework Core
- CORS configurado para o frontend
- Envio de e-mails (SMTP/SendGrid)
- Swagger UI para documentação
- AutoMapper para mapeamento de DTOs
- Injeção de dependência e boas práticas REST

 🖥️ **Frontend (React + Tailwind - optiktrack-web)**
- React 18 (Vite)
- Tailwind CSS 3+
- Axios / Fetch API
- React Router DOM
- Hooks customizados
- Componentização e integração direta com a API



Como Rodar o Projeto

Pré-requisitos
Certifique-se de ter instalado:
- [Node.js](https://nodejs.org/) (v18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [.NET SDK 8+](https://dotnet.microsoft.com/download)



  Passo a passo

 { Clone o repositório
```bash
git clone https://github.com/LeonardoNobody/ApiTreinamentoFull.git
cd ApiTreinamentoFull }

{ *Backend (.NET)*
cd backend/ApiTreinamento
dotnet restore
dotnet run } 

{ *Frontend (React)*
Em outro terminal:

cd frontend/optiktrack-web
npm install
npm run dev }

{ *Rodar os dois juntos (monorepo)*

Na raiz do projeto:
npm install
npm run dev }


🧑‍💻 Autor
<img src="https://avatars.githubusercontent.com/u/0?v=4" width=100><br><sub>Leonardo Nobody</sub>


💬 Desenvolvido com foco em aprendizado e boas práticas.
Sinta-se à vontade para clonar, modificar e contribuir!

📧 Contato: [https://www.linkedin.com/in/leonardo-souza-35a07920b]

