const express = require('express');
const cors = require('cors');

require('./db/database');

const quoteRoutes = require('./routes/quotes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (request, response) => {
    response.status(200).json({
        status: 'ok',
        message: 'HealthCoverSim API is running'
    });
});

app.use('/api/quotes', quoteRoutes);

app.use((request, response) => {
    response.status(404).json({
        error: 'The requested endpoint was not found.'
    });
});

app.use((error, request, response, next) => {
    console.error(error);

    if (error instanceof SyntaxError && error.status === 400) {
        return response.status(400).json({
            error: 'The request contains invalid JSON.'
        });
    }

    return response.status(500).json({
        error: 'An unexpected server error occurred.'
    });
});

module.exports = app;