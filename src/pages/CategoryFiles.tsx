import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileItem } from "@/components/FileItem";
import { Footer } from "@/components/Footer";
import { ArrowRight, Download, Share2, Home, Shield, LogOut, LogIn } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { User } from "@supabase/supabase-js";
import logoMain from "@/assets/logo-main.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface File {
  id: string;
  name: string;
  file_path: string;
  file_size?: number;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
}

interface ParentCategory {
  name: string;
}

const CategoryFiles = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<ParentCategory | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const { isAdmin } = useIsAdmin(user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
      fetchFiles();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", categoryId)
      .maybeSingle();

    if (error) {
      toast.error("حدث خطأ في جلب الفئة");
      return;
    }

    setCategory(data);

    // Fetch parent category if exists
    if (data?.parent_id) {
      const { data: parentData } = await supabase
        .from("categories")
        .select("name")
        .eq("id", data.parent_id)
        .maybeSingle();

      if (parentData) {
        setParentCategory(parentData);
      }
    }
  };

  const fetchFiles = async () => {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("حدث خطأ في جلب الملفات");
      return;
    }

    setFiles(data || []);
  };

  const handleDownloadAll = async () => {
    if (files.length === 0) {
      toast.error("لا توجد ملفات للتحميل");
      return;
    }

    toast.info("جاري إنشاء الملف المضغوط...");

    try {
      const zip = new JSZip();

      for (const file of files) {
        const { data, error } = await supabase.storage
          .from('files')
          .download(file.file_path);

        if (error) throw error;

        zip.file(file.name, data);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${category?.name || 'files'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("تم تحميل الملف المضغوط");
    } catch (error) {
      console.error('Error creating zip:', error);
      toast.error("حدث خطأ في إنشاء الملف المضغوط");
    }
  };

  const handleShareCategory = () => {
    const categoryUrl = window.location.href;
    navigator.clipboard.writeText(categoryUrl);
    toast.success('تم نسخ رابط الفئة');
  };

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={logoMain} 
            alt="SONS OF TAIBA" 
            className="h-32 sm:h-40 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Category Header */}
        {category && (
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              {parentCategory && (
                <>
                  <span className="text-muted-foreground">{parentCategory.name}</span>
                  <span className="mx-2">/</span>
                </>
              )}
              {category.name}
            </h1>
            {category.description && (
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {category.description}
              </p>
            )}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {files.length} {files.length === 1 ? 'ملف' : 'ملفات'}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")} 
            className="gap-2 hover:bg-accent/10"
          >
            <ArrowRight className="w-4 h-4" />
            العودة
          </Button>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleShareCategory} 
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">مشاركة</span>
            </Button>
            {files.length > 0 && (
              <Button 
                onClick={handleDownloadAll} 
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">تحميل الكل</span>
              </Button>
            )}
          </div>
        </div>

        {/* Files List */}
        <div className="space-y-4">
          {files.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                <Download className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">لا توجد ملفات في هذه الفئة</p>
            </div>
          ) : (
            files.map((file) => (
              <FileItem
                key={file.id}
                id={file.id}
                name={file.name}
                filePath={file.file_path}
                fileSize={file.file_size}
                isAdmin={isAdmin}
                onDelete={fetchFiles}
              />
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryFiles;