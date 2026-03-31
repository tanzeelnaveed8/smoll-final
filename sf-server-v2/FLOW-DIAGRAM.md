# Pet Subscription System - Diagrammatic Flow

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Pet Subscription System                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │   React Native  │    │   NestJS API    │    │   Stripe API    │             │
│  │   Mobile App    │◄──►│    Backend      │◄──►│    Service      │             │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘             │
│           │                       │                       │                     │
│           │                       │                       │                     │
│           ▼                       ▼                       ▼                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │  Payment Sheet  │    │   PostgreSQL    │    │ Stripe Customer │             │
│  │   Integration   │    │   Database      │    │ & Subscriptions │             │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 2. Pet Subscription Creation Flow

```
┌─────────────────┐
│   Customer      │
│   Opens App     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Select Pet    │
│   for Health    │
│   Plan          │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │ POST │   Backend       │ API  │   Stripe        │
│   Creates Sub   │─────►│   Creates       │─────►│   Creates       │
│   with Payment  │      │   Subscription  │      │   Subscription  │
│   Sheet API     │      │   + Payment     │      │   with Payment  │
└─────────┬───────┘      └─────────┬───────┘      └─────────┬───────┘
          │                        │                        │
          │              ┌─────────────────┐                │
          └──────────────┤   Returns       │◄───────────────┘
                         │   clientSecret  │
                         │   ephemeralKey  │
                         │   (Payment      │
                         │   Intent)       │
                         └─────────┬───────┘
                                   │
                                   ▼
                         ┌─────────────────┐
                         │   Initialize    │
                         │   Payment Sheet │
                         │   in React      │
                         │   Native        │
                         └─────────┬───────┘
                                   │
                                   ▼
                         ┌─────────────────┐
                         │   User Enters   │
                         │   Payment Info  │
                         │   & Confirms    │
                         └─────────┬───────┘
                                   │
                                   ▼
                         ┌─────────────────┐
                         │   Payment       │
                         │   Successful    │
                         └─────────┬───────┘
                                   │
                                   ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Stripe        │ POST │   Backend       │      │   Database      │
│   Sends         │─────►│   Webhook       │─────►│   Creates Pet   │
│   Webhook       │      │   Handler       │      │   Subscription  │
│   (invoice.paid)│      │   Processes     │      │   Record        │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## 3. Multiple Pet Management Flow

```
Customer: John Doe (cus_john123)
├── Pet 1: Buddy (Dog)
│   ├── Subscription: sub_buddy456
│   ├── Plan: Premium Pet Health ($49.99/month)
│   └── Status: Active
│
├── Pet 2: Whiskers (Cat)
│   ├── Subscription: sub_whiskers789
│   ├── Plan: Basic Pet Health ($29.99/month)
│   └── Status: Active
│
└── Pet 3: Max (Dog)
    ├── Subscription: sub_max101
    ├── Plan: Premium Pet Health ($49.99/month)
    └── Status: Paused

