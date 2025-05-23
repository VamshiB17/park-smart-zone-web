
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InfoIcon, MailIcon, PhoneIcon } from 'lucide-react';
import { toast } from 'sonner';

const contactFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

export default function Help() {
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof contactFormSchema>) {
    toast.success("Support request submitted successfully");
    form.reset();
  }

  return (
    <PageLayout>
      <div className="space-y-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Help Center</h1>
        </div>

        <Tabs defaultValue="faq">
          <TabsList className="mb-6">
            <TabsTrigger value="faq">FAQs</TabsTrigger>
            <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
          </TabsList>

          {/* FAQ Section */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How do I book a parking slot?</AccordionTrigger>
                    <AccordionContent>
                      To book a parking slot, navigate to the "Book a Slot" page, select your desired date and time, 
                      choose an available slot from the map, and confirm your booking. You'll receive a QR code that 
                      you can use to access the parking facility.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>What's the difference between normal and electric slots?</AccordionTrigger>
                    <AccordionContent>
                      Electric slots are equipped with EV charging facilities for electric vehicles. Normal slots 
                      are standard parking spaces without charging capabilities. Electric slots are marked with a blue 
                      indicator on the left side.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How do I cancel my booking?</AccordionTrigger>
                    <AccordionContent>
                      To cancel a booking, go to "My Bookings" page, find the booking you want to cancel, 
                      and click the "Cancel Booking" button. Your slot will be released and made available 
                      for others to book.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>What if the system is offline?</AccordionTrigger>
                    <AccordionContent>
                      If the system goes offline, your existing bookings are still valid. The app will 
                      use cached data to display your active bookings. Once connectivity is restored, 
                      the system will synchronize with the central database automatically.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>How do I use the QR code?</AccordionTrigger>
                    <AccordionContent>
                      Present the QR code on your screen to the scanner at the parking entrance. If lighting 
                      conditions are poor, use the flashlight toggle feature to improve QR code visibility. 
                      The system will validate your booking and grant access.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tutorial Section */}
          <TabsContent value="tutorial">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started with ParkSmart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">1. Creating an Account</h3>
                    <p className="text-gray-600">
                      Start by registering an account with your email address. Click on "Sign Up" 
                      and follow the instructions to create your account.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">2. Finding an Available Slot</h3>
                    <p className="text-gray-600">
                      Navigate to the "Slots" page to see all available parking spaces. Green slots 
                      are available, and red ones are already occupied. You can filter by normal or 
                      electric charging slots based on your needs.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">3. Making a Booking</h3>
                    <p className="text-gray-600">
                      Select "Book a Slot" tab, choose your date and time, select an available parking slot, 
                      and confirm your booking. The system will generate a unique QR code for your booking.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">4. Using Your QR Code</h3>
                    <p className="text-gray-600">
                      Access your booking from "My Bookings". Present the QR code at the parking entrance. 
                      Use the flashlight feature if needed for better visibility in low light conditions.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">5. Managing Your Bookings</h3>
                    <p className="text-gray-600">
                      On the "My Bookings" page, you can view all your active, completed, and cancelled bookings. 
                      You can cancel active bookings if your plans change.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Support Section */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="text-primary h-5 w-5" />
                      <span className="font-medium">+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MailIcon className="text-primary h-5 w-5" />
                      <span className="font-medium">support@parksmart.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <InfoIcon className="text-primary h-5 w-5" />
                      <span className="font-medium">Available 24/7</span>
                    </div>
                  </div>
                  
                  <div>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="How can we help you?" 
                                  className="min-h-[120px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full">Submit Request</Button>
                      </form>
                    </Form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Policy Section */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h3>Data Collection and Usage</h3>
                <p>
                  ParkSmart collects personal information including your name, email address, and vehicle information 
                  when you create an account. We also collect booking data including dates, times, and locations 
                  when you use our service.
                </p>
                
                <h3>How We Use Your Data</h3>
                <p>
                  Your data is used to provide and improve our parking services. This includes:
                </p>
                <ul>
                  <li>Processing and managing your parking bookings</li>
                  <li>Sending booking confirmations and reminders</li>
                  <li>Improving our service based on usage patterns</li>
                  <li>Addressing support inquiries and resolving issues</li>
                </ul>
                
                <h3>Data Storage and Security</h3>
                <p>
                  We implement industry-standard security measures to protect your personal information. 
                  Your data is stored in secure databases with encryption and access controls.
                </p>
                
                <h3>Offline Data Usage</h3>
                <p>
                  When you use our app in offline mode, we temporarily store your booking information on your device 
                  to ensure continuous service. This data is synchronized with our servers once connectivity is restored.
                </p>
                
                <h3>Third-Party Sharing</h3>
                <p>
                  We do not sell your personal information to third parties. We may share anonymized, 
                  aggregated data for analytical purposes to improve our services.
                </p>
                
                <h3>Your Rights</h3>
                <p>
                  You have the right to access, correct, or delete your personal information. To exercise these rights, 
                  please contact us through our support channels.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
