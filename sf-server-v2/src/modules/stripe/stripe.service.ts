import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Logger } from '../../configs/logger';
import {
  CreatePaymentSessionDto,
  CreatePaymentSessionResponseDto,
} from './dtos/create.dto';
import { GetPetSubscriptionsDto } from './dtos/pet-subscription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SmollCareSubscription } from '../smollcare/entities/smoll-care-subscription.entity';
import { Repository } from 'typeorm';
import { SubscriptionStatus } from '../smollcare/enums/subscription-status.enum';
import { NotificationService } from '../notification/notification.service';
import { AuthUser } from 'src/decorators/get-user.decorator';
import { subscriptionCancellationTemplate } from 'src/utils/emailTemplate';

@Injectable()
export class StripeService {
  private stripe: Stripe | null = null;
  private readonly logger = Logger.getInstance();

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(SmollCareSubscription)
    private subscriptionRepo: Repository<SmollCareSubscription>,
    @Inject(NotificationService)
    private notificationService: NotificationService
  ) {
    const stripeSecretKey = this.configService.get('STAGING_STRIPE_SECRET_KEY') || this.configService.get('STRIPE_SECRET_KEY');
    if (stripeSecretKey) {
      this.logger.info(`Stripe initialized with key: ${stripeSecretKey.substring(0, 12)}...`);
      this.stripe = new Stripe(stripeSecretKey);
    } else {
      this.logger.error('Stripe secret key not found in environment variables');
    }
  }

  async createStripeCustomer(
    userPhone?: string,
    userEmail?: string,
  ): Promise<string> {
    if (!this.stripe) {
      this.logger.error('Stripe is not configured - no API key found');
      throw new BadRequestException('Stripe is not configured');
    }

    this.logger.info(`Creating Stripe customer with phone: ${userPhone}, email: ${userEmail}`);

    const customerData: { phone?: string; email?: string } = {};

    if (userPhone) {
      customerData.phone = userPhone;
    }

    if (userEmail) {
      customerData.email = userEmail;
    }

    try {
      const customer = await this.stripe.customers.create(customerData);
      this.logger.info(`Stripe customer created successfully: ${customer.id}`);
      return customer.id;
    } catch (error) {
      this.logger.error('Stripe API error:', {
        message: error.message,
        type: error.type,
        code: error.code,
        statusCode: error.statusCode,
      });
      throw new BadRequestException(`Stripe API error: ${error.message}`);
    }
  }

  /**
   * Returns true if the customer exists in Stripe, false if deleted or not found.
   */
  async validateCustomer(customerId: string): Promise<boolean> {
    if (!this.stripe) return false;
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      return !(customer as any).deleted;
    } catch {
      return false;
    }
  }

  async updateStripeCustomer(
    customerId: string,
    user: { email: string; name: string },
  ): Promise<void> {
    await this.stripe.customers.update(customerId, {
      email: user.email,
      name: user.name,
    });
  }

  async createPaymentSession(
    body: CreatePaymentSessionDto,
  ): Promise<CreatePaymentSessionResponseDto> {
    const { customerId, price, currency } = body;

    try {
      // Validate customer exists
      const isValid = await this.validateCustomer(customerId);
      if (!isValid) {
        throw new BadRequestException('Invalid Stripe customer ID');
      }

      // Create ephemeral key with latest API version
      const ephemeralKey = await this.stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: '2024-11-20.acacia' },
      );

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: price,
        currency,
        customer: customerId,
        automatic_payment_methods: { enabled: true },
      });

      this.logger.info(`Payment session created for customer ${customerId}, amount: ${price} ${currency}`);

      return {
        paymentIntent: paymentIntent.id,
        paymentIntentClientSecret: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customerId,
      };
    } catch (error) {
      this.logger.error('Failed to create payment session', error);
      throw new BadRequestException(
        error?.message || 'Failed to create payment session'
      );
    }
  }

  async verifyCoupon(code: string) {
    try {
      const promoCodes = await this.stripe.promotionCodes.list({
        code,
        active: true,
        limit: 1,
      });

      const promo = promoCodes.data[0];

      if (!promo) {
        return { valid: false, reason: 'Invalid or expired coupon code.' };
      }

      if (!promo.coupon.valid) {
        return { valid: false, reason: 'Coupon is no longer valid.' };
      }

      return {
        valid: true,
        discountPercentage: promo.coupon.percent_off,
      };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }

  async createRefund(paymentIntentId: string): Promise<void> {
    await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
  }

  async attachPaymentMethod(customerId: string, paymentMethodId: string) {
    try {
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    } catch (error) {
      this.logger.error('Failed to attach/set payment method', error);
      throw error;
    }
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    paymentMethodId: string,
  ) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        default_payment_method: paymentMethodId,
        expand: ['latest_invoice.payment_intent', 'latest_invoice'],
      });

      //this.logger.log(`Stripe subscription created for customer ${customerId}`);
      return subscription;
    } catch (error) {
      this.logger.error('Failed to create subscription', error);
      throw error;
    }
  }

  async createSetupIntent(customerId: string) {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        usage: 'off_session',
      });
      // this.logger.log(`SetupIntent created for customer ${customerId}`);
      return setupIntent;
    } catch (error) {
      this.logger.error('Failed to create SetupIntent', error);
      throw error;
    }
  }

  // Pet Subscription Methods

  /**
   * Creates a subscription with payment sheet support for React Native
   * This creates the subscription immediately and returns payment intent for confirmation
   */
  async createSmollCareSubscription(
    customerId: string,
    priceId: string,
    metadata: Record<string, string>,
    coupon?: string,
  ) {
    try {
      // Check for existing incomplete subscriptions for this pet
      const existingSubscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'incomplete',
      });

      const existingForPet = existingSubscriptions.data.find(
        (sub) =>
          sub.metadata.petId === metadata.petId &&
          sub.metadata.subscriptionType === 'pet_subscription',
      );

      if (existingForPet) {
        // Return the existing incomplete subscription instead of creating new one
        const latestInvoice = existingForPet.latest_invoice as Stripe.Invoice;
        const paymentIntent =
          latestInvoice?.payment_intent as Stripe.PaymentIntent;

        // Create new ephemeral key with latest API version
        const ephemeralKey = await this.stripe.ephemeralKeys.create(
          { customer: customerId },
          { apiVersion: '2024-11-20.acacia' },
        );

        return {
          paymentIntent: paymentIntent,
          paymentIntentClientSecret: paymentIntent?.client_secret ?? null,
          ephemeralKey: ephemeralKey.secret,
        };
      }

      this.logger.info(JSON.stringify(metadata));

      this.logger.info(
        `Creating smoll care subscription for customer ${customerId} and pet ${metadata.petId}`,
      );

      // Create ephemeral key for the customer with latest API version
      const ephemeralKey = await this.stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: '2024-11-20.acacia' },
      );

      let promo: Stripe.PromotionCode;

      if (coupon) {
        const _promo = await this.stripe.promotionCodes.list({
          code: coupon,
          active: true, // optionally filter active only
          limit: 1,
        });

        if (_promo.data.length === 0) {
          throw new BadRequestException('Invalid or expired coupon code');
        }

        promo = _promo.data[0];
      }

      // Create subscription with payment collection
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata,
        discounts: coupon ? [{ promotion_code: promo.id }] : [],
      });

      const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent =
        latestInvoice?.payment_intent as Stripe.PaymentIntent;

      this.logger.info(`Subscription created for payment: ${subscription.id}`);

      return {
        paymentIntent: paymentIntent,
        paymentIntentClientSecret: paymentIntent?.client_secret ?? null,
        ephemeralKey: ephemeralKey.secret,
        percentageOff: promo ? promo.coupon?.percent_off : null,
      };
    } catch (error) {
      this.logger.error(
        'Failed to create pet subscription with payment sheet',
        error,
      );

      throw error;
    }
  }

  // Note: Pet subscription creation is now handled automatically via webhooks
  // when payment is successful. No need for manual subscription creation.

  /**
   * Gets all subscriptions for a customer, optionally filtered by pet
   */
  async getPetSubscriptions(query: GetPetSubscriptionsDto) {
    const { customerId, petId } = query;

    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        expand: ['data.latest_invoice'],
      });

      // Filter by pet if petId is provided
      let filteredSubscriptions = subscriptions.data;
      if (petId) {
        filteredSubscriptions = subscriptions.data.filter(
          (sub) => sub.metadata.petId === petId,
        );
      }

      // Only return pet-related subscriptions
      const petSubscriptions = filteredSubscriptions.filter(
        (sub) => sub.metadata.type === 'pet_subscription',
      );

      return petSubscriptions.map((subscription) => ({
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        petId: subscription.metadata.petId,
        petName: subscription.metadata.petName,
        petBreed: subscription.metadata.petBreed,
        petSpecies: subscription.metadata.petSpecies,
        petAge: subscription.metadata.petAge,
        priceId: subscription.items.data[0]?.price.id,
        amount: subscription.items.data[0]?.price.unit_amount,
        currency: subscription.items.data[0]?.price.currency,
        interval: subscription.items.data[0]?.price.recurring?.interval,
      }));
    } catch (error) {
      this.logger.error('Failed to get pet subscriptions', error);
      throw error;
    }
  }

  /**
   * Cancels a specific pet subscription
   */
  async cancelPetSubscription(petId: string, user: AuthUser) {
    try {
      const subscription = await this.subscriptionRepo.findOne({
        where: {
          pet: {
            id: petId,
          },
        },
        relations: {
          pet: true,
          plan: true,
        }
      });
      if (!subscription) {
        throw new NotFoundException('Subscription with petId not found.');
      }

      // Verify the subscription belongs to the specified pet
      const stripeSubscription = await this.stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
      );

      if (stripeSubscription.metadata.petId !== petId) {
        throw new Error('Subscription does not belong to the specified pet');
      }

      // Cancel the subscription
      const updatedSubscription = await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
          metadata: {
            dbStatus: SubscriptionStatus.CANCELED,
          },
        },
      );

      const subscriptionCancellationDetails = {
        memberName: user.name,
        petName: subscription.pet.name,
        planName: subscription.plan.name,
        petCareId: subscription.pet.careId
      }

      await this.notificationService.sendEmailNotification(
        user.email,
        "Subscription Cancellation",
        subscriptionCancellationTemplate(subscriptionCancellationDetails)
      )

      return {
        subscriptionId: updatedSubscription.id,
        status: SubscriptionStatus.CANCELED,
        cancelAt: updatedSubscription.cancel_at,
      };
    } catch (error) {
      this.logger.error('Failed to cancel pet subscription', error);
      throw error;
    }
  }

  async activePetSubscription(petId: string) {
    try {
      const subscription = await this.subscriptionRepo.findOne({
        where: {
          pet: {
            id: petId,
          },
        },
      });
      if (!subscription) {
        throw new NotFoundException('Subscription with petId not found.');
      }

      subscription.status = SubscriptionStatus.ACTIVE;
      await this.subscriptionRepo.update(subscription.id, subscription);

      // Verify the subscription belongs to the specified pet
      const stripeSubscription = await this.stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
      );

      if (stripeSubscription.metadata.petId !== petId) {
        throw new Error('Subscription does not belong to the specified pet');
      }

      // Cancel the subscription
      const updatedSubscription = await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: false,
        },
      );

      console.log(`Pet subscription activate for pet ${petId}`);

      return {
        subscriptionId: updatedSubscription.id,
        status: updatedSubscription.status,
      };
    } catch (error) {
      this.logger.error('Failed to activate pet subscription', error);
      throw error;
    }
  }

  /**
   * Updates a pet subscription (e.g., change price, pause, etc.)
   */
  async updatePetSubscription(
    subscriptionId: string,
    updates: {
      priceId?: string;
      petId?: string;
      pause?: boolean;
    },
  ) {
    try {
      const updateData: any = {};

      if (updates.priceId) {
        // Get current subscription to update the price
        const subscription =
          await this.stripe.subscriptions.retrieve(subscriptionId);
        updateData.items = [
          {
            id: subscription.items.data[0].id,
            price: updates.priceId,
          },
        ];
      }

      if (updates.pause !== undefined) {
        updateData.pause_collection = updates.pause
          ? { behavior: 'mark_uncollectible' }
          : null;
      }

      const updatedSubscription = await this.stripe.subscriptions.update(
        subscriptionId,
        updateData,
      );

      console.log(`Pet subscription updated: ${subscriptionId}`);

      return {
        subscriptionId: updatedSubscription.id,
        status: updatedSubscription.status,
        currentPeriodStart: updatedSubscription.current_period_start,
        currentPeriodEnd: updatedSubscription.current_period_end,
        petId: updatedSubscription.metadata.petId,
      };
    } catch (error) {
      this.logger.error('Failed to update pet subscription', error);
      throw error;
    }
  }

  /**
   * Gets subscription details for a specific pet
   */
  async getPetSubscriptionDetails(subscriptionId: string, petId: string) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(
        subscriptionId,
        {
          expand: ['latest_invoice', 'latest_invoice.payment_intent'],
        },
      );

      // Verify the subscription belongs to the specified pet
      if (subscription.metadata.petId !== petId) {
        throw new Error('Subscription does not belong to the specified pet');
      }

      return {
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        petId: subscription.metadata.petId,
        petName: subscription.metadata.petName,
        petBreed: subscription.metadata.petBreed,
        petSpecies: subscription.metadata.petSpecies,
        petAge: subscription.metadata.petAge,
        priceId: subscription.items.data[0]?.price.id,
        amount: subscription.items.data[0]?.price.unit_amount,
        currency: subscription.items.data[0]?.price.currency,
        interval: subscription.items.data[0]?.price.recurring?.interval,
        latestInvoice: subscription.latest_invoice,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialStart: subscription.trial_start,
        trialEnd: subscription.trial_end,
      };
    } catch (error) {
      this.logger.error('Failed to get pet subscription details', error);
      throw error;
    }
  }
}

