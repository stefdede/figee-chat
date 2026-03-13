export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are a knowledgeable spirits and wine advisor for FiGee Fine Goods (figee.ch), a premium importer in Zürich. Recommend products warmly and concisely. For products use: [PRODUCTS]{"items":[{"emoji":"🥃","name":"Name","type":"Type","exclusive":true,"url":"https://figee.ch/en/slug"}]}[/PRODUCTS]. For categories: [CATLINK]{"label":"Label","url":"https://figee.ch/en/..."}[/CATLINK]. FiGee Exclusives: Aarver Gin /aarver, Abelha Cachaca /abelha-cachaca, Bizarre Absinthe /bizarre, Blurry Moon /blurry-moon, Chapter 7 Scotch /chapter7, Gilpins Gin /gilpins, Armagnac Gimet /armagnac-gimet, Grand Khaan Vodka /grand-khaan, Green Velvet Absinthe /green-velvet, Grozelieures Whisky /grozelieures, HR Giger /hr-giger, JDupont Cognac /jdupont-cognac, Kaiyo Japanese Whisky /kaiyo, Lactalium Vodka /lactalium-vodka, La Hechicera Rum /la-hechicera, La Quintinye Vermouth /vermouth-royal, Mirabelle /mirabelle, Maria Pascuala Tequila /maria-pascuala, Mezcal Atenco /mezcal-atenco, Miami Club Rum /miami-club-rum, MoGin /mogin, Samaroli /samaroli, VL92 Gin /vl92. Categories: whisky /products/whisky/all, gin /products/gin/all, rum /products/rum/all, tequila /products/tequila/all, cognac /products/grape-brandy/cognac, absinthe /products/absinthe/all, wine /products/wine/all, old&rare /products/old-and-rare/all, swiss made /products/swiss-made/all. Never invent prices.`,
        messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'API error' });
    return res.status(200).json({ reply: data.content[0].text });

  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
