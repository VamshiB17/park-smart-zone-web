
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { SlotGrid } from '@/components/parking/SlotGrid';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParkingContext } from '@/contexts/ParkingContext';
import { BookingForm } from '@/components/booking/BookingForm';

export default function Slots() {
  const { currentUser } = useAuth();
  const { slots } = useParkingContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'list' | 'book'>('list');
  const [filterType, setFilterType] = useState<'all' | 'normal' | 'electric'>('all');
  
  // Redirect if not logged in
  if (!currentUser) {
    navigate('/auth');
    return null;
  }
  
  return (
    <PageLayout>
      <div className="space-y-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Parking Slots</h1>
        </div>
        
        <Tabs defaultValue="list" onValueChange={(value) => setActiveTab(value as any)}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="list">View Slots</TabsTrigger>
              <TabsTrigger value="book">Book a Slot</TabsTrigger>
            </TabsList>
            
            {activeTab === 'list' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterType('all')}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filterType === 'normal' ? 'default' : 'outline'}
                  onClick={() => setFilterType('normal')}
                >
                  Normal
                </Button>
                <Button
                  size="sm"
                  variant={filterType === 'electric' ? 'default' : 'outline'}
                  onClick={() => setFilterType('electric')}
                >
                  Electric
                </Button>
              </div>
            )}
          </div>
          
          <TabsContent value="list" className="mt-6">
            <div className="bg-white rounded-lg shadow p-6">
              <SlotGrid 
                slots={slots} 
                filterType={filterType}
                onSlotClick={() => setActiveTab('book')}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="book" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <BookingForm 
                onSuccess={() => navigate('/bookings')}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
