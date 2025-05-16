
const axios = require('axios');
const logger = require('../utils/logger');
const { PROMPTS } = require('../utils/constants');

const MAX_RETRIES = 3; 
const RETRY_DELAY = 1000;

/**
 * @param {Buffer} imageBuffer 
 * @returns {Promise<string>}
 */
async function analyzeImageWithGemini(imageBuffer) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY не найден в переменных окружения');
  }

  const executeWithRetry = async (retryCount = 0) => {
    try {
      const base64Image = imageBuffer.toString('base64');
      
      logger.info(`Отправка запроса к API Gemini, попытка ${retryCount + 1}/${MAX_RETRIES}`);

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
        },
        timeout: 45000 // 45 секунд таймаут
      });
      
      logger.info('Получен ответ от API Gemini');

      if (response.data && 
          response.data.candidates && 
          response.data.candidates[0] && 
          response.data.candidates[0].content &&
          response.data.candidates[0].content.parts &&
          response.data.candidates[0].content.parts[0]) {
          return response.data.candidates[0].content.parts[0].text;
      } else {
          logger.error('Неожиданная структура ответа:', JSON.stringify(response.data, null, 2));
          throw new Error('Неожиданная структура ответа от API');
      }
    } catch (error) {
      const errorMessage = error.response ? 
        `Ошибка API: ${error.response.status} ${JSON.stringify(error.response.data)}` : 
        `Ошибка запроса: ${error.message}`;
      
      logger.error(`API ошибка (попытка ${retryCount + 1}/${MAX_RETRIES}): ${errorMessage}`);

      if (retryCount < MAX_RETRIES - 1) {
        logger.info(`Ожидание ${RETRY_DELAY}мс перед следующей попыткой...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return executeWithRetry(retryCount + 1);
      }

      throw error;
    }
  };

  try {
    return await executeWithRetry();
  } catch (error) {
    logger.error('Все попытки запроса к API Gemini провалились:', error.message);
    return "Извините, сервис временно недоступен. Пожалуйста, попробуйте позже.";
  }
}

module.exports = { analyzeImageWithGemini };