import { transporter, renderTemplate } from '../initializers/nodemailer.js'
import config from '../config/index.js'
import logger from '../common/logger.js'

/**
 * sends email to a user
 * @param {*} template the string path to the email template
 * @param {*} data the data required for the template
 */
export const sendMail = async (sendTo, subject, templatePath, data) => {
	try {
		const htmlString = renderTemplate(templatePath, { data })

		const info = await transporter.sendMail({
			from: config.get('smtp.user'),
			to: sendTo,
			subject,
			html: htmlString
		})

		logger.info('email sent', info)
	} catch (err) {
		logger.error(err, 'failed to send email')
	}
}
