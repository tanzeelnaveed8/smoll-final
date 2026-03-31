import { Controller, HttpStatus, Inject, Post, Req, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import {
  PaymentStatus,
  PaymentType,
} from 'src/modules/payment-log/payment-log.entity';
import { SmollCareSubscription } from 'src/modules/smollcare/entities/smoll-care-subscription.entity';
import { SmollCarePlan } from 'src/modules/smollcare/entities/smoll-care-plan.entity';
import { SubscriptionStatus } from 'src/modules/smollcare/enums/subscription-status.enum';
import { PlanCycle } from 'src/modules/smollcare/enums/plan-cycle.enum';
import { Pet } from 'src/modules/pet/entities/pet.entity';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';
import { PaymentLogService } from 'src/modules/payment-log/payment-log.service';
import { Member } from 'src/modules/member/member.entity';
import { NotificationService } from 'src/modules/notification/notification.service';
import {
  subscriptionActivationtemplate,
  subscriptionCancellationTemplate,
} from 'src/utils/emailTemplate';
import { Logger } from 'src/configs/logger';

@ApiTags('Stripe: WebHook')
@Controller('payments')
export class StripeWebhookController {
  private readonly logger = Logger.getInstance();

  constructor(
    @InjectRepository(SmollCareSubscription)
    private petSubscriptionRepo: Repository<SmollCareSubscription>,
    @InjectRepository(Pet)
    private petRepo: Repository<Pet>,
    @InjectRepository(SmollCarePlan)
    private planRepo: Repository<SmollCarePlan>,
    @InjectRepository(Member)
    private memberRepo: Repository<Member>,
    @Inject(NotificationService)
    private notificationService: NotificationService,

    @Inject('STRIPE_CLIENT')
    private readonly stripe: Stripe,

    private readonly configService: ConfigService,
    private readonly paymentLogService: PaymentLogService,
  ) { }

  @Post('webhook')
  async handleStripeWebhook(@Req() req: Request, @Res() res: Response) {
    this.logger.info('Stripe webhook received');

    const signature = req.headers['stripe-signature'];
    let event;

    try {
      const webhookSecret = this.configService.get<string>('STAGING_STRIPE_WEBHOOK_SECRET') || this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
      event = this.stripe.webhooks.constructEvent(
        (req as any).body,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error(
        '⚠️ Webhook signature verification failed.',
        err.message,
      );
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(`Webhook Error: ${err.message}`);
    }

    this.logger.info(`Processing webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'invoice.paid': {
          await this.handleInvoicePaid(event);
          break;
        }

        case 'invoice.payment_failed': {
          await this.handleInvoicePaymentFailed(event);
          break;
        }

        case 'customer.subscription.created': {
          await this.handleSubscriptionCreated(event);
          break;
        }

        case 'customer.subscription.updated': {
          await this.handleSubscriptionUpdated(event);
          break;
        }

        case 'customer.subscription.deleted': {
          await this.handleSubscriptionCancelled(event);
          break;
        }

        default:
          this.logger.info(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error processing webhook event ${event.type}:`, error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        error: 'Webhook processing failed',
      });
    }

    res.json({ received: true });
  }

  private async handleInvoicePaid(event: Stripe.Event) {
    try {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeSubscriptionId = invoice.subscription as string;
      const paymentIntentId = invoice.payment_intent as string;

      if (!stripeSubscriptionId) {
        this.logger.error(
          '❌ invoice.subscription is null. Skipping Stripe subscription fetch.',
        );
        return;
      }

      // Get the Stripe subscription to access metadata
      const stripeSubscription =
        await this.stripe.subscriptions.retrieve(stripeSubscriptionId);

      this.logger.info(
        `Processing successful payment for subscription: ${stripeSubscription.id}`,
      );

      await this.handlePetSubscriptionPayment(
        stripeSubscription,
        invoice,
        paymentIntentId,
      );

      // // Sending invoice manually/programatically it can be automated...
      const invoiceFile = invoice.hosted_invoice_url;
      this.logger.info(`Invoice PDF link ${invoiceFile}`);


    } catch (err) {
      this.logger.error(`Error on Invoice paid: ${err}`);
    }
  }

  private async handleInvoicePaymentFailed(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;
    const stripeSubscriptionId = invoice.subscription as string;
    const type = invoice.metadata['type'];
    const memberId = invoice.metadata['memberId'];

    if (type !== 'pet_subscription') {
      this.logger.error('Subscription type is not pet_subscription');
      return;
    }

    this.logger.error(
      `❌ Invoice payment failed for subscription: ${stripeSubscriptionId}`,
    );

    if (!stripeSubscriptionId) {
      return;
    }

    // Find the pet subscription and potentially update status
    const petSubscription = await this.petSubscriptionRepo.findOne({
      where: { stripeSubscriptionId },
    });

    if (petSubscription) {
      // Log the failed payment
      await this.paymentLogService.createPaymentLog({
        subscriptionId: petSubscription.id,
        stripePaymentId: (invoice.payment_intent as string) || 'failed_payment',
        amount: invoice.amount_due / 100,
        currency: invoice.currency.toUpperCase(),
        paymentType: PaymentType.subscription,
        status: PaymentStatus.failed,
        metadata: JSON.stringify({
          invoiceId: invoice.id,
          failureReason: 'Payment failed',
          subscriptionType: 'pet_health_plan',
        }),
        member: <any>{ id: memberId },
      });

      this.logger.info(
        `Payment failure logged for pet subscription: ${petSubscription.id}`,
      );
    }
  }

  private async handleSubscriptionCreated(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;

    this.logger.info(
      `Subscription created: ${subscription.id}, status: ${subscription.status}`,
    );

    // The subscription creation is handled when the first invoice is paid
    // This event is mainly for logging purposes
  }

  private async handleSubscriptionUpdated(event: Stripe.Event) {
    try {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeSubscriptionId = subscription.id;
      const type = subscription.metadata['type'];

      if (type !== 'pet_subscription') {
        this.logger.error('Subscription type is not pet_subscription');
        return;
      }

      this.logger.info(
        `Subscription updated: ${stripeSubscriptionId}, status: ${subscription.status}`,
      );

      const petSubscription = await this.petSubscriptionRepo.findOne({
        where: { stripeSubscriptionId },
      });

      if (!petSubscription) {
        this.logger.warn(
          `Pet subscription not found for Stripe subscription: ${stripeSubscriptionId}`,
        );
        return;
      }

      // Update subscription status based on Stripe status
      let newStatus: SubscriptionStatus;
      switch (subscription.status) {
        case 'active':
          newStatus = SubscriptionStatus.ACTIVE;

          if (subscription.metadata.dbStatus) {
            newStatus = subscription.metadata.dbStatus as SubscriptionStatus;
          }

          break;
        case 'canceled':
        case 'incomplete_expired':
        case 'unpaid':
          newStatus = SubscriptionStatus.REVOKED;
          break;
        case 'past_due':
        case 'incomplete':
          // Keep current status for past_due, might recover
          newStatus = petSubscription.status;
          break;
        default:
          newStatus = petSubscription.status;
      }

      if (newStatus !== petSubscription.status) {
        petSubscription.status = newStatus;
        await this.petSubscriptionRepo.save(petSubscription);

        this.logger.info(
          `Pet subscription ${petSubscription.id} status updated to: ${newStatus}`,
        );
      }
    } catch (err) {
      this.logger.error(`Error on Subscription update ${err}`);
    }
  }

  private async handleSubscriptionCancelled(event: Stripe.Event) {
    try {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeSubscriptionId = subscription.id;

      const type = subscription.metadata['type'];

      if (type !== 'pet_subscription') {
        this.logger.error('Subscription type is not pet_subscription');
        return;
      }

      this.logger.info(`Subscription cancelled: ${stripeSubscriptionId}`);

      const petSubscription = await this.petSubscriptionRepo.findOne({
        where: { stripeSubscriptionId },
        relations: ['pet', 'pet.owner'],
      });

      if (!petSubscription) {
        this.logger.warn(
          `Pet subscription not found for cancelled Stripe subscription: ${stripeSubscriptionId}`,
        );
        return;
      }

      petSubscription.status = SubscriptionStatus.CANCELED;
      await this.petSubscriptionRepo.update(
        petSubscription.id,
        petSubscription,
      );

      this.logger.info(`Pet subscription ${petSubscription.id} cancelled`);

      this.notificationService.sendEmailNotification(
        petSubscription.pet.owner.email,
        'Subcription Cancellation',
        subscriptionCancellationTemplate({
          memberName: petSubscription.pet.owner.name,
          petName: petSubscription.pet.name,
          planName: 'SmollCare',
          petCareId: petSubscription.pet.careId,
        }),
      );
    } catch (err) {
      this.logger.error(`Error on Subscription cancelled: ${err}`);
    }
  }

  private async handlePetSubscriptionPayment(
    stripeSubscription: Stripe.Subscription,
    invoice: Stripe.Invoice,
    paymentIntentId: string,
  ) {
    const petId = stripeSubscription.metadata['petId'];
    const type = stripeSubscription.metadata['type'];
    const memberId = stripeSubscription.metadata['memberId'];

    if (type !== 'pet_subscription') {
      this.logger.error('Subscription type is not pet_subscription');
      return;
    }

    if (!petId) {
      this.logger.error('Pet ID not found in subscription metadata');
      return;
    }

    // Check if pet subscription already exists
    const petSubscription = await this.petSubscriptionRepo.findOne({
      where: {
        pet: {
          id: petId,
        },
      },
      relations: ['plan', 'pet'],
    });

    if (!petSubscription) {
      // Create new pet subscription record
      await this.createNewPetSubscription(
        stripeSubscription,
        invoice,
        petId,
        paymentIntentId,
        memberId,
      );
    } else {
      // Handle subscription renewal
      await this.renewPetSubscription(
        petSubscription,
        stripeSubscription,
        invoice,
        paymentIntentId,
        memberId,
      );
    }
  }

  private async createNewPetSubscription(
    stripeSubscription: Stripe.Subscription,
    invoice: Stripe.Invoice,
    petId: string,
    paymentIntentId: string,
    memberId: string,
  ) {
    try {
      const pet = await this.petRepo.findOne({
        where: { id: petId },
        relations: ['owner'],
      });
      if (!pet) {
        this.logger.error(`Pet not found: ${petId}`);
        return;
      }

      // Assign careId if not already assigned
      if (!pet.careId) {
        pet.careId = await this.generateSequentialCareId(pet, pet.owner);
        await this.petRepo.save(pet);
        this.logger.info(`✅ Assigned careId ${pet.careId} to pet ${pet.id}`);
      }

      // Get the plan from Stripe price ID
      const priceId = stripeSubscription.items.data[0]?.price.id;
      const subscriptionId = stripeSubscription.id;
      const plan = await this.planRepo.findOne({
        where: { stripePriceId: priceId },
      });
      if (!plan) {
        this.logger.error(`Plan not found for Stripe price ID: ${priceId}`);
        return;
      }

      const today = new Date();
      const endDate = this.calculateEndDate(today, plan.cycle);

      const petSubscription = this.petSubscriptionRepo.create({
        pet: { id: petId },
        stripeSubscriptionId: subscriptionId,
        status: SubscriptionStatus.ACTIVE,
        startDate: today,
        endDate: endDate,
        plan: { id: plan.id },
      });

      await this.petSubscriptionRepo.save(petSubscription);

      this.logger.info(
        `✅ Pet subscription created for pet ${petId}: ${petSubscription.id}`,
      );

      //Email notification for subscription creation
      this.notificationService.sendEmailNotification(
        pet.owner.email,
        'Care Plan Activation',
        subscriptionActivationtemplate({
          memberName: pet.owner.name,
          petName: pet.name,
          planName: 'SmollCare',
          petCareId: pet.careId,
          startDate: today,
          endDate,
          invoicePdfUrl: invoice.hosted_invoice_url
        }),
      );

      // Create payment log
      await this.createPaymentLog(
        petSubscription,
        invoice,
        paymentIntentId,
        stripeSubscription,
        'subscription_created',
        memberId,
      );
    } catch (err) {
      this.logger.error(err);
    }
  }

  private async renewPetSubscription(
    petSubscription: SmollCareSubscription,
    stripeSubscription: Stripe.Subscription,
    invoice: Stripe.Invoice,
    paymentIntentId: string,
    memberId: string,
  ) {
    try {
      // Update existing subscription for renewal
      petSubscription.status = SubscriptionStatus.ACTIVE;

      // Assigning new stripe Subscription Id
      if (petSubscription.stripeSubscriptionId !== stripeSubscription.id) {
        petSubscription.stripeSubscriptionId = stripeSubscription.id;
        this.logger.info(
          `✅ New stripesubscriptionId assigned to Pet Subscription: ${petSubscription.id}`,
        );
      }

      // Extend the subscription period
      const currentEndDate = petSubscription.endDate;
      const today = new Date();

      // If subscription hasn't expired, extend from current end date
      // If expired, start from today
      const startDate = currentEndDate > today ? currentEndDate : today;
      if (!petSubscription.plan || !petSubscription.plan.cycle) {
        this.logger.error(
          `Plan or cycle missing for subscription ${petSubscription.id}. Cannot renew.`,
        );
        return;
      }
      const newEndDate = this.calculateEndDate(
        startDate,
        petSubscription.plan.cycle,
      );

      petSubscription.startDate = startDate;
      petSubscription.endDate = newEndDate;

      await this.petSubscriptionRepo.save(petSubscription);

      this.logger.info(
        `✅ Pet subscription renewed for pet ${petSubscription.pet.id}: ${petSubscription.id}`,
      );

      // Create payment log for renewal
      await this.createPaymentLog(
        petSubscription,
        invoice,
        paymentIntentId,
        stripeSubscription,
        'subscription_renewed',
        memberId,
      );
    } catch (err) {
      this.logger.error(`Error on subscription renewel: ${err}`);
    }
  }

  private calculateEndDate(startDate: Date, cycle: PlanCycle): Date {
    const endDate = new Date(startDate);

    if (cycle === PlanCycle.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (cycle === PlanCycle.YEARLY) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    return endDate;
  }

  private async createPaymentLog(
    petSubscription: SmollCareSubscription,
    invoice: Stripe.Invoice,
    paymentIntentId: string,
    stripeSubscription: Stripe.Subscription,
    action: string,
    memberId: string,
  ) {
    await this.paymentLogService.createPaymentLog({
      subscriptionId: petSubscription.id,
      stripePaymentId: paymentIntentId,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      paymentType: PaymentType.subscription,
      status: PaymentStatus.success,
      metadata: JSON.stringify({
        invoiceId: invoice.id,
        petId: petSubscription.pet.id,
        petName: stripeSubscription.metadata.petName,
        subscriptionType: 'pet_health_plan',
        action,
        planId: petSubscription.plan?.id,
        planName: petSubscription.plan?.name,
      }),
      member: <any>{ id: memberId },
    });

    this.logger.info(
      `Payment log created for pet subscription: ${petSubscription.id}, action: ${action}`,
    );
  }

  private async generateSequentialCareId(
    pet: Pet,
    owner: Member,
  ): Promise<string> {
    const species = pet.species?.toLowerCase();
    let speciesMarker = 'X';

    if (species === 'cat') speciesMarker = 'F';
    else if (species === 'dog') speciesMarker = 'C';

    let numericOwnerId = owner.careId.toString().replace(/\D/g, '');
    numericOwnerId = numericOwnerId.padStart(6, '0').slice(0, 6);

    const suffix = owner.nextPetCareSuffix.toString().padStart(2, '0');
    const careId = `${numericOwnerId.slice(0, 3)}-${numericOwnerId.slice(3, 6)}-${speciesMarker}${suffix}`;

    // Update the owner's next suffix
    owner.nextPetCareSuffix = owner.nextPetCareSuffix + 1;
    await this.memberRepo.update(owner.id, owner);

    return careId;
  }
}
