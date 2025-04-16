const express = require('express');
const router = express.Router();
const axios = require('axios');
const { JSDOM } = require('jsdom');

// Insertion Proxy
//const HttpsProxyAgent = require('https-proxy-agent');
//const proxyAgent = new HttpsProxyAgent('http://ton_username:ton_password@proxy.webshare.io:12345');
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

router.get('/profile_tk', async (req, res) => {
    let path = req.query.path;
    if (!path) return res.status(400).json({ error: 'Le paramètre "path" est requis' });

    let link = "";
    if (!path.includes('tiktok.com'))
        link = `https://www.tiktok.com/@${path}`;
    else
        link = path;

    let html = await getHTML(link);
    if (!html) return res.status(500).json({ error: 'Impossible de récupérer la page' });

    let dom = parseDOM(html);
    let script = dom.querySelector('[id="__UNIVERSAL_DATA_FOR_REHYDRATION__"]');
    if (!script) return res.status(500).json({ error: 'Données non trouvées dans la page' });

    let dataJson;
    try {
        dataJson = JSON.parse(script.textContent);
    } catch (err) {
        return res.status(500).json({ error: 'Erreur lors du parsing JSON' });
    }

    let userData = dataJson['__DEFAULT_SCOPE__']['webapp.user-detail']?.userInfo;

    if (!userData) return res.status(500).json({ error: 'Impossible de parser les données utilisateur' });

    let name = userData.user.nickname;
    let imageProfil = userData.user.avatarLarger || null;
    let userStat = userData?.stats;
    let about = userData.user?.signature || null;
    let lastPublication = dom.querySelector('[class*="DivThreeColumnContainer"] [class*="DivItemContainer"] a img')?.getAttribute('src') || null;
    let adress = null;

    let profilData = {
        name: name,
        imageProfil: imageProfil,
        userStat: userStat,
        about: about,
        adress: adress,
        lastPublication: lastPublication
    };

    res.json(profilData);
});

module.exports = router;
