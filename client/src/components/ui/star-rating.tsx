import React from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  count?: number;
  className?: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showCount = false,
  count,
  className,
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizeClasses = {
    sm: "text-xs",
    md: "text-base",
    lg: "text-xl",
  };

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index);
    }
  };

  const renderStar = (index: number) => {
    const displayRating = hoverRating > 0 ? hoverRating : rating;
    
    if (index <= Math.floor(displayRating)) {
      return <i className="ri-star-fill"></i>;
    } else if (index - 0.5 <= displayRating) {
      return <i className="ri-star-half-fill"></i>;
    } else {
      return interactive ? <i className="ri-star-line"></i> : <i className="ri-star-line"></i>;
    }
  };

  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn("flex text-amber-400", sizeClasses[size])}>
        {[...Array(maxRating)].map((_, i) => (
          <span
            key={i}
            className={interactive ? "cursor-pointer" : ""}
            onMouseEnter={() => handleMouseEnter(i + 1)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(i + 1)}
          >
            {renderStar(i + 1)}
          </span>
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-gray-500 ml-1">
          ({count || 0})
        </span>
      )}
    </div>
  );
}
