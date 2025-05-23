
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { SlotManagement } from '@/components/admin/SlotManagement';

export default function AdminSlots() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not logged in
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    
    // Redirect regular users to their dashboard
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
  }, [currentUser, isAdmin, navigate]);
  
  // Prevent flash of content before redirect
  if (!currentUser || !isAdmin) return null;
  
  return (
    <PageLayout>
      <div className="space-y-8 py-6">
        <SlotManagement />
      </div>
    </PageLayout>
  );
}
