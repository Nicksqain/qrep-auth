import axios from "axios";
const token = import.meta.env.VITE_APP_TELEGRAM_BOT_TOKEN;

export const sendTelegramMessage = (chatId: string, message: string) =>
  axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: '1199080883',
    text: message,
    parse_mode: "Markdown",
  });
