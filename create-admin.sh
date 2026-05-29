
#!/usr/bin/env bash

set -euo pipefail

# ---------- defaults ----------
DEFAULT_EMAIL="admin@angkorauto.com"
DEFAULT_NAME="Admin"
DEFAULT_PASSWORD="tong12@gmail"
DEFAULT_ROLE="admin"

# ---------- arguments ----------
EMAIL="${1:-$DEFAULT_EMAIL}"
NAME="${2:-$DEFAULT_NAME}"
PASSWORD="${3:-$DEFAULT_PASSWORD}"
ROLE="${4:-$DEFAULT_ROLE}"

CONTAINER="angkor_app"

# ---------- container check ----------
if ! docker ps --format "{{.Names}}" | grep -q "^${CONTAINER}$"; then
  echo "❌ Error: Docker container '${CONTAINER}' is not running."
  exit 1
fi

echo "Creating/updating admin user..."

docker exec \
  -e ADMIN_EMAIL="$EMAIL" \
  -e ADMIN_NAME="$NAME" \
  -e ADMIN_PASSWORD="$PASSWORD" \
  -e ADMIN_ROLE="$ROLE" \
  -i "$CONTAINER" \
  php artisan tinker --execute='
use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = getenv("ADMIN_EMAIL");
$name = getenv("ADMIN_NAME");
$password = getenv("ADMIN_PASSWORD");
$role = getenv("ADMIN_ROLE");

$user = User::where("email", $email)->first();

if ($user) {
    echo "User exists. Updating...\n";

    $user->name = $name;
    $user->password = Hash::make($password);
    $user->role = $role;
    $user->save();

    echo "Updated admin user ID: {$user->id}\n";
} else {
    $user = User::create([
        "name" => $name,
        "email" => $email,
        "password" => Hash::make($password),
        "role" => $role,
    ]);

    echo "Created admin user ID: {$user->id}\n";
}
'

