const axios = require('axios');
const logger = require('./utils/logger');
const { PROMPTS } = require('./utils/constants');

/**
 * @param {Buffer} imageBuffer - Бинарные данные изображения
 * @returns {Promise<string>} Результат анализа в текстовом формате
 */
async function analyzeImageWithGemini(imageBuffer) {
  try {
    // Проверка наличия API ключа
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY не найден в переменных окружения');
    }

    // Кодируем изображение в base64
    const base64Image = imageBuffer.toString('base64');
    
    // Создаем запрос к API Gemini с шаблоном структурированного ответа
    const response = await axios({
      method: 'POST',
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      data: {
        contents: [
          {
            parts: [
              {
                text: PROMPTS.FOOD_ANALYSIS
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 800
        }
      }
    });
    
    // Проверяем наличие данных в ответе
    if (response.data && 
        response.data.candidates && 
        response.data.candidates[0] && 
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts[0]) {
        return response.data.candidates[0].content.parts[0].text;
    } else {
        logger.error('Неожиданная структура ответа:', JSON.stringify(response.data, null, 2));
        return "Не удалось распознать ответ от модели ИИ. Пожалуйста, попробуйте позже.";
    }
  } catch (error) {
    logger.error('Ошибка при анализе изображения:', error);
    return "Извините, произошла ошибка при анализе изображения. Пожалуйста, попробуйте еще раз.";
  }
}

module.exports = { analyzeImageWithGemini };