const express = require('express');
const app = express();
const PORT = 3000;

const facebookRoute = require('./root/facebook');
const tiktokRoute = require('./root/tiktok');

app.use('/api', facebookRoute);
app.use('/api', tiktokRoute);

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
