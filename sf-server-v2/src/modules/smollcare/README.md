# Smoll Care Subscription System

## Overview

The Smoll Care Subscription system provides a comprehensive solution for managing pet care subscriptions within the Smoll Pet Care Platform. It allows members to subscribe to predefined care plans, manage licenses for their pets, purchase additional licenses, and utilize benefits associated with their active subscriptions. The system is built using NestJS and TypeORM, integrating with Stripe for payment processing.

## Module Structure

-   **Directory**: `src/modules/smollcare/`
-   **Entities**: All TypeORM entities related to Smoll Care are located in `src/modules/smollcare/entities/`.
-   **DTOs**: Data Transfer Objects for API requests are in `src/modules/smollcare/dto/`.
-   **Service**: Core business logic is encapsulated in `smoll-care.service.ts`.
-   **Controller**: API endpoints are defined in `smoll-care.controller.ts`.
-   **Module**: The NestJS module definition is `smoll-care.module.ts`.

Related shared entities:
-   `PaymentLog`: Located in `src/modules/payment/entities/payment-log.entity.ts`, used for logging all Smoll Care related payments.

## Entities

1.  **`SmollCarePlan` (`smoll_care_plan`)**
    -   `id`: PK, UUID
    -   `name`: string - Name of the plan (e.g., "Basic Care", "Premium Care")
    -   `description`: string - Detailed description of the plan.
    -   `price`: decimal - Cost of the plan per cycle.
    -   `cycle`: enum (`Monthly`, `Yearly`) - Billing cycle.
    -   `defaultLicences`: number - Number of pet licenses included by default.
    -   `extraLicensePrice`: decimal - Cost for one extra license per cycle.

2.  **`SmollCareSubscription` (`smoll_care_subscription`)**
    -   `id`: PK, UUID
    -   `memberId`: FK to `Member`
    -   `planId`: FK to `SmollCarePlan`
    -   `status`: enum (`Active`, `Inactive`, `Cancelled`) - Current status of the subscription.
    -   `startDate`: date - Date when the subscription started or will start.
    -   `endDate`: date - Date when the subscription will end.
    -   `totalLicences`: number - Total number of licenses (default + extra) available under this subscription.
    -   `recurringCharge`: decimal - Total recurring charge for the subscription (plan price + cost of all extra licenses).

3.  **`SmollCareLicense` (`smoll_care_licenses`)**
    -   `id`: PK, UUID
    -   `subscriptionId`: FK to `SmollCareSubscription`
    -   `petId`: FK to `Pet`
    -   `assignedAt`: date - Date when the license was assigned to the pet.
    -   `status`: enum (`Active`, `Expired`, `Revoked`) - Status of the individual license.
    -   `charge`: decimal - Cost attributed to this specific license (0 if it's a default license, `extraLicensePrice` if it's an extra one).

