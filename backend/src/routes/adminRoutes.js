
import express from 'express';

import {
  inviteAdministrator,
  getPendingAdministrators,
  approveAdministrator,
  rejectAdministrator,
} from '../controllers/adminController.js';

const router = express.Router();

// ==========================================
// ADMINISTRATOR INVITATIONS
// ==========================================

// POST /api/admin/invitations
router.post('/invitations', inviteAdministrator);

// ==========================================
// ADMINISTRATOR APPROVALS
// ==========================================

// GET /api/admin/pending
router.get('/pending', getPendingAdministrators);

// PATCH /api/admin/:id/approve
router.patch('/:id/approve', approveAdministrator);

// PATCH /api/admin/:id/reject
router.patch('/:id/reject', rejectAdministrator);

export default router;
