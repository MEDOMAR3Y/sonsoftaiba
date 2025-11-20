import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";

export const Header = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLogo = mounted && theme === "dark" ? logoDark : logoLight;

  return (
    <header className="w-full bg-card/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-center">
          <button 
            onClick={() => navigate("/")}
            className="group relative transition-all duration-300 hover:scale-105"
          >
            <img 
              src={currentLogo} 
              alt="Sons of Taiba" 
              className="h-12 w-auto transition-opacity duration-300 group-hover:opacity-90"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
