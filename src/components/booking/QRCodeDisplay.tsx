
import React, { useState } from 'react';
import { Flashlight, FlashlightOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Booking } from '@/types';

interface QRCodeDisplayProps {
  booking: Booking;
  showFlashlightToggle?: boolean;
}

export function QRCodeDisplay({ booking, showFlashlightToggle = false }: QRCodeDisplayProps) {
  const [flashlightOn, setFlashlightOn] = useState(false);
  
  // Generate QR data from booking details
  const generateQRData = (booking: Booking) => {
    return JSON.stringify({
      action: 'book',
      bookingId: booking.id,
      slotId: booking.slotId,
      slotName: booking.slotName,
      slotType: booking.slotType,
      startTime: booking.startTime,
      endTime: booking.endTime,
      userId: booking.userId,
      userName: booking.userName,
    });
  };
  
  const toggleFlashlight = () => {
    setFlashlightOn(!flashlightOn);
    
    // Check if browser supports the flashlight API
    if ('navigator' in window && 'mediaDevices' in navigator) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          const track = stream.getVideoTracks()[0];
          // Check if track has torch capability without using property directly
          if (track) {
            try {
              // Using try/catch instead of direct property access
              // This works in supported devices and gracefully fails in others
              track.applyConstraints({
                advanced: [{ // Using any to bypass TypeScript constraint
                  torch: !flashlightOn 
                } as any]
              }).catch(e => console.log('Flashlight not supported on this device', e));
            } catch (error) {
              console.log('Flashlight control not supported', error);
            }
          }
        })
        .catch(err => {
          console.log('Error accessing camera for flashlight', err);
        });
    }
  };
  
  return (
    <div className={`flex flex-col items-center space-y-3 ${flashlightOn ? 'bg-yellow-50' : ''}`}>
      <div className={`qr-container p-4 bg-white rounded-lg shadow ${flashlightOn ? 'ring-2 ring-yellow-400 brightness-110' : ''}`}>
        <img 
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateQRData(booking))}`}
          alt="Booking QR Code"
          className="w-48 h-48"
        />
      </div>
      
      {showFlashlightToggle && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={toggleFlashlight}
          className={flashlightOn ? "bg-yellow-100 text-yellow-800 border-yellow-300" : ""}
        >
          {flashlightOn ? (
            <>
              <FlashlightOff className="h-4 w-4 mr-2" />
              Turn Off Flashlight
            </>
          ) : (
            <>
              <Flashlight className="h-4 w-4 mr-2" />
              Turn On Flashlight
            </>
          )}
        </Button>
      )}
    </div>
  );
}