4.  **`SmollCareBenefit` (`smoll_care_benefit`)**
    -   `id`: PK, UUID
    -   `planId`: FK to `SmollCarePlan`
    -   `name`: string - Name of the benefit (e.g., "Free Vet Consultation", "Discount on Grooming").
    -   `description`: string - Description of the benefit.
    -   `maxUsagePerLicense`: number - Maximum times this benefit can be used per active license within its validity period (e.g., per month/year depending on how it's tracked).

5.  **`SmollCareBenefitUsage` (`smoll_care_benefit_usage`)**
    -   `id`: PK, UUID
    -   `licenseId`: FK to `SmollCareLicense`
    -   `benefitId`: FK to `SmollCareBenefit`
    -   `partnerId`: FK to `Partner` (optional) - ID of the partner (vet/clinic) where the benefit was used.
    -   `caseId`: FK to `Case` (optional) - ID of the case associated with this benefit usage.

6.  **`PaymentLog` (Shared Entity - `payment_log`)**
    -   `id`: PK, UUID
    -   `subscriptionId`: FK to `SmollCareSubscription` (nullable, as payment log could be for other things too)
    -   `memberId`: FK to `Member`
    -   `stripePaymentId`: string - ID of the payment from Stripe.
    -   `amount`: decimal - Amount paid.
    -   `currency`: string - Currency of payment.
    -   `paymentType`: enum (`Subscription`, `Licences`) - Type of payment.
    -   `licenceCount`: number (nullable) - Number of licenses paid for, if `paymentType` is `Licences`.
    -   `status`: enum (`Success`, `Failed`, `Pending`) - Status of the payment.

## Features & API Endpoints

Base Path: `/smollcare`

1.  **Create Subscription**
    -   **Endpoint**: `POST /subscription`
    -   **Request DTO**: `CreateSmollCareSubscriptionDto` (`planId: string`)
    -   **Description**: Allows a member to subscribe to a Smoll Care plan. Initializes the subscription, triggers a Stripe payment intent, and logs the payment.
    -   **Returns**: Subscription details and Stripe `paymentIntentClientSecret`.

2.  **Assign License to Pet**
    -   **Endpoint**: `POST /license/assign`
    -   **Request DTO**: `AssignLicenseDto` (`subscriptionId: string`, `petId: string`)
    -   **Description**: Assigns an available license slot from an active subscription to one of the member's pets. Sets the individual charge on the license record based on whether it's a default or extra license.

3.  **Buy Extra Licenses**
    -   **Endpoint**: `POST /licenses/buy`
    -   **Request DTO**: `BuyExtraLicensesDto` (`subscriptionId: string`, `count: number`)
    -   **Description**: Allows a member to purchase additional license slots for an active subscription. Triggers a Stripe payment intent, updates the subscription's `totalLicences` and `recurringCharge`, and logs the payment.
    -   **Returns**: Updated subscription details and Stripe `paymentIntentClientSecret`.

4.  **Use Benefit**
    -   **Endpoint**: `POST /benefit/use`
    -   **Request DTO**: `UseBenefitDto` (`licenseId: string`, `benefitId: string`, `partnerId?: string`, `caseId?: string`)
    -   **Description**: Records the usage of a specific benefit associated with an active license. Validates usage against `maxUsagePerLicense`.

## Stripe Integration

-   The system integrates with Stripe via the `StripeService`.
-   Subscription creation and extra license purchases initiate a Stripe Payment Intent. The `paymentIntentClientSecret` is returned to the client to complete the payment (e.g., using Stripe Elements or mobile SDKs).
-   Successful payments should ideally be confirmed via Stripe Webhooks, which would then update the `PaymentLog` status from `Pending` to `Success`. (Current implementation optimistically sets to `Success` or requires manual/webhook update for `Pending` status).
-   Ensure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` (if webhooks are fully implemented) are configured in your environment.
-   Member records must have a `stripeCustomerId` before subscriptions can be created.

## Setup & Configuration

1.  **Environment Variables**:
    -   `STRIPE_SECRET_KEY`: Your Stripe secret key.
    -   `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret (for payment confirmation).
2.  **Database Migrations**: Run TypeORM migrations to create the new tables (`smoll_care_plan`, `smoll_care_subscription`, `smoll_care_licenses`, `smoll_care_benefit`, `smoll_care_benefit_usage`) and update existing tables (`member`, `pet`, `partner`, `case`) with new relations.
3.  **Stripe Account**: A Stripe account is required with configured products/prices if you plan to use Stripe Subscriptions directly, or manage pricing via your application logic as done here.
4.  **Authentication**: Ensure your authentication middleware (e.g., for JWT) correctly populates `req.user` with `id` (member ID) and `stripeCustomerId` for the controller endpoints.

## Future Enhancements & TODOs

-   **Full Stripe Webhook Handling**: Implement robust webhook handling to update payment statuses and manage subscription lifecycle based on Stripe events (e.g., `payment_intent.succeeded`, `payment_intent.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`).
-   **Cron Jobs/Scheduled Tasks**:
    -   Automatically expire licenses and update subscription statuses when `endDate` is reached.
    -   Periodic checks for overdue payments or subscription renewals if not handled by Stripe Subscriptions directly.
-   **Subscription Cancellation**: Implement a service method and endpoint to cancel a subscription (set status to `Cancelled`, revoke active licenses).
-   **Subscription Renewal**: Logic for handling subscription renewals (manual or automatic via Stripe Subscriptions).
-   **GET Endpoints**: Add controller methods to retrieve subscription details, licenses per subscription/pet, available benefits, usage history, etc.
-   **Admin Management**: Endpoints for administrators to manage plans, view/manage subscriptions, etc.
-   **Comprehensive Testing**: Write thorough unit and end-to-end tests for all features and edge cases.
-   **Refined Error Handling & Logging**: Enhance error messages and logging throughout the service.
-   **Notifications**: Inform members about subscription status changes, upcoming renewals, license expirations, etc.

This README provides a foundational overview of the Smoll Care Subscription system. 