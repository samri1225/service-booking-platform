import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout & auth
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';

// Customer pages
import Dashboard from './components/Dashboard';
import ServiceListings from './components/ServiceListings';
import ServiceDetails from './components/ServiceDetails';
import MyBookings from './components/MyBookings';
import BookingDetails from './components/BookingDetails';

// Provider pages
import ProviderDashboard from './components/ProviderDashboard';
import ProviderServices from './components/ProviderServices';
import ProviderBookings from './components/ProviderBookings';
import ProviderAvailability from './components/ProviderAvailability';

// Admin pages
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/AdminUsers';
import AdminBookings from './components/AdminBookings';
import AdminProviderApprovals from './components/AdminProviderApprovals';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/services" element={<ServiceListings />} />
        <Route path="/services/:id" element={<ServiceDetails />} />
        <Route
          path="/my-bookings"
          element={
            <PrivateRoute>
              <MyBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <PrivateRoute>
              <BookingDetails />
            </PrivateRoute>
          }
        />

        {/* Provider */}
        <Route
          path="/provider/dashboard"
          element={
            <PrivateRoute>
              <ProviderDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/provider/services"
          element={
            <PrivateRoute>
              <ProviderServices />
            </PrivateRoute>
          }
        />
        <Route
          path="/provider/bookings"
          element={
            <PrivateRoute>
              <ProviderBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/provider/availability"
          element={
            <PrivateRoute>
              <ProviderAvailability />
            </PrivateRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <AdminUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <PrivateRoute>
              <AdminBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/providers"
          element={
            <PrivateRoute>
              <AdminProviderApprovals />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;