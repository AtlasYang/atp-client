FROM node:18-alpine AS builder

WORKDIR /app

ARG VITE_API_URL
ARG VITE_API_WS_URL

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_WS_URL=${VITE_API_WS_URL}

COPY package.json package-lock.json ./

RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
