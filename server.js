const express = require('express');
const app = express();
const PORT = 3000;

const facebookRoute = require('./root/facebook');
const tiktokRoute = require('./root/tiktok');
const linkTiktok = require('./root/tiktok_video_link');

app.use('/api', facebookRoute);
app.use('/api', tiktokRoute);
app.use('/api', linkTiktok);

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
