# Order Payments using Stripe Payment Intents

1. Let the customer add a payment method using `stripe.paymentMethods.create`

```typescript
const paymentMethod = await stripe.paymentMethods.create({
  type: "card",
  card: {
    number: "4242424242424242",
    exp_month: 8,
    exp_year: 2025,
    cvc: "314",
  },
});
```

2. The payment ID coming from the added payment method will then be associated to a customer in MongoDB.

```typescript
await Customer.findByIdAndUpdate(
  customerId,
  { $push: { paymentMethods: paymentMethod.id } },
  { new: true }
);
```

3. Create a payment intent with confirmation method set to `manual`. This means payment attempts must be made using a secret key.

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000, // amount in cents
  currency: "usd",
  payment_method: paymentMethod.id,
  confirmation_method: "manual",
});
```

4. Confirm a payment intent using the created payment method.

```typescript
const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
  payment_method: paymentMethod.id,
  return_url: "https://www.example.com",
});

if (confirmedIntent.status === "succeeded") {
  // Payment successful
} else {
  // Handle other statuses
}
```

---

# Notes

- If the confirmation_method is manual, all payment attempts must be initiated using a secret key.
- If any actions are required for the payment, the PaymentIntent will return to the requires_confirmation state after those actions are completed. Your server needs to then explicitly re-confirm the PaymentIntent to initiate the next payment attempt.

---

# Links

- https://docs.stripe.com/api - then select Node.js as runtime
