import crypto from 'node:crypto'
import passport from 'passport'
import GoogleStrategy from 'passport-google-oauth20'

import User from '../models/user.model.js'
import config from '../config/index.js'
import logger from '../common/logger.js'

passport.use(
	new GoogleStrategy(
		{
			clientID: config.get('googleOauth.clientId'),
			clientSecret: config.get('googleOauth.clientSecret'),
			callbackURL: config.get('googleOauth.callbackUrl')
		},
		async function (accessToken, refreshToken, profile, done) {
			try {
				const user = await User.findOne({ email: profile.emails[0].value })

				// if user user exists simply login the user
				if (user) {
					return done(null, user)
				} else {
					// if user does not exist create a new user
					const newUser = await User.create({
						name: profile.displayName,
						email: profile.emails[0].value,
						password: crypto.randomBytes(20).toString('hex')
					})

					return done(null, newUser)
				}
			} catch (error) {
				logger.error(error, 'failed to authenticate via google')
			}
		}
	)
)
