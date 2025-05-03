
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container flex items-center justify-center py-32">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-6">Oops! Page not found</p>
          <Link to="/" className="text-primary hover:underline transition-all">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
