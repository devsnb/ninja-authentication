import express from 'express'
import {
	signupPageHandler,
	loginPageHandler,
	createUserHandler,
	destroySession
} from '../controllers/auth.controller.js'

const router = express.Router()

router.get('/sign-up', signupPageHandler)
router.get('/login', loginPageHandler)
router.post('/create', createUserHandler)
router.get('/sign-out', destroySession)

export default router
