export default async function handler(req, res) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN) {
    return res.status(200).json({
      ok: false,
      error: "TELEGRAM_BOT_TOKEN not set in Vercel env vars",
      hint: "Go to Vercel Dashboard → Settings → Environment Variables → add TELEGRAM_BOT_TOKEN for Production",
      env: Object.keys(process.env).filter(k => k.includes('TELE') || k.includes('BOT'))
    });
  }

  // Get bot info
  const me = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`).then(r => r.json());
  
  // Get updates
  const updates = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`).then(r => r.json());
  
  const chats = [];
  if (updates.ok && updates.result) {
    for (const u of updates.result) {
      if (u.message?.chat) {
        const c = u.message.chat;
        if (!chats.find(ch => ch.id === c.id)) chats.push(c);
      }
    }
  }

  // Try to send test message
  let testResult = null;
  if (CHAT_ID) {
    const test = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text: "✅ تم ربط البوت بنجاح! النظام جاهز لاستقبال الطلبات." }),
    }).then(r => r.json());
    testResult = test.ok ? "sent" : test.description;
  }

  res.status(200).json({
    ok: true,
    bot: me.ok ? `@${me.result.username}` : "unknown",
    chat_id_configured: !!CHAT_ID,
    chats_found: chats,
    test_message: testResult,
    message: !CHAT_ID
      ? "Send any message to your Telegram channel, then refresh this page to get the chat ID."
      : "Everything configured! Orders will be sent to your Telegram channel.",
  });
}
