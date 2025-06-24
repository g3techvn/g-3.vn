'use client';

import { useState } from 'react';
import Image from 'next/image';
import Spin from 'antd/es/spin';
import message from 'antd/es/message';
import Select from 'antd/es/select';
import Input from 'antd/es/input';
import Switch from 'antd/es/switch';
import Divider from 'antd/es/divider';
import { SortAscendingOutlined, SortDescendingOutlined, FolderOutlined } from '@ant-design/icons';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
import { ImageItem } from '@/types/supabase';
import { Button } from '@/components/ui/Button';

interface ImageGalleryProps {
  defaultFolder?: string;
  defaultBucket?: string;
  predefinedFolders?: string[];
  showControls?: boolean;
  showSorting?: boolean;
  showCustomFolder?: boolean;
  title?: string;
  className?: string;
  renderItem?: (image: ImageItem) => React.ReactNode;
}

export function ImageGallery({
  defaultFolder = 'products/gami/ghe-gami-core',
  defaultBucket = 'g3tech',
  predefinedFolders = [],
  showControls = true,
  showSorting = true,
  showCustomFolder = true,
  title = 'Image Gallery',
  className = '',
  renderItem
}: ImageGalleryProps) {
  const [folder, setFolder] = useState(defaultFolder);
  const [bucket, setBucket] = useState(defaultBucket);
  const [customFolder, setCustomFolder] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showDebug, setShowDebug] = useState(false);
  const [useAlternativeUrl, setUseAlternativeUrl] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  
  const { images, loading, error, refetch, debug, suggestedFolders } = useSupabaseStorage({
    folder,
    bucket,
    sortOrder
  });

  const handleFolderChange = (value: string) => {
    setFolder(value);
  };
  
  const handleCustomFolderSubmit = () => {
    if (customFolder.trim()) {
      setFolder(customFolder.trim());
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const navigateToFolder = (newFolder: string) => {
    setFolder(newFolder);
  };

  if (error) {
    message.error(error);
  }

  const defaultRenderItem = (image: ImageItem) => {
    // Determine which URL to use
    const imageUrl = useAlternativeUrl && image.alternativeUrl 
      ? image.alternativeUrl 
      : image.url;
    
    // Use the image key to track error state
    const imageKey = `${image.name}-${image.url}`;
    const imageError = imageErrors[imageKey] || false;
    
    const handleImageError = () => {
      // Update the error state for this specific image
      setImageErrors(prev => ({
        ...prev,
        [imageKey]: true
      }));
      
      // If using the default URL format and it fails, try the alternative
      if (!useAlternativeUrl && image.alternativeUrl) {
        setUseAlternativeUrl(true);
      }
    };
      
    return (
      <div 
        key={`${image.name}`}
        className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        <div className="relative h-48 w-full">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
              <div className="text-center">
                <p className="text-red-500 text-sm">Image failed to load</p>
                <p className="text-xs text-gray-500 mt-1">{image.name}</p>
                {useAlternativeUrl ? (
                  <Button 
                    variant="default"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setUseAlternativeUrl(false);
                      setSelectedImage(null);
                    }}
                  >
                    Sử dụng URL gốc
                  </Button>
                ) : (
                  <Button 
                    variant="default"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setUseAlternativeUrl(true);
                      setSelectedImage(null);
                    }}
                  >
                    Sử dụng URL thay thế
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={image.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              onError={handleImageError}
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-800 truncate" title={image.name}>
            {image.name}
          </h3>
          {image.type && (
            <p className="text-sm text-gray-500 mt-1">
              {image.type}
            </p>
          )}
          <a 
            href={imageUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:underline text-sm block mt-2"
          >
            View Original
          </a>
        </div>
      </div>
    );
  };

  const renderBreadcrumbs = () => {
    if (!folder) return null;
    
    const parts = folder.split('/');
    let currentPath = '';
    
    return (
      <div className="flex flex-wrap items-center gap-1 text-sm mb-4">
        <span 
          className="text-blue-500 hover:underline cursor-pointer" 
          onClick={() => navigateToFolder('')}
        >
          Root
        </span>
        
        {parts.map((part, index) => {
          currentPath = currentPath 
            ? `${currentPath}/${part}` 
            : part;
          
          const isLast = index === parts.length - 1;
          
          return (
            <span key={index} className="flex items-center">
              <span className="mx-1 text-gray-400">/</span>
              {isLast ? (
                <span className="font-medium">{part}</span>
              ) : (
                <span 
                  className="text-blue-500 hover:underline cursor-pointer"
                  onClick={() => navigateToFolder(currentPath)}
                >
                  {part}
                </span>
              )}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      {title && <h1 className="text-3xl font-bold mb-8 text-center">{title}</h1>}
      
      {showControls && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Gallery Settings</h2>
          
          {renderBreadcrumbs()}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {predefinedFolders.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Folder
                </label>
                <Select
                  style={{ width: '100%' }}
                  value={folder}
                  onChange={handleFolderChange}
                  options={predefinedFolders.map(f => ({ value: f, label: f }))}
                />
              </div>
            )}
            
            {showCustomFolder && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Folder Path
                </label>
                <div className="flex gap-2">
                  <Input 
                    value={customFolder} 
                    onChange={(e) => setCustomFolder(e.target.value)}
                    placeholder="Enter folder path"
                  />
                  <Button variant="default" onClick={handleCustomFolderSubmit}>
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="bg-gray-100 px-3 py-2 rounded-md">
              <span className="font-medium">Current Path:</span> {bucket}/{folder}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Use Alternative URL:</span>
                <Switch 
                  checked={useAlternativeUrl} 
                  onChange={setUseAlternativeUrl}
                />
              </div>
              
              <div className="flex gap-2">
                {showSorting && (
                  <Button 
                    onClick={toggleSortOrder} 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                    {sortOrder === 'asc' ? 'Sort A-Z' : 'Sort Z-A'}
                  </Button>
                )}
                
                <Button onClick={refetch} variant="outline">
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin
            size="large"
            tip="Loading images..."
            className="text-center"
          >
            <div className="p-12" />
          </Spin>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4 border border-red-200 rounded-md">
          {error}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-gray-500 mb-4">No images found in this folder</p>
          
          {suggestedFolders.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-3">Available Folders:</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedFolders.map((suggestedFolder, index) => (
                  <Button 
                    key={index}
                    onClick={() => navigateToFolder(suggestedFolder)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FolderOutlined />
                    {suggestedFolder.split('/').pop()}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 justify-center mt-4">
            <Button 
              onClick={() => navigateToFolder(folder.split('/').slice(0, -1).join('/'))}
              disabled={!folder.includes('/')}
              variant="outline"
            >
              Go Up One Level
            </Button>
            
            <Button 
              onClick={() => setShowDebug(!showDebug)} 
              variant="secondary"
            >
              {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
            </Button>
            
            <Button 
              onClick={() => setUseAlternativeUrl(!useAlternativeUrl)} 
              variant="default"
            >
              Try Alternative URL Format
            </Button>
          </div>
          
          {showDebug && debug && (
            <div className="mt-4 p-4 bg-gray-100 text-left rounded-md">
              <h3 className="text-lg font-medium mb-2">Debug Information</h3>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(debug, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Try these solutions:</h3>
            <ul className="text-left list-disc list-inside">
              <li>Check if the folder path is correct (currently: <strong>{folder}</strong>)</li>
              <li>Verify that the bucket name is correct (currently: <strong>{bucket}</strong>)</li>
              <li>Make sure the images exist in this path in Supabase</li>
              <li>Try clicking &quot;Try Alternative URL Format&quot; button</li>
              <li>Check if file names have special characters or spaces</li>
              <li>Confirm your Supabase permissions</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <div key={`${image.name}-${index}`}>
              {renderItem ? renderItem(image) : defaultRenderItem(image)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 