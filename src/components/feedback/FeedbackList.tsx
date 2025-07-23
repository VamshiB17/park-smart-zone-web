import React from 'react';
import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFeedbackContext, Feedback } from '@/contexts/FeedbackContext';

interface FeedbackListProps {
  showUserName?: boolean;
  limit?: number;
}

export function FeedbackList({ showUserName = true, limit }: FeedbackListProps) {
  const { feedbacks } = useFeedbackContext();

  const displayFeedbacks = limit ? feedbacks.slice(0, limit) : feedbacks;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (displayFeedbacks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No feedback available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {displayFeedbacks.map((feedback) => (
        <Card key={feedback.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showUserName && (
                  <Badge variant="outline">{feedback.userName}</Badge>
                )}
                <div className="flex items-center gap-1">
                  {renderStars(feedback.rating)}
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {format(feedback.createdAt, 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
          </CardHeader>
          {feedback.comment && (
            <CardContent className="pt-0">
              <p className="text-gray-700">{feedback.comment}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}