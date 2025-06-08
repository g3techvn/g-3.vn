import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// Custom styles for Swiper navigation
const swiperStyles = `
  .category-swiper .swiper-button-next,
  .category-swiper .swiper-button-prev {
    color: #000;
    background: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .category-swiper .swiper-button-next:after,
  .category-swiper .swiper-button-prev:after {
    font-size: 18px;
  }
  .category-swiper .swiper-button-disabled {
    opacity: 0.35;
    cursor: auto;
    pointer-events: none;
  }
  .category-swiper .swiper-slide:first-child {
    width: 100% !important;
  }
  @media (min-width: 640px) {
    .category-swiper .swiper-slide:first-child {
      width: 50% !important;
    }
  }
  @media (min-width: 1024px) {
    .category-swiper .swiper-slide:first-child {
      width: 25% !important;
    }
  }
`;

interface CategoryCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
  isFirst?: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, description, image, href, isFirst }) => {
  if (isFirst) {
    // Card đầu: ảnh phủ full, không bo góc
    return (
      <Link
        href={href}
        className="group relative flex flex-col h-full min-h-[420px] rounded-xl overflow-hidden bg-white"
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-5 px-4 py-5 z-10 flex justify-between items-center">
          <div>
            <div className="text-2xl font-semibold text-white">
              {title}
            </div>
            <div className="text-sm text-white mt-1 opacity-90">{description}</div>
          </div>
          <div className="flex items-center justify-end">
            <FiArrowRight className="text-xl text-white transition-transform duration-500 ease-in-out group-hover:rotate-90 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    );
  }
  // Card còn lại: ảnh bo góc rounded-xl
  return (
    <Link
      href={href}
      className="group flex flex-col h-full rounded-xl overflow-hidden "
    >
      <div className="relative aspect-square  w-full">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-500 ease-in-out"
        />
      </div>
      <div className="flex-1 flex justify-between items-center px-5 px-4 py-5">
        <div>
          <div className="text-2xl font-semibold text-gray-900">
            {title}
          </div>
          <div className="text-sm text-gray-600 mt-1">{description}</div>
        </div>
        <div className="flex items-center justify-end">
          <FiArrowRight className="text-xl text-gray-700 transition-transform duration-500 ease-in-out group-hover:rotate-90 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};

const CategorySection: React.FC = () => {
  const categories = [
    {
      title: "All Products",
      description: "Xem các sản phẩm của chúng tôi",
      image: "https://hyperwork.vn/cdn/shop/files/DSC03313.jpg?v=1738725813&width=1080",
      href: "/"
    },
    {
      title: "Desks",
      description: "Bàn nâng hạ, bàn văn phòng",
      image: "https://hyperwork.vn/cdn/shop/files/atlas-white-2_11zon.jpg?v=1740126361&width=1080",
      href: "/"
    },
    {
      title: "Chairs",
      description: "Ghế công thái học",
      image: "https://hyperwork.vn/cdn/shop/files/Capture_One_Catalog05971_11zon.svg?v=1741830770&width=1080",
      href: "/"
    },
    {
      title: "Keyboards & Mice",
      description: "Bàn phím, chuột",
      image: "https://hyperwork.vn/cdn/shop/files/BBB_11zon.svg?v=1742179997&width=1080",
      href: "/"
    },
    {
      title: "Storage & Accessories",
      description: "Lưu trữ & phụ kiện",
      image: "https://hyperwork.vn/cdn/shop/files/Setup1-PG02-1_11zon.jpg?v=1739178887&width=1080",
      href: "/"
    }
  ];

  return (
    <section className="container mx-auto py-12">
      <style jsx global>{swiperStyles}</style>
      <div className="relative">
        <Swiper
          modules={[Navigation]}
          spaceBetween={24}
          slidesPerView={1}
          navigation
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          className="category-swiper"
        >
          {categories.map((category, idx) => (
            <SwiperSlide key={category.title} className={idx === 0 ? 'first-slide' : ''}>
              <CategoryCard
                {...category}
                isFirst={idx === 0}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default CategorySection;
