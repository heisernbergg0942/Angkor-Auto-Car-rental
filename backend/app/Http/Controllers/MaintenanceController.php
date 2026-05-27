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
        $maintenance = Maintenance::with('vehicle')->findOrFail($id);

        $request->validate([
            'issue'             => 'sometimes|string',
            'service_date'      => 'sometimes|date',
            'cost'              => 'nullable|numeric|min:0',
            'next_service_date' => 'nullable|date|after_or_equal:service_date',
            'resolved_date'     => 'nullable|date',
            'status'            => 'nullable|in:scheduled,in_progress,completed',
        ]);

        $maintenance->update($request->only('issue', 'service_date', 'cost', 'next_service_date', 'resolved_date', 'status'));

        // When maintenance is marked completed, restore vehicle to available
        if ($request->status === 'completed' && $maintenance->vehicle) {
            $maintenance->vehicle->update(['status' => 'available']);
        }

        return response()->json(['message' => 'Maintenance updated', 'maintenance' => $maintenance->load('vehicle')]);
    }

    public function destroy($id)
    {
        $maintenance = Maintenance::with('vehicle')->findOrFail($id);

        // Restore vehicle to available when a maintenance record is deleted
        if ($maintenance->vehicle && $maintenance->vehicle->status === 'maintenance') {
            // Only restore if no other active maintenance records exist for this vehicle
            $otherActive = Maintenance::where('vehicle_id', $maintenance->vehicle_id)
                ->where('id', '!=', $id)
                ->exists();
            if (!$otherActive) {
                $maintenance->vehicle->update(['status' => 'available']);
            }
        }

        $maintenance->delete();
        return response()->json(['message' => 'Maintenance record deleted and vehicle restored to available']);
    }
}
