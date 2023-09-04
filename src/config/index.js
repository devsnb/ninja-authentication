import convict from 'convict'

/**
 * convict configuration setup & validation
 */
const config = convict({
	env: {
		doc: 'application environment.',
		format: ['production', 'development', 'test'],
		default: 'development',
		env: 'NODE_ENV'
	},
	port: {
		doc: 'port for the application to listen on',
		format: 'port',
		default: 8080,
		env: 'PORT',
		arg: 'port'
	},
	mongoUri: {
		doc: 'url to connect to mongodb atlas',
		format: String,
		default: '',
		nullable: false,
		env: 'MONGO_URI'
	},
	sessionSecret: {
		doc: 'secret for session',
		format: String,
		default: 'top-secret-secret',
		nullable: false,
		env: 'SESSION_SECRET'
	}
})

const env = config.get('env')

// do not load configuration from a file in production environment
if (env !== 'production') {
	config.loadFile('./config/' + env + '.json')
}

export default config
