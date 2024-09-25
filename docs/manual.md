1. Run the seeder `npm run seed`
2. Run your Stripe CLI using the command:

```shell
stripe listen -e payment_intent.succeeded,payment_intent.payment_failed --forward-to http://localhost:3000/api/webhook
```
