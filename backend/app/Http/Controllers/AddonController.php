<?php

namespace App\Http\Controllers;

use App\Models\Addon;
use Illuminate\Http\Request;

class AddonController extends Controller
{
    public function index()
    {
        return response()->json(Addon::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:100',
            'description'   => 'nullable|string',
            'price_per_day' => 'required|numeric|min:0',
        ]);

        $addon = Addon::create($request->only('name', 'description', 'price_per_day'));

        return response()->json(['message' => 'Addon created', 'addon' => $addon], 201);
    }

    public function update(Request $request, $id)
    {
        $addon = Addon::findOrFail($id);

        $request->validate([
            'name'          => 'sometimes|string|max:100',
            'description'   => 'nullable|string',
            'price_per_day' => 'sometimes|numeric|min:0',
        ]);

        $addon->update($request->only('name', 'description', 'price_per_day'));

        return response()->json(['message' => 'Addon updated', 'addon' => $addon]);
    }

    public function destroy($id)
    {
        Addon::findOrFail($id)->delete();
        return response()->json(['message' => 'Addon deleted']);
    }
}
