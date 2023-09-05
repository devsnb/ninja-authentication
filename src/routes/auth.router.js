import express from 'express'
import {
	signupPageHandler,
	loginPageHandler,
	createUserHandler,
	createSession,
	destroySession,
	passwordResetPageHandler,
	passwordResetHandler,
	forgotPasswordPageHandler,
	forgotPasswordHandler
} from '../controllers/auth.controller.js'
import passport from 'passport'

const router = express.Router()

router.get('/sign-up', signupPageHandler)
router.get('/login', loginPageHandler)
router.post('/create', createUserHandler)
router.post(
	'/create-session',
	passport.authenticate('local', {
		failureRedirect: '/login'
	}),
	createSession
)
router.get('/sign-out', destroySession)
router.get(
	'/reset-password',
	passport.checkAuthentication,
	passwordResetPageHandler
)
router.post(
	'/reset-password',
	passport.checkAuthentication,
	passwordResetHandler
)
router.get('/forgot-password', forgotPasswordPageHandler)
router.post('/forgot-password', forgotPasswordHandler)

export default router
