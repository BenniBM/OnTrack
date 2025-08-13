import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import GoalPage from "./pages/GoalPage";
import LoginScreen from "./components/LoginScreen";
import "./App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const ProtectedRoutes = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <LoginScreen />;
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Index />} />
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
