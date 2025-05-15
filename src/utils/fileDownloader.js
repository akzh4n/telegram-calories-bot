const axios = require('axios');
const logger = require('./logger');

/**
 * @param {TelegrafContext} ctx - Контекст Telegraf
 * @param {string} fileId - ID файла в Telegram
 * @returns {Promise<Buffer>} Бинарные данные файла
 */
async function downloadTelegramFile(ctx, fileId) {
  try {
    // Получаем информацию о файле
    const fileInfo = await ctx.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${fileInfo.file_path}`;
    
    // Загружаем файл
    const response = await axios({
      url: fileUrl,
      method: 'GET',
      responseType: 'arraybuffer'
    });
    
    return response.data;
  } catch (error) {
    logger.error('Ошибка при скачивании файла из Telegram:', error);
    throw new Error('Не удалось загрузить файл из Telegram');
  }
}

module.exports = { downloadTelegramFile };