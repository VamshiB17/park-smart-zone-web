
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Car, CircleParking, Clock, Zap, User } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  return <PageLayout>
      {/* Hero Section */}
      <section className="py-12 md:py-24">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-10 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                The Smarter Way to Park
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Find and book parking spaces in real-time. No more driving in circles looking for a spot.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate('/auth')}>
                  Get Started
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/slots')}>
                  View Available Slots
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="bg-gray-100 rounded-lg overflow-hidden shadow-xl p-6 md:p-10">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => <div key={i} className={`aspect-video rounded-md flex items-center justify-center ${i % 3 === 0 ? 'bg-parking-occupied/10 border border-parking-occupied' : i % 4 === 0 ? 'bg-parking-electric/10 border border-parking-electric' : 'bg-parking-available/10 border border-parking-available'}`}>
                      <span className="font-semibold">
                        {`A-${i + 1}`}
                      </span>
                    </div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Smart Parking Benefits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Save Time</h3>
              <p className="text-gray-600">
                No more circling around looking for parking. Find and reserve your spot in seconds.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CircleParking className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Guaranteed Parking</h3>
              <p className="text-gray-600">
                Pre-book your spot and arrive with peace of mind knowing your space is waiting.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Zap className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Electric Vehicle Support</h3>
              <p className="text-gray-600">
                Dedicated charging spots for electric vehicles, helping you go green.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-12 md:py-20 bg-primary text-white">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Park Smarter?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of drivers who have simplified their parking experience with ParkSmart.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" onClick={() => navigate('/auth')}>
              <User className="mr-2 h-4 w-4" /> Sign Up Now
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>;
}
