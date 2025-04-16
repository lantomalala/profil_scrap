const express = require('express');
const router = express.Router();
const axios = require('axios');
const { JSDOM } = require('jsdom');

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

router.get('/profile_fb', async (req, res) => {
    let path = req.query.path;
    if (!path) return res.status(400).json({ error: 'Le paramètre "path" est requis' });
    let html =""
    let link =""
    if(!path.includes('facebook.com'))
        link = `https://www.facebook.com/p/${path}/?locale=fr_CA`;
    else
        link = path

    html = await getHTML(link);
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

module.exports = router;
