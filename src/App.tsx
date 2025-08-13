import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Goals from "./pages/Goals";
import GoalPage from "./pages/GoalPage";
import Reviews from "./pages/Reviews";
import ReviewPage from "./pages/ReviewPage";
import LoginScreen from "./components/LoginScreen";
import "./App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoadingSpinner } from "./components/LoadingSpinner";

const ProtectedRoutes = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <LoginScreen />;
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Goals />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/review" element={<ReviewPage />} />
                <Route path="/review/:id" element={<ReviewPage />} />
                <Route path="/goal/:id" element={<GoalPage />} />
            </Routes>
            <Toaster />
        </Router>
    );
};

function App() {
    return (
        <AuthProvider>
            <ProtectedRoutes />
        </AuthProvider>
    );
}

export default App;
