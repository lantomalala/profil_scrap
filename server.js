const express = require('express');
const axios = require('axios');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = 3000;

const getHTML = async (url) => {
    try {
        let response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
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

app.get('/api/profile_fb', async (req, res) => {
    let path = req.query.path;
    if (!path) return res.status(400).json({ error: 'Le paramètre "path" est requis' });

    let link = `https://www.facebook.com/p/${path}/?locale=fr_CA`;
    let html = await getHTML(link);
    if (!html) return res.status(500).json({ error: 'Impossible de récupérer la page' });

    let dom = parseDOM(html);

    let name = dom.querySelector('meta[property*="title"]')?.getAttribute('content') || null;
    let imageProfil = dom.querySelector('meta[property="og:image"]')?.getAttribute('content') || null;
    let dernierPublication = [];
    let about = null;
    let adress = null;

    let profilData = {
        name: name,
        imageProfil: imageProfil,
        dernierPublication: dernierPublication,
        about: about,
        adress: adress
    };

    res.json(profilData);
});

app.get('/api/profile_tk', async (req, res) => {
    let path = req.query.path;
    if (!path) return res.status(400).json({ error: 'Le paramètre "path" est requis' });

    let link = `https://www.tiktok.com/@${path}`;
    let html = await getHTML(link);
    if (!html) return res.status(500).json({ error: 'Impossible de récupérer la page' });

    let dom = parseDOM(html);
    let script = dom.querySelector('[id="__UNIVERSAL_DATA_FOR_REHYDRATION__"]');
    if (!script) return res.status(500).json({ error: 'Données non trouvées dans la page' });

    let dataJson = JSON.parse(script.textContent);
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

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
