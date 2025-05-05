
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { initializeApp } from "@/lib/initialSetup";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Upload from "./pages/Upload";
import ProjectDetail from "./pages/ProjectDetail";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import TechGallery from "./pages/TechGallery";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize the app when it first loads
    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/profile/edit/:username" element={<ProfileEdit />} />
            <Route path="/tech-gallery" element={<TechGallery />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
