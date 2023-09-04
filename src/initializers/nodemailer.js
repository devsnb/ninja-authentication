import path from 'node:path'
import { fileURLToPath } from 'node:url'
import nodemailer from 'nodemailer'
import ejs from 'ejs'
import config from '../config/index.js'
import logger from '../common/logger.js'

// polyfill __filename & __dirname as we're using es-modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Nodemailer transporter for authenticating email server & sending emails
 */
export const transporter = nodemailer.createTransport({
	host: config.get('smtp.host'),
	port: config.get('smtp.port'),
	secure: config.get('smtp.secure'),
	auth: {
		user: config.get('smtp.user'),
		pass: config.get('smtp.password')
	}
})

/**
 * generates html for the ejs template
 * @param {*} data the data needed for this template
 * @param {*} relativePath the path to ejs email template
 * @returns the generated html
 */
export const renderTemplate = (relativePath, data) => {
	let mailHtml
	ejs.renderFile(
		path.join(__dirname, '../views/mail-templates', relativePath),
		data,
		function (err, template) {
			if (err) {
				logger.error(err, 'error rendering email template')
				return
			}
			mailHtml = template
		}
	)

	return mailHtml
}
