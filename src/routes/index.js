import express from 'express'
import passport from 'passport'

import { homepageHandler } from '../controllers/home.controller.js'
import authRouter from './auth.router.js'

const router = express.Router()

router.get('/', passport.checkAuthentication, homepageHandler)
// register pages related to authentication
router.use(authRouter)

export default router
