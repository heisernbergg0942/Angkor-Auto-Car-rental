<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    /**
     * List all users (admin only).
     */
    public function index(Request $request)
    {
        $users = User::with('customer')
            ->when($request->role, fn($q) => $q->where('role', $request->role))
            ->when($request->search, fn($q) => $q->where(fn($sub) => $sub->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%")))
            ->latest()
            ->paginate(15);

        return response()->json($users);
    }

    /**
     * Show a single user.
     */
    public function show($id)
    {
        $user = User::with('customer.bookings.vehicle')->findOrFail($id);
        return response()->json($user);
    }

    /**
     * Create a new staff/admin user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => ['required', Rules\Password::defaults()],
            'role'     => 'required|in:admin,staff,customer',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ]);

        return response()->json(['message' => 'User created', 'user' => $user], 201);
    }

    /**
     * Update user details.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:users,email,' . $id,
            'role'     => 'sometimes|in:admin,staff,customer',
            'password' => ['sometimes', Rules\Password::defaults()],
        ]);

        $data = $request->only('name', 'email', 'role');
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json(['message' => 'User updated', 'user' => $user]);
    }

    /**
     * Delete a user.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Prevent self-deletion
        if (auth()->id() === $user->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }
}
