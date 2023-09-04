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
	},
	smtp: {
		host: {
			doc: 'smtp host name',
			format: String,
			default: 'smtp.zoho.com',
			nullable: false,
			env: 'SMTP_HOST'
		},
		port: {
			doc: 'smtp port number',
			format: 'port',
			default: 587,
			nullable: false,
			env: 'SMTP_PORT'
		},
		secure: {
			doc: 'secure mail or not',
			format: Boolean,
			default: false,
			nullable: false,
			env: 'SMTP_SECURE'
		},
		user: {
			doc: 'smtp user email',
			format: String,
			default: 'admin@zoho.com',
			nullable: false,
			env: 'SMTP_USER'
		},
		password: {
			doc: 'smtp user email password',
			format: String,
			default: 'super-secure-password',
			nullable: false,
			env: 'SMTP_PASSWORD'
		}
	},
	jwtSecret: {
		doc: 'secret to sign & verify jwt',
		format: String,
		default: 'super-secret',
		nullable: false,
		env: 'JWT_SECRET'
	}
})

const env = config.get('env')

// do not load configuration from a file in production environment
if (env !== 'production') {
	config.loadFile('./config/' + env + '.json')
}

export default config
