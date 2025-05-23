
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: undefined,
      experience: '',
      suggestions: '',
    },
  });

  function onSubmit(data: z.infer<typeof feedbackSchema>) {
    // In a real app, this would send the feedback to a server
    console.log('Feedback submitted:', data);
    toast.success('Thank you for your feedback!');
    
    if (onComplete) {
      onComplete();
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
            
            <Button type="submit" className="w-full">Submit Feedback</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
