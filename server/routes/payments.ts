import { Router } from 'express';
import { paymentController } from '../controllers/payments';
import { escrowController } from '../controllers/escrow';
import { authenticateToken, requireSubscription } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Payment Intent Routes
router.post('/create-intent', 
  authenticateToken,
  paymentController.createPaymentIntent
);

// Subscription Routes
router.post('/subscriptions',
  authenticateToken,
  paymentController.createSubscription
);

// Webhook endpoint (no auth required, verified by Stripe signature)
router.post('/webhook',
  paymentController.handleWebhook
);

// Payment History
router.get('/history',
  authenticateToken,
  paymentController.getPaymentHistory
);

// Escrow Routes
router.post('/escrow/hold',
  authenticateToken,
  requireSubscription('pro'), // Escrow requires Pro or Enterprise
  escrowController.createEscrowHold
);

router.post('/escrow/release',
  authenticateToken,
  escrowController.releaseEscrow
);

router.post('/escrow/refund',
  authenticateToken,
  escrowController.refundEscrow
);

router.get('/escrow/:escrowId',
  authenticateToken,
  escrowController.getEscrowStatus
);

// Admin routes (TODO: Add admin role check)
router.get('/escrow',
  authenticateToken,
  escrowController.getAllEscrows
);

export default router;