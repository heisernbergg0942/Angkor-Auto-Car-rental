<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function show($id)
    {
        $invoice = Invoice::with('rental.booking.customer', 'rental.booking.vehicle', 'payments')->findOrFail($id);
        return response()->json($invoice);
    }

    public function store(Request $request)
    {
        $request->validate([
            'rental_id'   => 'required|exists:rentals,id',
            'subtotal'    => 'required|numeric|min:0',
            'tax'         => 'nullable|numeric|min:0',
            'discount'    => 'nullable|numeric|min:0',
            'type'        => 'sometimes|string|in:rental,damage',
            'description' => 'nullable|string',
        ]);

        $subtotal    = $request->subtotal;
        $tax         = $request->tax ?? 0;
        $discount    = $request->discount ?? 0;
        $total       = $subtotal + $tax - $discount;
        $type        = $request->type ?? 'rental';
        $description = $request->description;

        $invoice = Invoice::create([
            'rental_id'   => $request->rental_id,
            'subtotal'    => $subtotal,
            'tax'         => $tax,
            'discount'    => $discount,
            'total'       => $total,
            'type'        => $type,
            'description' => $description,
        ]);

        // Send alert notification to the customer who rented the car if it is a damage invoice!
        if ($type === 'damage') {
            $rental = \App\Models\Rental::with('booking.customer.user', 'booking.vehicle')->findOrFail($request->rental_id);
            if ($rental->booking && $rental->booking->customer) {
                $customerUserId = $rental->booking->customer->user_id;
                \App\Models\Notification::create([
                    'user_id' => $customerUserId,
                    'message' => "🚨 Damage Report: A repair invoice of $" . number_format($total, 2) . " has been added for your rental of " . ($rental->booking->vehicle ? ($rental->booking->vehicle->brand . " " . $rental->booking->vehicle->model) : 'vehicle') . ". Note: " . ($description ?? 'Repair cost'),
                    'is_read' => false,
                ]);
            }
        }

        return response()->json(['message' => 'Invoice created', 'invoice' => $invoice], 201);
    }

    public function update(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);

        $request->validate([
            'subtotal' => 'sometimes|numeric|min:0',
            'tax'      => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
        ]);

        $subtotal = $request->subtotal ?? $invoice->subtotal;
        $tax      = $request->tax      ?? $invoice->tax;
        $discount = $request->discount ?? $invoice->discount;

        $invoice->update([
            'subtotal' => $subtotal,
            'tax'      => $tax,
            'discount' => $discount,
            'total'    => $subtotal + $tax - $discount,
        ]);

        return response()->json(['message' => 'Invoice updated', 'invoice' => $invoice]);
    }

    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->delete();

        return response()->json(['message' => 'Invoice deleted successfully']);
    }
}
