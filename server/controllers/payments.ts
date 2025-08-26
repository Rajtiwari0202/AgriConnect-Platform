import { Request, Response } from 'express';
import Stripe from 'stripe';
import { env } from '../env';
import { storage } from '../storage';
import { AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

// Initialize Stripe with India-specific configuration
let stripe: Stripe | null = null;
if (env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  });
}

// Validation schemas
const createPaymentIntentSchema = z.object({
  amount: z.number().min(100, 'Minimum amount is ₹1.00'), // ₹1.00 minimum
  purpose: z.enum(['subscription', 'deposit', 'rent', 'commission']),
  mode: z.enum(['upi', 'card', 'netbanking']).optional(),
  metadata: z.record(z.string()).optional(),
});

const createSubscriptionSchema = z.object({
  planId: z.enum(['basic', 'pro', 'enterprise']),
  billingPeriod: z.enum(['monthly', 'yearly']),
  paymentMethodId: z.string().optional(),
  useFreeTrial: z.boolean().default(false),
});

export const paymentController = {
  // Create payment intent for one-time payments
  createPaymentIntent: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          message: 'Payment processing temporarily unavailable',
          error: 'STRIPE_NOT_CONFIGURED' 
        });
      }

      const { amount, purpose, mode, metadata } = createPaymentIntentSchema.parse(req.body);
      const userId = req.userId!;

      // Get or create Stripe customer
      let user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName,
          phone: user.phone,
          metadata: {
            userId: user.id,
            role: user.role,
            state: user.state,
            district: user.district,
          },
        });
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await storage.updateUser(userId, { stripeCustomerId: customerId });
      }

      // Determine payment method types based on Indian market
      const paymentMethodTypes: Stripe.PaymentIntentCreateParams.PaymentMethodType[] = ['card'];
      
      // Add UPI if specifically requested or by default
      if (!mode || mode === 'upi') {
        // Note: UPI support depends on Stripe India configuration
        // paymentMethodTypes.push('upi'); // Uncomment when UPI is enabled
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'inr',
        customer: customerId,
        payment_method_types: paymentMethodTypes,
        metadata: {
          userId,
          purpose,
          preferredMode: mode || 'card',
          ...metadata,
        },
        description: `${purpose} payment for AgriConnect`,
      });

      // Create payment record in our system
      await storage.createPayment({
        userId,
        amount: amount.toString(),
        currency: 'INR',
        purpose,
        type: 'one_time',
        status: 'pending',
        mode: mode || 'card',
        providerRef: paymentIntent.id,
        stripePaymentIntentId: paymentIntent.id,
        metadata: { 
          paymentMethodTypes,
          ...metadata 
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        currency: 'INR',
        supportedMethods: paymentMethodTypes,
      });

    } catch (error: any) {
      console.error('Payment intent creation error:', error);
      res.status(500).json({ 
        message: 'Failed to create payment intent',
        error: error.message 
      });
    }
  },

  // Create subscription with Indian compliance
  createSubscription: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          message: 'Subscription service temporarily unavailable',
          error: 'STRIPE_NOT_CONFIGURED' 
        });
      }

      const { planId, billingPeriod, paymentMethodId, useFreeTrial } = createSubscriptionSchema.parse(req.body);
      const userId = req.userId!;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user already has an active subscription
      if (user.subscriptionStatus === 'active') {
        return res.status(400).json({ 
          message: 'User already has an active subscription',
          currentPlan: user.subscriptionTier 
        });
      }

      // Get subscription plan details
      const plans = await storage.getSubscriptionPlansByTier(planId);
      const plan = plans[0];
      if (!plan) {
        return res.status(404).json({ message: 'Subscription plan not found' });
      }

      // Calculate pricing
      const priceAmount = billingPeriod === 'yearly' 
        ? parseFloat(plan.yearlyPrice) 
        : parseFloat(plan.monthlyPrice);

      // Get or create Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName,
          phone: user.phone,
          metadata: { userId },
        });
        customerId = customer.id;
        await storage.updateUser(userId, { stripeCustomerId: customerId });
      }

      // Create or get Stripe product and price
      const product = await stripe.products.create({
        name: `${plan.name} - ${billingPeriod}`,
        description: plan.description,
        metadata: {
          planId,
          tier: plan.tier,
          billingPeriod,
        },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(priceAmount * 100), // Convert to paise
        currency: 'inr',
        recurring: {
          interval: billingPeriod === 'yearly' ? 'year' : 'month',
        },
        metadata: {
          planId,
          tier: plan.tier,
        },
      });

      // Create subscription
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price: price.id }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId,
          planId,
          billingPeriod,
        },
      };

      // Add free trial if requested and eligible
      if (useFreeTrial && !user.freeTrialUsed) {
        subscriptionData.trial_period_days = 7; // 7-day free trial
      }

      // If payment method provided, attach it
      if (paymentMethodId) {
        subscriptionData.default_payment_method = paymentMethodId;
      }

      const subscription = await stripe.subscriptions.create(subscriptionData);

      // Update user subscription info
      await storage.updateUser(userId, {
        stripeSubscriptionId: subscription.id,
        subscriptionTier: planId,
        subscriptionStatus: subscription.status === 'trialing' ? 'active' : 'inactive',
        subscriptionStartDate: new Date(subscription.current_period_start * 1000),
        subscriptionEndDate: new Date(subscription.current_period_end * 1000),
        freeTrialUsed: useFreeTrial ? true : user.freeTrialUsed,
      });

      // Create payment record
      await storage.createPayment({
        userId,
        amount: priceAmount.toString(),
        currency: 'INR',
        purpose: 'subscription',
        type: 'recurring',
        status: subscription.status === 'trialing' ? 'completed' : 'pending',
        mode: 'card',
        providerRef: subscription.id,
        stripeInvoiceId: subscription.latest_invoice?.id,
        metadata: { planId, billingPeriod, useFreeTrial },
      });

      const response: any = {
        subscriptionId: subscription.id,
        status: subscription.status,
        planId,
        billingPeriod,
        amount: priceAmount,
        currency: 'INR',
      };

      // Include client secret if payment required immediately
      if (subscription.latest_invoice?.payment_intent && 
          typeof subscription.latest_invoice.payment_intent === 'object') {
        response.clientSecret = subscription.latest_invoice.payment_intent.client_secret;
      }

      res.json(response);

    } catch (error: any) {
      console.error('Subscription creation error:', error);
      res.status(500).json({ 
        message: 'Failed to create subscription',
        error: error.message 
      });
    }
  },

  // Handle Stripe webhooks
  handleWebhook: async (req: Request, res: Response) => {
    try {
      if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
        return res.status(503).json({ message: 'Webhook processing not configured' });
      }

      const sig = req.headers['stripe-signature'] as string;
      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });

    } catch (error: any) {
      console.error('Webhook handling error:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  },

  // Get user's payment history
  getPaymentHistory: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const payments = await storage.getTransactionsByUser(userId);
      
      res.json({
        payments: payments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          purpose: payment.type,
          status: payment.status,
          mode: payment.metadata?.mode,
          createdAt: payment.createdAt,
          invoiceUrl: payment.metadata?.invoiceUrl,
        }))
      });

    } catch (error: any) {
      console.error('Payment history error:', error);
      res.status(500).json({ message: 'Failed to fetch payment history' });
    }
  },
};

