/**
 * Handles user sign up page
 * @param {*} req the express request object
 * @param {*} res the express response object
 */
export const signupPageHandler = (req, res) => {
	res.render('pages/sign-up')
}

/**
 * Handles user login page
 * @param {*} req the express request object
 * @param {*} res the express response object
 */
export const loginPageHandler = (req, res) => {
	res.render('pages/login')
}
