// File: api/token.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).send('Missing authorization code');
        }

        const params = new URLSearchParams();
        params.append('client_id', process.env.VITE_DISCORD_CLIENT_ID);
        params.append('client_secret', process.env.DISCORD_CLIENT_SECRET);
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        // This MUST match the redirect URI in your Dev Portal
        params.append('redirect_uri', process.env.VITE_HOST_URL); 

        const response = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Failed to fetch token:', data);
            return res.status(response.status).json(data);
        }

        res.json({ access_token: data.access_token });

    } catch (error) {
        console.error('Token exchange error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}