import { Router } from "express";
import { getElements, login, logout, refreshAccessToken, register, savepage } from "../controllers/user.controllers.js";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";

const router = Router();

router.route('/register').post(register)

router.route('/login').post(login)
router.route('/refreshtoken').get(refreshAccessToken)
router.route('/logout').get(isAuthenticated,logout);
router.route('/save').post(isAuthenticated,savepage)
router.route('/getelements').get(isAuthenticated,getElements);

export default router