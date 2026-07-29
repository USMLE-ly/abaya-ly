export default function handler(req, res) {
  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>404 - الصفحة غير موجودة</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:Tajawal,system-ui,sans-serif;background:#f9fafb;direction:rtl}.box{text-align:center;padding:2rem}h1{font-size:6rem;margin:0;color:#d1d5db;font-weight:800}p{font-size:1.125rem;color:#6b7280;margin-top:.5rem}</style></head>
<body><div class="box"><h1>404</h1><p>الصفحة غير موجودة</p></div></body>
</html>`);
}