// Webhook event handlers
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata.userId;
  if (!userId) return;

  // Update payment status
  await storage.updatePaymentByProviderRef(paymentIntent.id, {
    status: 'completed',
    metadata: { 
      paymentMethod: paymentIntent.payment_method,
      ...paymentIntent.metadata 
    },
  });

  // Generate invoice for successful payment
  // TODO: Implement PDF invoice generation
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  // Update payment status
  await storage.updatePaymentByProviderRef(paymentIntent.id, {
    status: 'failed',
    metadata: { 
      failureReason: paymentIntent.last_payment_error?.message,
      ...paymentIntent.metadata 
    },
  });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription && typeof invoice.subscription === 'string') {
    // Update subscription payment record
    await storage.updatePaymentByProviderRef(invoice.subscription, {
      status: 'completed',
      stripeInvoiceId: invoice.id,
      invoiceUrl: invoice.hosted_invoice_url,
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  await storage.updateUser(userId, {
    subscriptionStatus: subscription.status as any,
    subscriptionStartDate: new Date(subscription.current_period_start * 1000),
    subscriptionEndDate: new Date(subscription.current_period_end * 1000),
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  await storage.updateUser(userId, {
    subscriptionStatus: 'cancelled',
    stripeSubscriptionId: null,
  });
}