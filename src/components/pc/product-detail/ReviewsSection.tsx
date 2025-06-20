import React, { useState } from 'react';
import * as Progress from '@radix-ui/react-progress';
import * as Avatar from '@radix-ui/react-avatar';
import { motion } from 'framer-motion';
import { HandThumbUpIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/react/24/solid';

// Define types
interface Comment {
  id: string;
  user: {
    name: string;
  };
  rating: number;
  content: string;
  date: string;
  likes: number;
  publisherReply?: {
    name: string;
    date: string;
    content: string;
  };
}

interface RatingSummary {
  average: number;
  total: number;
  stars: {
    star: number;
    count: number;
  }[];
}

interface ReviewsSectionProps {
  comments: Comment[];
  ratingSummary: RatingSummary;
}

export function ReviewsSection({ comments, ratingSummary }: ReviewsSectionProps) {
  // Track liked comments
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [activeComment, setActiveComment] = useState<string | null>(null);

  // Helper function to get random color from name for avatar
  const getRandomColor = (name: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  // Helper function to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div 
      className="mt-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
      <motion.h2 
        className="text-2xl font-bold mb-4"
        variants={itemVariants}
      >
        Đánh giá & Nhận xét
      </motion.h2>
      
      {/* Rating Summary */}
      <motion.div 
        className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-lg"
        variants={itemVariants}
      >
        <div className="flex flex-col items-center min-w-[70px]">
          <motion.span 
            className="text-4xl font-bold text-gray-900 leading-none"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 0.6, 
              delay: 0.2,
              ease: "easeOut"
            }}
          >
            {ratingSummary.average.toFixed(1)}
          </motion.span>
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <motion.svg 
                key={i} 
                className={`w-5 h-5 ${i < Math.round(ratingSummary.average) ? 'text-yellow-400' : 'text-gray-300'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.3, 
                  delay: 0.1 * i + 0.3
                }}
              >
                <polygon points="9.9,1.1 7.6,6.6 1.6,7.3 6.1,11.2 4.8,17.1 9.9,14.1 15,17.1 13.7,11.2 18.2,7.3 12.2,6.6" />
              </motion.svg>
            ))}
          </div>
          <span className="text-xs text-gray-500 mt-1">{ratingSummary.total.toLocaleString()}</span>
        </div>
        
        {/* Star Distribution */}
        <div className="flex-1 flex flex-col gap-1">
          {ratingSummary.stars.map((starItem, index) => {
            const percent = (starItem.count / ratingSummary.total) * 100;
            return (
              <div key={starItem.star} className="flex items-center gap-2">
                <span className="text-xs w-3 text-gray-700">{starItem.star}</span>
                <Progress.Root className="relative flex-1 h-2 overflow-hidden rounded bg-gray-200" value={percent}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percent}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                    className="h-full bg-blue-500 rounded"
                  />
                </Progress.Root>
              </div>
            );
          })}
        </div>
      </motion.div>
      
      {/* Comments List */}
      <div className="space-y-8">
        {comments.map((comment, index) => (
          <motion.div 
            key={comment.id}
            variants={itemVariants}
            onHoverStart={() => setActiveComment(comment.id)}
            onHoverEnd={() => setActiveComment(null)}
            whileHover={{ 
              backgroundColor: "rgba(0,0,0,0.01)", 
              scale: 1.01, 
              y: -2,
              transition: { duration: 0.2 } 
            }}
            className="rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Avatar.Root className="flex items-center justify-center">
                  <Avatar.Fallback 
                    className={`w-10 h-10 rounded-full ${getRandomColor(comment.user.name)} flex items-center justify-center text-white font-medium text-lg`}
                  >
                    {getInitials(comment.user.name)}
                  </Avatar.Fallback>
                </Avatar.Root>
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{comment.user.name}</span>
                  <span className="text-xs text-gray-500">{comment.date}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.svg 
                      key={i} 
                      className={`w-4 h-4 ${i < comment.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: 0.05 * i
                      }}
                    >
                      <polygon points="9.9,1.1 7.6,6.6 1.6,7.3 6.1,11.2 4.8,17.1 9.9,14.1 15,17.1 13.7,11.2 18.2,7.3 12.2,6.6" />
                    </motion.svg>
                  ))}
                </div>
                <motion.p 
                  className="text-gray-800 text-sm mt-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {comment.content}
                </motion.p>
                <div className="mt-2 text-xs text-gray-500">
                  {likedComments[comment.id] ? comment.likes + 1 : comment.likes} người thấy bài đánh giá này hữu ích
                </div>
                <motion.div 
                  className="flex items-center gap-2 mt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <span className="text-sm text-gray-700">Bài đánh giá này có hữu ích không?</span>
                  <motion.button 
                    className={`px-3 py-1 border rounded-lg text-sm ${
                      likedComments[comment.id] 
                        ? 'border-blue-400 bg-blue-50 text-blue-600' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    } flex items-center gap-1`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setLikedComments(prev => ({
                        ...prev,
                        [comment.id]: !prev[comment.id]
                      }));
                    }}
                  >
                    {likedComments[comment.id] ? (
                      <HandThumbUpSolidIcon className="h-4 w-4" />
                    ) : (
                      <HandThumbUpIcon className="h-4 w-4" />
                    )}
                    Có
                  </motion.button>
                  <motion.button 
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Không
                  </motion.button>
                </motion.div>
                
                {comment.publisherReply && (
                  <motion.div 
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-xs text-gray-700">{comment.publisherReply.name}</span>
                      <span className="text-xs text-gray-400">{comment.publisherReply.date}</span>
                    </div>
                    <div className="text-gray-700 text-sm whitespace-pre-line">{comment.publisherReply.content}</div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 