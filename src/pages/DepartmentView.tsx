import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { Home, Shield, LogOut, LogIn, UserCircle, Share2, GraduationCap, Calculator, Briefcase, Users, Laptop, TrendingUp, FileText, Building2, BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import logoMain from "@/assets/logo-main.png";

interface Department {
  id: string;
  name: string;
  years_count: number;
  has_preparatory: boolean;
}

const DepartmentView = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { isAdmin } = useIsAdmin(user);

  // Function to get icon based on department name
  const getIconForDepartment = (name: string) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes("محاسب") || lowerName.includes("حساب")) return Calculator;
    if (lowerName.includes("إدار") || lowerName.includes("ادار")) return Briefcase;
    if (lowerName.includes("موارد") || lowerName.includes("بشري")) return Users;
    if (lowerName.includes("هندس") || lowerName.includes("تقني") || lowerName.includes("حاسب")) return Laptop;
    if (lowerName.includes("اقتصاد") || lowerName.includes("مالي")) return TrendingUp;
    if (lowerName.includes("تربي") || lowerName.includes("تعليم")) return GraduationCap;
    if (lowerName.includes("قانون") || lowerName.includes("حقوق")) return FileText;
    if (lowerName.includes("طب") || lowerName.includes("صحة")) return Building2;
    
    return BookOpen;
  };

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
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching departments:", error);
    } else {
      setDepartments(data || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-lg bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2 hover:bg-accent/10"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">الرئيسية</span>
              </Button>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className="gap-2 hover:bg-accent/10"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">لوحة التحكم</span>
                </Button>
              )}
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/profile")}
                  className="gap-2 hover:bg-accent/10"
                >
                  <UserCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">الملف الشخصي</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">تسجيل الخروج</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">تسجيل الدخول</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Logo */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <img 
            src={logoMain} 
            alt="SONS OF TAIBA" 
            className="h-32 sm:h-40 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">
          اختر القسم
        </h1>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => {
            const Icon = getIconForDepartment(department.name);
            return (
              <Card
                key={department.id}
                onClick={() => navigate(`/department/${department.id}/levels`)}
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1 bg-card/80 backdrop-blur-sm relative"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="absolute top-4 right-4 p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="pt-8">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                      {department.name}
                    </CardTitle>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DepartmentView;
