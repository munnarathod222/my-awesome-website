import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const AuthContext = createContext(null);
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 Hours strict session expiration

const getStoredUser = () => {
  try {
    // 1. Check PocketBase authStore first
    if (pb.authStore.isValid && pb.authStore.model) {
      return pb.authStore.model;
    }

    // 2. Check localStorage backup with strict session expiration check
    const saved = localStorage.getItem('app_auth_user');
    const savedTimestamp = localStorage.getItem('app_session_timestamp');

    if (saved && savedTimestamp) {
      const age = Date.now() - parseInt(savedTimestamp, 10);
      if (age < SESSION_MAX_AGE_MS) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.id || parsed.email)) {
          // If it is the fallback admin session or any admin/superadmin without a valid SDK token, restore it to pb.authStore so apiServerClient has credentials
          if ((parsed.role === 'super_admin' || parsed.role === 'admin' || parsed.id === 'usr_munna_superadmin') && !pb.authStore.isValid) {
            pb.authStore.save('dummy-fallback-token-for-api-routing', {
              id: parsed.id || 'usr_munna_superadmin',
              email: parsed.email || 'operations@jaibhavanicargo.com',
              name: parsed.name || 'Vinod kumar Rathod',
              role: parsed.role || 'super_admin',
              status: parsed.status || 'active',
              collectionName: 'users'
            });
          }
          return parsed;
        }
      } else {
        // Expired session - purge storage
        console.warn('[AuthContext] Session expired due to max age limit (8h). Purging.');
        localStorage.removeItem('app_auth_user');
        localStorage.removeItem('app_session_timestamp');
        pb.authStore.clear();
      }
    }
  } catch (e) {
    console.error('[AuthContext] getStoredUser error:', e);
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [initialLoading, setInitialLoading] = useState(true);

  const checkUserApprovalStatus = async (email) => {
    try {
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
      if (error.message.includes('pending approval') || error.message.includes('rejected')) {
        throw error;
      }
      return true;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = getStoredUser();
        if (storedUser) {
          setCurrentUser(storedUser);
          localStorage.setItem('app_auth_user', JSON.stringify(storedUser));
        } else {
          setCurrentUser(null);
          localStorage.removeItem('app_auth_user');
          localStorage.removeItem('app_session_timestamp');
        }
      } catch (err) {
        console.error('[AuthContext] checkAuth error:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Email address and password are required.');
    }

    // Check signup approval status first
    await checkUserApprovalStatus(cleanEmail);

    let userRecord = null;

    // 1. Try PocketBase database authentication
    try {
      let authData;
      try {
        authData = await pb.collection('users').authWithPassword(cleanEmail, password, { $autoCancel: false });
      } catch (uErr) {
        authData = await pb.collection('_superusers').authWithPassword(cleanEmail, password, { $autoCancel: false });
      }
      userRecord = authData?.record || authData;
    } catch (pbErr) {
      console.warn('[AuthContext] Database auth check:', pbErr.message);
    }

    // 2. Master Account Verification for Super Admin (munnarathod222@gmail.com)
    if (!userRecord || !userRecord.id) {
      if ((cleanEmail === 'munnarathod222@gmail.com' || cleanEmail === 'operations@jaibhavanicargo.com') && (password === 'Munnarathod@25' || password === 'Munnarathod@2026')) {
        userRecord = {
          id: 'usr_munna_superadmin',
          email: cleanEmail,
          name: 'Vinod kumar Rathod',
          role: 'super_admin',
          status: 'active'
        };
        // Manually populate pb.authStore with dummy session details so apiServerClient can attach token headers
        pb.authStore.save('dummy-fallback-token-for-api-routing', {
          id: userRecord.id,
          email: userRecord.email,
          name: userRecord.name,
          role: userRecord.role,
          status: userRecord.status,
          collectionName: 'users'
        });
      }
    }

    // STRICT SECURITY: Reject invalid logins
    if (!userRecord || !userRecord.id) {
      throw new Error('Invalid email address or password. Please check your credentials.');
    }

    // Store verified session token and timestamp
    setCurrentUser(userRecord);
    localStorage.setItem('app_auth_user', JSON.stringify(userRecord));
    localStorage.setItem('app_session_timestamp', Date.now().toString());

    return userRecord;
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
      let authResponse;
      try {
        authResponse = await pb.collection('users').authWithPassword(currentUser.email, oldPassword, { $autoCancel: false });
      } catch (e) {
        authResponse = await pb.collection('_superusers').authWithPassword(currentUser.email, oldPassword, { $autoCancel: false });
      }

      if (!authResponse || (!authResponse.record && !authResponse.token)) {
        throw new Error("Old password verification failed.");
      }

      const targetCollection = authResponse.record?.collectionName || 'users';
      const recordId = authResponse.record?.id || currentUser.id;

      await pb.collection(targetCollection).update(recordId, {
        password: newPassword,
        passwordConfirm: newPassword,
      }, { $autoCancel: false });

      toast.success("Password updated successfully!");
    } catch (err) {
      console.error('[AuthContext:changePassword] Error:', err);
      throw new Error(err.message || "Failed to update password. Please check your current password.");
    }
  };

  const logout = () => {
    pb.authStore.clear();
    localStorage.removeItem('app_auth_user');
    localStorage.removeItem('app_session_timestamp');
    localStorage.removeItem('jbc_device_pin_profile');
    setCurrentUser(null);
    toast.info('You have been logged out safely.');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: Boolean(currentUser),
      initialLoading,
      login,
      signup,
      logout,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};