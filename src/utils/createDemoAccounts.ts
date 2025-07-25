import { supabase } from '@/integrations/supabase/client';

export async function createDemoAccounts() {
  const accounts = [
    {
      email: 'user@example.com',
      password: 'password123',
      name: 'Demo User',
      role: 'user'
    },
    {
      email: 'admin@example.com', 
      password: 'admin123',
      name: 'Demo Admin',
      role: 'admin'
    }
  ];

  const results = [];

  for (const account of accounts) {
    try {
      // Try to sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            name: account.name,
            role: account.role
          }
        }
      });

      if (error) {
        // If user already exists, that's fine
        if (error.message.includes('already registered')) {
          results.push({
            email: account.email,
            status: 'already_exists',
            message: 'User already exists'
          });
        } else {
          results.push({
            email: account.email,
            status: 'error',
            message: error.message
          });
        }
      } else {
        results.push({
          email: account.email,
          status: 'created',
          message: 'Account created successfully',
          userId: data.user?.id
        });
      }
    } catch (err) {
      results.push({
        email: account.email,
        status: 'error',
        message: (err as Error).message
      });
    }
  }

  return results;
}