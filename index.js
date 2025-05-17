require('dotenv').config();
const { Telegraf } = require('telegraf');
const { setupBot } = require('./src/bot');
const logger = require('./src/utils/logger');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;

// Получение токена из переменных окружения
const token = process.env.TELEGRAM_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;

if (!token) {
  logger.error('TELEGRAM_TOKEN не найден в переменных окружения');
  process.exit(1);
}

const bot = new Telegraf(token);

setupBot(bot);

bot.catch((err, ctx) => {
  logger.error('Ошибка бота Telegraf:', err);

  try {
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже или обратитесь к разработчику.');
  } catch (replyError) {
    logger.error('Не удалось отправить сообщение об ошибке пользователю:', replyError);
  }
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Бот "ИИ Калорий" работает!');
});

async function startBot() {
  if (webhookUrl) {
    logger.info(`Настройка webhook по адресу: ${webhookUrl}`);

    await bot.telegram.setWebhook(webhookUrl);
    
    app.use(bot.webhookCallback('/webhook'));
    
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Сервер запущен на порту ${PORT} и слушает на всех интерфейсах`);
      logger.info(`Webhook настроен по адресу: ${webhookUrl}`);
    });
  } else {
    logger.info('Запуск бота в режиме polling (без webhook)');
    await bot.launch();
    logger.info('Бот "ИИ Калорий" успешно запущен в режиме polling!');
  }
}

startBot().catch(err => {
  logger.error('Ошибка при запуске бота:', err);
  process.exit(1);
});

// Корректное завершение работы бота при остановке процесса
const gracefulShutdown = () => {
  logger.info('Получен сигнал остановки, завершение работы...');
  
  if (webhookUrl) {
    bot.telegram.deleteWebhook()
      .then(() => logger.info('Webhook удален'))
      .catch(err => logger.error('Ошибка при удалении webhook:', err))
      .finally(() => process.exit(0));
  } else {

    bot.stop('SIGTERM');
    process.exit(0);
  }
};

process.once('SIGINT', gracefulShutdown);
process.once('SIGTERM', gracefulShutdown);