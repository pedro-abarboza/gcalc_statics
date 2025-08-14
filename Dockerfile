# Imagem base mínima com Nginx
FROM nginx:1.27-alpine

# Variável para onde os arquivos estáticos serão servidos
ENV STATIC_PATH=/usr/share/nginx/html

# Remove a config padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos (já coletados do Django)
COPY public/ static/

# Permite leitura para todos
RUN chmod -R 755 static

# Porta padrão
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
