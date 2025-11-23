import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Worker Configuration - Default fallback values
const DEFAULT_MOBILE_WORKER_URL = 'https://mobi.btspro24.xyz';
const DEFAULT_BUSINESS_WORKER_URL = 'https://web.btspro24.xyz';
const WORKER_AUTH_TOKEN = 'GDI-Auth-8c5e9a4f-7b1d-4f6c-8e3b-9a2d1e5f0b4a';

// Helper function to get worker config from settings
async function getWorkerConfig(supabaseClient: any, userType: 'mobile' | 'business') {
  try {
    const { data, error } = await supabaseClient
      .from('settings')
      .select('value')
      .eq('key', 'worker_config')
      .single();
    
    if (!error && data) {
      const config = data.value as {
        mobile_worker_url: string;
        business_worker_url: string;
        custom_domain: string;
      };
      
      // If custom domain is configured, use it
      if (config.custom_domain) {
        return `https://${config.custom_domain}`;
      }
      
      // Otherwise use the configured worker URLs
      return userType === 'mobile' 
        ? config.mobile_worker_url 
        : config.business_worker_url;
    }
  } catch (e) {
    console.log('Failed to load worker config from settings:', e);
  }
  
  // Fallback to default values
  return userType === 'mobile' 
    ? DEFAULT_MOBILE_WORKER_URL 
    : DEFAULT_BUSINESS_WORKER_URL;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get userId from URL parameter (passed from frontend after subscription check)
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return new Response('Missing userId parameter', { status: 401, headers: corsHeaders });
    }

    // Create Supabase client with service role for user verification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user exists and has active subscription
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .maybeSingle();

    if (subError) {
      console.error('Subscription error:', subError);
      return new Response('Error checking subscription', { status: 500, headers: corsHeaders });
    }

    if (!subscription) {
      return new Response('No active subscription', { status: 403, headers: corsHeaders });
    }

    // Get user profile for user_type
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('user_type')
      .eq('user_id', userId)
      .single();

    // Get worker URL based on user type and settings
    const WORKER_URL = await getWorkerConfig(supabaseClient, profile?.user_type || 'mobile');
    console.log('Using worker URL:', WORKER_URL);

    // Get the path from query params
    const path = url.searchParams.get('path') || '/0:/';
    
    console.log('Proxying request to:', `${WORKER_URL}${path}`);

    // Fetch from Worker with authentication
    const workerResponse = await fetch(`${WORKER_URL}${path}`, {
      method: req.method,
      headers: {
        'X-Auth-Token': WORKER_AUTH_TOKEN,
        'User-Agent': req.headers.get('user-agent') || 'Mozilla/5.0',
      },
    });

    if (!workerResponse.ok) {
      console.error('Worker response error:', workerResponse.status);
      return new Response(`Worker error: ${workerResponse.status}`, { 
        status: workerResponse.status, 
        headers: corsHeaders 
      });
    }

    // Get content type from worker response
    const contentType = workerResponse.headers.get('content-type') || 'text/html';
    
    // Pass through the response
    const body = await workerResponse.arrayBuffer();
    
    return new Response(body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
      },
    });

  } catch (error) {
    console.error('Error in tv-proxy:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
