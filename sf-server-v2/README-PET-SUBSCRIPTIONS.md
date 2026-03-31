# Pet Subscription System with Stripe Integration

This system allows customers to create individual subscriptions for each of their pets, enabling independent management of pet health plans.

## Key Features

- **Individual Pet Subscriptions**: Each pet gets its own Stripe subscription
- **Independent Management**: Cancel, pause, or modify one pet's subscription without affecting others
- **React Native Payment Sheet Support**: Seamless mobile payment experience
- **Comprehensive API**: Full CRUD operations for pet subscriptions

## API Endpoints

### 1. Create Pet Subscription with Payment Sheet
**POST** `/member/stripe/pet-subscriptions/create-with-payment-sheet`

Creates a subscription immediately and returns payment intent for React Native payment sheet integration. The subscription will be activated automatically via webhook when payment succeeds.

```json
{
  "customerId": "cus_1234567890",
  "petId": "pet_abc123",
  "priceId": "price_1234567890",
  "petInfo": {
    "name": "Buddy",
    "breed": "Golden Retriever",
    "species": "Dog",
    "age": 3
  }
}
```

**Response:**
```json
{
  "clientSecret": "seti_1234567890_secret_abc",
  "ephemeralKey": "ek_test_1234567890",
  "customer": "cus_1234567890",
  "petId": "pet_abc123"
}
```

### 2. Webhook Handling (Automatic)
**POST** `/stripe/webhook`

This endpoint is called automatically by Stripe when payments succeed or fail. It handles:
- Creating pet subscription records in the database
- Updating subscription status
- Creating payment logs
- No manual API calls needed from frontend

### 3. Get Pet Subscriptions
**GET** `/member/stripe/pet-subscriptions?customerId=cus_1234567890&petId=pet_abc123`

Retrieves subscriptions for a customer, optionally filtered by pet.

**Response:**
```json
[
  {
    "subscriptionId": "sub_1234567890",
    "status": "active",
    "currentPeriodStart": 1640995200,
    "currentPeriodEnd": 1643673600,
    "petId": "pet_abc123",
    "petName": "Buddy",
    "petBreed": "Golden Retriever",
    "petSpecies": "Dog",
    "petAge": "3",
    "priceId": "price_1234567890",
    "amount": 2999,
    "currency": "usd",
    "interval": "month"
  }
]
```

### 4. Get Pet Subscription Details
**GET** `/member/stripe/pet-subscriptions/{subscriptionId}/details?petId=pet_abc123`

Retrieves detailed information about a specific pet subscription.

### 5. Update Pet Subscription
**PUT** `/member/stripe/pet-subscriptions/{subscriptionId}`

Updates a pet subscription (change price, pause, etc.).

```json
{
  "priceId": "price_new_1234567890",
  "pause": false
}
```

### 6. Cancel Pet Subscription
**DELETE** `/member/stripe/pet-subscriptions`

Cancels a specific pet subscription.

```json
{
  "subscriptionId": "sub_1234567890",
  "petId": "pet_abc123"
}
```

## React Native Integration

### Installation
```bash
npm install @stripe/stripe-react-native
```

### Basic Usage

```typescript
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';

// Step 1: Create subscription and setup payment sheet
const setupPaymentSheet = async () => {
  const response = await fetch('/member/stripe/pet-subscriptions/create-with-payment-sheet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cus_1234567890',
      petId: 'pet_abc123',
      priceId: 'price_1234567890',
      petInfo: {
        name: 'Buddy',
        breed: 'Golden Retriever',
        species: 'Dog',
        age: 3
      }
    })
  });

  const { clientSecret, ephemeralKey, customer } = await response.json();

  const { error } = await initPaymentSheet({
    merchantDisplayName: 'Pet Health Plan',
    customerId: customer,
    customerEphemeralKeySecret: ephemeralKey,
    paymentIntentClientSecret: clientSecret, // Changed from setupIntentClientSecret
    allowsDelayedPaymentMethods: true,
    defaultBillingDetails: {
      name: "Buddy's Health Plan"
    }
  });

  return !error;
};

// Step 2: Present payment sheet (subscription created automatically via webhook)
const subscribeToPetPlan = async () => {
  const setupSuccess = await setupPaymentSheet();
  if (!setupSuccess) return;

  const { error } = await presentPaymentSheet();
  if (error) {
    console.error('Payment failed:', error);
    return;
  }

  // Payment successful! Subscription is automatically created via webhook
  console.log('Payment successful! Subscription will be activated via webhook.');
  
  // Optionally, you can fetch the subscription status
  // const subscriptions = await fetch(`/member/stripe/pet-subscriptions?customerId=${customerId}&petId=${petId}`);
};
```

## Database Schema Updates

The `SmollCarePetSubscription` entity has been updated to include:

```typescript
@Column({ nullable: true })
stripeSubscriptionId: string | null;
```

This links your local pet subscription records with Stripe subscriptions.

## Benefits of This Architecture

1. **Scalability**: Each pet has its own subscription, allowing unlimited pets per customer
2. **Flexibility**: Independent billing cycles and pricing per pet
3. **User Experience**: Cancel one pet without affecting others
4. **Compliance**: Clear separation of charges for different pets
5. **Analytics**: Track subscription metrics per pet

## Example Scenarios

### Scenario 1: Customer with Multiple Pets
- Customer has 3 pets: Buddy (Dog), Whiskers (Cat), Max (Dog)
- Each pet gets its own subscription to "Pet Health Plan"
- Customer can cancel Whiskers' subscription while keeping Buddy and Max active

### Scenario 2: Different Plans per Pet
- Buddy gets "Premium Pet Plan" ($49.99/month)
- Whiskers gets "Basic Pet Plan" ($29.99/month)
- Each subscription is independent with different billing cycles

### Scenario 3: Subscription Management
- Pause Buddy's subscription during vacation
- Update Max's subscription to a different plan
- Cancel and restart subscriptions as needed

## Error Handling

The system includes comprehensive error handling:

- Validates pet ownership before subscription operations
- Prevents duplicate subscriptions for the same pet
- Handles Stripe API errors gracefully
- Provides clear error messages for frontend integration

## Security Considerations

- All subscription operations verify pet ownership
- Stripe customer ID validation
- Secure payment method handling
- Metadata encryption for sensitive pet information 