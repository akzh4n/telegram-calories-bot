require('dotenv').config();
const { Telegraf } = require('telegraf');
const { setupBot } = require('./src/bot');
const logger = require('./src/utils/logger');
const http = require('http');
const https = require('https');

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  logger.error('TELEGRAM_TOKEN не найден в переменных окружения');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Бот "ИИ Калорий" работает!\n');
});

server.listen(PORT, () => {
  logger.info(`HTTP-сервер запущен на порту ${PORT}`);
});

// Функция для предотвращения "засыпания" сервиса на бесплатных хостингах
function keepAlive() {
  const appUrl = process.env.APP_URL;
  if (appUrl) {
    logger.info(`Настройка самопинга для ${appUrl}`);
    setInterval(() => {
      https.get(appUrl, (res) => {
        logger.info(`Самопинг выполнен, статус: ${res.statusCode}`);
      }).on('error', (err) => {
        logger.error(`Ошибка самопинга: ${err.message}`);
      });
    }, 5 * 60 * 1000); 
  }
}

const bot = new Telegraf(token);

bot.telegram.polling = {
  timeout: 30, 
  limit: 100, 
};

setupBot(bot);

// Улучшенная обработка ошибок
bot.catch((err, ctx) => {
  logger.error('Ошибка бота Telegraf:', err);
  try {
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже или обратитесь к разработчику.');
  } catch (replyError) {
    logger.error('Не удалось отправить сообщение об ошибке пользователю:', replyError);
  }
});

// Запуск бота с обработкой ошибок
function startBot() {
  bot.launch()
    .then(() => {
      logger.info('Бот "ИИ Калорий" успешно запущен!');
      keepAlive();
    })
    .catch(err => {
      logger.error('Ошибка при запуске бота:', err);
      logger.info('Попытка перезапуска через 10 секунд...');
      setTimeout(startBot, 10000);
    });
}

startBot();

process.once('SIGINT', () => {
  logger.info('Завершение работы бота (SIGINT)');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  logger.info('Завершение работы бота (SIGTERM)');
  bot.stop('SIGTERM');
});