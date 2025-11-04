// File: api/token.js
// --- CORRECTED VERSION ---

export default async function handler(req, res) {
    console.log("--- VERCEL LOG: /api/token function invoked ---");
    console.log("Request Method:", req.method);

    if (req.method !== 'POST') {
        console.log("Error: Invalid method.");
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const { code } = req.body;
        console.log("Received auth code from frontend.");

        if (!code) {
            console.log("Error: Missing authorization code in request body.");
            return res.status(400).send('Missing authorization code');
        }

        const clientId = process.env.VITE_DISCORD_CLIENT_ID;
        const clientSecret = process.env.DISCORD_CLIENT_SECRET;

        console.log("Env Var - VITE_DISCORD_CLIENT_ID:", clientId ? "Loaded" : "!!! UNDEFINED !!!");
        console.log("Env Var - DISCORD_CLIENT_SECRET:", clientSecret ? "Loaded (hidden)" : "!!! UNDEFINED !!!");

        // We removed VITE_HOST_URL, as it is not needed
        if (!clientId || !clientSecret) {
            console.log("Error: One or more environment variables are missing.");
            return res.status(500).send("Server configuration error.");
        }

        const params = new URLSearchParams();
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        // --- THIS LINE WAS REMOVED ---
        // params.append('redirect_uri', hostUrl); 

        console.log("Sending request to Discord API (/oauth2/token)...");
        
        const response = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const data = await response.json();
        console.log("Received response from Discord API. Status:", response.status);

        if (!response.ok) {
            console.error("Error from Discord API:", data);
            return res.status(response.status).json(data);
        }

        console.log("--- VERCEL LOG: Success! Sending access token to frontend. ---");
        res.json({ access_token: data.access_token });

    } catch (error) {
        console.error("--- VERCEL LOG: Unhandled error in /api/token ---");
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
