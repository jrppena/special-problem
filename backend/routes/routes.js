import { authRoutes } from "../controllers/auth-controller.js";
import { adminRoutes } from "../controllers/admin-controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const appRoutes = (app) =>{

    app.post('/api/auth/signup', authRoutes.signup);
    app.post('/api/auth/login', authRoutes.login);
    app.get('/api/auth/logout', authRoutes.logout);

    app.get('/api/auth/check', protectRoute, authRoutes.checkAuth);

    app.get('/api/admin/pending-users', protectRoute, adminRoutes.getPendingUsers);
    app.post('/api/admin/verify/:userId', protectRoute, adminRoutes.verifyUser);
}

export default appRoutes;