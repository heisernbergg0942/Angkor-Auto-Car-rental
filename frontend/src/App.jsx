import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Customer pages
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import ForgotPasswordPage from './pages/customer/ForgotPasswordPage';
import LandingPage from './pages/customer/LandingPage';
import FleetPage from './pages/customer/FleetPage';
import VehicleDetailPage from './pages/customer/VehicleDetailPage';
import MyTripsPage from './pages/customer/MyTripsPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import SupportPage from './pages/customer/SupportPage';

// Admin pages
import DashboardPage from './pages/admin/DashboardPage';
import FleetManagementPage from './pages/admin/FleetManagementPage';
import CustomersPage from './pages/admin/CustomersPage';
import RentalsPage from './pages/admin/RentalsPage';
import RevenuePage from './pages/admin/RevenuePage';
import SettingsPage from './pages/admin/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Portal */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/browse" element={<FleetPage />} />
        <Route path="/browse/:id" element={<VehicleDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/my-trips" element={<MyTripsPage />} />

        {/* Admin Portal */}
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/fleet" element={<FleetManagementPage />} />
        <Route path="/admin/customers" element={<CustomersPage />} />
        <Route path="/admin/rentals" element={<RentalsPage />} />
        <Route path="/admin/revenue" element={<RevenuePage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/admin/help" element={<Navigate to="/admin" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
