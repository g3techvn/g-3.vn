import Link from 'next/link';
import { AspectRatio } from './ui/AspectRatio';
import { Card, CardBadge, CardContent, CardHeader } from './ui/Card';
import { Rating } from './ui/Rating';

// Định nghĩa lại kiểu dữ liệu Product phù hợp với cấu trúc từ API /api/products
type Product = {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  image_url: string;
  brand?: string;
  rating?: number;
};

type NewProductsProps = {
  products: Product[];
};

export default function NewProducts({ products }: NewProductsProps) {
  return (
    <section className="py-8 bg-gray-100">
      <div className="container mx-auto">
        <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-6 inline-block uppercase">
          Mới Cập Nhật
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product) => (
            <Link href={`/product/${product.id}`} key={product.id} className="group h-full">
              <Card>
                <CardHeader>
                  {product.discount_percentage && product.discount_percentage > 0 && (
                    <CardBadge>-{product.discount_percentage}%</CardBadge>
                  )}
                  <AspectRatio ratio={1 / 1}>
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </div>
                  </AspectRatio>
                </CardHeader>
                
                <CardContent>
                  <div className="text-xs text-gray-500 mb-1">{product.brand || 'Không rõ'}</div>
                  
                  <h3 className="text-xs font-medium mb-2 text-gray-800 group-hover:text-red-600 line-clamp-2 h-[2.5rem]">
                    {product.name}
                  </h3>
                  
                  <Rating value={product.rating || 4} className="mb-2" />
                  
                  <div className="flex flex-col mt-auto">
                    {product.original_price ? (
                      <>
                        <span className="text-gray-500 line-through text-xs">
                          {product.original_price.toLocaleString()}₫
                        </span>
                        <span className="text-red-600 font-bold text-sm">
                          {product.price.toLocaleString()}₫
                        </span>
                      </>
                    ) : (
                      <span className="text-red-600 font-bold text-sm">
                        {product.price.toLocaleString()}₫
                      </span>
                    )}
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