import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple IP geolocation function (using ipapi.co free API)
async function getLocationFromIP(ip: string) {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    if (!response.ok) return null
    const data = await response.json()
    return {
      country: data.country_name || 'Unknown',
      city: data.city || 'Unknown',
    }
  } catch (error) {
    console.error('Error fetching location:', error)
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create client with ANON key for user validation
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Create admin client with SERVICE ROLE key for session management
    // This bypasses RLS policies for system operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { userId, deviceFingerprint, deviceName, userAgent } = await req.json()

    if (!userId || !deviceFingerprint) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[VALIDATION] Starting validation for user: ${userId}`)

    // CRITICAL: Check if user is admin FIRST - admins bypass ALL device limits and restrictions
    // USE ADMIN CLIENT to bypass RLS and reliably fetch profile
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, mobile_number, display_name')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('[VALIDATION] Error fetching profile:', profileError)
    }

    console.log(`[VALIDATION] User role: ${profileData?.role || 'unknown'}`)

    // If user has 'admin' role, bypass ALL validations (device limit, IP tracking, location checks)
    if (profileData?.role === 'admin') {
      console.log('🔓 [ADMIN BYPASS] Admin user detected - bypassing ALL device restrictions')
      
      // Get IP for audit logging only (no restrictions enforced)
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                 req.headers.get('x-real-ip') || 
                 'Unknown'
      const location = await getLocationFromIP(ip)

      // Log the attempt for audit trail only (admins can login from anywhere, any device)
      await supabaseAdmin
        .from('login_attempts')
        .insert({
          user_id: userId,
          mobile_number: profileData.mobile_number,
          device_fingerprint: deviceFingerprint,
          ip_address: ip,
          country: location?.country || 'Unknown',
          city: location?.city || 'Unknown',
          attempt_type: 'success',
          reason: '✅ Admin user - all device limits and location checks bypassed',
          user_agent: userAgent,
        })

      console.log('✅ [ADMIN BYPASS] Admin login successful - no restrictions applied')

      return new Response(
        JSON.stringify({ 
          allowed: true,
          message: 'Admin login successful - unlimited device access',
          isAdmin: true,
          bypassedValidation: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔒 [VALIDATION] User is NOT admin - applying full device restrictions')

    // Get IP address from request
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'Unknown'

    // Get location from IP
    const location = await getLocationFromIP(ip)
    const country = location?.country || 'Unknown'
    const city = location?.city || 'Unknown'

    // Check for existing active sessions - USE ADMIN CLIENT to bypass RLS
    const { data: existingSessions, error: sessionsError } = await supabaseAdmin
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      throw sessionsError
    }

    // Check if this device already has an approved session
    const existingDevice = existingSessions?.find(s => s.device_fingerprint === deviceFingerprint)
    
    if (existingDevice) {
      // Update last active time
      await supabaseAdmin
        .from('user_sessions')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', existingDevice.id)

      // Log successful attempt
      await supabaseAdmin
        .from('login_attempts')
        .insert({
          user_id: userId,
          mobile_number: profileData?.mobile_number,
          device_fingerprint: deviceFingerprint,
          ip_address: ip,
          country,
          city,
          attempt_type: 'success',
          user_agent: userAgent,
        })

      return new Response(
        JSON.stringify({ 
          allowed: true,
          message: 'Login successful',
          sessionId: existingDevice.id 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // IMPORTANT: Check if there are OTHER ACTIVE SESSIONS on DIFFERENT devices
    // Only block if another device is already logged in
    const otherActiveDevices = existingSessions?.filter(s => s.device_fingerprint !== deviceFingerprint) || []
    
    if (otherActiveDevices.length > 0) {
      console.log(`⚠️ [DEVICE LIMIT] User has ${otherActiveDevices.length} other active device(s) - blocking new device`)
      
      // Log blocked attempt
      await supabaseAdmin
        .from('login_attempts')
        .insert({
          user_id: userId,
          mobile_number: profileData?.mobile_number,
          device_fingerprint: deviceFingerprint,
          ip_address: ip,
          country,
          city,
          attempt_type: 'blocked',
          reason: `Another device already logged in (${otherActiveDevices.length} active device(s)). Admin approval required.`,
          user_agent: userAgent,
        })

      // Create notification for admin
      const { data: adminProfiles } = await supabaseClient
        .from('profiles')
        .select('user_id')
        .eq('role', 'admin')

      if (adminProfiles && adminProfiles.length > 0) {
        for (const admin of adminProfiles) {
          await supabaseClient.rpc('create_notification', {
            p_user_id: admin.user_id,
            p_title: 'নতুন ডিভাইস লগিন অনুরোধ',
            p_message: `${profileData?.mobile_number || 'একজন ইউজার'} একটি নতুন ডিভাইস থেকে লগিন করার চেষ্টা করছে। IP: ${ip}, Location: ${city}, ${country}`,
            p_type: 'warning',
            p_link: '/admin/sessions'
          })
        }
      }

      // Insert pending session
      await supabaseAdmin
        .from('user_sessions')
        .insert({
          user_id: userId,
          device_fingerprint: deviceFingerprint,
          device_name: deviceName,
          ip_address: ip,
          country,
          city,
          is_active: false,
          is_approved: false,
          user_agent: userAgent,
        })

      return new Response(
        JSON.stringify({ 
          allowed: false,
          reason: 'device_limit',
          message: 'আপনার অ্যাকাউন্ট ইতিমধ্যে অন্য একটি ডিভাইসে লগিন রয়েছে। এই ডিভাইসে লগিন করতে এডমিনের অনুমতি প্রয়োজন।',
          requiresApproval: true
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('✅ [DEVICE CHECK] No other active devices found - allowing login')

    // Check for suspicious login based on impossible travel
    // Note: We only check country change, NOT IP change
    // Same device with different IP (WiFi/Mobile Data/VPN) is normal
    const { data: isSuspicious, error: suspiciousError } = await supabaseClient
      .rpc('check_suspicious_login', {
        p_user_id: userId,
        p_ip_address: ip,
        p_country: country
      })

    if (suspiciousError) {
      console.error('[SUSPICIOUS CHECK] Error checking suspicious login:', suspiciousError)
    }

    console.log(`[SUSPICIOUS CHECK] Is suspicious: ${isSuspicious}`)

    if (isSuspicious) {
      console.log('⚠️ [SUSPICIOUS] Impossible travel detected - blocking login')
      
      // Log suspicious attempt
      await supabaseAdmin
        .from('login_attempts')
        .insert({
          user_id: userId,
          mobile_number: profileData?.mobile_number,
          device_fingerprint: deviceFingerprint,
          ip_address: ip,
          country,
          city,
          attempt_type: 'suspicious',
          reason: 'Impossible travel detected: Different country within 1 hour',
          user_agent: userAgent,
        })

      // Notify admins
      const { data: adminProfiles } = await supabaseClient
        .from('profiles')
        .select('user_id')
        .eq('role', 'admin')

      if (adminProfiles && adminProfiles.length > 0) {
        for (const admin of adminProfiles) {
          await supabaseClient.rpc('create_notification', {
            p_user_id: admin.user_id,
            p_title: 'সন্দেহজনক লগিন সনাক্ত',
            p_message: `${profileData?.mobile_number || 'একজন ইউজার'} সন্দেহজনক লোকেশন থেকে লগিন করছে: ${city}, ${country}. IP: ${ip} (সম্ভাব্য VPN বা অসম্ভব travel)`,
            p_type: 'error',
            p_link: '/admin/sessions'
          })
        }
      }

      return new Response(
        JSON.stringify({ 
          allowed: false,
          reason: 'suspicious',
          message: 'সন্দেহজনক কার্যকলাপ সনাক্ত করা হয়েছে। আপনি যদি VPN ব্যবহার করে থাকেন তবে তা বন্ধ করুন। এডমিন আপনার অ্যাকাউন্ট পরীক্ষা করবে।',
          requiresApproval: true
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ [SUSPICIOUS CHECK] No suspicious activity detected')

    // Check if there's any existing session (active or inactive) with this device
    const { data: anyExistingSession } = await supabaseAdmin
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('device_fingerprint', deviceFingerprint)
      .maybeSingle()

    let sessionId: string;

    if (anyExistingSession) {
      // If session was previously approved, reactivate it
      if (anyExistingSession.is_approved) {
        console.log('♻️ [VALIDATION] Previously approved session found - reactivating')
        
        const { data: updatedSession, error: updateError } = await supabaseAdmin
          .from('user_sessions')
          .update({
            is_active: true,
            last_active_at: new Date().toISOString(),
            ip_address: ip,
            country,
            city,
            device_name: deviceName,
            user_agent: userAgent,
          })
          .eq('id', anyExistingSession.id)
          .select()
          .single()

        if (updateError) {
          console.error('[VALIDATION] Error updating session:', updateError)
          throw updateError
        }

        sessionId = updatedSession.id
      } else {
        // Session exists but not approved yet - still pending
        console.log('⏳ [VALIDATION] Session exists but not yet approved - still pending')
        
        return new Response(
          JSON.stringify({ 
            allowed: false,
            reason: 'pending_approval',
            message: 'আপনার লগইন অনুরোধ এখনও পেন্ডিং আছে। এডমিনের অনুমোদনের জন্য অপেক্ষা করুন।',
            requiresApproval: true
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // First time login from this device
      // Check if this is the VERY FIRST device for this user
      const { data: allUserSessions } = await supabaseAdmin
        .from('user_sessions')
        .select('id')
        .eq('user_id', userId)
      
      const isFirstDeviceEver = !allUserSessions || allUserSessions.length === 0
      
      if (isFirstDeviceEver) {
        // This is the user's FIRST device EVER - automatically approve
        console.log('🎉 [FIRST DEVICE] This is user\'s first device ever - auto-approving')
        
        const { data: newSession, error: insertError } = await supabaseAdmin
          .from('user_sessions')
          .insert({
            user_id: userId,
            device_fingerprint: deviceFingerprint,
            device_name: deviceName,
            ip_address: ip,
            country,
            city,
            is_active: true,
            is_approved: true,
            approved_at: new Date().toISOString(),
            user_agent: userAgent,
          })
          .select()
          .single()

        if (insertError) {
          console.error('[VALIDATION] Error creating first session:', insertError)
          throw insertError
        }

        sessionId = newSession.id
        
        // Log successful first login
        await supabaseAdmin
          .from('login_attempts')
          .insert({
            user_id: userId,
            mobile_number: profileData?.mobile_number,
            device_fingerprint: deviceFingerprint,
            ip_address: ip,
            country,
            city,
            attempt_type: 'success',
            reason: 'First device - automatically approved',
            user_agent: userAgent,
          })
      } else {
        // This is a NEW device but user already has sessions - require approval
        console.log('🆕 [NEW DEVICE] User has other sessions - requiring admin approval')
        
        // Create pending session
        const { data: newSession, error: insertError } = await supabaseAdmin
          .from('user_sessions')
          .insert({
            user_id: userId,
            device_fingerprint: deviceFingerprint,
            device_name: deviceName,
            ip_address: ip,
            country,
            city,
            is_active: false,
            is_approved: false,
            user_agent: userAgent,
          })
          .select()
          .single()

        if (insertError) {
          console.error('[VALIDATION] Error creating session:', insertError)
          throw insertError
        }

        // Notify admins
        const { data: adminProfiles } = await supabaseClient
          .from('profiles')
          .select('user_id')
          .eq('role', 'admin')

        if (adminProfiles && adminProfiles.length > 0) {
          for (const admin of adminProfiles) {
            await supabaseClient.rpc('create_notification', {
              p_user_id: admin.user_id,
              p_title: 'নতুন ডিভাইস লগিন অনুরোধ',
              p_message: `${profileData?.mobile_number || 'একজন ইউজার'} নতুন ${deviceName} থেকে লগিন করার চেষ্টা করছে। Location: ${city}, ${country}`,
              p_type: 'info',
              p_link: '/admin/sessions'
            })
          }
        }

        // Log the attempt
        await supabaseAdmin
          .from('login_attempts')
          .insert({
            user_id: userId,
            mobile_number: profileData?.mobile_number,
            device_fingerprint: deviceFingerprint,
            ip_address: ip,
            country,
            city,
            attempt_type: 'blocked',
            reason: 'New device - admin approval required',
            user_agent: userAgent,
          })

        return new Response(
          JSON.stringify({ 
            allowed: false,
            reason: 'new_device',
            message: 'নতুন ডিভাইস সনাক্ত করা হয়েছে। এডমিনের অনুমোদনের জন্য অপেক্ষা করুন।',
            requiresApproval: true
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Log successful attempt
    await supabaseAdmin
      .from('login_attempts')
      .insert({
        user_id: userId,
        mobile_number: profileData?.mobile_number,
        device_fingerprint: deviceFingerprint,
        ip_address: ip,
        country,
        city,
        attempt_type: 'success',
        user_agent: userAgent,
      })

    return new Response(
      JSON.stringify({ 
        allowed: true,
        message: 'Login successful',
        sessionId: sessionId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
