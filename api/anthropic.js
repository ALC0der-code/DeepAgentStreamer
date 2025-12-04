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

        // Validate request body
        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        // Security: Validate API key format
        if (!apiKey.startsWith('sk-ant-')) {
            return res.status(400).json({ error: 'Invalid API key format' });
        }

        console.log('Calling Anthropic API with model:', model);

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

        // Log for debugging
        console.log('Anthropic API response status:', response.status);

        // Handle Anthropic API errors
        if (!response.ok) {
            console.error('Anthropic API error:', data);
            return res.status(response.status).json(data);
        }

        // Return successful response
        return res.status(200).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            details: error.toString()
        });
    }
}
