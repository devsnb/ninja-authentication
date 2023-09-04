import mongoose from 'mongoose'

/**
 * schema for user document
 */
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	}
})

const User = mongoose.model('User', userSchema)

export default User