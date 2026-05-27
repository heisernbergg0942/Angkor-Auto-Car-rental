<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class PaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function index(Request $request)
    {
        $payments = Payment::with('invoice.rental.booking.customer')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15);

        return response()->json($payments);
    }

    public function createIntent(Request $request)
    {
        $request->validate([
            'amount'     => 'required|numeric|min:1',
            'currency'   => 'sometimes|string|size:3',
            'invoice_id' => 'sometimes|exists:invoices,id',
            'booking_id' => 'sometimes|string',
        ]);

        try {
            $paymentIntent = PaymentIntent::create([
                'amount'   => (int) round($request->amount * 100),
                'currency' => $request->currency ?? 'usd',
                'metadata' => [
                    'invoice_id' => $request->invoice_id ?? 'N/A',
                    'booking_id' => $request->booking_id ?? 'N/A',
                ],
                'automatic_payment_methods' => ['enabled' => true],
            ]);

            // Create a pending payment record
            if ($request->invoice_id) {
                Payment::create([
                    'invoice_id'               => $request->invoice_id,
                    'amount'                   => $request->amount,
                    'payment_method'           => 'card',
                    'status'                   => 'pending',
                    'stripe_payment_intent_id' => $paymentIntent->id,
                ]);
            }

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
                'intentId'     => $paymentIntent->id,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

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
            $intent = $event->data->object;

            Payment::where('stripe_payment_intent_id', $intent->id)
                ->update([
                    'status'       => 'paid',
                    'payment_date' => now(),
                ]);
        }

        return response()->json(['status' => 'received']);
    }

    public function store(Request $request)
    {
        $request->validate([
            'invoice_id'     => 'required|exists:invoices,id',
            'amount'         => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,card,bank,e-wallet',
            'payment_date'   => 'nullable|date',
        ]);

        $payment = Payment::create([
            'invoice_id'     => $request->invoice_id,
            'amount'         => $request->amount,
            'payment_method' => $request->payment_method,
            'payment_date'   => $request->payment_date ?? now(),
            'status'         => 'paid',
        ]);

        return response()->json(['message' => 'Payment recorded', 'payment' => $payment], 201);
    }
}
