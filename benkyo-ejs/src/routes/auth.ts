import { Router } from 'express';
const authRoutes: Router = Router();
authRoutes.get('/', (req, res) => {
    res.render('login');
});
export default authRoutes;
