# AI Calories Bot

A Telegram bot that analyzes food photos and provides information about calorie content using Google's Gemini API.

## Features

- Food recognition from photos
- Calorie estimation
- Nutritional information (protein, fat, carbs)
- Ingredient identification

## Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/telegram-calories-bot.git
cd telegram-calories-bot
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file with your API keys
```
TELEGRAM_TOKEN=your_telegram_bot_token
GEMINI_API_KEY=your_gemini_api_key
```

4. Run the bot
```bash
npm start
```

## How to Use

1. Start a chat with your bot on Telegram
2. Send `/start` to begin interaction
3. Take a clear photo of your food
4. Send the photo to the bot
5. Receive detailed food analysis with calorie information

## Tech Stack

- Node.js
- Telegraf.js (Telegram Bot API)
- Google Gemini API
- Axios

## Deployment

The bot can be deployed to various free hosting platforms:
- Render
- Railway
- Glitch

## License

MIT
