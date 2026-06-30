import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const checkUserApprovalStatus = async (email) => {
    try {
      // Check if there's a signup request for this email
      // Note: Normal users might not have list permission for signup_requests depending on rules,
      // but if the query succeeds, we validate the status.
      const reqs = await pb.collection('signup_requests').getList(1, 1, { 
        filter: `email="${email}"`, 
        $autoCancel: false 
      });
      
      if (reqs.items.length > 0) {
        const status = reqs.items[0].status;
        if (status === 'Pending') throw new Error('Your account is pending approval. Please wait for admin confirmation.');
        if (status === 'Rejected') throw new Error('Your request has been rejected. Contact administrator.');
      }
      return true;
    } catch (error) {
      // Pass through our custom errors
      if (error.message.includes('pending approval') || error.message.includes('rejected')) {
        throw error;
      }
      // If 403 Forbidden (normal user without admin rights), we assume they are approved 
      // because they successfully authenticated with authWithPassword.
      return true;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (pb.authStore.isValid && pb.authStore.model) {
        try {
          // Disable autoCancel for reliable auth refresh
          const authData = await pb.collection('users').authRefresh({ $autoCancel: false });
          setCurrentUser(authData.record);
        } catch (error) {
          console.error("Auth refresh failed", error);
          pb.authStore.clear();
          setCurrentUser(null);
        }
      }
      setInitialLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
      
      if (authData.record.status === 'inactive') {
        pb.authStore.clear();
        throw new Error('Account is inactive. Please contact administrator.');
      }

      // Check signup request approval status
      await checkUserApprovalStatus(email);
      
      setCurrentUser(authData.record);
      return authData.record;
    } catch (error) {
      pb.authStore.clear();
      throw error;
    }
  };

  const signup = async (data) => {
    try {
      const record = await pb.collection('users').create({
        ...data,
        status: 'active'
      }, { $autoCancel: false });
      
      await login(data.email, data.password);
      return record;
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    if (!currentUser) {
      throw new Error("No authenticated user found.");
    }

    try {
      console.log('[AuthContext:changePassword] Attempting to verify old password for:', currentUser.email);
      
      // 1. Verify old password
      const authResponse = await pb.collection('users').authWithPassword(currentUser.email, oldPassword, { $autoCancel: false });
      console.log('[AuthContext:changePassword] Old password verified successfully. User ID:', authResponse.record.id);

      // 2. Update password in database
      console.log('[AuthContext:changePassword] Attempting to update password in database...');
      const updatePayload = {
        oldPassword: oldPassword, // Required by PocketBase when user changes their own password
        password: newPassword,
        passwordConfirm: newPassword
      };
      
      const record = await pb.collection('users').update(currentUser.id, updatePayload, { $autoCancel: false });
      console.log('[AuthContext:changePassword] Password updated successfully for user ID:', record.id);
      
      return record;
    } catch (error) {
      console.error('[AuthContext:changePassword] Password change failed API error:', {
        status: error?.status || error?.response?.code,
        message: error?.message,
        data: error?.response?.data
      });
      // Rethrow to let the modal handle the UI feedback
      throw error;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    toast.info('You have been logged out.');
  };

  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, changePassword, logout, isAuthenticated, initialLoading, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};