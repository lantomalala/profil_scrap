const express = require('express');
const axios = require('axios');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = 3000;

const getHTML = async (url) => {
    try {
        let response = await axios.get(url);
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

app.get('/api/profile', async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
