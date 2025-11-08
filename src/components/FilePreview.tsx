import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  filePath: string;
  mimeType?: string;
}

export const FilePreview = ({ isOpen, onClose, fileName, filePath, mimeType }: FilePreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && filePath) {
      loadPreview();
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen, filePath]);

  const loadPreview = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Error loading preview:', error);
      toast.error('حدث خطأ في تحميل المعاينة');
    } finally {
      setLoading(false);
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
      a.download = fileName;
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

  const isImage = mimeType?.startsWith('image/');
  const isPDF = mimeType === 'application/pdf';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold truncate flex-1">
              {fileName}
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">تحميل</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 overflow-auto max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : isImage && previewUrl ? (
            <div className="flex items-center justify-center bg-muted/30 rounded-lg p-4">
              <img 
                src={previewUrl} 
                alt={fileName}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          ) : isPDF && previewUrl ? (
            <div className="w-full h-[70vh] rounded-lg overflow-hidden border border-border">
              <iframe
                src={previewUrl}
                className="w-full h-full"
                title={fileName}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
              <p>لا يمكن عرض معاينة لهذا النوع من الملفات</p>
              <Button
                onClick={handleDownload}
                className="mt-4 gap-2"
              >
                <Download className="w-4 h-4" />
                تحميل الملف
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
