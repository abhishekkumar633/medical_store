import { Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { useAuth } from "./lib/auth";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import Companies from "./pages/Companies";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MedicineDetails from "./pages/MedicineDetails";
import OfferPage from "./pages/Offers";
import OrderDetails from "./pages/OrderDetails";
import Orders from "./pages/Orders";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/40 via-white to-fuchsia-50/30">
      <Navbar />
      <div className="min-h-[calc(100vh-64px)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/medicines/:id" element={<MedicineDetails />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/offers" element={<OfferPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <AdminGuard>
                <Admin />
              </AdminGuard>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

