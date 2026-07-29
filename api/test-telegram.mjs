export default async function handler(req, res) {
  const EC_URL = process.env.EDGE_CONFIG;
  
  try {
    const resp = await fetch(EC_URL);
    const raw = await resp.text();
    const parsed = JSON.parse(raw);
    
    const items = parsed.items;
    const itemKeys = typeof items === 'object' && items !== null ? Object.keys(items) : [];
    const itemSample = itemKeys.length > 0 ? items[itemKeys[0]] : null;
    
    return res.status(200).json({
      topLevelKeys: Object.keys(parsed),
      itemsType: typeof items,
      itemsIsArray: Array.isArray(items),
      itemsKeyCount: itemKeys.length,
      firstItemKey: itemKeys[0] || null,
      sampleValue: itemSample
    });
  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
}
