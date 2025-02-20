import 'dotenv/config';
import 'tsconfig-paths/register';
import express, { Express } from 'express';
import cors from 'cors';
import { connect } from 'mongoose';
import rootRouter from './routes';
import { errorMiddleware } from './middlewares/errorsMiddleware';
import path from 'path';

const app: Express = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
connect(MONGO_URI!)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error(err));

app.use('/api', rootRouter);
app.get('/auth/login', (req, res) => {
    res.render('auth/login');
});
app.get('/auth/register', (req, res) => {
    res.render('auth/register');
});
app.get('/quiz', (req, res) => {
    res.render('quiz/take');
});
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
});
