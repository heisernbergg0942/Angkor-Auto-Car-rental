<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $records = Maintenance::with('vehicle')
            ->when($request->vehicle_id, fn($q) => $q->where('vehicle_id', $request->vehicle_id))
            ->latest('service_date')
            ->paginate(15);

        return response()->json($records);
    }

    public function store(Request $request)
    {
        $request->validate([
            'vehicle_id'        => 'required|exists:vehicles,id',
            'issue'             => 'required|string',
            'service_date'      => 'required|date',
            'cost'              => 'nullable|numeric|min:0',
            'next_service_date' => 'nullable|date|after:service_date',
        ]);

        $maintenance = Maintenance::create($request->only(
            'vehicle_id', 'issue', 'service_date', 'cost', 'next_service_date'
        ));

        // Mark vehicle as under maintenance
        Vehicle::findOrFail($request->vehicle_id)->update(['status' => 'maintenance']);

        return response()->json(['message' => 'Maintenance record created', 'maintenance' => $maintenance->load('vehicle')], 201);
    }

    public function update(Request $request, $id)
    {
        $maintenance = Maintenance::findOrFail($id);

        $request->validate([
            'issue'             => 'sometimes|string',
            'service_date'      => 'sometimes|date',
            'cost'              => 'nullable|numeric|min:0',
            'next_service_date' => 'nullable|date',
        ]);

        $maintenance->update($request->only('issue', 'service_date', 'cost', 'next_service_date'));

        return response()->json(['message' => 'Maintenance updated', 'maintenance' => $maintenance]);
    }

    public function destroy($id)
    {
        Maintenance::findOrFail($id)->delete();
        return response()->json(['message' => 'Maintenance record deleted']);
    }
}