//   async createPaymentSession(
//     user: FindUserResponseDto,
//     createQueryDto: CreatePaymentSessionPayloadDto,
//   ): Promise<CreatePaymentSessionResponseDto> {
//     const { plan, interval } = createQueryDto;

//     const session = await this.stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       customer: user.stripeCustomerId,
//       line_items: [
//         {
//           price: this.configService.get(`${plan}_${interval}_PRICE_ID`),
//           quantity: 1,
//         },
//       ],
//       mode: 'subscription',
//       success_url: this.configService.get('APP_URL') + '/confirm-payment',
//       metadata: {
//         userId: user.id,
//         plan,
//         interval,
//       },
//     });

//     return {
//       url: session.url,
//     };
//   }

//   async cancel(user: FindUserResponseDto): Promise<void> {
//     const { stripeCustomerId } = user;

//     const customer = await this.stripe.customers.retrieve(stripeCustomerId);

//     if (!customer) {
//       throw new NotFoundException('Customer not found!');
//     }

//     const subscriptions = await this.stripe.subscriptions.list({
//       customer: stripeCustomerId,
//       status: 'active',
//     });

//     if (subscriptions.data.length === 0) {
//       throw new NotFoundException('No active subscription found!');
//     }

//     console.log('s', subscriptions);

//     const subscription = subscriptions.data[0];

