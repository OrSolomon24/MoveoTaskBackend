const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const { connectToDatabase } = require('./data/database');
const codeBlocksRoutes = require('./routes/codeBlockRoutes');
const { handleSocketConnection } = require('./sockets/codeBlockHandlers');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

io.on('connection', handleSocketConnection);

app.use('/api/codeBlocks', codeBlocksRoutes);

const startServer = async () => {
    try {
        await connectToDatabase();
        const port = process.env.PORT || 5000;
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
