import axios from 'axios';
import { Router } from 'express';
const quizRoutes: Router = Router();
quizRoutes.get('/', async (req, res) => {
    const response = await axios.get('http://localhost:3000/api/quizzes');
    const quizes = response.data;
    res.render('quiz/quiz', { quizes });
});
export default quizRoutes;
