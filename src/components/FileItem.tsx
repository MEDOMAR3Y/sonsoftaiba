import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Trash2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FilePreview } from "./FilePreview";

interface FileItemProps {
  id: string;
  name: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  isAdmin: boolean;
  onDelete?: () => void;
}

export const FileItem = ({ id, name, filePath, fileSize, mimeType, isAdmin, onDelete }: FileItemProps) => {
  const [showPreview, setShowPreview] = useState(false);
  
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('تم تحميل الملف بنجاح');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('حدث خطأ في تحميل الملف');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الملف؟')) return;

    try {
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      toast.success('تم حذف الملف بنجاح');
      onDelete?.();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('حدث خطأ في حذف الملف');
    }
  };

  const canPreview = mimeType?.startsWith('image/') || mimeType === 'application/pdf';

  return (
    <>
      <FilePreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        fileName={name}
        filePath={filePath}
        mimeType={mimeType}
      />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all gap-3">
      <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{name}</p>
          {fileSize && (
            <p className="text-sm text-muted-foreground">{formatFileSize(fileSize)}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        {canPreview && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="gap-2 flex-1 sm:flex-initial"
          >
            <Eye className="w-4 h-4" />
            <span className="sm:inline">معاينة</span>
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownload}
          className="gap-2 flex-1 sm:flex-initial"
        >
          <Download className="w-4 h-4" />
          <span className="sm:inline">تحميل</span>
        </Button>
        {isAdmin && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            className="shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
    </>
  );
};