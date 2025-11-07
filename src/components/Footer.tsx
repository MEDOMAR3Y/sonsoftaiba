const Footer = () => {
  return (
    <footer className="mt-auto border-t bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-right">
            © {new Date().getFullYear()} جميع الحقوق محفوظة
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              الشروط والأحكام
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              سياسة الخصوصية
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              اتصل بنا
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
