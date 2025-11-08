import { MessageCircle } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-16 border-t border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
            <span>© جميع الحقوق محفوظة ل</span>
            <span className="font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              SONS OF TAIBA
            </span>
          </div>
          
          <div className="flex items-center justify-center">
            <a
              href="https://chat.whatsapp.com/ISVxK2e63CU6qf6KbMZfhS?mode=wwt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">للتواصل</span>
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
