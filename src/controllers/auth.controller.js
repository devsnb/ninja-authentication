import * as argon from 'argon2'

import config from '../config/index.js'
import logger from '../common/logger.js'
import User from '../models/user.model.js'
import { signJwt, verifyJwt } from '../utils/jwt.util.js'
import { sendMail } from '../utils/mailer.util.js'

/**
 * Handles user sign up page
 * @param {*} req the express request object
 * @param {*} res the express response object
 */
export const signupPageHandler = (req, res) => {
	res.render('pages/sign-up')
}

/**
 * Handles user login page
 * @param {*} req the express request object
 * @param {*} res the express response object
 */
export const loginPageHandler = (req, res) => {
	res.render('pages/login')
}

/**
 * Creates a user in the database
 * @param {*} req the express request object
 * @param {*} res the express response object
 */
export const createUserHandler = async (req, res) => {
	try {
		if (req.body.password != req.body.confirmPassword) {
			req.flash('error', 'passwords do not match')
			return res.redirect('back')
		}

		const user = await User.findOne({ email: req.body.email })

		if (!user) {
			const hashedPassword = await argon.hash(req.body.password)
			const payload = {
				email: req.body.email,
				password: hashedPassword
			}

			req.flash('success', 'registration successful, please login to continue')
			await User.create(payload)
			return res.redirect('/login')
		}

		req.flash('error', 'user registration failed')
		return res.redirect('back')
	} catch (error) {
		logger.error(error, 'error in finding user in signing up')
		req.flash('error', 'user registration failed')
		return res.redirect('back')
	}
}

/**
 * create creates a new session
 * @param {*} req the express request object
 * @param {*} res the express response object
 */
export const createSession = function (req, res) {
	req.flash('success', 'logged in successfully')
	return res.redirect('/')
}

/**
 * destroy the current session
 * @param {*} req the express request object
 * @param {*} res the express response object
 */
export const destroySession = function (req, res) {
	req.logout(function (err) {
		if (err) {
			return next(err)
		}
		req.flash('success', 'logged out successfully')
		res.redirect('/login')
	})
}

/**
 * handles the reset password page
 * @param {*} req the express request object
 * @param {*} res the express response object
 */
export const passwordResetPageHandler = (req, res) => {
	res.render('pages/reset-password')
}

/**
 * Rests/update password of a user
 * @param {*} req the express request object
 * @param {*} res the express response object
 */
export const passwordResetHandler = async (req, res) => {
	try {
		const userFound = await User.findById(req.user._id)

		if (!userFound) {
			req.flash('error', 'please login to continue')
			return res.redirect('/login')
		}

		const passwordMatches = await argon.verify(
			userFound.password,
			req.body.currentPassword
		)

		if (!passwordMatches) {
			req.flash('error', 'invalid credentials')
			return res.redirect('back')
		}

		if (req.body.newPassword !== req.body.confirmNewPassword) {
			req.flash('error', 'passwords do not match')
			return res.redirect('back')
		}

		const hashedPassword = await argon.hash(req.body.newPassword)

		userFound.password = hashedPassword

		await userFound.save()

		return req.logout(function (err) {
			if (err) {
				return next(err)
			}
			req.flash('success', 'logged out successfully, login to continue')
			res.redirect('/login')
		})
	} catch (error) {
		logger.error(error, 'failed to reset password')
		req.flash('error', 'failed to reset password')
		return res.redirect('back')
	}
}

/**
 * Handles forgot password page
 * @param {*} req the express request object
 * @param {*} res the express response object
 */
export const forgotPasswordPageHandler = (req, res) => {
	res.render('pages/forgot-password')
}

/**
 * Sends an email to the user with reset password link
 * @param {*} req the express request object
 * @param {*} res the express response object
 */
export const forgotPasswordHandler = async (req, res) => {
	try {
		const email = req.body.email

		const userFound = await User.findOne({ email })

		if (!userFound) {
			logger.error('user not found')
			return req.logout(function (err) {
				if (err) {
					return next(err)
				}
				res.redirect('/login')
			})
		}

		const jwtPayload = {
			id: userFound._id.toString()
		}

		const token = signJwt(jwtPayload)

		if (!token) {
			return res.redirect('back')
		}

		const baseUrl = config.get('applicationHost')
		const resetPasswordUrl = new URL('/change-forgot-password', baseUrl)

		if (config.get('env') !== 'production') {
			resetPasswordUrl.port = config.get('port')
		}

		resetPasswordUrl.searchParams.append('reset-token', token)

		await sendMail(
			userFound.email,
			'Reset your password',
			'/reset-password.ejs',
			{
				reset_link: resetPasswordUrl,
				url: baseUrl
			}
		)

		return req.logout(function (err) {
			if (err) {
				return next(err)
			}
			req.flash(
				'success',
				'an email containing reset link has been sent to your email, if the email you provided is correct'
			)
			res.redirect('/login')
		})
	} catch (error) {
		logger.error(error, 'resetting password failed')
		req.flash('error', 'failed to send reset link')
		res.redirect('back')
	}
}

/**
 * handles change forgot password page
 * @param {*} req the express request object
 * @param {*} res the express response object
 */
export const changeForgotPasswordPageHandler = async (req, res) => {
	const token = req.query['reset-token']

	if (!token) {
		return res.redirect('/login')
	}

	const payload = verifyJwt(token)

	if (!payload || !payload?.id) {
		req.flash('error', 'link is invalid / link has expired')
		return res.redirect('/login')
	}

	const userFound = await User.findById(payload.id)

	if (!userFound) {
		return res.redirect('/login')
	}

	return res.render('pages/change-password', {
		email: userFound.email,
		token
	})
}

/**
 * Changes password of the user when user forgets their password
 * @param {*} req the express request object
 * @param {*} res the express response object
 */
export const changeForgotPasswordHandler = async (req, res) => {
	try {
		if (!req.body.token) {
			return res.redirect('/login')
		}

		const payload = verifyJwt(req.body.token)

		if (!payload || !payload?.id) {
			req.flash('error', 'link is invalid / link has expired')
			res.redirect('/login')
		}

		const userFound = await User.findOne({ email: req.body.email })

		if (!userFound) {
			res.redirect('/login')
		}

		if (req.body.newPassword !== req.body.confirmNewPassword) {
			req.flash('error', 'passwords do not match')
			res.redirect('/back')
		}

		const hashedPassword = await argon.hash(req.body.newPassword)

		userFound.password = hashedPassword

		await userFound.save()

		req.flash('success', 'password has been set, please login to continue')
		res.redirect('/login')
	} catch (error) {
		req.flash('error', 'failed to set the password')
		logger.error(error)
		res.redirect('/login')
	}
}
