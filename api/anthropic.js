# Final Files for Feren.AI Deployment

## 📁 Project Structure

```
feren-ai/
├── api/
│   └── anthropic.js
├── public/
│   └── index.html
└── package.json (optional)
```

That's it! Only **3 files** needed.

---

## 📄 File 1: `/api/anthropic.js`

```javascript
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { apiKey, model, messages, max_tokens } = req.body;

        // Security: Validate API key format
        if (!apiKey || !apiKey.startsWith('sk-ant-')) {
            return res.status(400).json({ error: 'Invalid API key format' });
        }

        // Call Anthropic API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model || 'claude-sonnet-4-20250514',
                messages: messages,
                max_tokens: max_tokens || 2048
            })
        });

        const data = await response.json();

        // Handle Anthropic API errors
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        // Return successful response
        return res.status(200).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
```
