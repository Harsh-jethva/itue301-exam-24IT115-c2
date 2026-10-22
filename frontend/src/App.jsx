import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import FleetPage from "./pages/FleetPage";
import MyBookingsPage from "./pages/MyBookingsPage";

// Lazy-loaded AdminPanel using React.lazy (Exam Section 9)
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          {/* Global Navigation bar (Exam Section 5) */}
          <Navigation />

          <main className="main-content">
            <Routes>
              {/* Public route: LoginPage */}
              <Route path="/" element={<LoginPage />} />

              {/* Protected route: FleetPage (Exam Section 4 & 7) */}
              <Route
                path="/fleet"
                element={
                  <ProtectedRoute>
                    <FleetPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected route: MyBookingsPage (Exam Section 4 & 7) */}
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Lazy-loaded route wrapped in React Suspense (Exam Section 9) */}
              <Route
                path="/admin"
                element={
                  <Suspense
                    fallback={
                      <div className="suspense-loading">
                        <div className="spinner"></div>
                        <p>Loading Admin Panel...</p>
                      </div>
                    }
                  >
                    <AdminPanel />
                  </Suspense>
                }
              />
            </Routes>
          </main>

          <footer className="footer">
            <p>© 2026 DriveEasy Car Rental System • ITUE301 Advanced Web Development Frameworks</p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
