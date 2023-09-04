import express from 'express'
import authRouter from './auth.router.js'

const router = express.Router()

// register pages related to authentication
router.use('/auth', authRouter)

export default router
