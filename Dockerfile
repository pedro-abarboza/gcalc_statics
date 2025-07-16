# Usa uma imagem mínima, já que não precisa de servidor
FROM alpine:latest

# Define diretório de trabalho
WORKDIR /app

# Copie os arquivos do site estático para o diretório padrão do Nginx
COPY . .

# Exponha a porta 80, que é a porta padrão do Nginx
EXPOSE 80