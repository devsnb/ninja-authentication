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
	forgotPasswordHandler,
	changeForgotPasswordPageHandler,
	changeForgotPasswordHandler
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
router.post('/reset-password', passwordResetHandler)
router.get('/forgot-password', forgotPasswordPageHandler)
router.post('/forgot-password', forgotPasswordHandler)
router.get('/change-forgot-password', changeForgotPasswordPageHandler)
router.post('/change-forgot-password', changeForgotPasswordHandler)

// google oauth
router.get(
	'/login/google',
	passport.authenticate('google', { scope: ['profile', 'email'] })
)

// handle google oauth callback
router.get(
	'/login/google/callback',
	passport.authenticate('google', {
		failureRedirect: '/login'
	}),
	createSession
)

export default router
