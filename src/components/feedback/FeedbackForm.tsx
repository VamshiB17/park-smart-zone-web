
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFeedbackContext } from '@/contexts/FeedbackContext';
import { toast } from 'sonner';

const feedbackSchema = z.object({
  comment: z.string().optional(),
});

type FeedbackFormProps = {
  onComplete?: () => void;
};

export function FeedbackForm({ onComplete }: FeedbackFormProps) {
  const { submitFeedback } = useFeedbackContext();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      comment: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof feedbackSchema>) => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await submitFeedback(rating, data.comment);
      
      // Reset form
      form.reset();
      setRating(0);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>How was your booking experience?</CardTitle>
        <CardDescription>
          Your feedback helps us improve our service for all users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <FormLabel>Rating</FormLabel>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 cursor-pointer transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  />
                ))}
              </div>
              {rating === 0 && (
                <p className="text-sm text-muted-foreground">Click to rate your experience</p>
              )}
            </div>
            
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your experience..."
                      {...field}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">Submit Feedback</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
