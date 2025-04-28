
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { SlotManagement } from '@/components/admin/SlotManagement';

export default function AdminSlots() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not logged in or not an admin
  if (!currentUser || !isAdmin) {
    navigate('/auth');
    return null;
  }
  
  return (
    <PageLayout>
      <div className="space-y-8 py-6">
        <SlotManagement />
      </div>
    </PageLayout>
  );
}
