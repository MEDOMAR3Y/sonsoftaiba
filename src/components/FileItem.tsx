import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Eye, Trash2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FilePreviewDialog } from "./FilePreviewDialog";

interface FileItemProps {
  id: string;
  name: string;
  filePath: string;
  fileSize?: number;
  isAdmin: boolean;
  onDelete?: () => void;
}

export const FileItem = ({ id, name, filePath, fileSize, isAdmin, onDelete }: FileItemProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const canPreview = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    const previewableExts = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'txt', 'mp4', 'webm'];
    return previewableExts.includes(ext || '');
  };

  const handleView = async () => {
    if (!canPreview(name)) {
      toast.info("لا يوجد معاينة لهذا الملف، قم بتحميله لرؤيته");
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from("files")
        .createSignedUrl(filePath, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        const ext = name.split('.').pop()?.toLowerCase() || '';
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        const videoExts = ['mp4', 'webm', 'ogg'];
        
        let mimeType = '';
        if (ext === 'pdf') mimeType = 'application/pdf';
        else if (imageExts.includes(ext)) mimeType = 'image/' + ext;
        else if (videoExts.includes(ext)) mimeType = 'video/' + ext;

        setFileType(mimeType);
        setPreviewUrl(data.signedUrl);
        setPreviewOpen(true);
      }
    } catch (error: any) {
      console.error("Error viewing file:", error);
      toast.error("فشل فتح الملف");
    }
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

  return (
    <>
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
          <Button
            size="sm"
            variant="outline"
            onClick={handleView}
            className="flex-1 sm:flex-none"
          >
            <Eye className="w-4 h-4 sm:ml-2" />
            <span className="hidden sm:inline">معاينة</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="flex-1 sm:flex-none"
          >
            <Download className="w-4 h-4 sm:ml-2" />
            <span className="hidden sm:inline">تحميل</span>
          </Button>
          {isAdmin && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="w-4 h-4 sm:ml-2" />
              <span className="hidden sm:inline">حذف</span>
            </Button>
          )}
        </div>
      </div>
      <FilePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        fileUrl={previewUrl}
        fileName={name}
        fileType={fileType}
      />
    </>
  );
};