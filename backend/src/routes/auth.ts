import express from 'express';
import Joi from 'joi';
import { protect } from '../middleware/auth';
import { register, login, verifyEmail, resendVerification, refreshToken, logout } from '../controllers/auth';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const verifySchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required()
});

// Routes
router.post('/register', async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    await register(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    await login(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const { error } = verifySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    await verifyEmail(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/resend', async (req, res, next) => {
  try {
    const { error } = Joi.object({ email: Joi.string().email().required() }).validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    await resendVerification(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);

export default router;