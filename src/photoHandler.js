const { analyzeImageWithGemini } = require('./geminiService');
const { downloadTelegramFile } = require('./utils/fileDownloader');
const logger = require('./utils/logger');

/**
 * @param {TelegrafContext} ctx 
 */
async function handlePhoto(ctx) {
  const processingMessage = await ctx.reply('🔍 Анализирую ваше блюдо... Это может занять несколько секунд.');
  
  try {
    // Получаем информацию о фотографии (берем самый большой размер)
    const photoInfo = ctx.message.photo[ctx.message.photo.length - 1];
    const fileId = photoInfo.file_id;
    
    // Скачиваем фото из Telegram
    const imageData = await downloadTelegramFile(ctx, fileId);
    
    // Анализируем изображение
    const analysisResult = await analyzeImageWithGemini(imageData);
    
    // Удаляем сообщение о процессе
    await ctx.telegram.deleteMessage(ctx.chat.id, processingMessage.message_id);
    
    if (analysisResult && analysisResult.trim() !== '') {
      await ctx.reply(`${analysisResult}`, { parse_mode: 'Markdown' });
    } else {
      await ctx.reply('К сожалению, не удалось распознать блюдо на фото. Пожалуйста, попробуйте сделать более четкое фото при хорошем освещении.');
    }
  } catch (error) {
    logger.error('Ошибка при обработке фото:', error);
    await ctx.telegram.deleteMessage(ctx.chat.id, processingMessage.message_id);
    await ctx.reply(
      '😕 Извините, произошла ошибка при обработке фотографии.\n' +
      'Пожалуйста, убедитесь, что на фото четко видно блюдо, и попробуйте снова.'
    );
  }
}

module.exports = { handlePhoto };