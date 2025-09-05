import PayMongo from 'paymongo-node';

// Initialize PayMongo client
const paymongo = new PayMongo(process.env.PAYMONGO_SECRET_KEY!);

export interface PaymentIntentData {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface PaymentMethodData {
  type: 'card' | 'gcash' | 'grab_pay';
  details: {
    card_number?: string;
    exp_month?: number;
    exp_year?: number;
    cvc?: string;
  };
}

export class PayMongoService {
  /**
   * Create a payment intent
   */
  static async createPaymentIntent(data: PaymentIntentData) {
    try {
      const paymentIntent = await paymongo.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to centavos
        currency: data.currency,
        description: data.description,
        metadata: data.metadata || {},
      });

      return {
        success: true,
        data: paymentIntent,
      };
    } catch (error) {
      console.error('PayMongo createPaymentIntent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Attach payment method to payment intent
   */
  static async attachPaymentMethod(paymentIntentId: string, paymentMethodId: string) {
    try {
      const result = await paymongo.paymentIntents.attach(paymentIntentId, {
        payment_method: paymentMethodId,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('PayMongo attachPaymentMethod error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Retrieve payment intent
   */
  static async getPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await paymongo.paymentIntents.retrieve(paymentIntentId);
      return {
        success: true,
        data: paymentIntent,
      };
    } catch (error) {
      console.error('PayMongo getPaymentIntent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create payment method (for testing purposes)
   */
  static async createPaymentMethod(data: PaymentMethodData) {
    try {
      const paymentMethod = await paymongo.paymentMethods.create({
        type: data.type,
        details: data.details,
      });

      return {
        success: true,
        data: paymentMethod,
      };
    } catch (error) {
      console.error('PayMongo createPaymentMethod error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(payload: string, signature: string, secret: string) {
    try {
      // PayMongo webhook signature verification
      // This is a simplified version - in production, use proper crypto verification
      return true; // For now, return true. Implement proper verification later.
    } catch (error) {
      console.error('PayMongo webhook verification error:', error);
      return false;
    }
  }
}

export default paymongo;
