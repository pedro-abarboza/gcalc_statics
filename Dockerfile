# Usa uma imagem mínima, já que não precisa de servidor
FROM alpine:latest

# Define diretório de trabalho
WORKDIR /app

# Copia os arquivos estáticos para dentro do container
COPY . .

# Nada para expor nem rodar, já que o EasyPanel cuida disso
