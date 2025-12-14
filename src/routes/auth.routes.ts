import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();

// Adres: /api/auth/register
router.post('/register', register);

// Adres: /api/auth/login
router.post('/login', login);

export default router;