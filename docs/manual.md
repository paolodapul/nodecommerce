1. Run the seeder `npm run seed`
2. Run your Stripe CLI using the command:

```shell
stripe listen -e payment_intent.succeeded,payment_intent.payment_failed --forward-to http://localhost:3000/api/webhook
```

3. Testing flow:

- Create order
- Get orders
- Checkout order using order ID as input
- Check Stripe if payment successful
- Check webhook if payment successful
- Re-check order, should change its status to "processing" - meaning ready for order fulfillment, paymentInfo status should be "succeeded"
