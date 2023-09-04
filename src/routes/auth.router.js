import express from 'express'
import {
	signupPageHandler,
	loginPageHandler
} from '../controllers/auth.controller.js'

const router = express.Router()

router.get('/sign-up', signupPageHandler)
router.get('/login', loginPageHandler)

export default router
