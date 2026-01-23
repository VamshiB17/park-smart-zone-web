import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const feedbackSchema = z.object({
  rating: z.enum(['1', '2', '3', '4', '5'], {
    required_error: "Please select a rating",
  }),
  experience: z.string().min(1, "Please describe your experience").max(500, "Description too long"),
  suggestions: z.string().optional(),
});

type FeedbackFormProps = {
  onComplete?: () => void;
};

export function FeedbackForm({ onComplete }: FeedbackFormProps) {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: undefined,
      experience: '',
      suggestions: '',
    },
  });

  async function onSubmit(data: z.infer<typeof feedbackSchema>) {
    if (!currentUser) {
      toast.error('You must be logged in to submit feedback');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: currentUser.id,
        rating: parseInt(data.rating),
        experience: data.experience,
        suggestions: data.suggestions || null,
      });
      
      if (error) throw error;
      
      toast.success('Thank you for your feedback!');
      form.reset();
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

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
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <div key={rating} className="flex flex-col items-center space-y-1">
                          <RadioGroupItem value={String(rating)} id={`rating-${rating}`} />
                          <Label htmlFor={`rating-${rating}`} className="text-xs">{rating}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe your experience</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you like or dislike about your booking experience?"
                      {...field}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="suggestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suggestions for improvement</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How can we make the booking process better?"
                      {...field}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Feedback
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
