# Use uma imagem base do Nginx
FROM nginx:alpine

# Copie os arquivos do site estático para o diretório padrão do Nginx
COPY . /usr/share/nginx/html

# Exponha a porta 80, que é a porta padrão do Nginx
EXPOSE 80

# Configurações adicionais podem ser inseridas aqui, se necessário

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]