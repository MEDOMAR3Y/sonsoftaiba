import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { Home, Shield, LogOut, LogIn, UserCircle, ArrowRight, Calendar, Share2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import logoMain from "@/assets/logo-main.png";

interface Semester {
  id: string;
  name: string;
  semester_number: number;
}

interface AcademicLevel {
  id: string;
  name: string;
}

const SemesterView = () => {
  const navigate = useNavigate();
  const { levelId } = useParams();
  const [level, setLevel] = useState<AcademicLevel | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
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
    if (levelId) {
      fetchLevel();
      fetchSemesters();
    }
  }, [levelId]);

  const fetchLevel = async () => {
    const { data, error } = await supabase
      .from("academic_levels")
      .select("*")
      .eq("id", levelId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching level:", error);
    } else {
      setLevel(data);
    }
  };

  const fetchSemesters = async () => {
    const { data, error } = await supabase
      .from("semesters")
      .select("*")
      .eq("academic_level_id", levelId)
      .order("semester_number");

    if (error) {
      console.error("Error fetching semesters:", error);
    } else {
      setSemesters(data || []);
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

        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            رجوع
          </Button>
          
          <Button 
            variant="default"
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              toast.success('تم نسخ رابط الترمات');
            }}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            مشاركة
          </Button>
        </div>

        {level && (
          <h1 className="text-3xl font-bold text-center mb-8">{level.name}</h1>
        )}

        {/* Semesters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {semesters.map((semester) => (
            <Card
              key={semester.id}
              onClick={() => navigate(`/semester/${semester.id}/categories`)}
              className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1 bg-card/80 backdrop-blur-sm relative"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{semester.semester_number}</span>
                  </div>
                </div>
                <div className="pt-8">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                    {semester.name}
                  </CardTitle>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SemesterView;
