import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import config from './config/index.js'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import expressLayouts from 'express-ejs-layouts'
import passport from 'passport'
import './initializers/passport-local.js'
import './initializers/passport-google-oauth.js'
import router from './routes/index.js'

async function app(connection) {
	const app = express()

	// register cookie-parser
	app.use(cookieParser())

	// Parsing the incoming request body
	app.use(express.json())
	app.use(
		express.urlencoded({
			extended: false
		})
	)

	// polyfill __filename & __dirname as we're using es-modules
	const __filename = fileURLToPath(import.meta.url)
	const __dirname = path.dirname(__filename)

	// register static path
	app.use(express.static(path.join(__dirname, 'assets')))

	// register ejs view engine & express ejs layouts
	app.use(expressLayouts)
	app.set('view engine', 'ejs')
	app.set('views', path.join(__dirname, 'views'))

	// extract style and scripts from sub pages into the layout
	app.set('layout extractStyles', true)
	app.set('layout extractScripts', true)

	// setup express session
	app.use(
		session({
			name: 'ninja-auth',
			secret: config.get('sessionSecret'),
			saveUninitialized: false,
			resave: false,
			cookie: {
				maxAge: 1000 * 60 * 100
			},
			// persist session with session store
			store: MongoStore.create({
				client: connection.getClient(),
				autoRemove: 'disabled'
			})
		})
	)

	// setup passport
	app.use(passport.initialize())
	app.use(passport.session())

	// set authenticated user
	app.use(passport.setAuthenticatedUser)

	// register application router
	app.use(router)

	return app
}

export default app
