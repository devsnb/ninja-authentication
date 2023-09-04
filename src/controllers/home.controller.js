/**
 * Handles the home page
 * @param {*} req the express request object
 * @param {*} res the express response object
 */
export const homepageHandler = (req, res) => {
	res.render('pages/index')
}
