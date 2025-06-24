import { motion } from 'framer-motion';
import { Brand, Product } from '@/types';
import HeroCarousel from './HeroCarousel';
import CategorySection from './CategorySection';
import ComboProduct from '../product/ComboProduct';
import NewProducts from '../product/NewProducts';
import SupportSection from './support';
import HomeAdModal from '../common/HomeAdModal';
import { FAQJsonLd } from '@/components/SEO/FAQJsonLd';
import { generalFAQs } from '@/lib/general-faqs';

interface DesktopHomeProps {
  newProducts: Product[];
  brands: Brand[];
  comboProducts: Product[];
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function DesktopHome({ newProducts, brands, comboProducts }: DesktopHomeProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-8"
    >
      <HeroCarousel />
      <CategorySection />
      <NewProducts products={newProducts} brands={brands} />
      {comboProducts.length > 0 && (
        <ComboProduct products={comboProducts} brands={brands} />
      )}
      <SupportSection />
      <HomeAdModal />
      <FAQJsonLd faqs={generalFAQs} />
    </motion.div>
  );
} 