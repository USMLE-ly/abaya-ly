import type { VercelRequest, VercelResponse } from "@vercel/node";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

interface OrderData {
  code: string;
  name: string;
  color: string;
  size: string;
  location: string;
  phone: string;
}

function formatOrderMessage(data: OrderData): string {
  return `🆕 طلب جديد من متجر نادين

━━━━━━━━━━━━━━━
🆔 الكود: ${data.code}
👗 الفستان: ${data.name}
🎨 اللون: ${data.color}
📏 المقاس: ${data.size}
📍 الموقع: ${data.location}
📞 الهاتف: ${data.phone}
━━━━━━━━━━━━━━━
📅 ${new Date().toLocaleDateString("ar-LY", { 
  weekday: "long", year: "numeric", month: "long", day: "numeric",
  hour: "2-digit", minute: "2-digit" 
})}
`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, name, color, size, location, phone } = req.body || {};

  // Validate required fields
  if (!code || !phone) {
    return res.status(400).json({ 
      error: "Missing required fields: code and phone are required" 
    });
  }

  const orderData: OrderData = {
    code: code || "—",
    name: name || "—",
    color: color || "—",
    size: size || "—",
    location: location || "—",
    phone,
  };

  const message = formatOrderMessage(orderData);

  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN not configured");
    return res.status(500).json({ error: "Telegram not configured" });
  }

  try {
    // Try to get the chat ID by first sending to a known ID or via updates
    // First, try to send to the channel using the invite link's username
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!chatId) {
      // If no chat ID configured, return success but notify
      console.log("No TELEGRAM_CHAT_ID configured. Message would be:", message);
      return res.status(200).json({ 
        success: true, 
        message: "Order received, but Telegram not configured yet."
      });
    }

    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Telegram API error:", result);
      return res.status(500).json({ error: "Failed to send to Telegram", details: result });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
