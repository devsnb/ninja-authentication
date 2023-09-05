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
		// send user back if both password & confirm password does not match
		if (req.body.password != req.body.confirmPassword) {
			req.flash('error', 'passwords do not match')
			return res.redirect('back')
		}

		const user = await User.findOne({ email: req.body.email })

		// if the user with the email does not exist
		if (!user) {
			// hash password
			const hashedPassword = await argon.hash(req.body.password)
			const payload = {
				email: req.body.email,
				password: hashedPassword
			}

			// save the user with hashed password
			await User.create(payload)
			req.flash('success', 'registration successful, please login to continue')

			// send user to login
			return res.redirect('/login')
		}

		// if the user is present with the provided email send the user back
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

		// if user is not found send user to login
		if (!userFound) {
			req.flash('error', 'please login to continue')
			return res.redirect('/login')
		}

		const passwordMatches = await argon.verify(
			userFound.password,
			req.body.currentPassword
		)

		// if password does not match send user back
		if (!passwordMatches) {
			req.flash('error', 'invalid credentials')
			return res.redirect('back')
		}

		// if newPassword & confirmNewPassword does not match send the user back
		if (req.body.newPassword !== req.body.confirmNewPassword) {
			req.flash('error', 'passwords do not match')
			return res.redirect('back')
		}

		// hash the new password
		const hashedPassword = await argon.hash(req.body.newPassword)

		userFound.password = hashedPassword

		// save the user with new hashed password
		await userFound.save()

		// logout user
		return req.logout(function (err) {
			if (err) {
				return next(err)
			}
			// send user to login
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

		// if user is not found logout user and send to login
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

		// generate the jwt with the payload
		const token = signJwt(jwtPayload)

		if (!token) {
			// for some reason if we're unable to generate token send user back to try again
			req.flash('error', 'something went wrong, please try again')
			return res.redirect('back')
		}

		// generate url for user to change the password
		const baseUrl = config.get('applicationHost')
		const resetPasswordUrl = new URL('/change-forgot-password', baseUrl)

		if (config.get('env') !== 'production') {
			resetPasswordUrl.port = config.get('port')
		}

		resetPasswordUrl.searchParams.append('reset-token', token)

		// send an email to the user with the generated reset password url
		await sendMail(
			userFound.email,
			'Reset your password',
			'/reset-password.ejs',
			{
				reset_link: resetPasswordUrl,
				url: baseUrl
			}
		)

		// logout user and prompt user to login again
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
	// extract token form the query of the url
	const token = req.query['reset-token']

	// if no token is found send user to login
	if (!token) {
		req.flash('error', 'failed to reset your password, please try again')
		return res.redirect('/login')
	}

	const payload = verifyJwt(token)

	if (!payload || !payload?.id) {
		req.flash('error', 'link is invalid / link has expired')
		return res.redirect('/login')
	}

	const userFound = await User.findById(payload.id)

	// if no user is found send user to login
	if (!userFound) {
		req.flash('error', 'failed to reset your password, please try again')
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
		// if no token is found send user back to login
		if (!req.body.token) {
			req.flash('error', 'failed to reset password, please try again')
			return res.redirect('/login')
		}

		const payload = verifyJwt(req.body.token)

		// if for some reason our jwt verification fails send user to login page
		if (!payload || !payload?.id) {
			req.flash('error', 'link is invalid / link has expired')
			res.redirect('/login')
		}

		const userFound = await User.findOne({ email: req.body.email })

		// if no user is found send user to login again
		if (!userFound) {
			req.flash('error', 'failed to reset password, please try again')
			res.redirect('/login')
		}

		// if newPassword & confirmNewPassword does not match we send the user back to fix it
		if (req.body.newPassword !== req.body.confirmNewPassword) {
			req.flash('error', 'passwords do not match')
			res.redirect('/back')
		}

		// hash the new password
		const hashedPassword = await argon.hash(req.body.newPassword)

		userFound.password = hashedPassword

		// save the user with hashed password
		await userFound.save()

		req.flash('success', 'password has been set, please login to continue')
		res.redirect('/login')
	} catch (error) {
		req.flash('error', 'failed to set the password')
		logger.error(error)
		res.redirect('/login')
	}
}
