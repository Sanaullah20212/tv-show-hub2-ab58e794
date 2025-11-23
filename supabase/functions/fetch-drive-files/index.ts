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
    // Verify user has active subscription
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('user_type, role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile error:', profileError);
      throw new Error('Profile not found');
    }

    // Check if user is admin - admins bypass subscription check
    const isAdmin = profile.role === 'admin';
    
    if (!isAdmin) {
      // Check active subscription for non-admin users
      const { data: subscription, error: subError } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .maybeSingle();

      if (subError) {
        console.error('Subscription error:', subError);
        throw new Error('Error checking subscription');
      }

      if (!subscription) {
        return new Response(
          JSON.stringify({ error: 'No active subscription', files: [] }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    const { folderName, userType: requestedUserType } = await req.json();
    
    const folderPath = folderName || '';
    const workerPath = folderPath ? `/0:/${folderPath}` : '/0:/';
    console.log('Fetching files from path:', workerPath);
    
    // Decide which user type's drive to use
    const requestedUserTypeSanitized =
      requestedUserType === 'mobile' || requestedUserType === 'business'
        ? requestedUserType
        : null;
    const effectiveUserType = isAdmin && requestedUserTypeSanitized
      ? requestedUserTypeSanitized
      : profile.user_type;
    
    // Get worker URL based on user type and settings
    const WORKER_URL = await getWorkerConfig(supabaseClient, effectiveUserType);
    console.log('Using worker URL:', WORKER_URL);
    
    // Fetch files using X-Auth-Token header
    const fullUrl = `${WORKER_URL}${workerPath}`;
    console.log('Full URL:', fullUrl);
    
    const filesResponse = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'X-Auth-Token': WORKER_AUTH_TOKEN,
      },
    });

    console.log('Files page response status:', filesResponse.status);
    
    const htmlText = await filesResponse.text();
    console.log('HTML response length:', htmlText.length);
    console.log('HTML response preview (first 500 chars):', htmlText.substring(0, 500));

    if (!filesResponse.ok) {
      console.error('Files fetch failed - status:', filesResponse.status);
      console.error('Full HTML error response:', htmlText);
      throw new Error(`Failed to fetch files: ${filesResponse.status}. Response: ${htmlText.substring(0, 200)}`);
    }

    // Try to parse JSON response first
    const files: any[] = [];
    try {
      const json = JSON.parse(htmlText);
      if (json && Array.isArray(json.files)) {
        console.log(`Parsed ${json.files.length} items from JSON response`);
        for (const item of json.files as any[]) {
          const isFolder = !!item.isFolder;
          const path = item.path as string | undefined;
          files.push({
            id: path || item.fileId || item.name,
            name: item.name,
            size: item.size || (item.rawSize != null ? String(item.rawSize) : '0'),
            downloadUrl: item.downloadPath
              ? `${WORKER_URL}${item.downloadPath}`
              : path
                ? `${WORKER_URL}/0:/${path}`
                : `${WORKER_URL}/0:/`,
            mimeType: item.mimeType || (isFolder ? 'folder' : 'application/octet-stream'),
            isFolder,
            path,
          });
        }
      }
    } catch (e) {
      console.log('Response is not pure JSON, falling back to HTML parsing:', e);
    }

    // If JSON parsing didn't produce any files, fall back to HTML parsing
    if (files.length === 0) {
      // Parse HTML to extract file information
      // Try to find API endpoint or data embedded in HTML
      
      // Check if there's JSON data embedded in the HTML inside script tags
      const scriptMatch = htmlText.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
      
      if (scriptMatch) {
      console.log(`Found ${scriptMatch.length} script tags`);
      
      // Look for file data in script tags
      for (const script of scriptMatch) {
        // Try to find JSON arrays or objects that might contain file data
        const jsonMatch = script.match(/(?:files|items|data)\s*[:=]\s*(\[[\s\S]*?\])/i);
        if (jsonMatch) {
          try {
            const fileData = JSON.parse(jsonMatch[1]);
            console.log('Found file data in script:', fileData);
            
            if (Array.isArray(fileData)) {
              fileData.forEach((item: any) => {
                if (item.name || item.fileName) {
                  files.push({
                    id: item.id || item.path || item.name,
                    name: item.name || item.fileName,
                    size: item.size || '0',
                    downloadUrl: `${WORKER_URL}${item.path || item.url || '/' + item.name}`,
                    mimeType: item.mimeType || 'application/octet-stream',
                    isFolder: item.isFolder || item.type === 'folder',
                  });
                }
              });
            }
          } catch (e) {
            console.log('Failed to parse JSON from script:', e);
          }
        }
      }
      
      // If no files found in scripts, try HTML parsing
      if (files.length === 0) {
        const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
        const allLinks = [...htmlText.matchAll(linkRegex)];
        
        console.log(`Found ${allLinks.length} total links in HTML`);
        
        for (const match of allLinks) {
          const href = match[1];
          const name = match[2].trim();
          
          // Skip navigation links, empty, or parent directory
          if (!name || name === '..' || name === '.' || 
              href.includes('login') || href.includes('logout') || 
              href === '/' || href === '#' || name === folderName) {
            continue;
          }
          
          // Check if it's a valid file/folder link
          if (href.startsWith('/0:') || href.startsWith('0:') || 
              (href.startsWith('/') && !href.includes('http') && href.length > 1)) {
            
            const cleanHref = href.startsWith('/') ? href : '/' + href;
            const isFolder = href.endsWith('/');
            
            files.push({
              id: cleanHref,
              name: name,
              size: '0',
              downloadUrl: `${WORKER_URL}${cleanHref}`,
              mimeType: isFolder ? 'folder' : 'application/octet-stream',
              isFolder: isFolder,
            });
          }
        }
      }
      }
    }
    
    console.log(`Parsed ${files.length} files/folders from HTML`);
    
    // If no files found, log a larger sample of HTML for debugging
    if (files.length === 0) {
      console.log('No files found. HTML sample (first 2000 chars):', htmlText.substring(0, 2000));
    }

    return new Response(
      JSON.stringify({ files }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in fetch-drive-files:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', files: [] }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
