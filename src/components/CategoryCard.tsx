import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Folder, 
  Building2, 
  Calculator, 
  Briefcase, 
  Users, 
  GraduationCap,
  BookOpen,
  FileText,
  Laptop,
  TrendingUp
} from "lucide-react";

interface CategoryCardProps {
  name: string;
  description?: string;
  fileCount: number;
  onClick: () => void;
  departmentName?: string;
}

// Function to get icon based on department or category name
const getIconForCategory = (name: string, departmentName?: string) => {
  const lowerName = (name + " " + (departmentName || "")).toLowerCase();
  
  if (lowerName.includes("محاسب") || lowerName.includes("حساب")) return Calculator;
  if (lowerName.includes("إدار") || lowerName.includes("ادار")) return Briefcase;
  if (lowerName.includes("موارد") || lowerName.includes("بشري")) return Users;
  if (lowerName.includes("هندس") || lowerName.includes("تقني")) return Laptop;
  if (lowerName.includes("اقتصاد") || lowerName.includes("مالي")) return TrendingUp;
  if (lowerName.includes("تربي") || lowerName.includes("تعليم")) return GraduationCap;
  if (lowerName.includes("قانون") || lowerName.includes("حقوق")) return FileText;
  if (lowerName.includes("طب") || lowerName.includes("صحة")) return Building2;
  
  return BookOpen;
};

export const CategoryCard = ({ name, description, fileCount, onClick, departmentName }: CategoryCardProps) => {
  const Icon = getIconForCategory(name, departmentName);
  
  return (
    <Card 
      onClick={onClick}
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1 bg-card/80 backdrop-blur-sm relative"
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="absolute top-4 right-4 p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium ml-auto">
            {fileCount} {fileCount === 1 ? 'ملف' : 'ملفات'}
          </div>
        </div>
        <div className="pt-8">
          <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
            {name}
          </CardTitle>
          {description && (
            <CardDescription className="mt-2 line-clamp-2">
              {description}
            </CardDescription>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};