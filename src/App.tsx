import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import CategoryFiles from "./pages/CategoryFiles";
import DepartmentView from "./pages/DepartmentView";
import LevelView from "./pages/LevelView";
import SemesterView from "./pages/SemesterView";
import SemesterCategories from "./pages/SemesterCategories";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
// Force types refresh

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DepartmentView />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/department/:departmentId/levels" element={<LevelView />} />
            <Route path="/level/:levelId/semesters" element={<SemesterView />} />
            <Route path="/semester/:semesterId/categories" element={<SemesterCategories />} />
            <Route path="/category/:categoryId" element={<CategoryFiles />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
