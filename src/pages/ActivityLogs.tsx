import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Activity } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  target_type: string | null;
  target_id: string | null;
  target_name: string | null;
  details: any;
  created_at: string;
  user_email?: string;
}

const ActivityLogs = () => {
  const [user, setUser] = useState<User | null>(null);
  const { isAdmin, loading: adminLoading } = useIsAdmin(user);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        navigate("/auth");
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
    }
  }, [isAdmin]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch user emails for each log
      const logsWithEmails = await Promise.all(
        (data || []).map(async (log) => {
          const { data: userData } = await supabase.auth.admin.getUserById(
            log.user_id
          );
          return {
            ...log,
            user_email: userData?.user?.email || "غير معروف",
          };
        })
      );

      setLogs(logsWithEmails);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      upload: "رفع ملف",
      download: "تحميل ملف",
      delete: "حذف ملف",
      create_category: "إنشاء فئة",
      edit_category: "تعديل فئة",
      delete_category: "حذف فئة",
      change_role: "تغيير دور",
      delete_user: "حذف مستخدم",
    };
    return labels[actionType] || actionType;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">غير مصرح لك بالوصول لهذه الصفحة</div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />

      <nav className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center" dir="rtl">
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              الرئيسية
            </Button>
            <Button variant="ghost" onClick={() => navigate("/admin")}>
              لوحة التحكم
            </Button>
            <Button variant="ghost" onClick={() => navigate("/profile")}>
              الملف الشخصي
            </Button>
          </div>
          <Button onClick={handleLogout} variant="outline">
            تسجيل الخروج
          </Button>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">سجل النشاطات</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>آخر 100 نشاط</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                لا توجد نشاطات مسجلة
              </p>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-lg">
                          {getActionLabel(log.action_type)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          المستخدم: {log.user_email}
                        </div>
                        {log.target_name && (
                          <div className="text-sm text-muted-foreground">
                            الهدف: {log.target_name}
                          </div>
                        )}
                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className="text-sm text-muted-foreground mt-1">
                            تفاصيل: {JSON.stringify(log.details, null, 2)}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap mr-4">
                        {formatDate(log.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default ActivityLogs;
