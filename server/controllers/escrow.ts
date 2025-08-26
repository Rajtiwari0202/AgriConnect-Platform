import { Request, Response } from 'express';
import Stripe from 'stripe';
import { env } from '../env';
import { storage } from '../storage';
import { AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

// Initialize Stripe for escrow simulation
let stripe: Stripe | null = null;
if (env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  });
}

// Validation schemas
const createEscrowSchema = z.object({
  requestId: z.string().uuid(),
  amount: z.number().min(100, 'Minimum escrow amount is ₹1.00'),
  autoReleaseDate: z.string().datetime().optional(),
  releaseConditions: z.string().optional(),
});

const escrowActionSchema = z.object({
  escrowId: z.string().uuid(),
  reason: z.string().optional(),
});

export const escrowController = {
  // Create escrow hold (simulated via Stripe manual capture)
  createEscrowHold: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          message: 'Escrow service temporarily unavailable',
          error: 'STRIPE_NOT_CONFIGURED' 
        });
      }

      const { requestId, amount, autoReleaseDate, releaseConditions } = createEscrowSchema.parse(req.body);
      const userId = req.userId!;

      // Verify the request exists and user is authorized
      const request = await storage.getRentalRequest(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Rental request not found' });
      }

      // Only farmer or landowner can create escrow for their request
      if (request.farmerId !== userId && request.landOwnerId !== userId) {
        return res.status(403).json({ message: 'Not authorized for this request' });
      }

      // Request must be accepted to proceed to escrow
      if (request.status !== 'accepted') {
        return res.status(400).json({ 
          message: 'Request must be accepted before creating escrow',
          currentStatus: request.status 
        });
      }

      // Get user for Stripe customer
      const user = await storage.getUser(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(400).json({ message: 'User must have payment method set up' });
      }

      // Create payment intent with manual capture for escrow simulation
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'inr',
        customer: user.stripeCustomerId,
        capture_method: 'manual', // This simulates holding funds in escrow
        payment_method_types: ['card'],
        metadata: {
          type: 'escrow',
          requestId,
          userId,
          farmerId: request.farmerId,
          landOwnerId: request.landOwnerId,
        },
        description: `Escrow for land rental request #${requestId}`,
      });

      // Create escrow record
      const escrow = await storage.createEscrow({
        requestId,
        amount: amount.toString(),
        currency: 'INR',
        status: 'hold',
        provider: 'stripe_sim',
        captureId: paymentIntent.id,
        releaseConditions: releaseConditions || 'Successful completion of rental agreement milestones',
        autoReleaseDate: autoReleaseDate ? new Date(autoReleaseDate) : null,
      });

      // Update request status
      await storage.updateRentalRequest(requestId, {
        status: 'in_escrow',
      });

      // Create payment record
      await storage.createPayment({
        userId,
        amount: amount.toString(),
        currency: 'INR',
        purpose: 'deposit',
        type: 'one_time',
        status: 'pending',
        mode: 'card',
        providerRef: paymentIntent.id,
        stripePaymentIntentId: paymentIntent.id,
        metadata: { 
          escrowId: escrow.id,
          requestId,
          type: 'escrow_hold' 
        },
      });

      res.json({
        escrowId: escrow.id,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount,
        currency: 'INR',
        status: 'pending_payment',
        message: 'Complete payment to hold funds in escrow',
      });

    } catch (error: any) {
      console.error('Escrow creation error:', error);
      res.status(500).json({ 
        message: 'Failed to create escrow hold',
        error: error.message 
      });
    }
  },

  // Release escrow funds (capture payment)
  releaseEscrow: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: 'Escrow service unavailable' });
      }

      const { escrowId, reason } = escrowActionSchema.parse(req.body);
      const userId = req.userId!;

      // Get escrow record
      const escrow = await storage.getEscrow(escrowId);
      if (!escrow) {
        return res.status(404).json({ message: 'Escrow not found' });
      }

      // Verify escrow is in correct state
      if (escrow.status !== 'hold') {
        return res.status(400).json({ 
          message: 'Escrow is not in hold status',
          currentStatus: escrow.status 
        });
      }

      // Get the associated request to verify authorization
      const request = await storage.getRentalRequest(escrow.requestId);
      if (!request) {
        return res.status(404).json({ message: 'Associated request not found' });
      }

      // Only landowner can release escrow (receive funds)
      if (request.landOwnerId !== userId) {
        return res.status(403).json({ message: 'Only the landowner can release escrow funds' });
      }

      // Capture the payment intent (release funds)
      if (escrow.captureId) {
        await stripe.paymentIntents.capture(escrow.captureId, {
          amount_to_capture: Math.round(parseFloat(escrow.amount) * 100),
        });
      }

      // Update escrow status
      await storage.updateEscrow(escrowId, {
        status: 'released',
        updatedAt: new Date(),
      });

      // Update request status to active
      await storage.updateRentalRequest(escrow.requestId, {
        status: 'active',
      });

      // Update payment record
      await storage.updatePaymentByProviderRef(escrow.captureId!, {
        status: 'completed',
        metadata: { 
          escrowAction: 'released',
          reason: reason || 'Manual release by landowner',
          releasedAt: new Date().toISOString(),
        },
      });

      res.json({
        message: 'Escrow funds released successfully',
        escrowId,
        status: 'released',
        amount: escrow.amount,
      });

    } catch (error: any) {
      console.error('Escrow release error:', error);
      res.status(500).json({ 
        message: 'Failed to release escrow funds',
        error: error.message 
      });
    }
  },

  // Refund escrow (cancel payment intent)
  refundEscrow: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: 'Escrow service unavailable' });
      }

      const { escrowId, reason } = escrowActionSchema.parse(req.body);
      const userId = req.userId!;

      // Get escrow record
      const escrow = await storage.getEscrow(escrowId);
      if (!escrow) {
        return res.status(404).json({ message: 'Escrow not found' });
      }

      // Verify escrow is in correct state
      if (escrow.status !== 'hold') {
        return res.status(400).json({ 
          message: 'Escrow is not in hold status',
          currentStatus: escrow.status 
        });
      }

      // Get the associated request to verify authorization
      const request = await storage.getRentalRequest(escrow.requestId);
      if (!request) {
        return res.status(404).json({ message: 'Associated request not found' });
      }

      // Both farmer and landowner can initiate refund, but admin approval may be required
      if (request.farmerId !== userId && request.landOwnerId !== userId) {
        return res.status(403).json({ message: 'Not authorized for this escrow' });
      }

      // Cancel the payment intent (refund)
      if (escrow.captureId) {
        await stripe.paymentIntents.cancel(escrow.captureId);
      }

      // Update escrow status
      await storage.updateEscrow(escrowId, {
        status: 'refunded',
        updatedAt: new Date(),
      });

      // Update request status back to accepted or cancelled based on reason
      await storage.updateRentalRequest(escrow.requestId, {
        status: 'cancelled',
      });

      // Update payment record
      await storage.updatePaymentByProviderRef(escrow.captureId!, {
        status: 'refunded',
        metadata: { 
          escrowAction: 'refunded',
          reason: reason || 'Manual refund initiated',
          refundedAt: new Date().toISOString(),
        },
      });

      res.json({
        message: 'Escrow refunded successfully',
        escrowId,
        status: 'refunded',
        amount: escrow.amount,
      });

    } catch (error: any) {
      console.error('Escrow refund error:', error);
      res.status(500).json({ 
        message: 'Failed to refund escrow',
        error: error.message 
      });
    }
  },

  // Get escrow status
  getEscrowStatus: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { escrowId } = req.params;
      const userId = req.userId!;

      const escrow = await storage.getEscrow(escrowId);
      if (!escrow) {
        return res.status(404).json({ message: 'Escrow not found' });
      }

      // Get the associated request to verify authorization
      const request = await storage.getRentalRequest(escrow.requestId);
      if (!request) {
        return res.status(404).json({ message: 'Associated request not found' });
      }

      // Verify user is involved in this escrow
      if (request.farmerId !== userId && request.landOwnerId !== userId) {
        return res.status(403).json({ message: 'Not authorized to view this escrow' });
      }

      res.json({
        escrowId: escrow.id,
        requestId: escrow.requestId,
        amount: escrow.amount,
        currency: escrow.currency,
        status: escrow.status,
        provider: escrow.provider,
        releaseConditions: escrow.releaseConditions,
        autoReleaseDate: escrow.autoReleaseDate,
        createdAt: escrow.createdAt,
        updatedAt: escrow.updatedAt,
      });

    } catch (error: any) {
      console.error('Escrow status error:', error);
      res.status(500).json({ 
        message: 'Failed to get escrow status',
        error: error.message 
      });
    }
  },

  // Admin: Get all escrows (admin only)
  getAllEscrows: async (req: AuthenticatedRequest, res: Response) => {
    try {
      // TODO: Add admin role check
      const { status, page = 1, limit = 20 } = req.query;

      const escrows = await storage.getAllEscrows({
        status: status as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });

      res.json({
        escrows,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: escrows.length,
        }
      });

    } catch (error: any) {
      console.error('Get all escrows error:', error);
      res.status(500).json({ 
        message: 'Failed to fetch escrows',
        error: error.message 
      });
    }
  },
};