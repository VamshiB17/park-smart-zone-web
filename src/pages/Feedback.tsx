import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { FeedbackList } from '@/components/feedback/FeedbackList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Feedback() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
  }, [currentUser, navigate]);
  
  if (!currentUser) return null;
  
  return (
    <PageLayout>
      <div className="space-y-8 py-6">
        <h1 className="text-3xl font-bold">Feedback</h1>
        
        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
            <TabsTrigger value="view">My Feedback</TabsTrigger>
          </TabsList>
          
          <TabsContent value="submit">
            <FeedbackForm />
          </TabsContent>
          
          <TabsContent value="view">
            <Card>
              <CardHeader>
                <CardTitle>My Feedback History</CardTitle>
                <CardDescription>
                  View all the feedback you've submitted
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeedbackList showUserName={false} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}