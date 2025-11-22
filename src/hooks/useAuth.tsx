import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getDeviceFingerprint, getDeviceInfo } from '@/utils/deviceFingerprint';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signUp: (mobile: string, password: string, userType: 'mobile' | 'business') => Promise<{ error: any }>;
  signIn: (mobile: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile data when user is authenticated
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signUp = async (mobile: string, password: string, userType: 'mobile' | 'business') => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: `${mobile}@panel.com`,
        password,
        options: {
          data: {
            mobile_number: mobile,
            user_type: userType
          }
        }
      });

      if (error) {
        toast({
          title: "সাইনআপ ব্যর্থ",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Store user credentials for admin access - REMOVED FOR SECURITY
      // Raw password storage is a security vulnerability

      // Log the signup activity
      if (data.user) {
        try {
          await supabase.rpc('log_activity', {
            p_user_id: data.user.id,
            p_action: 'user_created',
            p_description: `নতুন ${userType === 'mobile' ? 'মোবাইল' : 'বিজনেস'} ইউজার তৈরি হয়েছে: ${mobile}`,
            p_metadata: {
              user_type: userType,
              mobile_number: mobile,
            }
          });
        } catch (activityError) {
          console.error('Error logging activity:', activityError);
          // Don't fail signup if activity logging fails
        }
      }

      toast({
        title: "সাইনআপ সফল",
        description: "আপনার অ্যাকাউন্ট তৈরি হয়েছে।",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "ত্রুটি",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (mobile: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting login with:', `${mobile}@panel.com`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${mobile}@panel.com`,
        password,
      });

      console.log('Login response:', { data, error });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "লগইন ব্যর্থ",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (!data.user) {
        const noUserError = new Error('No user returned');
        toast({
          title: "লগইন ব্যর্থ",
          description: "ইউজার তথ্য পাওয়া যায়নি",
          variant: "destructive",
        });
        return { error: noUserError };
      }

      // Check approval status and role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('approval_status, display_name, role')
        .eq('user_id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      }

      // IMPORTANT: Admin users bypass approval checks
      if (profileData?.role === 'admin') {
        console.log('Admin user - bypassing approval check');
      } else {
        // Allow pending users to log in; only block rejected accounts
        if (profileData?.approval_status === 'rejected') {
          await supabase.auth.signOut();
          toast({
            title: "অনুমোদন প্রত্যাখ্যান",
            description: "আপনার অ্যাকাউন্ট প্রত্যাখ্যান করা হয়েছে।",
            variant: "destructive",
          });
          return { error: new Error('Account rejected') };
        }
      }

      // Device validation and session tracking
      try {
        const deviceFingerprint = await getDeviceFingerprint();
        const deviceName = getDeviceInfo();
        const userAgent = navigator.userAgent;

        const { data: validationData, error: validationError } = await supabase.functions.invoke('validate-login', {
          body: {
            userId: data.user.id,
            deviceFingerprint,
            deviceName,
            userAgent,
          }
        });

        if (validationError) {
          console.error('Validation error:', validationError);
          throw validationError;
        }

        if (!validationData.allowed) {
          await supabase.auth.signOut();
          
          toast({
            title: validationData.reason === 'suspicious' ? 'সন্দেহজনক কার্যকলাপ' : 'ডিভাইস লিমিট',
            description: validationData.message,
            variant: "destructive",
          });
          
          return { error: new Error(validationData.message) };
        }
      } catch (deviceError: any) {
        console.error('Device validation error:', deviceError);
        
        // CRITICAL: Block login if device validation fails
        await supabase.auth.signOut();
        
        toast({
          title: "ডিভাইস যাচাইকরণ ব্যর্থ",
          description: "আপনার ডিভাইস যাচাই করা যায়নি। দয়া করে আবার চেষ্টা করুন।",
          variant: "destructive",
        });
        
        return { error: deviceError };
      }

      console.log('Login successful for user:', data.user.id);
      
      // Log the login activity
      try {
        await supabase.rpc('log_activity', {
          p_user_id: data.user.id,
          p_action: 'login',
          p_description: `${profileData?.display_name || mobile} সফলভাবে লগইন করেছে`,
          p_metadata: {
            device_fingerprint: await getDeviceFingerprint(),
            device_name: getDeviceInfo(),
          }
        });
      } catch (activityError) {
        console.error('Error logging activity:', activityError);
        // Don't fail login if activity logging fails
      }
      
      toast({
        title: "সফলভাবে লগইন হয়েছে",
        description: "আপনার ড্যাশবোর্ডে স্বাগতম",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      toast({
        title: "ত্রুটি",
        description: error.message || 'কিছু ভুল হয়েছে',
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const currentUser = user;
      
      // Deactivate current device session before logout
      if (currentUser) {
        try {
          const deviceFingerprint = await getDeviceFingerprint();
          await supabase
            .from('user_sessions')
            .update({ is_active: false })
            .eq('user_id', currentUser.id)
            .eq('device_fingerprint', deviceFingerprint);
          
          console.log('Device session deactivated successfully');
        } catch (sessionError) {
          console.error('Error deactivating session:', sessionError);
        }
      }
      
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      toast({
        title: "লগআউট সফল",
        description: "আপনি সফলভাবে লগআউট হয়েছেন।",
      });
    } catch (error: any) {
      toast({
        title: "ত্রুটি",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}