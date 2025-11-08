import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Loader2, Trash2, FolderOpen, Upload, Plus, Home, Shield, LogOut, UserCircle, AlertCircle, Users, Edit } from "lucide-react";
import logoMain from "@/assets/logo-main.png";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Check authentication and admin status
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      setSession(session);
      setUser(session.user);

      // Check admin status
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Error checking admin:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }
      
      setInitializing(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      
      setSession(session);
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin === true) {
      fetchCategories();
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("list-users");

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("فشل في تحميل المستخدمين");
        return;
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("فشل في تحميل المستخدمين");
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("فشل في تحميل الفئات");
    } else {
      setCategories(data || []);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("يرجى إدخال اسم الفئة");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("categories")
      .insert([{ name: categoryName, description: categoryDescription }]);

    if (error) {
      toast.error("فشل في إنشاء الفئة");
    } else {
      toast.success("تم إنشاء الفئة بنجاح");
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

    // Delete all files in this category first
    const { data: files } = await supabase
      .from("files")
      .select("file_path")
      .eq("category_id", categoryId);

    if (files) {
      for (const file of files) {
        await supabase.storage.from("files").remove([file.file_path]);
      }
    }

    // Delete file records
    await supabase.from("files").delete().eq("category_id", categoryId);

    // Delete category
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      toast.error("فشل في حذف الفئة");
    } else {
      toast.success("تم حذف الفئة بنجاح");
      fetchCategories();
    }
    setLoading(false);
  };

  const handleUpdateUserRole = async (userId: string, newRole: string | null) => {
    if (!userId) return;

    try {
      if (newRole === null) {
        // Remove role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId);

        if (error) throw error;
        toast.success("تم إزالة الدور بنجاح");
      } else {
        // Check if user already has a role
        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (existingRole) {
          // Update existing role
          const { error } = await supabase
            .from("user_roles")
            .update({ role: newRole as "admin" })
            .eq("user_id", userId);

          if (error) throw error;
        } else {
          // Insert new role
          const { error } = await supabase
            .from("user_roles")
            .insert([{ user_id: userId, role: newRole as "admin" }]);

          if (error) throw error;
        }
        
        toast.success("تم تحديث الدور بنجاح");
      }

      fetchUsers();
    } catch (error: any) {
      toast.error("فشل في تحديث الدور");
      console.error(error);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile || !selectedCategoryId) {
      toast.error("يرجى اختيار ملف وفئة");
      return;
    }

    setLoading(true);

    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${selectedCategoryId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("files")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("files").insert([
        {
          name: selectedFile.name,
          file_path: filePath,
          category_id: selectedCategoryId,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
        },
      ]);

      if (dbError) throw dbError;

      toast.success("تم رفع الملف بنجاح");
      setSelectedFile(null);
      setSelectedCategoryId("");
    } catch (error: any) {
      toast.error("فشل في رفع الملف");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Show loading while checking authentication
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show unauthorized message if not admin
  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-2">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">غير مصرح</CardTitle>
            <CardDescription>ليس لديك صلاحية للوصول إلى لوحة التحكم</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => navigate("/")} className="w-full">
              العودة إلى الصفحة الرئيسية
            </Button>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              تسجيل الخروج
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                className="gap-2 hover:bg-accent/10"
              >
                <UserCircle className="h-4 w-4" />
                <span className="hidden sm:inline">الملف الشخصي</span>
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
            alt="SONS OF TAIBA Admin" 
            className="h-24 sm:h-32 w-auto object-contain drop-shadow-2xl"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Create Category Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                إنشاء فئة جديدة
              </CardTitle>
              <CardDescription>أضف فئة جديدة لتنظيم الملفات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder="اسم الفئة"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
              <div>
                <Input
                  placeholder="الوصف (اختياري)"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                />
              </div>
              <Button
                onClick={handleCreateCategory}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  "إنشاء الفئة"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Upload File Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                رفع ملف جديد
              </CardTitle>
              <CardDescription>ارفع ملف إلى إحدى الفئات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                  <option value="">اختر الفئة</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
              <Button
                onClick={handleUploadFile}
                disabled={loading || !selectedFile || !selectedCategoryId}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  "رفع الملف"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Categories List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">الفئات الحالية</h2>
          {categories.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">لا توجد فئات حالياً. ابدأ بإنشاء فئة جديدة.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    {category.description && (
                      <CardDescription>{category.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/category/${category.id}`)}
                      className="w-full gap-2"
                    >
                      <FolderOpen className="h-4 w-4" />
                      عرض الملفات
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={loading}
                      className="w-full gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف الفئة
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Users Management */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="h-6 w-6" />
            إدارة المستخدمين
          </h2>
          {users.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">لا يوجد مستخدمين حالياً.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-right p-4 font-semibold">البريد الإلكتروني</th>
                        <th className="text-right p-4 font-semibold">تاريخ الإنشاء</th>
                        <th className="text-right p-4 font-semibold">الدور</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userItem) => (
                        <tr key={userItem.id} className="border-b border-border hover:bg-muted/50">
                          <td className="p-4">
                            {userItem.email}
                            {userItem.id === user?.id && (
                              <span className="mr-2 text-xs text-muted-foreground">(أنت)</span>
                            )}
                          </td>
                          <td className="p-4">
                            {new Date(userItem.created_at).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="p-4">
                            <select
                              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm min-w-[140px]"
                              value={userItem.role || ""}
                              onChange={(e) => handleUpdateUserRole(userItem.id, e.target.value || null)}
                              disabled={userItem.id === user?.id}
                            >
                              <option value="">بدون دور</option>
                              <option value="admin">مدير</option>
                              <option value="moderator">معدل</option>
                              <option value="viewer">مشاهد</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
