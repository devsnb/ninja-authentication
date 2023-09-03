import mongoose from 'mongoose'
import config from '../config/index.js'
import logger from '../common/logger.js'

/**
 * Connect to the database
 * @returns the mongodb connection
 */
const connectDB = async () => {
	try {
		const mongoUri = config.get('mongoUri')

		const mongo = await mongoose.connect(mongoUri)

		logger.info('connected to database')

		return mongo.connection
	} catch (error) {
		logger.error(error, 'unable to connect to db')
		process.exit(1)
	}
}

export default connectDB
