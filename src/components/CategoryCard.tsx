import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder } from "lucide-react";

interface CategoryCardProps {
  name: string;
  description?: string;
  fileCount: number;
  onClick: () => void;
}

export const CategoryCard = ({ name, description, fileCount, onClick }: CategoryCardProps) => {
  return (
    <Card 
      onClick={onClick}
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1 bg-card/80 backdrop-blur-sm"
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
            <Folder className="h-8 w-8 text-primary" />
          </div>
          <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
            {fileCount} {fileCount === 1 ? 'ملف' : 'ملفات'}
          </div>
        </div>
        <div>
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