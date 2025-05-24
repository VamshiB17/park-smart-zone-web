
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Flashlight, FlashlightOff } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ScannedBookingData {
  action: string;
  bookingId: string;
  slotId: string;
  slotName: string;
  slotType: string;
  startTime: string;
  endTime: string;
  userId: string;
  userName: string;
}

interface QRScannerProps {
  onClose: () => void;
  onBookingScanned?: (bookingData: ScannedBookingData) => void;
}

export function QRScanner({ onClose, onBookingScanned }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedBookingData | null>(null);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setIsScanning(true);
        scanForQR();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const toggleFlashlight = async () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      if (track) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashlightOn } as any]
          });
          setFlashlightOn(!flashlightOn);
        } catch (error) {
          console.log('Flashlight not supported on this device');
          toast.error('Flashlight not supported on this device');
        }
      }
    }
  };

  const scanForQR = () => {
    const scan = () => {
      if (!isScanning || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const qrResult = detectQRCode(imageData);
        
        if (qrResult) {
          try {
            const bookingData = JSON.parse(qrResult) as ScannedBookingData;
            if (bookingData.action === 'book' && bookingData.startTime && bookingData.endTime) {
              setScannedData(bookingData);
              setIsScanning(false);
              if (onBookingScanned) {
                onBookingScanned(bookingData);
              }
              return;
            }
          } catch (error) {
            console.error('Invalid QR code data:', error);
          }
        }
      }

      requestAnimationFrame(scan);
    };

    scan();
  };

  // Simple QR code detection simulation
  // In a real app, you'd use a proper QR code detection library like jsQR
  const detectQRCode = (imageData: ImageData): string | null => {
    // This is a mock implementation
    // In reality, you'd use a library like jsQR to decode the QR code
    // For demo purposes, we'll simulate QR detection
    return null;
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: format(date, 'PPP'),
        time: format(date, 'HH:mm')
      };
    } catch (error) {
      return {
        date: 'Invalid date',
        time: 'Invalid time'
      };
    }
  };

  const handleManualInput = () => {
    // For demo purposes, let's simulate a scanned QR code
    const mockBookingData: ScannedBookingData = {
      action: 'book',
      bookingId: 'booking-123',
      slotId: 'slot-A1',
      slotName: 'A-1',
      slotType: 'normal',
      startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
      userId: 'user-123',
      userName: 'Demo User'
    };
    
    setScannedData(mockBookingData);
    setIsScanning(false);
    if (onBookingScanned) {
      onBookingScanned(mockBookingData);
    }
    toast.success('QR code scanned successfully!');
  };

  if (scannedData) {
    const startDateTime = formatDateTime(scannedData.startTime);
    const endDateTime = formatDateTime(scannedData.endTime);

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Scanned Booking Details</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Slot {scannedData.slotName}</h3>
              <p className="text-sm text-gray-600 capitalize">{scannedData.slotType} parking slot</p>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Start Time:</p>
                <p className="text-lg">{startDateTime.date}</p>
                <p className="text-xl font-semibold text-green-600">{startDateTime.time}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">End Time:</p>
                <p className="text-lg">{endDateTime.date}</p>
                <p className="text-xl font-semibold text-red-600">{endDateTime.time}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Booked by:</p>
                <p className="text-lg">{scannedData.userName}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button className="flex-1" onClick={onClose}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Scan QR Code</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 bg-gray-200 rounded-lg object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {isScanning && (
              <div className="absolute inset-0 border-2 border-blue-500 rounded-lg">
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                    Position QR code within frame
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFlashlight}
              className="flex-1"
            >
              {flashlightOn ? (
                <>
                  <FlashlightOff className="h-4 w-4 mr-2" />
                  Flash Off
                </>
              ) : (
                <>
                  <Flashlight className="h-4 w-4 mr-2" />
                  Flash On
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualInput}
              className="flex-1"
            >
              Demo Scan
            </Button>
          </div>
          
          <p className="text-sm text-gray-600 text-center">
            Point your camera at a booking QR code to scan it
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
