import 'dotenv/config';
import 'tsconfig-paths/register';
import express, { Express } from 'express';
import path from 'path';
import rootRouter from './routes';

const app: Express = express();
const PORT = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', rootRouter);
app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
});
