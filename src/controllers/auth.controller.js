import * as argon from 'argon2'

import logger from '../common/logger.js'
import User from '../models/user.model.js'

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
			return res.redirect('back')
		}

		const user = await User.findOne({ email: req.body.email })

		if (!user) {
			const hashedPassword = await argon.hash(req.body.password)
			const payload = {
				email: req.body.email,
				password: hashedPassword
			}

			await User.create(payload)
			return res.redirect('/login')
		}

		return res.redirect('back')
	} catch (error) {
		logger.error(error, 'error in finding user in signing up')
		return res.redirect('back')
	}
}

/**
 * create creates a new session
 * @param {*} req the express request object
 * @param {*} res the express response object
 */
export const createSession = function (req, res) {
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
		res.redirect('/')
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
			return res.redirect('/login')
		}

		const passwordMatches = await argon.verify(
			userFound.password,
			req.body.currentPassword
		)

		if (!passwordMatches) {
			return res.redirect('back')
		}

		if (req.body.newPassword !== req.body.confirmNewPassword) {
			return res.redirect('back')
		}

		const hashedPassword = await argon.hash(req.body.newPassword)

		userFound.password = hashedPassword

		await userFound.save()

		return req.logout(function (err) {
			if (err) {
				return next(err)
			}
			res.redirect('/')
		})
	} catch (error) {
		logger.error(error, 'failed to reset password')
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
