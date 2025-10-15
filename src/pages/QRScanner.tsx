
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { QRScanner } from '@/components/qr/QRScanner';
import { Button } from '@/components/ui/button';
import { QrCode, ArrowLeft } from 'lucide-react';

export default function QRScannerPage() {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);

  const handleBookingScanned = (bookingData: any) => {
    console.log('Scanned booking data:', bookingData);
    // The scanner component already displays the booking details
  };

  return (
    <PageLayout>
      <div className="space-y-8 py-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">QR Code Scanner</h1>
        </div>
        
        {!showScanner ? (
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="bg-white rounded-lg shadow p-8">
              <QrCode className="h-16 w-16 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-semibold mb-4">Scan Booking QR Codes</h2>
              <p className="text-gray-600 mb-6">
                Use your device camera to scan parking booking QR codes and view detailed information including start and end times.
              </p>
              
              <div className="space-y-4">
                <Button size="lg" onClick={() => setShowScanner(true)} className="w-full">
                  <QrCode className="h-5 w-5 mr-2" />
                  Start Scanning
                </Button>
                
                <div className="text-sm text-gray-500">
                  <p>Make sure to allow camera permissions when prompted</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">What you can scan:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Booking QR codes from the ParkSmart app</li>
                <li>• View detailed start and end times</li>
                <li>• See slot information and user details</li>
                <li>• Verify booking authenticity</li>
              </ul>
            </div>
          </div>
        ) : (
          <QRScanner 
            onClose={() => setShowScanner(false)}
            onBookingScanned={handleBookingScanned}
          />
        )}
      </div>
    </PageLayout>
  );
}
