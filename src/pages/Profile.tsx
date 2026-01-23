import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useParkingContext } from '@/contexts/ParkingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Calendar, Car, Clock, CheckCircle, XCircle, Edit2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Profile() {
  const { currentUser, isAdmin } = useAuth();
  const { userBookings } = useParkingContext();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<{ created_at: string } | null>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    
    // Redirect admin to admin dashboard
    if (isAdmin) {
      navigate('/admin/dashboard');
      return;
    }

    setName(currentUser.name);
    fetchProfileData();
  }, [currentUser, isAdmin, navigate]);

  const fetchProfileData = async () => {
    if (!currentUser) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (!error && data) {
      setProfileData(data);
    }
  };

  const handleSave = async () => {
    if (!currentUser || !name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', currentUser.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      setIsEditing(false);
      // Refresh the page to get updated user data
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(currentUser?.name || '');
    setIsEditing(false);
  };

  if (!currentUser || isAdmin) return null;

  // Calculate booking stats
  const activeBookings = userBookings.filter(b => b.status === 'active').length;
  const completedBookings = userBookings.filter(b => b.status === 'completed').length;
  const cancelledBookings = userBookings.filter(b => b.status === 'cancelled').length;
  const totalBookings = userBookings.length;

  return (
    <PageLayout>
      <div className="space-y-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Name
                  </Label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        disabled={loading}
                      />
                      <Button onClick={handleSave} disabled={loading} size="icon">
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="icon" disabled={loading}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <span className="font-medium">{currentUser.name}</span>
                      <Button onClick={() => setIsEditing(true)} variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <div className="p-3 bg-muted rounded-md">
                    <span className="font-medium">{currentUser.email}</span>
                  </div>
                </div>

                {profileData && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </Label>
                    <div className="p-3 bg-muted rounded-md">
                      <span className="font-medium">
                        {format(new Date(profileData.created_at), 'MMMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Booking Statistics
              </CardTitle>
              <CardDescription>
                Your parking activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  Total Bookings
                </span>
                <span className="text-2xl font-bold">{totalBookings}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-md">
                <span className="flex items-center gap-2 text-sm text-primary">
                  <Car className="h-4 w-4" />
                  Active
                </span>
                <span className="text-2xl font-bold text-primary">{activeBookings}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4" />
                  Completed
                </span>
                <span className="text-2xl font-bold text-muted-foreground">{completedBookings}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-md">
                <span className="flex items-center gap-2 text-sm text-destructive">
                  <XCircle className="h-4 w-4" />
                  Cancelled
                </span>
                <span className="text-2xl font-bold text-destructive">{cancelledBookings}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigate('/slots')}>
                <Car className="h-4 w-4 mr-2" />
                Book a Slot
              </Button>
              <Button variant="outline" onClick={() => navigate('/bookings')}>
                <Clock className="h-4 w-4 mr-2" />
                View My Bookings
              </Button>
              <Button variant="outline" onClick={() => navigate('/help')}>
                Help Center
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