┌─────────────────────────────────────────────────────────────────┐
│                    Independent Operations                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Cancel Whiskers' Subscription                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   Frontend      │    │   Backend       │                    │
│  │   DELETE        │───►│   Validates     │                    │
│  │   /pet-subs     │    │   Pet Ownership │                    │
│  │   {sub_whiskers │    │   & Cancels     │                    │
│  │    petId}       │    │   Only Whiskers │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                                                 │
│  Result: Buddy & Max subscriptions remain unaffected           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 4. API Endpoint Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API Endpoints                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  POST /member/stripe/pet-subscriptions/setup                                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │   Request       │    │   Controller    │    │   Service       │             │
│  │   {customerId,  │───►│   Validates     │───►│   Creates       │             │
│  │    petId,       │    │   Input         │    │   Setup Intent  │             │
│  │    priceId}     │    │                 │    │   with Metadata │             │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘             │
│                                                                                 │
│  POST /member/stripe/pet-subscriptions                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │   Request       │    │   Controller    │    │   Service       │             │
│  │   {customerId,  │───►│   Validates     │───►│   Attaches      │             │
│  │    petId,       │    │   Input         │    │   Payment &     │             │
│  │    paymentId}   │    │                 │    │   Creates Sub   │             │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘             │
│                                                                                 │
│  GET /member/stripe/pet-subscriptions?customerId=X&petId=Y                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │   Query Params  │    │   Controller    │    │   Service       │             │
│  │   customerId    │───►│   Validates     │───►│   Fetches       │             │
│  │   petId (opt)   │    │   Params        │    │   Filtered Subs │             │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘             │
│                                                                                 │
│  DELETE /member/stripe/pet-subscriptions                                       │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │   Request       │    │   Controller    │    │   Service       │             │
│  │   {subId,       │───►│   Validates     │───►│   Verifies      │             │
│  │    petId}       │    │   Input         │    │   Ownership &   │             │
│  │                 │    │                 │    │   Cancels       │             │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 5. Database Relationship Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Database Schema                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │     Member      │    │      Pet        │    │ SmollCarePet    │             │
│  │                 │    │                 │    │ Subscription    │             │
│  │ - id            │    │ - id            │    │                 │             │
│  │ - stripeCustomer│◄──┐│ - name          │    │ - id            │             │
│  │   Id            │   ││ - breed         │    │ - petId         │             │
│  │ - email         │   ││ - species       │◄──►│ - stripeSubscr- │             │
│  │ - phone         │   ││ - age           │    │   iptionId      │             │
│  └─────────────────┘   │└─────────────────┘    │ - status        │             │
│                        │                       │ - charges       │             │
│                        │                       │ - startDate     │             │
│                        │                       │ - endDate       │             │
│                        │                       └─────────────────┘             │
│                        │                                                       │
│                        │ ┌─────────────────┐                                  │
│                        │ │   Stripe API    │                                  │
│                        │ │                 │                                  │
│                        └►│ - Customer      │                                  │
│                          │ - Subscriptions │                                  │
│                          │ - PaymentMethods│                                  │
│                          │ - Invoices      │                                  │
│                          └─────────────────┘                                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 6. Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            Error Handling                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Request Processing                                                             │
│  ┌─────────────────┐                                                           │
│  │   API Request   │                                                           │
│  └─────────┬───────┘                                                           │
│            │                                                                   │
│            ▼                                                                   │
│  ┌─────────────────┐    ❌ Validation Error                                    │
│  │   Input         │────────────────────┐                                     │
│  │   Validation    │                    │                                     │
│  └─────────┬───────┘                    │                                     │
│            │ ✅                         │                                     │
│            ▼                            │                                     │
│  ┌─────────────────┐    ❌ Pet Not Found│                                     │
│  │   Pet           │────────────────────┤                                     │
│  │   Ownership     │                    │                                     │
│  │   Verification  │                    │                                     │
│  └─────────┬───────┘                    │                                     │
│            │ ✅                         │                                     │
│            ▼                            │                                     │
│  ┌─────────────────┐    ❌ Stripe Error │                                     │
│  │   Stripe API    │────────────────────┤                                     │
│  │   Operation     │                    │                                     │
│  └─────────┬───────┘                    │                                     │
│            │ ✅                         │                                     │
│            ▼                            │                                     │
│  ┌─────────────────┐                    │                                     │
│  │   Success       │                    │                                     │
│  │   Response      │                    │                                     │
│  └─────────────────┘                    │                                     │
│                                         │                                     │
│                                         ▼                                     │
│                               ┌─────────────────┐                             │
│                               │   Error         │                             │
│                               │   Response      │                             │
│                               │   with Details  │                             │
│                               └─────────────────┘                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 7. React Native Payment Sheet Integration Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     React Native Integration                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  User Interaction Flow:                                                        │
│                                                                                 │
│  1. User selects pet ──► 2. Tap "Subscribe" ──► 3. Payment Sheet opens         │
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │   Pet List      │    │   Subscribe     │    │   Payment       │             │
│  │   Component     │───►│   Button        │───►│   Sheet         │             │
│  │                 │    │   Pressed       │    │   (Stripe)      │             │
│  └─────────────────┘    └─────────────────┘    └─────────┬───────┘             │
│                                                           │                     │
│                                                           ▼                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │   Success       │    │   Create        │    │   Payment       │             │
│  │   Confirmation  │◄───│   Subscription  │◄───│   Completed     │             │
│  │   Screen        │    │   API Call      │    │   Successfully  │             │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘             │
│                                                                                 │
│  Technical Flow:                                                               │
│                                                                                 │
│  initPaymentSheet() ──► presentPaymentSheet() ──► createSubscription()         │
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │   Setup Intent  │    │   User Payment  │    │   Subscription  │             │
│  │   API Call      │───►│   Input &       │───►│   Creation      │             │
│  │   Returns Keys  │    │   Confirmation  │    │   API Call      │             │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 8. Subscription Lifecycle Management

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        Subscription Lifecycle                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │   Created       │───►│   Active        │───►│   Canceled      │             │
│  │   (Initial)     │    │   (Billing)     │    │   (Ended)       │             │
│  └─────────────────┘    └─────────┬───────┘    └─────────────────┘             │
│                                   │                                             │
│                                   ▼                                             │
│                         ┌─────────────────┐                                    │
│                         │   Paused        │                                    │
│                         │   (Temporary)   │                                    │
│                         └─────────┬───────┘                                    │
│                                   │                                             │
│                                   ▼                                             │
│                         ┌─────────────────┐                                    │
│                         │   Resumed       │                                    │
│                         │   (Reactivated) │                                    │
│                         └─────────────────┘                                    │
│                                                                                 │
│  Operations Available:                                                         │
│  • Create new subscription for pet                                            │
│  • Pause subscription (vacation, temporary)                                   │
│  • Resume subscription                                                         │
│  • Update subscription (change plan/price)                                    │
│  • Cancel subscription (permanent)                                            │
│  • View subscription details and history                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

This diagrammatic flow shows the complete architecture and process flow for the pet subscription system, from initial setup through subscription management, with clear separation of concerns and independent pet subscription handling. 