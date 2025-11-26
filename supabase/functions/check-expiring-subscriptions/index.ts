import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {
  public: {
    Tables: {
      subscriptions: any;
      profiles: any;
      notifications: any;
    };
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting subscription expiry check...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Get subscriptions expiring in the next 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const now = new Date();

    // Check subscriptions expiring in 7 days
    const { data: expiring7Days, error: error7 } = await supabase
      .from('subscriptions')
      .select('id, user_id, end_date, plan_months')
      .eq('status', 'active')
      .lte('end_date', sevenDaysFromNow.toISOString())
      .gte('end_date', now.toISOString());

    if (error7) {
      console.error('❌ Error fetching 7-day expiring subscriptions:', error7);
      throw error7;
    }

    console.log(`📊 Found ${expiring7Days?.length || 0} subscriptions expiring in 7 days`);

    // Check subscriptions expiring in 3 days
    const { data: expiring3Days, error: error3 } = await supabase
      .from('subscriptions')
      .select('id, user_id, end_date, plan_months')
      .eq('status', 'active')
      .lte('end_date', threeDaysFromNow.toISOString())
      .gte('end_date', now.toISOString());

    if (error3) {
      console.error('❌ Error fetching 3-day expiring subscriptions:', error3);
      throw error3;
    }

    console.log(`📊 Found ${expiring3Days?.length || 0} subscriptions expiring in 3 days`);

    // Check subscriptions expiring today
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: expiringToday, error: errorToday } = await supabase
      .from('subscriptions')
      .select('id, user_id, end_date, plan_months')
      .eq('status', 'active')
      .lt('end_date', tomorrow.toISOString())
      .gte('end_date', now.toISOString());

    if (errorToday) {
      console.error('❌ Error fetching today expiring subscriptions:', errorToday);
      throw errorToday;
    }

    console.log(`📊 Found ${expiringToday?.length || 0} subscriptions expiring today`);

    const notifications = [];

    // Send notifications for 7-day expiring subscriptions
    if (expiring7Days && expiring7Days.length > 0) {
      for (const sub of expiring7Days) {
        const daysLeft = Math.ceil((new Date(sub.end_date).getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        // Check if notification already sent
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', sub.user_id)
          .eq('type', 'subscription_expiring')
          .gte('created_at', new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString())
          .single();

        if (!existing) {
          const { error: notifError } = await supabase
            .from('notifications')
            .insert({
              user_id: sub.user_id,
              title: 'সাবস্ক্রিপশন শেষ হওয়ার সতর্কতা',
              message: `আপনার সাবস্ক্রিপশন ${daysLeft} দিনের মধ্যে শেষ হয়ে যাবে। নতুন সাবস্ক্রিপশন নিতে ভুলবেন না।`,
              type: 'subscription_expiring',
              link: '/plans'
            });

          if (notifError) {
            console.error(`❌ Error creating notification for user ${sub.user_id}:`, notifError);
          } else {
            notifications.push({ user_id: sub.user_id, days_left: daysLeft, type: '7-day' });
            console.log(`✅ Created 7-day notification for user ${sub.user_id}`);
          }
        }
      }
    }

    // Send notifications for 3-day expiring subscriptions
    if (expiring3Days && expiring3Days.length > 0) {
      for (const sub of expiring3Days) {
        const daysLeft = Math.ceil((new Date(sub.end_date).getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        // Check if notification already sent recently
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', sub.user_id)
          .eq('type', 'subscription_expiring_soon')
          .gte('created_at', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString())
          .single();

        if (!existing) {
          const { error: notifError } = await supabase
            .from('notifications')
            .insert({
              user_id: sub.user_id,
              title: '⚠️ জরুরি: সাবস্ক্রিপশন শীঘ্রই শেষ হবে',
              message: `আপনার সাবস্ক্রিপশন মাত্র ${daysLeft} দিনের মধ্যে শেষ হয়ে যাবে! এখনই নবায়ন করুন।`,
              type: 'subscription_expiring_soon',
              link: '/plans'
            });

          if (notifError) {
            console.error(`❌ Error creating notification for user ${sub.user_id}:`, notifError);
          } else {
            notifications.push({ user_id: sub.user_id, days_left: daysLeft, type: '3-day' });
            console.log(`✅ Created 3-day notification for user ${sub.user_id}`);
          }
        }
      }
    }

    // Send notifications for subscriptions expiring today
    if (expiringToday && expiringToday.length > 0) {
      for (const sub of expiringToday) {
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: sub.user_id,
            title: '🚨 সাবস্ক্রিপশন আজ শেষ হচ্ছে!',
            message: 'আপনার সাবস্ক্রিপশন আজই শেষ হয়ে যাবে। সেবা চালু রাখতে এখনই নবায়ন করুন।',
            type: 'subscription_expiring_today',
            link: '/plans'
          });

        if (notifError) {
          console.error(`❌ Error creating notification for user ${sub.user_id}:`, notifError);
        } else {
          notifications.push({ user_id: sub.user_id, days_left: 0, type: 'today' });
          console.log(`✅ Created today notification for user ${sub.user_id}`);
        }
      }
    }

    console.log(`✅ Completed! Sent ${notifications.length} notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        notifications_sent: notifications.length,
        notifications,
        summary: {
          expiring_7_days: expiring7Days?.length || 0,
          expiring_3_days: expiring3Days?.length || 0,
          expiring_today: expiringToday?.length || 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in check-expiring-subscriptions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});