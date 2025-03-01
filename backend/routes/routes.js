import { userRoutes } from "../controllers/user-controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const appRoutes = (app) =>{
    app.get('/', (req, res) => {
        res.send('Hello World');
    });
    app.post('/user/signup', userRoutes.signup);
    app.post('/user/login', userRoutes.login);
    app.get('/user/logout', userRoutes.logout);

    app.get('/user/check', protectRoute, userRoutes.checkAuth);
}

export default appRoutes;