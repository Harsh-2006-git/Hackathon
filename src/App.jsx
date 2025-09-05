import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Auth from "./pages/auth";
import Home from "./pages/index1";
import LostAndFound from "./pages/LostAndFound";
import LiveDarshan from "./pages/LiveDarshan";
import ProtectedRoute from "./components/PrivateRoute";
import ProfilePage from "./pages/profile";
import Ticket from "./pages/ticket";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="app">
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auth"
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <Auth setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        <Route path="*" element={<Navigate to="/auth" />} />
        <Route path="/live-darshan" element={<LiveDarshan />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/lostFound" element={<LostAndFound />} />
        <Route path="/ticket" element={<Ticket />} />
      </Routes>
    </div>
  );
}

export default App;
