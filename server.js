const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('test-page'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-page/index.html'));
});

app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://0.0.0.0:3000');
});
