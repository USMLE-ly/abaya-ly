export default async function handler(req, res) {
  // ULTRA MINIMAL - just echo back the params
  const { orderNumber, phone } = req.query;
  return res.status(200).json({ 
    received: true, 
    orderNumber: orderNumber || "(empty)", 
    phone: phone || "(empty)",
    hasEC: !!process.env.EDGE_CONFIG,
    shortEC: (process.env.EDGE_CONFIG || "").substring(0, 20),
  });
}
