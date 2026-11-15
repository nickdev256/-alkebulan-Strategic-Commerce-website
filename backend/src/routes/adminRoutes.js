
import express from 'express';
import { inviteAdministrator } from '../controllers/adminController.js';

const router = express.Router();

// POST /api/admin/invitations
router.post('/invitations', inviteAdministrator);

export default router;
