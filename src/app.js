const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('Hello From the server');
})

module.exports = app;