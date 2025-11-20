import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RoleManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  currentRoles: string[];
  isCurrentUser: boolean;
  onRolesUpdated: () => void;
}

export const RoleManagementDialog = ({
  open,
  onOpenChange,
  userId,
  userEmail,
  currentRoles,
  isCurrentUser,
  onRolesUpdated,
}: RoleManagementDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState<string>("");

  const allRoles = [
    { value: "admin", label: "مدير", color: "bg-red-500/10 text-red-500 border-red-500/20" },
    { value: "moderator", label: "محرر", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { value: "downloader", label: "محمل", color: "bg-green-500/10 text-green-500 border-green-500/20" },
    { value: "viewer", label: "مشاهد", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
  ];

  const availableRoles = allRoles.filter(role => !currentRoles.includes(role.value));

  const handleAddRole = async (role: string) => {
    if (!role || isCurrentUser) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: role as any });

      if (error) throw error;

      // Log the activity
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("activity_logs").insert({
        user_id: user?.id,
        user_email: user?.email,
        action_type: "change_role",
        target_type: "user",
        target_id: userId,
        target_name: userEmail,
        details: { role: role, action: "added" } as any,
      });

      toast.success("تم إضافة الدور بنجاح");
      setSelectedRoleToAdd("");
      
      // Wait for database to update
      await new Promise(resolve => setTimeout(resolve, 500));
      onRolesUpdated();
    } catch (error: any) {
      console.error("Error adding role:", error);
      toast.error("فشل في إضافة الدور: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (role: string) => {
    if (!role || isCurrentUser) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role as any);

      if (error) throw error;

      // Log the activity
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("activity_logs").insert({
        user_id: user?.id,
        user_email: user?.email,
        action_type: "change_role",
        target_type: "user",
        target_id: userId,
        target_name: userEmail,
        details: { role: role, action: "removed" } as any,
      });

      toast.success("تم إزالة الدور بنجاح");
      
      // Wait for database to update
      await new Promise(resolve => setTimeout(resolve, 500));
      onRolesUpdated();
    } catch (error: any) {
      console.error("Error removing role:", error);
      toast.error("فشل في إزالة الدور: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            إدارة أدوار المستخدم
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
            <p className="font-medium">{userEmail}</p>
          </div>

          {/* Current Roles */}
          <div className="space-y-3">
            <p className="text-sm font-medium">الأدوار الحالية</p>
            {currentRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد أدوار</p>
            ) : (
              <div className="space-y-2">
                {currentRoles.map((role) => {
                  const roleInfo = allRoles.find(r => r.value === role);
                  return (
                    <div
                      key={role}
                      className="flex items-center justify-between p-3 border rounded-lg bg-card"
                    >
                      <Badge variant="outline" className={roleInfo?.color}>
                        {roleInfo?.label || role}
                      </Badge>
                      {!isCurrentUser && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveRole(role)}
                          disabled={loading}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Role */}
          {!isCurrentUser && availableRoles.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">إضافة دور جديد</p>
              <div className="space-y-2">
                {availableRoles.map((role) => (
                  <Button
                    key={role.value}
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => handleAddRole(role.value)}
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4" />
                    {role.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {isCurrentUser && (
            <p className="text-sm text-muted-foreground text-center p-4 bg-muted/50 rounded-lg">
              لا يمكنك تعديل أدوارك الخاصة
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
