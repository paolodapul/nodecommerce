## Stripe integration

1. Initialize a Stripe client instance using `new Stripe(STRIPE_SECRET_KEY)`
2. The webhook endpoint should allow a raw request body to be passed, instead of a parsed JavaScript object. This means the route should not use `express.json()`.
3. You need to implement `express.raw({ type: "application/json" })` as middleware for your webhook endpoint, else, you will receive the error: `no webhook payload was provided`.
   - `express.raw({ type: "application/json" })` is used when you want to receive the request body in its raw, unmodified form (as a Buffer).
   - Stripe expects the webhook to handle JSON payloads specifically, so you need to supply the `{ type: "application/json" }` part.
4. To prevent this error from happening on your webhook listener, `Stripe webhook using CLI fails to POST. Returns "Client.Timeout exceeded while awaiting headers"`, implement a `res.end()` on your controller which handles the webhook endpoint.
5. If for some reason you can't fetch your .env values, try importing dotenv in your module containing your Stripe implementation. If you fail to provide a secret key, you will receive a `you did not provide an API key...` error when trying to call Stripe SDK functions.

## Webhook forwarding

1. Since Stripe cannot directly make HTTP requests to your machine, you need to setup Stripe CLI to have a means for establishing a secure tunnel for webhook events.
2. To forward webhook events to your local HTTP server and to your webhook endpoint, run the command below:

   ```shell
   stripe listen -e checkout.session.completed --forward-to http://localhost:3000/webhook
   ```

3. Command explanation:
   - The `-e checkout.session.completed` flag filters for a specific event type.
   - `--forward-to http://localhost:3000/webhook` forwards the webhook events to your local server running on port 3000 at the `/webhook` endpoint.
