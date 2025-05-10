# Usa Node.js oficial
FROM node:18

# Crea directorio en el contenedor
WORKDIR /app

# Copia dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia todo el código
COPY . .

# Expone el puerto de tu servidor
EXPOSE 3001

# Comando de inicio
CMD ["node", "index.js"]
    