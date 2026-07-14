const axios = require('axios');
const cron = require('node-cron');

const startHeartbeat = () => {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
        console.warn('[Heartbeat] BACKEND_URL not found in environment variables. Heartbeat skipped.');
        return;
    }

    const healthUrl = `${backendUrl.replace(/\/$/, '')}/api/health`;

    console.log(`[Heartbeat] Service initialized. Pinging ${healthUrl} every 10 minutes.`);

    // Initial ping
    axios.get(healthUrl)
        .then(() => console.log(`[Heartbeat] Initial ping successful to ${healthUrl}`))
        .catch(err => console.error(`[Heartbeat] Initial ping failed: ${err.message}`));

    // Schedule ping every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        try {
            await axios.get(healthUrl);
            console.log(`[Heartbeat] Ping sent successfully at ${new Date().toLocaleString()}`);
        } catch (err) {
            console.error(`[Heartbeat] Ping failed at ${new Date().toLocaleString()}: ${err.message}`);
        }
    });
};

module.exports = { startHeartbeat };
