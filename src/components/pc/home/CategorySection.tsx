import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

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
        className="group pt-4 relative flex flex-col h-full min-h-[420px] rounded-xl overflow-hidden bg-white mx-0"
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-4 right-0 px-5 py-5 z-10 flex justify-between items-center">
          <div>
            <div className="text-2xl font-semibold text-white">
              {title}
            </div>
            <div className="text-sm text-white mt-1">{description}</div>
          </div>
          <div className="flex items-center justify-end">
            <FiArrowRight className="text-xl text-gray-700 transition-transform duration-500 ease-in-out group-hover:rotate-90 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    );
  }
  // Card còn lại: ảnh bo góc rounded-xl
  return (
    <Link
      href={href}
      className=" group flex flex-col h-full rounded-xl "
    >
      <div className="relative aspect-square rounded-t-xl w-full">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover rounded-xl shadow-lg overflow-hidden  hover:shadow-xl transition-shadow duration-300 group-hover:scale-105 transition-transform duration-500 ease-in-out"
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
      href: "/san-pham"
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
      href: "/categories/ghe-cong-thai-hoc"
    },
    {
      title: "Keyboards & Mice",
      description: "Bàn phím, chuột",
      image: "https://hyperwork.vn/cdn/shop/files/BBB_11zon.svg?v=1742179997&width=1080",
      href: "/"
    },
    {
      title: "Accessories",
      description: "Lưu trữ & phụ kiện",
      image: "https://hyperwork.vn/cdn/shop/files/Setup1-PG02-1_11zon.jpg?v=1739178887&width=1080",
      href: "/"
    }
  ];

  return (
    <section className="container mx-auto relative py-12">
      <div className="w-full mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((category, idx) => (
            <div key={category.title}>
              <CategoryCard
                {...category}
                isFirst={idx === 0}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
