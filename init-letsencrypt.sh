#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# init-letsencrypt.sh — Bootstrap Let's Encrypt SSL Certificates with Docker
# Run this script ON your DigitalOcean Droplet once to set up SSL.
# ─────────────────────────────────────────────────────────────────────────────

set -e

domains=(angkorauto.work www.angkorauto.work)
rsa_key_size=4096
data_path="./certs"
email="suytonglleng@gmail.com" # Handled automatically from git profile
staging=0 # Set to 1 to test certificate generation without rate limits

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed on this system. Install Docker before running this script."
    exit 1
fi

if [ -d "$data_path" ]; then
    echo "⚠️  Existing certificate data found in $data_path."
    read -p "Do you want to overwrite and replace existing certificates? (y/N) " decision
    if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
        echo "🚪 Exiting without modifications."
        exit 0
    fi
fi

if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
    echo "📥 Downloading recommended TLS parameters..."
    mkdir -p "$data_path/conf"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
fi

echo "🔑 Creating temporary self-signed dummy certificate for ${domains[0]}..."
mkdir -p "$data_path/live/${domains[0]}"
openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1 \
    -keyout "$data_path/live/${domains[0]}/privkey.pem" \
    -out "$data_path/live/${domains[0]}/fullchain.pem" \
    -subj "/CN=localhost"

echo "🐳 Starting Edge Nginx to serve Let's Encrypt challenge path..."
docker compose up --force-recreate -d nginx

echo "❌ Deleting temporary dummy certificate..."
docker compose run --rm --entrypoint "\
    rm -Rf /etc/letsencrypt/live/${domains[0]} && \
    rm -Rf /etc/letsencrypt/archive/${domains[0]} && \
    rm -Rf /etc/letsencrypt/renewal/${domains[0]}.conf" certbot

echo "📥 Requesting official Let's Encrypt certificate for ${domains[@]}..."
domain_args=""
for domain in "${domains[@]}"; do
    domain_args="$domain_args -d $domain"
done

email_arg="--register-unsafely-without-email"
if [ -n "$email" ]; then
    email_arg="--email $email --no-eff-email"
fi

staging_arg=""
if [ $staging -ne 0 ]; then
    staging_arg="--staging"
fi

docker compose run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
        $staging_arg \
        $email_arg \
        $domain_args \
        --rsa-key-size $rsa_key_size \
        --agree-tos \
        --force-renewal" certbot

echo "⚡ Reloading Nginx to load the official Let's Encrypt certificates..."
docker compose exec nginx nginx -s reload

echo "✅ SSL Certificates successfully set up! Your application is now live at: https://${domains[0]}"
