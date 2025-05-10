# Etapa 1: Build de la app
FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servir con servidor estático
FROM node:18

# Instala el servidor estático 'serve'
RUN npm install -g serve

WORKDIR /app
COPY --from=build /app/build ./build

# Expone el puerto 3000 (React)
EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
