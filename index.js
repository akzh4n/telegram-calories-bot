require('dotenv').config();
const { Telegraf } = require('telegraf');
const { setupBot } = require('./src/bot');
const logger = require('./src/utils/logger');

// Получение токена из переменных окружения
const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  logger.error('TELEGRAM_TOKEN не найден в переменных окружения');
  process.exit(1);
}
const bot = new Telegraf(token);

setupBot(bot);

// Обработка ошибок
bot.catch((err, ctx) => {
  logger.error('Ошибка бота Telegraf:', err);
  ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже или обратитесь к разработчику.');
});

// Запуск бота
bot.launch()
  .then(() => {
    logger.info('Бот "ИИ Калорий" успешно запущен!');
  })
  .catch(err => {
    logger.error('Ошибка при запуске бота:', err);
    process.exit(1);
  });

// Корректное завершение работы бота при остановке процесса
process.once('SIGINT', () => {
  logger.info('Завершение работы бота (SIGINT)');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  logger.info('Завершение работы бота (SIGTERM)');
  bot.stop('SIGTERM');
});