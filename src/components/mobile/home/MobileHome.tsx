import { Brand, Product } from '@/types';
import MobileHomeHeader from '../MobileHomeHeader';
import MobileHomeTabs from '../MobileHomeTabs';
import MobileFeatureProduct from '../MobileFeatureProduct';
import MobileBestsellerProducts from '../MobileBestsellerProducts';

interface MobileHomeProps {
  categories: Array<{
    name: string;
    slug: string;
    id: number | null;
    productCount: number;
  }>;
  onCategoryChange: (categorySlug: string) => void;
  featureProducts: Product[];
  newProducts: Product[];
  brands: Brand[];
}

export default function MobileHome({
  categories,
  onCategoryChange,
  featureProducts,
  newProducts,
  brands
}: MobileHomeProps) {
  return (
    <div className="space-y-4">
      <MobileHomeHeader />
      <MobileHomeTabs
        categories={categories}
        onCategoryChange={onCategoryChange}
      />
      <MobileBestsellerProducts products={newProducts} />
      <MobileFeatureProduct products={featureProducts} brands={brands} />
    </div>
  );
} 