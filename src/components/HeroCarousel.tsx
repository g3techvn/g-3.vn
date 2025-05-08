'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Slot } from '@radix-ui/react-slot';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

interface CarouselItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
}

const sampleItems: CarouselItem[] = [
  {
    id: 1,
    title: "Ghế Gaming Công Thái Học",
    subtitle: "Tối ưu cho game thủ chuyên nghiệp",
    image: "/images/section-1.jpeg",
    buttonText: "Khám phá ngay",
    buttonLink: "/collections/gaming-chairs",
    backgroundColor: "bg-gradient-to-r from-purple-600 to-indigo-600"
  },
  {
    id: 2,
    title: "Ưu đãi đặc biệt",
    subtitle: "Giảm giá lên đến 30% cho ghế gaming",
    image: "/images/section-2.jpeg",
    buttonText: "Mua ngay",
    buttonLink: "/collections/sale",
    backgroundColor: "bg-gradient-to-r from-pink-500 to-rose-500"
  },
  {
    id: 3,
    title: "Thiết kế công thái học",
    subtitle: "Hỗ trợ tối đa cho cột sống",
    image: "/images/section-3.jpeg",
    buttonText: "Tìm hiểu thêm",
    buttonLink: "/collections/ergonomic",
    backgroundColor: "bg-gradient-to-r from-blue-500 to-cyan-500"
  }
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === sampleItems.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? sampleItems.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="relative overflow-hidden bg-gray-100 w-full">
      <div className="container mx-auto relative">
        <div className="relative">
          {sampleItems.map((item, index: number) => (
            <div 
              key={item.id}
              className={`transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0 absolute top-0 left-0'
              } w-full`}
            >
              <div className={`${item.backgroundColor} relative overflow-hidden rounded-lg h-[500px]`}>
                <div className="py-12 h-full">
                  <div className="flex flex-col md:flex-row items-center h-full">
                    <div className="md:w-1/2 mb-8 md:mb-0 text-white z-10 pl-4 md:pl-8">
                      <h3 className="text-2xl mb-2">{item.title}</h3>
                      <h2 className="text-5xl font-bold mb-4">{item.subtitle}</h2>
                      <Link 
                        href={item.buttonLink} 
                        className="inline-block bg-white text-black px-6 py-2 rounded-md font-semibold hover:bg-gray-100 mt-4"
                      >
                        {item.buttonText}
                      </Link>
                    </div>
                    <div className="md:w-1/2 flex justify-center h-full">
                      <div className="relative w-full h-full">
                        <div className="absolute right-0 h-full flex items-center p-4 pr-12">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="h-[95%] w-auto object-contain rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <div className="absolute inset-0 flex items-center justify-between px-4 md:px-8 pointer-events-none">
          <button 
            className="w-10 h-10 flex items-center justify-center bg-white/30 hover:bg-white/50 rounded-full p-2 z-10 pointer-events-auto"
            onClick={prevSlide}
          >
            <ChevronLeftIcon className="h-6 w-6 text-white" />
          </button>
          <button 
            className="w-10 h-10 flex items-center justify-center bg-white/30 hover:bg-white/50 rounded-full p-2 z-10 pointer-events-auto"
            onClick={nextSlide}
          >
            <ChevronRightIcon className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-0 right-0">
          <NavigationMenu.Root orientation="horizontal">
            <NavigationMenu.List className="flex justify-center gap-2">
              {sampleItems.map((_, index: number) => (
                <NavigationMenu.Item key={index}>
                  <Slot>
                    <button
                      onClick={() => goToSlide(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
                      }`}
                    />
                  </Slot>
                </NavigationMenu.Item>
              ))}
            </NavigationMenu.List>
          </NavigationMenu.Root>
        </div>
      </div>
    </section>
  );
} 