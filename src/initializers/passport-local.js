import passport from 'passport'
import passportLocal from 'passport-local'
import * as argon from 'argon2'

import logger from '../common/logger.js'
import User from '../models/user.model.js'

const LocalStrategy = passportLocal.Strategy

/**
 * register passport local strategy
 */
passport.use(
	new LocalStrategy(
		{
			usernameField: 'email',
			passReqToCallback: true
		},
		async function (req, email, password, done) {
			try {
				const user = await User.findOne({ email })
				if (!user) {
					return done(null, false)
				}

				const passwordMatches = await argon.verify(user.password, password)

				if (!passwordMatches) {
					return done(null, false)
				}

				return done(null, user)
			} catch (error) {
				if (err) {
					return done(err)
				}
			}
		}
	)
)

/**
 * serializing the user to decide which key is to be kept in the cookies
 */
passport.serializeUser(function (user, done) {
	done(null, user.id)
})

/**
 * deserializing the user from the key in the cookies
 */
passport.deserializeUser(async function (id, done) {
	try {
		const user = await User.findById(id)
		return done(null, user)
	} catch (error) {
		logger.error(error, 'could not find user')
		return done(err)
	}
})

/**
 * custom express authentication middleware
 */
passport.checkAuthentication = function (req, res, next) {
	// let request pass through if user is authenticated
	if (req.isAuthenticated()) {
		return next()
	}

	// redirect to login page otherwise
	return res.redirect('/login')
}

/**
 * attaches the user object to the res.local
 */
passport.setAuthenticatedUser = function (req, res, next) {
	// will attach user only when the the request is authenticated
	if (req.isAuthenticated()) {
		res.locals.user = req.user
	}

	next()
}

export default passport