//     await this.stripe.subscriptions.cancel(subscription.id);
//   }

//   async handleStripeWebhook(request: Request, response: Response) {
//     const sig = request.headers['stripe-signature'];

//     let event: Stripe.Event;

//     try {
//       event = this.stripe.webhooks.constructEvent(
//         request.body,
//         sig,
//         this.configService.get('STRIPE_WEBHOOK_SECRET'),
//       );
//     } catch (err) {
//       return response.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     const session = event.data.object as Stripe.Checkout.Session;
//     const { userId, plan, interval } = session.metadata;

//     let userEmail: string;

//     userEmail = session.customer_email;

//     if (!userEmail) {
//       const customer = await this.stripe.customers.retrieve(
//         session.customer as string,
//       );

//       userEmail = (customer as Stripe.Customer).email;
//     }

//     // Check if subscription already exists
//     const subscription = await this.findOne(userEmail);

//     if (event.type === 'checkout.session.completed') {
//       const stripeSubscription = await this.stripe.subscriptions.retrieve(
//         session.subscription as string,
//       );

//       const endDate = new Date(
//         stripeSubscription.current_period_end * 1000,
//       ).toISOString();

//       // if exist update it else create it
//       if (subscription) {
//         await this.update({
//           id: subscription.id,
//           plan: plan as PlanEnum,
//           interval: interval as IntervalEnum,
//           endDate,
//         });
//       } else {
//         await this.create(userId, {
//           plan: plan as PlanEnum,
//           interval: interval as IntervalEnum,
//           endDate,
//         });
//       }

//       // TODO: if plan is team, create a workspace
//     } else if (event.type === 'customer.subscription.deleted') {
//       await this.update({
//         id: subscription.id,
//         plan: PlanEnum.FREE,
//         interval: IntervalEnum.MONTHLY,
//       });
//     }

//     response.status(200).json({ received: true });
//   }
