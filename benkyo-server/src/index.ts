import 'dotenv/config';
import 'tsconfig-paths/register';
import './authPassport';
import express, { Express } from 'express';
import cors from 'cors';
import { connect } from 'mongoose';
import passport from 'passport';
import path from 'path';
import fs from 'fs-extra';
import rootRouter from './routes';
import { errorMiddleware } from './middlewares/errorsMiddleware';
import { initPineconeIndex } from './services/pineconeService';
import { createServer } from 'http';
import { setupWebSocket } from './utils/socketServer';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
const documentsDir = path.join(uploadDir, 'documents');
fs.ensureDirSync(uploadDir);
fs.ensureDirSync(documentsDir);

const app: Express = express();
const server = createServer(app);
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
app.use(express.json());

app.use(cors());
app.use(passport.initialize());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
connect(MONGO_URI!)
    .then(() => {
        console.log('Connected to MongoDB');
        // Initialize Pinecone index
        initPineconeIndex()
            .then(() => console.log('Pinecone index initialized'))
            .catch((err) => console.error('Error initializing Pinecone index:', err));
    })
    .catch((err) => console.error(err));

setupWebSocket(server);

app.use('/api', rootRouter);
app.use(errorMiddleware);
server.listen(PORT, () => {
    console.log(` Server (Express + WebSocket) is running on http://localhost:${PORT}`);
});
