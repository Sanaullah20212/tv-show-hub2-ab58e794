# Worker URL Configuration Guide

## Worker URL কোথায় আছে?

আপনার প্রজেক্টে Worker URL তিনটি স্থানে ব্যবহার করা হয়েছে:

### 1. Frontend Configuration (সবচেয়ে গুরুত্বপূর্ণ)
**ফাইল:** `src/config/workerConfig.ts`

এই ফাইল থেকে সব Worker URL এবং Auth Token নিয়ন্ত্রণ করা হয়। এটি সবচেয়ে সহজ পদ্ধতি।

```typescript
export const WORKER_CONFIG = {
  // Mobile users এর জন্য Worker URL
  MOBILE_WORKER_URL: 'https://black-wildflower-1653.savshopbd.workers.dev/',
  
  // Business users এর জন্য Worker URL
  BUSINESS_WORKER_URL: 'https://webzip.savshopbd.workers.dev/',
  
  // Authentication token
  WORKER_AUTH_TOKEN: 'GDI-Auth-8c5e9a4f-7b1d-4f6c-8e3b-9a2d1e5f0b4a',
  
  // GDI Path prefix
  GDI_PATH_PREFIX: '0:/'
};
```

### 2. TV Proxy Edge Function
**ফাইল:** `supabase/functions/tv-proxy/index.ts`

```typescript
// Worker Configuration - এই লিংকগুলো পরিবর্তন করতে এই ফাইল এডিট করুন
const WORKER_URL = 'https://black-wildflower-1653.savshopbd.workers.dev';
const WORKER_AUTH_TOKEN = 'GDI-Auth-8c5e9a4f-7b1d-4f6c-8e3b-9a2d1e5f0b4a';
```

### 3. Fetch Drive Files Edge Function
**ফাইল:** `supabase/functions/fetch-drive-files/index.ts`

```typescript
// Worker Configuration - এই লিংকগুলো পরিবর্তন করতে এই ফাইল এডিট করুন
const WORKER_URL = 'https://black-wildflower-1653.savshopbd.workers.dev';
const WORKER_AUTH_TOKEN = 'GDI-Auth-8c5e9a4f-7b1d-4f6c-8e3b-9a2d1e5f0b4a';
```

---

## কীভাবে Worker URL পরিবর্তন করবেন?

### পদক্ষেপ ১: Frontend Configuration আপডেট করুন

1. `src/config/workerConfig.ts` ফাইলটি খুলুন
2. আপনার নতুন Worker URL দিয়ে প্রতিস্থাপন করুন:

```typescript
export const WORKER_CONFIG = {
  MOBILE_WORKER_URL: 'https://YOUR-NEW-WORKER-URL.workers.dev/',
  BUSINESS_WORKER_URL: 'https://YOUR-BUSINESS-WORKER-URL.workers.dev/',
  WORKER_AUTH_TOKEN: 'YOUR-NEW-AUTH-TOKEN',
  GDI_PATH_PREFIX: '0:/'
};
```

### পদক্ষেপ ২: Edge Functions আপডেট করুন

1. **TV Proxy Function আপডেট:**
   - `supabase/functions/tv-proxy/index.ts` খুলুন
   - লাইন ১১-১২ এ Worker URL এবং Token আপডেট করুন

2. **Fetch Drive Files Function আপডেট:**
   - `supabase/functions/fetch-drive-files/index.ts` খুলুন
   - লাইন ১১-১২ এ Worker URL এবং Token আপডেট করুন

### পদক্ষেপ ৩: Deploy করুন

সব পরিবর্তন করার পর, Lovable automatically deploy করবে। কোনো manual deployment এর প্রয়োজন নেই।

---

## গুরুত্বপূর্ণ নোট

⚠️ **Auth Token সুরক্ষিত রাখুন:** Worker Auth Token খুবই sensitive তথ্য। এটি কখনো public repository তে শেয়ার করবেন না।

⚠️ **Trailing Slash:** Mobile Worker URL এ শেষে `/` রাখুন, কিন্তু Business Worker URL এ শেষে `/` রাখা ঐচ্ছিক।

⚠️ **Testing:** পরিবর্তনের পর অবশ্যই Drive Access এবং TV Access ফিচার টেস্ট করুন।

---

## সমস্যা সমাধান

### সমস্যা: "Access Denied" error
**সমাধান:** Auth Token সঠিক আছে কিনা চেক করুন সব তিনটি ফাইলে।

### সমস্যা: Files load হচ্ছে না
**সমাধান:** Worker URL এর শেষে trailing slash (`/`) আছে কিনা চেক করুন।

### সমস্যা: TV Access কাজ করছে না
**সমাধান:** `supabase/functions/tv-proxy/index.ts` ফাইলে Worker URL সঠিকভাবে আপডেট করেছেন কিনা চেক করুন।

---

## প্রযুক্তিগত বিবরণ

এই সিস্টেম তিনটি layer এ কাজ করে:

1. **Frontend (React):** User interface এবং direct API calls
2. **Edge Functions (Supabase):** Backend logic এবং authentication
3. **Worker (Cloudflare):** File storage এবং streaming

সব layer এ একই Worker URL এবং Auth Token ব্যবহার করতে হবে consistency এর জন্য।
