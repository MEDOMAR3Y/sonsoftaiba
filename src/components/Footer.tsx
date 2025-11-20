import { MessageCircle } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-auto border-t bg-card text-card-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
            <span>© جميع الحقوق محفوظة ل</span>
            <span className="font-bold text-primary">
              SONS OF TAIBA
            </span>
          </div>
          
          <div className="flex items-center justify-center">
            <a
              href="https://chat.whatsapp.com/ISVxK2e63CU6qf6KbMZfhS?mode=wwt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs">للتواصل</span>
            </a>
          </div>
          
          <div className="text-xs text-muted-foreground">
            تم التطوير بواسطة <span className="font-semibold text-foreground">MEDO MAR3Y</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
