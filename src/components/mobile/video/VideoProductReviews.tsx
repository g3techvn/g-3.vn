'use client';

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

export function VideoProductReviews({ comments, ratingSummary }: VideoProductReviewsProps) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Đánh giá sản phẩm</h3>
      
      {/* Rating Summary */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center">
          <span className="text-3xl font-bold text-gray-900">{ratingSummary.average}</span>
          <span className="text-sm text-gray-500 ml-1">/5</span>
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500">
            {ratingSummary.total.toLocaleString()} đánh giá
          </div>
          <div className="flex items-center mt-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center mr-2">
                <span className="text-sm text-gray-500 mr-1">{star}★</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{
                      width: `${(ratingSummary.stars.find(s => s.star === star)?.count || 0) / ratingSummary.total * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500 ml-1">
                  {ratingSummary.stars.find(s => s.star === star)?.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-gray-200 pb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="font-medium text-gray-900">{comment.user.name}</span>
                <div className="flex items-center ml-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4 w-4 ${i < comment.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <span className="text-sm text-gray-500">{comment.date}</span>
            </div>
            <p className="text-gray-600 mb-4">{comment.content}</p>
            {comment.publisherReply && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{comment.publisherReply.name}</span>
                  <span className="text-sm text-gray-500">{comment.publisherReply.date}</span>
                </div>
                <p className="text-gray-600">{comment.publisherReply.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 