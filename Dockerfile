# =============================================================================
# gcalc — imagem de estáticos + proxy reverso (Nginx)
#
# Build context: raiz do repositório (gcalc/)
#   docker build -f statics/Dockerfile -t gcalc-static .
#
# Responsabilidades:
#   - Stage builder: executa collectstatic para reunir todos os arquivos
#   - Stage final:   Nginx serve /static/ e faz proxy_pass para o Django
#
# Variável de ambiente esperada em runtime pelo nginx.conf:
#   DJANGO_HOST   hostname/IP do container Django (default: app)
#   DJANGO_PORT   porta do Gunicorn              (default: 8000)
# =============================================================================

# ── Stage 1: coleta os estáticos ──────────────────────────────────────────────
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY django/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY django/ .
COPY statics/ /statics/

# Variáveis mínimas para o Django inicializar durante o build
# (collectstatic não precisa de banco de dados)
ENV SECRET_KEY=build-placeholder \
    DB_NAME=build \
    DB_USER=build \
    DB_PASSWORD=build \
    ALLOWED_HOSTS=localhost

RUN python manage.py collectstatic --no-input --clear


# ── Stage 2: Nginx ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove config padrão
RUN rm /etc/nginx/conf.d/default.conf

COPY statics/nginx.conf /etc/nginx/conf.d/default.conf

# Copia apenas os arquivos coletados, sem código Python
COPY --from=builder /statics/collected /usr/share/nginx/html/static

EXPOSE 80
