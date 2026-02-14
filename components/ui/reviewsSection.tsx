"use client";

import { useEffect, useState } from "react";
import { Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Cookies from "js-cookie";
import axiosInstance from "@/lib/axiosInstance";

interface Review {
  _id: string;
  user: {
    _id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    setIsAuthenticated(!!token);
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await axiosInstance.get(`/review/${productId}`);
      setReviews(res.data);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    setSubmitting(true);
    const token = Cookies.get("token");
    try {
      await axiosInstance.post(
        "/review",
        { productId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      fetchReviews(); // Refresh list
    } catch (error) {
      console.error("Failed to submit review", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
      // Logic for deletion if user is owner/admin can go here
  }

  // Calculate stats
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  return (
    <div id="reviews" className="mt-16 bg-card border border-border rounded-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Rating Summary */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="bg-secondary/30 rounded-lg p-6 text-center">
            <div className="text-5xl font-bold text-foreground mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-muted-foreground text-sm">
              Based on {reviews.length} reviews
            </p>
          </div>
        </div>

        {/* Reviews List & Form */}
        <div className="md:col-span-8 lg:col-span-9 space-y-10">
          {/* Write a Review */}
          {isAuthenticated ? (
            <div className="bg-secondary/10 rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Comment</label>
                <Textarea
                  value={comment}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows={4}
                  className="bg-background"
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          ) : (
            <div className="bg-secondary/20 rounded-lg p-6 text-center">
              <p className="text-muted-foreground mb-3">Please login to write a review.</p>
              <Button onClick={() => window.location.href = '/auth/login'} variant="outline">
                Login
              </Button>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground italic">No reviews yet. Be the first!</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="border-b border-border last:border-0 pb-6 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {review.user?.username || review.user?.firstName || "Anonymous"}
                        </p>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-gray-200 text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-foreground/80 text-sm leading-relaxed ml-13 pl-12">
                    {review.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
