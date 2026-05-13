<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\VehicleAvailability;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $vehicles = Vehicle::query()
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->brand,  fn($q) => $q->where('brand', 'like', "%{$request->brand}%"))
            ->when($request->search, fn($q) => $q->where('brand', 'like', "%{$request->search}%")
                ->orWhere('model', 'like', "%{$request->search}%")
                ->orWhere('plate_number', 'like', "%{$request->search}%"))
            ->paginate(12);

        return response()->json($vehicles);
    }

    public function show($id)
    {
        $vehicle = Vehicle::with('availability', 'maintenance')->findOrFail($id);
        return response()->json($vehicle);
    }

    public function store(Request $request)
    {
        $request->validate([
            'plate_number' => 'required|string|unique:vehicles',
            'brand'        => 'required|string|max:100',
            'model'        => 'required|string|max:100',
            'year'         => 'required|integer|min:1990|max:' . (date('Y') + 1),
            'color'        => 'nullable|string|max:50',
            'daily_rate'   => 'required|numeric|min:0',
            'status'       => 'nullable|in:available,booked,rented,maintenance',
            'description'  => 'nullable|string',
            'image'        => 'nullable|image|max:5120',
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('vehicles', 'public');
        }

        $vehicle = Vehicle::create($data);

        return response()->json(['message' => 'Vehicle created', 'vehicle' => $vehicle], 201);
    }

    public function update(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);

        $request->validate([
            'plate_number' => 'sometimes|string|unique:vehicles,plate_number,' . $id,
            'brand'        => 'sometimes|string|max:100',
            'model'        => 'sometimes|string|max:100',
            'year'         => 'sometimes|integer|min:1990|max:' . (date('Y') + 1),
            'color'        => 'nullable|string|max:50',
            'daily_rate'   => 'sometimes|numeric|min:0',
            'status'       => 'nullable|in:available,booked,rented,maintenance',
            'description'  => 'nullable|string',
            'image'        => 'nullable|image|max:5120',
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('vehicles', 'public');
        }

        $vehicle->update($data);

        return response()->json(['message' => 'Vehicle updated', 'vehicle' => $vehicle]);
    }

    public function destroy($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->delete();

        return response()->json(['message' => 'Vehicle deleted']);
    }

    public function availability($id)
    {
        $vehicle      = Vehicle::findOrFail($id);
        $availability = $vehicle->availability()->orderBy('start_date')->get();

        return response()->json(['vehicle' => $vehicle, 'availability' => $availability]);
    }

    public function storeAvailability(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);

        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'status'     => 'required|in:available,reserved,booked,maintenance',
        ]);

        $avail = $vehicle->availability()->create($request->only('start_date', 'end_date', 'status'));

        return response()->json(['message' => 'Availability set', 'availability' => $avail], 201);
    }
}
