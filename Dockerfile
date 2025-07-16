# Use uma imagem base do Nginx
FROM nginx:alpine

# Copie os arquivos do site estático para o diretório padrão do Nginx
COPY . .

# Exponha a porta 80, que é a porta padrão do Nginx
EXPOSE 80