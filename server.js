const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Autoriser uniquement votre domaine
app.use(cors({
  origin: ['https://clubrh.mabonnefee.com', 'https://mabonnefee.com'],
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Club RH · Ma Bonne Fée · API Proxy' });
});

// Proxy vers Anthropic
app.post('/api/newsletter', async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Clé API manquante' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    console.error('Erreur proxy Anthropic:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(PORT, () => {
  console.log(`✦ Club RH API Proxy démarré sur le port ${PORT}`);
});
