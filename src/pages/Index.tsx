import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/CategoryCard";
import { User, Session } from "@supabase/supabase-js";
import logoMain from "@/assets/logo-main.png";
import { Home, Shield, LogOut, LogIn } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import Footer from "@/components/Footer";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface FileCount {
  category_id: string;
  count: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [fileCounts, setFileCounts] = useState<Record<string, number>>({});
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { isAdmin } = useIsAdmin(user);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchFileCounts();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data || []);
    }
  };

  const fetchFileCounts = async () => {
    const { data, error } = await supabase
      .from("files")
      .select("category_id");

    if (error) {
      console.error("Error fetching file counts:", error);
    } else {
      const counts: Record<string, number> = {};
      data?.forEach((file) => {
        counts[file.category_id] = (counts[file.category_id] || 0) + 1;
      });
      setFileCounts(counts);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-lg bg-background/80">
...
      </nav>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
...
      </div>

      <Footer />
    </div>
  );
};

export default Index;
