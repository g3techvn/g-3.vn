'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Slot } from '@radix-ui/react-slot';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from '@radix-ui/react-icons';
import OptimizedImage from '@/components/common/OptimizedImage';

interface CarouselItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
  accentColor: string;
  badge?: string;
}

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    title: "Ghế Gaming Công Thái Học",
    subtitle: "Tối ưu cho game thủ chuyên nghiệp",
    description: "Thiết kế đột phá với công nghệ hỗ trợ cột sống tiên tiến, mang đến trải nghiệm gaming tuyệt vời nhất",
    image: "/images/section-1.jpeg",
    buttonText: "Khám phá bộ sưu tập",
    buttonLink: "/collections/gaming-chairs",
    backgroundColor: "from-slate-900 via-purple-900 to-slate-900",
    accentColor: "from-purple-400 to-pink-400",
    badge: "Bán chạy nhất"
  },
  {
    id: 2,
    title: "Ưu Đãi Đặc Biệt",
    subtitle: "Giảm giá lên đến 30%",
    description: "Cơ hội sở hữu ghế gaming cao cấp với mức giá ưu đãi chưa từng có. Số lượng có hạn!",
    image: "/images/section-2.jpeg",
    buttonText: "Mua ngay hôm nay",
    buttonLink: "/collections/sale",
    backgroundColor: "from-rose-900 via-pink-900 to-rose-900",
    accentColor: "from-rose-400 to-orange-400",
    badge: "Giới hạn"
  },
  {
    id: 3,
    title: "Thiết Kế Công Thái Học",
    subtitle: "Hỗ trợ tối đa cho cột sống",
    description: "Kết hợp hoàn hảo giữa khoa học và nghệ thuật, mang đến sự thoải mái tuyệt đối cho công việc dài ngày",
    image: "/images/section-3.jpeg",
    buttonText: "Tìm hiểu công nghệ",
    buttonLink: "/collections/ergonomic",
    backgroundColor: "from-cyan-900 via-blue-900 to-cyan-900",
    accentColor: "from-cyan-400 to-blue-400",
    badge: "Công nghệ mới"
  }
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !isHovered) {
      intervalRef.current = setInterval(nextSlide, 5000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isHovered, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextSlide, prevSlide, togglePlayPause]);

  const currentItem = carouselItems[currentSlide];

  return (
    <section 
      className="relative overflow-hidden w-full h-[600px] lg:h-[700px] group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="Hero carousel"
    >
      {/* Background with animated gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentItem.backgroundColor} transition-all duration-1000 ease-in-out`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
      </div>

      {/* Main content container */}
      <div className="container mx-auto relative h-full">
        <div className="relative h-full flex items-center">
          {carouselItems.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentSlide 
                  ? 'opacity-100 transform translate-x-0' 
                  : index < currentSlide 
                    ? 'opacity-0 transform -translate-x-full' 
                    : 'opacity-0 transform translate-x-full'
              }`}
            >
              <div className="grid lg:grid-cols-2 gap-8 h-full items-center px-6 lg:px-12">
                {/* Content Section */}
                <div className="text-white space-y-6 max-w-xl">
                  {/* Badge */}
                  {item.badge && (
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${item.accentColor} text-white shadow-lg transform transition-all duration-300 hover:scale-105`}>
                      <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                      {item.badge}
                    </div>
                  )}

                  {/* Title */}
                  <div className="space-y-3">
                    <h3 className="text-xl lg:text-2xl font-light tracking-wide opacity-90 transform transition-all duration-500 delay-100">
                      {item.subtitle}
                    </h3>
                    <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight transform transition-all duration-500 delay-200">
                      <span className={`bg-gradient-to-r ${item.accentColor} bg-clip-text text-transparent`}>
                        {item.title}
                      </span>
                    </h1>
                  </div>

                  {/* Description */}
                  <p className="text-lg lg:text-xl text-gray-200 leading-relaxed max-w-lg transform transition-all duration-500 delay-300">
                    {item.description}
                  </p>

                  {/* CTA Button */}
                  <div className="transform transition-all duration-500 delay-400">
                    <Link 
                      href={item.buttonLink}
                      className={`group inline-flex items-center px-8 py-4 bg-gradient-to-r ${item.accentColor} text-white font-semibold rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/20`}
                    >
                      <span className="mr-2">{item.buttonText}</span>
                      <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>

                  {/* Progress indicator */}
                  <div className="flex space-x-1 mt-8">
                    {carouselItems.map((_, idx) => (
                      <div
                        key={idx}
                        className="h-1 bg-white/20 rounded-full overflow-hidden flex-1 max-w-16"
                      >
                        <div
                          className={`h-full bg-gradient-to-r ${item.accentColor} transition-all duration-300 ${
                            idx === currentSlide ? 'w-full' : 'w-0'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                                 {/* Image Section */}
                 <div className="relative h-full flex items-center justify-center lg:justify-end">
                   <div className="relative w-full max-w-md lg:max-w-lg h-[400px] lg:h-[500px]">
                     {/* Decorative elements */}
                     <div className={`absolute -top-4 -right-4 w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br ${item.accentColor} rounded-full opacity-20 animate-pulse`} />
                     <div className={`absolute -bottom-6 -left-6 w-20 h-20 lg:w-32 lg:h-32 bg-gradient-to-br ${item.accentColor} rounded-full opacity-10 animate-pulse delay-1000`} />
                     
                     {/* Main image container */}
                     <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-700 hover:scale-[1.02] group-hover:shadow-4xl bg-white/5">
                       <OptimizedImage 
                         src={item.image} 
                         alt={item.title}
                         fill={true}
                         priority={index === currentSlide}
                         enablePreload={index === currentSlide}
                         optimizeForSlowNetwork={true}
                         className="transition-all duration-700"
                         sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 500px"
                         objectFit="cover"
                         style={{
                           objectPosition: 'center center'
                         }}
                       />
                       
                       {/* Image overlay */}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                       
                       {/* Frame border */}
                       <div className="absolute inset-0 border-2 border-white/10 rounded-2xl" />
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="absolute inset-y-0 left-6 right-6 flex items-center justify-between pointer-events-none">
          <button 
            className="w-14 h-14 flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full shadow-xl border border-white/20 pointer-events-auto group transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/20"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
          </button>
          
          <button 
            className="w-14 h-14 flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full shadow-xl border border-white/20 pointer-events-auto group transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/20"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>

        {/* Carousel Indicators & Controls */}
        <div className="absolute bottom-8 left-0 right-0">
          <div className="flex items-center justify-center space-x-6">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full border border-white/20 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/20"
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? (
                <PauseIcon className="w-4 h-4 text-white" />
              ) : (
                <PlayIcon className="w-4 h-4 text-white" />
              )}
            </button>

            {/* Indicators */}
            <NavigationMenu.Root orientation="horizontal">
              <NavigationMenu.List className="flex gap-3">
                {carouselItems.map((_, index) => (
                  <NavigationMenu.Item key={index}>
                    <Slot>
                      <button
                        onClick={() => goToSlide(index)}
                        className={`h-3 rounded-full transition-all duration-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                          index === currentSlide 
                            ? 'w-12 bg-white shadow-lg' 
                            : 'w-3 bg-white/30 hover:bg-white/50 hover:w-6'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    </Slot>
                  </NavigationMenu.Item>
                ))}
              </NavigationMenu.List>
            </NavigationMenu.Root>

            {/* Slide counter */}
            <div className="text-white/70 text-sm font-medium min-w-16 text-center">
              {currentSlide + 1} / {carouselItems.length}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 right-6 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full relative">
          <div className="w-1 h-3 bg-white/50 rounded-full absolute top-2 left-1/2 transform -translate-x-1/2 animate-pulse" />
        </div>
      </div>
    </section>
  );
} 