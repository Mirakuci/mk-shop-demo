FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install || true
COPY . .
ENV NEXT_PUBLIC_API_BASE=http://backend:8100
EXPOSE 3000
CMD ["npm","run","dev","--","-p","3000","-H","0.0.0.0"]
