import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, FolderOpen, Upload, Plus, Home, Shield, LogOut } from "lucide-react";
import logoMain from "@/assets/logo-main.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface Category {
  id: string;
  name: string;
  description?: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { isAdmin, loading: adminLoading } = useIsAdmin(user);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!adminLoading && user && !isAdmin) {
      toast({
        title: "غير مصرح",
        description: "ليس لديك صلاحية للوصول إلى لوحة التحكم",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, isAdmin, adminLoading, navigate, toast]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchCategories();
    }
  }, [user, isAdmin]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل الفئات",
        variant: "destructive",
      });
    } else {
      setCategories(data || []);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast({
        title: "تنبيه",
        description: "يرجى إدخال اسم الفئة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("categories")
      .insert([{ name: categoryName, description: categoryDescription }]);

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء الفئة",
        variant: "destructive",
      });
    } else {
      toast({
        title: "نجح",
        description: "تم إنشاء الفئة بنجاح",
      });
      setCategoryName("");
      setCategoryDescription("");
      fetchCategories();
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفئة؟ سيتم حذف جميع الملفات المرتبطة بها.")) {
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف الفئة",
        variant: "destructive",
      });
    } else {
      toast({
        title: "نجح",
        description: "تم حذف الفئة بنجاح",
      });
      fetchCategories();
    }
    setLoading(false);
  };

  const handleUploadFile = async () => {
    if (!selectedFile || !selectedCategoryId) {
      toast({
        title: "تنبيه",
        description: "يرجى اختيار ملف وفئة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const fileExt = selectedFile.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${selectedCategoryId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("files")
      .upload(filePath, selectedFile);

    if (uploadError) {
      toast({
        title: "خطأ",
        description: "فشل في رفع الملف",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase
      .from("files")
      .insert([{
        name: selectedFile.name,
        file_path: filePath,
        category_id: selectedCategoryId,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
      }]);

    if (dbError) {
      toast({
        title: "خطأ",
        description: "فشل في حفظ معلومات الملف",
        variant: "destructive",
      });
    } else {
      toast({
        title: "نجح",
        description: "تم رفع الملف بنجاح",
      });
      setSelectedFile(null);
      setSelectedCategoryId("");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin")}
                className="gap-2 bg-accent/10"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">لوحة التحكم</span>
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Logo */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <img 
            src={logoMain} 
            alt="SONS OF TAIBA" 
            className="h-32 sm:h-40 w-auto object-contain drop-shadow-2xl"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Create Category Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                إنشاء فئة جديدة
              </CardTitle>
              <CardDescription>أضف فئة جديدة لتنظيم ملفاتك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="اسم الفئة"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
              <Input
                placeholder="الوصف (اختياري)"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
              />
              <Button
                onClick={handleCreateCategory}
                disabled={loading}
                className="w-full"
              >
                {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                إنشاء فئة
              </Button>
            </CardContent>
          </Card>

          {/* Upload File Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                رفع ملف جديد
              </CardTitle>
              <CardDescription>اختر فئة وملف للرفع</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                <option value="">اختر فئة</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <Input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <Button
                onClick={handleUploadFile}
                disabled={loading}
                className="w-full"
              >
                {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                رفع ملف
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Categories List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>الفئات الموجودة</CardTitle>
            <CardDescription>إدارة جميع الفئات</CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد فئات</p>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/category/${category.id}`)}
                      >
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;