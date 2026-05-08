<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class PaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a Stripe PaymentIntent for a booking.
     */
    public function createIntent(Request $request)
    {
        $request->validate([
            'amount'     => 'required|numeric|min:1',
            'currency'   => 'sometimes|string|size:3',
            'booking_id' => 'sometimes|string',
        ]);

        try {
            $paymentIntent = PaymentIntent::create([
                'amount'   => (int) round($request->amount * 100), // convert to cents
                'currency' => $request->currency ?? 'usd',
                'metadata' => [
                    'booking_id' => $request->booking_id ?? 'N/A',
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
                'intentId'     => $paymentIntent->id,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Handle Stripe webhook events (for production use).
     */
    public function webhook(Request $request)
    {
        $payload   = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret    = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }

        if ($event->type === 'payment_intent.succeeded') {
            $intent    = $event->data->object;
            $bookingId = $intent->metadata->booking_id ?? null;

            // TODO: Update booking status in database
            // Booking::where('id', $bookingId)->update(['status' => 'paid']);
        }

        return response()->json(['status' => 'received']);
    }
}
