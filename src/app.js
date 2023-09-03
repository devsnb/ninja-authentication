import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cookieParser from 'cookie-parser'
import expressLayouts from 'express-ejs-layouts'
import router from './routes/index.js'

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

// register application router
app.use(router)

export default app
