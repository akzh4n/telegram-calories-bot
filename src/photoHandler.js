const { analyzeImageWithGemini } = require('./geminiService');
const { downloadTelegramFile } = require('./utils/fileDownloader');
const logger = require('./utils/logger');

/**
 * @param {TelegrafContext} ctx - 
 */
async function handlePhoto(ctx) {
  // Локальная функция для добавления таймаута к промису
  const withTimeout = (promise, ms, errorMessage) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(errorMessage)), ms)
      )
    ]);
  };

  const processingMessage = await ctx.reply('🔍 Анализирую ваше блюдо... Это может занять несколько секунд.');
  
  try {
    const photoInfo = ctx.message.photo[ctx.message.photo.length - 1];
    const fileId = photoInfo.file_id;
    
    logger.info(`Получено фото: ${fileId}, размер: ${photoInfo.width}x${photoInfo.height}, ${photoInfo.file_size} байт`);
    
    const imageData = await withTimeout(
      downloadTelegramFile(ctx, fileId),
      30000, 
      'Превышено время ожидания при загрузке фото'
    );
    
    logger.info(`Фото успешно загружено, размер: ${imageData.length} байт`);
    
    const analysisResult = await withTimeout(
      analyzeImageWithGemini(imageData),
      60000, 
      'Анализ фотографии занял слишком много времени'
    );
    
    logger.info(`Анализ завершен, длина ответа: ${analysisResult ? analysisResult.length : 0} символов`);
  
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, processingMessage.message_id);
    } catch (deleteError) {
      logger.warn('Не удалось удалить сообщение о процессе:', deleteError.message);
    }

    if (analysisResult && analysisResult.trim() !== '') {
      try {
        await ctx.reply(`${analysisResult}`, { parse_mode: 'Markdown' });
      } catch (markdownError) {
        logger.warn('Ошибка в Markdown форматировании:', markdownError.message);
        await ctx.reply(`${analysisResult}`, { parse_mode: 'HTML' });
      }
    } else {
      await ctx.reply('К сожалению, не удалось распознать блюдо на фото. Пожалуйста, попробуйте сделать более четкое фото при хорошем освещении.');
    }
  } catch (error) {
    logger.error('Ошибка при обработке фото:', error.message);

    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, processingMessage.message_id);
    } catch (deleteError) {
      logger.warn('Не удалось удалить сообщение о процессе:', deleteError.message);
    }
    
    let errorMessage = '😕 Извините, произошла ошибка при обработке фотографии.';
    
    if (error.message.includes('таймаута') || error.message.includes('too much time')) {
      errorMessage = '⏱️ Извините, анализ фотографии занял слишком много времени. Пожалуйста, попробуйте позже.';
    }
    
    await ctx.reply(errorMessage + '\nПожалуйста, убедитесь, что на фото четко видно блюдо, и попробуйте снова.');
  }
}

module.exports = { handlePhoto };


module.exports = { handlePhoto };