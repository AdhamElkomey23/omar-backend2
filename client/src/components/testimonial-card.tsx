import { StarRating } from '@/components/ui/star-rating';
import { Review } from '@shared/schema';

interface TestimonialCardProps {
  review: Review;
}

export function TestimonialCard({ review }: TestimonialCardProps) {
  return (
    <div className="bg-neutral p-6 rounded-lg shadow-sm">
      <StarRating rating={review.rating} className="mb-3" />
      <p className="text-gray-600 italic mb-4">"{review.content}"</p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 mr-3">
          <i className="ri-user-line"></i>
        </div>
        <div>
          <h4 className="font-medium">{review.userName}</h4>
          <p className="text-sm text-gray-500">
            {review.isVerifiedPurchase ? 'Verified Buyer' : 'Reviewer'}
          </p>
        </div>
      </div>
    </div>
  );
}
