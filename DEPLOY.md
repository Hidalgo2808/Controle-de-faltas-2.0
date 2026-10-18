# 🚀 Guia de Hospedagem e Deploy - Meu Projeto

Este projeto foi construído pelo **Code In** com arquitetura pronta para ser hospedado em **qualquer plataforma**: VPS, hospedagens convencionais compartilhadas (cPanel) ou nuvem.

---

## 1. 🐳 Hospedagem em VPS com Docker (Recomendado)

O projeto já contém `Dockerfile`, `docker-compose.yml` e `nginx.conf` pré-configurados.

1. Instale o Docker e Docker Compose na sua VPS (Ubuntu / Debian):
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
2. Clone o repositório ou copie os arquivos do projeto para o servidor.
3. Inicie o container em segundo plano:
   ```bash
   docker compose up -d --build
   ```
4. Acesse o IP ou domínio do seu servidor na porta **80**. O Nginx cuidará do cache e de todas as rotas da aplicação!

---

## 2. 🟢 Hospedagem em VPS com Node.js / PM2 (Sem Docker)

O projeto inclui um servidor nativo ultraleve (`server.js`) sem dependências externas:

1. Na sua VPS, instale o Node.js e o PM2:
   ```bash
   npm install -g pm2
   ```
2. Instale as dependências e gere o build de produção:
   ```bash
   npm install
   npm run build
   ```
3. Inicie a aplicação com o PM2 (início automático e reinício caso caia):
   ```bash
   pm2 start server.js --name "meu-projeto"
   pm2 save
   pm2 startup
   ```
4. Por padrão, a aplicação roda na porta `3000`. Você pode alterar configurando a variável `PORT=80`.

---

## 3. 🌐 Hospedagem Comum Compartilhada (cPanel / Apache / Hostinger / Locaweb)

1. No seu computador, gere os arquivos finais de produção:
   ```bash
   npm run build
   ```
2. Uma pasta chamada **`dist/`** será gerada no projeto.
3. Acesse o **Gerenciador de Arquivos** do seu cPanel (ou conecte via FTP).
4. Envie todo o conteúdo de dentro da pasta `dist/` para a pasta `public_html` da sua hospedagem.
5. O arquivo `.htaccess` já incluído garante que qualquer rota (ex: `/login`, `/painel`) funcione perfeitamente sem gerar erro 404!

---

## 4. ⚡ Hospedagem na Nuvem (Vercel, Netlify, Cloudflare Pages, Render)

1. Publique o projeto no GitHub usando o botão **"Publicar no GitHub"** no Code In.
2. Na sua plataforma de preferência (ex: Vercel ou Netlify):
   - Importe o repositório do GitHub.
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. O deploy será feito automaticamente em poucos segundos!
