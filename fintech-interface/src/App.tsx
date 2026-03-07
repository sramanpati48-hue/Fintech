import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import DashboardLayout from "./components/layout/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import SendMoneyPage from "./pages/SendMoneyPage";
import QRScannerPage from "./pages/QRScannerPage";
import ConvertPage from "./pages/ConvertPage";
import ProfilePage from "./pages/ProfilePage";
import CardsPage from "./pages/CardsPage";
import NotificationsPage from "./pages/NotificationsPage";
import TransactionsPage from "./pages/TransactionsPage";
import CryptoPage from "./pages/CryptoPage";
import SavingsGoalsPage from "./pages/SavingsGoalsPage";
import BillPaymentsPage from "./pages/BillPaymentsPage";
import RewardsPage from "./pages/RewardsPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import CreateProfilePage from "./pages/CreateProfilePage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <ToastProvider>
      <Router>
        <Routes>
          {/* Landing Page — standalone layout */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-profile" element={<CreateProfilePage />} />

          {/* App Pages — sidebar dashboard layout */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/send" element={<SendMoneyPage />} />
            <Route path="/scanner" element={<QRScannerPage />} />
            <Route path="/convert" element={<ConvertPage />} />
            <Route path="/cards" element={<CardsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/crypto" element={<CryptoPage />} />
            <Route path="/savings" element={<SavingsGoalsPage />} />
            <Route path="/bills" element={<BillPaymentsPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<ProfilePage />} />
          </Route>

          {/* Catch-all — redirect unknown routes to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
