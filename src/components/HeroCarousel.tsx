'use client';
import { useState, useEffect } from 'react';
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

interface HeroCarouselProps {
  items: CarouselItem[];
}

export default function HeroCarousel({ items }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? items.length - 1 : prev - 1));
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
          {items.map((item, index: number) => (
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
                      {/* Placeholder for image */}
                      <div className="relative w-full h-full">
                        <div className="absolute right-0 h-full flex items-center">
                          {/* Hình ảnh sản phẩm sẽ được thêm vào đây */}
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
              {items.map((_, index: number) => (
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