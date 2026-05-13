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
            'rental_id' => 'required|exists:rentals,id',
            'subtotal'  => 'required|numeric|min:0',
            'tax'       => 'nullable|numeric|min:0',
            'discount'  => 'nullable|numeric|min:0',
        ]);

        $subtotal = $request->subtotal;
        $tax      = $request->tax ?? 0;
        $discount = $request->discount ?? 0;
        $total    = $subtotal + $tax - $discount;

        $invoice = Invoice::create([
            'rental_id' => $request->rental_id,
            'subtotal'  => $subtotal,
            'tax'       => $tax,
            'discount'  => $discount,
            'total'     => $total,
        ]);

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
}
