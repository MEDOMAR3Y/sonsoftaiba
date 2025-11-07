import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-card/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-center">
          <button 
            onClick={() => navigate("/")}
            className="group relative transition-all duration-300 hover:scale-105"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent relative">
              SONS OF TAIBA
              <span className="absolute inset-0 bg-gradient-to-r from-primary via-primary-glow to-primary opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></span>
            </h1>
          </button>
        </div>
      </div>
    </header>
  );
};
