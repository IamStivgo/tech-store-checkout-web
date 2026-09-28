# Web image: Vite build served by an unprivileged nginx that also proxies /api to the API.

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# No lifecycle scripts: they only install the git hooks.
RUN npm ci --ignore-scripts
COPY . .
# Local image: the card is tokenized with the fake tokenizer, matching the API's fake provider.
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
