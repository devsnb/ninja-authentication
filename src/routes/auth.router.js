import express from 'express'
import { emailSignUpHandler } from '../controllers/auth.controller.js'

const router = express.Router()

router.get('/sign-up', emailSignUpHandler)

export default router
