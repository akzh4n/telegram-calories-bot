const { handlePhoto } = require('./photoHandler');
const { commands } = require('./commands');
const logger = require('./utils/logger');

/**
 * @param {Telegraf} bot - Экземпляр бота Telegraf
 */
function setupBot(bot) {
  for (const [command, handler] of Object.entries(commands)) {
    logger.info(`Регистрация команды: /${command}`);
    bot.command(command, handler);
  }

  // Обработка полученных фотографий
  bot.on('photo', handlePhoto);

  // Обработка текстовых сообщений
  bot.on('text', (ctx) => {
    ctx.reply(
      'Пожалуйста, отправьте фотографию блюда, чтобы я мог оценить его калорийность. ' +
      'Если у вас есть вопросы, введите /help.'
    );
  });

  return bot;
}

module.exports = { setupBot };