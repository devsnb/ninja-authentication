/**
 * Sets flash on the outgoing response
 * @param {*} req express request object
 * @param {*} res express response object
 * @param {*} next express next function
 */
export const setFlash = function (req, res, next) {
	res.locals.flash = {
		success: req.flash('success'),
		error: req.flash('error')
	}

	next()
}
