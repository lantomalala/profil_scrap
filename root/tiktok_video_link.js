const express = require('express');
const router = express.Router();
const axios = require('axios');
const { JSDOM } = require('jsdom');

// Insertion Proxy (désactivée pour le moment)
// const HttpsProxyAgent = require('https-proxy-agent');
// const proxyAgent = new HttpsProxyAgent('http://ton_username:ton_password@proxy.webshare.io:12345');

const getHTML = async (url) => {
    try {
        let response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
            // httpsAgent: proxyAgent,
            // proxy: true
        });
        return response.data;
    } catch (error) {
        console.error('Erreur de requête :', error.message);
        return null;
    }
};

const parseDOM = (html) => {
    let dom = new JSDOM(html);
    return dom.window.document;
};

router.get('/profile_tk_link', async (req, res) => {
    let path = req.query.path;
    if (!path) return res.status(400).json({ error: 'Le paramètre "path" est requis' });

    // Vérifie si le path commence par http/https, sinon on ajoute https://
    let link = path.startsWith('http') ? path : `https://${path}`;

    let html = await getHTML(link);
    if (!html) return res.status(500).json({ error: 'Impossible de récupérer la page' });

    let dom = parseDOM(html);

    // Exemple simple pour voir si la page est bien scrapée
    let title = JSON.parse(dom.querySelector('[id="__UNIVERSAL_DATA_FOR_REHYDRATION__"]').textContent)

    res.json({ title: title });
});

module.exports = router;
