import React from 'react';
import ProductCard2Skeleton from './ProductCard2Skeleton';
import TabsSkeleton from './TabsSkeleton';

// HACK: Sử dụng CSS-in-JS để đảm bảo grid layout không bị ghi đè
const TWO_COLUMN_GRID_STYLE = `
.two-column-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

@media (min-width: 640px) {
  .two-column-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}

@media (min-width: 1024px) {
  .two-column-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
  }
}
`;

export default function ProductTabsRadix2Skeleton() {
  // Responsive với số lượng sản phẩm skeleton hiển thị theo kích thước màn hình
  const getProductCount = () => {
    // Sử dụng window.innerWidth nếu như component được render phía client
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 4; // mobile - 2x2 grid
      if (window.innerWidth < 1024) return 6; // tablet - 2x3 or 3x2 grid
      return 6; // desktop - 6x1 or 3x2 grid
    }
    return 6; // Default for server-side rendering
  };
  
  // Số lượng sản phẩm skeleton hiển thị
  const [productsPerPage, setProductsPerPage] = React.useState(6);
  
  // Effect để cập nhật số lượng sản phẩm khi resize
  React.useEffect(() => {
    const handleResize = () => {
      setProductsPerPage(getProductCount());
    };
    
    // Set initial count
    setProductsPerPage(getProductCount());
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Style inline để đảm bảo grid đúng
  const forceTwoColumnStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '6px'
  };
  
  return (
    <>
      {/* Add inline CSS */}
      <style dangerouslySetInnerHTML={{ __html: TWO_COLUMN_GRID_STYLE }} />
      
      <section className="py-4 md:py-10 bg-gray-100">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="pb-1 mb-3 md:mb-6">
            <div className="overflow-x-auto -mx-2 px-2 sm:-mx-3 sm:px-3">
              <TabsSkeleton
                tabCount={3}
                tabWidthClass="w-14 sm:w-16"
                titleWidthClass="w-32 sm:w-40"
                showControls={true}
              />
            </div>
            
            {/* Tab content skeleton - double inline và class approach */}
            <div className="mt-3 md:mt-4">
              <div 
                className="two-column-grid" 
                style={forceTwoColumnStyle}
              >
                {Array.from({ length: productsPerPage }).map((_, index) => (
                  <div key={index} className="w-full">
                    <ProductCard2Skeleton 
                      showMultipleImages={index % 3 === 0} // Chỉ một số sản phẩm hiển thị nhiều ảnh
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 