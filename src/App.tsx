import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import GoalPage from "./pages/GoalPage";
import "./App.css";
import { useEffect } from "react";
import supabase from "./lib/supabase";

function App() {
    async function getTest() {
        const { data: test } = await supabase.from("test").select();
        console.log(test);
    }

    useEffect(() => {
        getTest();
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/goal/:id" element={<GoalPage />} />
            </Routes>
            <Toaster />
        </Router>
    );
}

export default App;
