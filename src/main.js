import application from './app.js'
import config from './config/index.js'
import connectDB from './initializers/mongoose.js'
import logger from './common/logger.js'

/**
 * entry to our application
 */
const main = async () => {
	const PORT = config.get('port')

	// connect to the database
	const connection = await connectDB()

	// bootstrap the application
	const app = await application(connection)

	app.listen(PORT, () => {
		logger.info(`application started on port: ${PORT}`)
	})
}

main()
