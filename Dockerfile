FROM node:18-alpine

# Создаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы проекта
COPY . .

# Устанавливаем переменную окружения для порта
ENV PORT=3000

# Запускаем приложение
CMD ["node", "index.js"]