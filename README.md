<div align="center">

  <img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20Logo%20Vertical/1%20Full%20Color/laravel-logo-vertical-full-color.svg" width="120" alt="Angkor Auto Logo">

  # 🚗 Angkor Auto Car Rental

  A comprehensive, full-stack car rental management system and booking platform. Built with a headless Laravel API and a high-performance React frontend.

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Stripe](https://img.shields.io/badge/Stripe-625B98?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

</div>

---

## 🌟 Key Features

* **Interactive Customer Portal:** Browse available fleets, filter by vehicle type, and book cars seamlessly.
* **Robust Admin Dashboard:** Full fleet management, real-time customer tracking, and visual revenue analytics.
* **Secure Payments:** Integrated with Stripe for automated, reliable payment processing.
* **Separation of Concerns:** Clean, headless API backend combined with a fast, modern SPA frontend.

---

## 🛠️ Architecture & Tech Stack

### Frontend (`./frontend`)
* **Framework:** React (via Vite)
* **Styling:** Tailwind CSS (Utility-first, responsive interface)
* **State/Routing:** React Router DOM & Context API

### Backend (`./backend`)
* **Framework:** Laravel (Headless REST API)
* **Database:** PostgreSQL
* **Payments:** Stripe API Integration

---

## 🚀 Complete Local Setup Guide

Follow these steps to get both the backend API and frontend interface running locally on your machine.

### Prerequisites
Make sure you have Node.js, PHP (>= 8.2), Composer, and PostgreSQL installed.

---

### 1. Frontend Installation & Setup
```bash
# 1. Navigate to frontend directory

cd frontend

### 2. frontend Installation & Setup

npm run dev

Open your terminal and navigate to the backend folder to set up the Laravel API:

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install PHP dependencies
composer install or composer update (for diffrent version of php)

# 3. Create your environment configuration file
cp .env.example .env

# 4. Generate application key
php artisan key:generate

# 5. Run database migrations and seeders
php artisan migrate

# 6. Start the local API server
php artisan serve