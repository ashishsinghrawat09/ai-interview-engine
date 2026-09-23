    const express = require("express");

    const authController = require("../controllers/auth.controller");

    const authRouter = express.Router();

    const authMiddleware = require("../middlewares/auth.middleware");


    /**
     * @route POST /api/auth/register
     * @description Register a new user
     * @access Public
     */
    authRouter.post(
        "/register",
        authController.registerUserController
    );


    /**
     * @route POST /api/auth/login
     * @description Login user with email and password
     * @access Public
     */
    authRouter.post(
        "/login",
        authController.loginUserController
    );


    /**
     * @route POST /api/auth/logout
     * @description Clear token from user cookie and add token to blacklist
     * @access Public
     */
    authRouter.post(
        "/logout",
        authController.logoutUserController
    );


    /**
     * @route GET /api/auth/get-me
     * @description Get the current logged-in user details
     * @access Private
     */
    authRouter.get(
        "/get-me",
        authMiddleware,
        authController.getMeController
    );


    module.exports = authRouter;