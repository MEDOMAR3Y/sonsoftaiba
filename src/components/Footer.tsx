import { MessageCircle } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-auto border-t bg-[#1a1a2e] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
            <span>© جميع الحقوق محفوظة ل</span>
            <span className="font-bold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
              SONS OF TAIBA
            </span>
          </div>
          
          <div className="flex items-center justify-center">
            <a
              href="https://chat.whatsapp.com/ISVxK2e63CU6qf6KbMZfhS?mode=wwt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25d366]/10 hover:bg-[#25d366]/20 transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-[#25d366]" />
              <span className="text-sm">للتواصل</span>
            </a>
          </div>
          
          <div className="text-xs text-gray-400">
            تم التطوير بواسطة <span className="font-semibold text-white">MEDO MAR3Y</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
