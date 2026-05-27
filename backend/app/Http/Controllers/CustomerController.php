<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $customers = Customer::with('user', 'documents')
            ->when($request->search, fn($q) => $q->where(fn($sub) => $sub->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%")))
            ->paginate(15);

        return response()->json($customers);
    }

    public function show($id)
    {
        $customer = Customer::with('user', 'documents', 'bookings.vehicle')->findOrFail($id);
        return response()->json($customer);
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $request->validate([
            'name'           => 'sometimes|string|max:255',
            'phone'          => 'sometimes|nullable|string|max:20',
            'address'        => 'sometimes|nullable|string',
            'license_number' => 'sometimes|nullable|string|unique:customers,license_number,' . $id,
            'is_verified'    => 'sometimes|boolean',
        ]);

        $customer->update($request->only('name', 'phone', 'address', 'license_number', 'is_verified'));

        return response()->json(['message' => 'Customer updated', 'customer' => $customer]);
    }

    public function uploadDocument(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $request->validate([
            'document_type' => 'required|in:license,national_id',
            'file'          => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $path = $request->file('file')->store("documents/customer_{$id}", 'public');

        $doc = CustomerDocument::create([
            'customer_id'   => $customer->id,
            'document_type' => $request->document_type,
            'file_path'     => $path,
            'uploaded_at'   => now(),
        ]);

        return response()->json(['message' => 'Document uploaded', 'document' => $doc], 201);
    }

    public function getDocuments($id)
    {
        $customer  = Customer::findOrFail($id);
        $documents = $customer->documents()->latest()->get();

        return response()->json($documents);
    }

    public function myProfile(Request $request)
    {
        $customer = $request->user()->customer()->with('documents', 'bookings.vehicle')->first();
        return response()->json($customer);
    }

    public function uploadMyDocument(Request $request)
    {
        $customer = $request->user()->customer;
        
        if (!$customer) {
            return response()->json(['message' => 'Customer profile not found'], 404);
        }

        $request->validate([
            'document_type' => 'required|in:license,national_id',
            'file'          => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $path = $request->file('file')->store("documents/customer_{$customer->id}", 'public');

        $doc = CustomerDocument::create([
            'customer_id'   => $customer->id,
            'document_type' => $request->document_type,
            'file_path'     => $path,
            'uploaded_at'   => now(),
        ]);

        return response()->json(['message' => 'Document uploaded', 'document' => $doc], 201);
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $user = $customer->user;
        
        if ($user) {
            $user->delete(); // This will cascade delete the customer and bookings
        } else {
            $customer->delete();
        }

        return response()->json(['message' => 'Customer removed successfully']);
    }
}
