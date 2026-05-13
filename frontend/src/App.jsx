import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Customer pages
import LoginPage          from './pages/customer/LoginPage';
import RegisterPage       from './pages/customer/RegisterPage';
import ForgotPasswordPage from './pages/customer/ForgotPasswordPage';
import LandingPage        from './pages/customer/LandingPage';
import FleetPage          from './pages/customer/FleetPage';
import VehicleDetailPage  from './pages/customer/VehicleDetailPage';
import MyTripsPage        from './pages/customer/MyTripsPage';
import CheckoutPage       from './pages/customer/CheckoutPage';
import SupportPage        from './pages/customer/SupportPage';
import PaymentSuccessPage from './pages/customer/PaymentSuccessPage';

// Admin pages
import DashboardPage       from './pages/admin/DashboardPage';
import FleetManagementPage from './pages/admin/FleetManagementPage';
import CustomersPage       from './pages/admin/CustomersPage';
import RentalsPage         from './pages/admin/RentalsPage';
import RevenuePage         from './pages/admin/RevenuePage';
import SettingsPage        from './pages/admin/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public Customer Routes ─────────────────────────────── */}
          <Route path="/"                 element={<LandingPage />} />
          <Route path="/login"            element={<LoginPage />} />
          <Route path="/register"         element={<RegisterPage />} />
          <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
          <Route path="/browse"           element={<FleetPage />} />
          <Route path="/browse/:id"       element={<VehicleDetailPage />} />
          <Route path="/support"          element={<SupportPage />} />

          {/* ── Protected Customer Routes ─────────────────────────── */}
          <Route path="/checkout" element={
            <ProtectedRoute roles={['customer', 'admin', 'staff']}>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="/payment-success" element={
            <ProtectedRoute roles={['customer', 'admin', 'staff']}>
              <PaymentSuccessPage />
            </ProtectedRoute>
          } />
          <Route path="/my-trips" element={
            <ProtectedRoute roles={['customer']}>
              <MyTripsPage />
            </ProtectedRoute>
          } />

          {/* ── Protected Admin Routes ────────────────────────────── */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin', 'staff']}>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/fleet" element={
            <ProtectedRoute roles={['admin', 'staff']}>
              <FleetManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedRoute roles={['admin', 'staff']}>
              <CustomersPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/rentals" element={
            <ProtectedRoute roles={['admin', 'staff']}>
              <RentalsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/revenue" element={
            <ProtectedRoute roles={['admin', 'staff']}>
              <RevenuePage />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute roles={['admin']}>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/help" element={<Navigate to="/admin" replace />} />

          {/* ── Fallback ──────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
