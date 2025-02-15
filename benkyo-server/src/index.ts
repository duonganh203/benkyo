import 'dotenv/config';
import 'tsconfig-paths/register';
import './authPassport';
import express, { Express } from 'express';
import cors from 'cors';
import { connect } from 'mongoose';
import passport from 'passport';
import rootRouter from './routes';
import { errorMiddleware } from './middlewares/errorsMiddleware';

const app: Express = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
app.use(express.json());

app.use(cors());
app.use(passport.initialize());
connect(MONGO_URI!)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error(err));

app.use('/api', rootRouter);
app.use(errorMiddleware);
app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
});
