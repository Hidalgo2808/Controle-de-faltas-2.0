# ==============================================================================
# Dockerfile de Produção Multi-Stage - Otimizado para VPS e Containers
# ==============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copia dependências e instala
COPY package*.json ./
RUN npm install

# Copia código-fonte e compila para produção
COPY . .
RUN npm run build

# Estágio de Servidor Web Ultraleve com Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe porta 80 padrão
EXPOSE 80

# Inicia o Nginx em modo foreground
CMD ["nginx", "-g", "daemon off;"]
