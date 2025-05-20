'use client';

import React from 'react';
import { StarIcon } from '@heroicons/react/24/outline';

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

interface VideoProductReviewsProps {
  comments: Comment[];
  ratingSummary: RatingSummary;
}

// Hàm tạo màu ngẫu nhiên từ tên
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

// Hàm lấy 2 ký tự đầu của tên
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export function VideoProductReviews({ comments, ratingSummary }: VideoProductReviewsProps) {
  return (
    <div className="px-4 pb-8">
      {/* Tổng quan điểm đánh giá */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Điểm xếp hạng và bài đánh giá</h2>
        <p className="text-gray-500 text-sm mb-4">Điểm xếp hạng và bài đánh giá đã được xác minh và do những người sử dụng cùng loại thiết bị với bạn đưa ra</p>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center min-w-[70px]">
            <span className="text-4xl font-bold text-gray-900 leading-none">{ratingSummary.average.toFixed(1)}</span>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(ratingSummary.average) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-500 mt-1">{ratingSummary.total.toLocaleString()}</span>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            {ratingSummary.stars.map((s) => {
              const percent = (s.count / ratingSummary.total) * 100;
              return (
                <div key={s.star} className="flex items-center gap-2">
                  <span className="text-xs w-3 text-gray-700">{s.star}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded">
                    <div className="h-2 rounded bg-blue-500" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Danh sách bình luận */}
      <div className="space-y-8">
        {[...comments].reverse().map((comment) => (
          <div key={comment.id}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-lg ${getRandomColor(comment.user.name)}`}>{getInitials(comment.user.name)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{comment.user.name}</span>
                  <span className="text-xs text-gray-500">{comment.date}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`w-4 h-4 ${i < comment.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-800 text-sm mt-2 whitespace-pre-line">{comment.content}</p>
                <div className="mt-2 text-xs text-gray-500">{comment.likes} người thấy bài đánh giá này hữu ích</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-700">Bài đánh giá này có hữu ích không?</span>
                  <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Có</button>
                  <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Không</button>
                </div>
                {comment.publisherReply && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-xs text-gray-700">{comment.publisherReply.name}</span>
                      <span className="text-xs text-gray-400">{comment.publisherReply.date}</span>
                    </div>
                    <div className="text-gray-700 text-sm whitespace-pre-line">{comment.publisherReply.content}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 