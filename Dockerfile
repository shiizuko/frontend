# Etapa 1: Construir a aplicação React
FROM node:18-alpine AS builder

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar os arquivos de dependências
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar o restante dos arquivos do projeto
COPY . .

# Construir a aplicação para produção
RUN npm run build

# Etapa 2: Configurar Nginx para servir os arquivos da aplicação
FROM nginx:alpine

# Remover configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar a configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/

# Copiar os arquivos estáticos construídos para o diretório que o Nginx usa para servir conteúdo
COPY --from=builder /app/build /usr/share/nginx/html

# Expor a porta 80 para o tráfego HTTP
EXPOSE 80

# Comando padrão para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
