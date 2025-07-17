
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { QRCodeDisplay } from '@/components/booking/QRCodeDisplay';
import { Button } from '@/components/ui/button';
import { BookingWithDetails } from '@/types';

type BookingSuccessDialogProps = {
  open: boolean;
  onClose: () => void;
  booking: BookingWithDetails | null;
};

export function BookingSuccessDialog({ open, onClose, booking }: BookingSuccessDialogProps) {
  const [showFeedback, setShowFeedback] = React.useState(false);
  
  const handleFeedbackComplete = () => {
    setShowFeedback(false);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showFeedback ? "Share Your Feedback" : "Booking Successful!"}
          </DialogTitle>
          <DialogDescription>
            {showFeedback 
              ? "Help us improve our service with your feedback."
              : "Your parking slot has been reserved successfully."}
          </DialogDescription>
        </DialogHeader>
        
        {!showFeedback && booking && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-4">
              <QRCodeDisplay booking={booking} />
              
              <div className="mt-4 text-center space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Slot:</span> {booking.slotName} ({booking.slotType})
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Date:</span> {new Date(booking.startTime).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Time:</span> {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => setShowFeedback(true)}>
                Share Feedback
              </Button>
            </div>
          </div>
        )}
        
        {showFeedback && (
          <FeedbackForm onComplete={handleFeedbackComplete} />
        )}
      </DialogContent>
    </Dialog>
  );
}
