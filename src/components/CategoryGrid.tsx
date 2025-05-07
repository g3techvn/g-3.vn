import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { CameraIcon } from '@radix-ui/react-icons';

type Category = {
  name: string;
  image: string;
};

type CategoryGridProps = {
  categories: Category[];
};

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="py-8 bg-gray-100">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category, index) => (
            <Link 
              key={index} 
              href={`/product-category/${category.name.toLowerCase().replace(/\s+/g, '-')}`} 
              className="group"
            >
              <Card className="h-full bg-gray-300 hover:bg-gray-200">
                <CardContent className="flex items-center justify-between w-full p-4">
                  <div className="flex-1 text-left mr-3">
                    <h3 className="text-xs md:text-sm font-bold text-gray-800 group-hover:text-red-600 transition-colors leading-tight">
                      {category.name}
                    </h3>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white shadow-sm flex-shrink-0 flex items-center justify-center">
                    <CameraIcon className="h-8 w-8 text-gray-500" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 