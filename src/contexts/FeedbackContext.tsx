import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext, type AuthContextType } from './AuthContext';
import { toast } from 'sonner';

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  bookingId?: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

interface FeedbackContextType {
  feedbacks: Feedback[];
  userFeedbacks: Feedback[];
  submitFeedback: (rating: number, comment?: string, bookingId?: string) => Promise<void>;
  refreshFeedbacks: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function useFeedbackContext() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedbackContext must be used within a FeedbackProvider');
  }
  return context;
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const authContext = useContext(AuthContext) as AuthContextType | null;
  const currentUser = authContext?.currentUser || null;
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [userFeedbacks, setUserFeedbacks] = useState<Feedback[]>([]);

  // Fetch feedbacks from Supabase
  const refreshFeedbacks = useCallback(async () => {
    try {
      const { data: feedbackData, error } = await supabase
        .from('feedback')
        .select(`
          *,
          user_profiles!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const convertedFeedbacks: Feedback[] = feedbackData?.map((dbFeedback: any) => ({
        id: dbFeedback.id,
        userId: dbFeedback.user_id,
        userName: dbFeedback.user_profiles.name || 'Unknown User',
        bookingId: dbFeedback.booking_id,
        rating: dbFeedback.rating,
        comment: dbFeedback.comment,
        createdAt: new Date(dbFeedback.created_at),
      })) || [];

      setFeedbacks(convertedFeedbacks);
      
      if (currentUser) {
        setUserFeedbacks(convertedFeedbacks.filter(feedback => feedback.userId === currentUser.id));
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Failed to load feedbacks');
    }
  }, [currentUser]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('feedback_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, () => {
        console.log('Feedback data changed');
        refreshFeedbacks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshFeedbacks]);

  // Initialize data
  useEffect(() => {
    if (currentUser) {
      refreshFeedbacks();
    }
  }, [currentUser, refreshFeedbacks]);

  const submitFeedback = useCallback(async (rating: number, comment?: string, bookingId?: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to submit feedback");
      return;
    }

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: currentUser.id,
          booking_id: bookingId,
          rating,
          comment,
        });

      if (error) throw error;

      toast.success("Feedback submitted successfully!");
      refreshFeedbacks();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback: ' + (error as Error).message);
    }
  }, [currentUser, refreshFeedbacks]);

  const value = {
    feedbacks,
    userFeedbacks,
    submitFeedback,
    refreshFeedbacks,
  };

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>;
}