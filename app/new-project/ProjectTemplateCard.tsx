import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';

interface Props {
  title: string;
  description: string;
}
export const ProjectTemplateCard = ({ title, description }: Props) => {
  return (
    <Card className="rounded-lg shadow-sm w-[350px] hover:bg-slate-50 hover:cursor-pointer">
      <CardHeader className="px-3 pt-3 pb-0">
        <div className="relative w-full h-48">
          <Image
            fill
            src="https://placehold.jp/400x300.png"
            alt="Project template"
            className="rounded-t-lg"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 border-t">
        <div className="font-medium mb-1">{title}</div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
