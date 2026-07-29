import type { VercelRequest, VercelResponse } from "@vercel/node";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!BOT_TOKEN) {
    return res.status(200).json({ ok: false, error: "TELEGRAM_BOT_TOKEN not set in Vercel env vars" });
  }

  // Get recent updates
  const updatesRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
  const updates = await updatesRes.json();

  // Also test send a message to bot itself
  const meRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
  const me = await meRes.json();

  // Extract unique chat IDs from updates
  const chats = new Set<string>();
  if (updates.ok && updates.result) {
    for (const u of updates.result) {
      if (u.message?.chat) chats.add(JSON.stringify(u.message.chat));
    }
  }

  return res.status(200).json({
    ok: true,
    bot: me.ok ? me.result.username : "unknown",
    updates_count: updates.ok ? updates.result?.length || 0 : 0,
    chats: Array.from(chats).map(c => JSON.parse(c)),
    message: chats.size === 0
      ? "No chats yet. Send a message to your Telegram channel (where @Nadine_luxor_bot is admin), then refresh this page."
      : "Chats found! Copy the 'id' field and set TELEGRAM_CHAT_ID in Vercel env vars",
  });
}
