# 📱 মোবাইল অ্যাপ সেটআপ গাইড

আপনার প্যানেল এখন **Capacitor** দিয়ে নেটিভ মোবাইল অ্যাপে রূপান্তর করার জন্য প্রস্তুত! 🎉

## ✅ কি কি যুক্ত হয়েছে

1. **Capacitor Configuration** - নেটিভ মোবাইল অ্যাপ সাপোর্ট
2. **Push Notifications** - রিয়েল-টাইম নোটিফিকেশন সিস্টেম
3. **Subscription Notifications** - নতুন সাবস্ক্রিপশনের জন্য অটো নোটিফিকেশন
4. **Database Table** - push tokens সংরক্ষণের জন্য
5. **Realtime Updates** - Supabase realtime subscription monitoring

## 📦 পরবর্তী ধাপসমূহ

### ১. প্রোজেক্ট GitHub-এ আপলোড করুন
1. Lovable থেকে "Export to Github" বাটনে ক্লিক করুন
2. আপনার GitHub repository-তে project transfer করুন
3. Local machine-এ git pull করুন

### ২. Dependencies ইনস্টল করুন
```bash
npm install
```

### ৩. iOS অথবা Android Platform যুক্ত করুন

**Android এর জন্য:**
```bash
npx cap add android
npx cap update android
```

**iOS এর জন্য (শুধুমাত্র Mac):**
```bash
npx cap add ios
npx cap update ios
```

### ৪. প্রোজেক্ট Build করুন
```bash
npm run build
```

### ৫. Native Platform এ Sync করুন
```bash
npx cap sync
```

### ৬. অ্যাপ Run করুন

**Android এ:**
```bash
npx cap run android
```
অথবা Android Studio দিয়ে খুলুন:
```bash
npx cap open android
```

**iOS এ (Mac প্রয়োজন):**
```bash
npx cap run ios
```
অথবা Xcode দিয়ে খুলুন:
```bash
npx cap open ios
```

## 🔔 Push Notification সেটআপ

### Android এর জন্য:
1. Firebase Console-এ যান: https://console.firebase.google.com
2. নতুন Project তৈরি করুন অথবা existing project select করুন
3. Android app যুক্ত করুন
4. Package name দিন: `app.lovable.46e5412090f14676bb5576d45e0f18e7`
5. `google-services.json` ফাইল ডাউনলোড করুন
6. ফাইলটি `android/app/` ফোল্ডারে রাখুন

### iOS এর জন্য:
1. Apple Developer Account প্রয়োজন
2. Push Notification Capability enable করুন Xcode-এ
3. APNs (Apple Push Notification service) key তৈরি করুন
4. Firebase Console-এ APNs key আপলোড করুন

## 🎯 বৈশিষ্ট্যসমূহ

### ✨ ইউজারদের জন্য:
- মোবাইল ডিভাইসে native অ্যাপ অভিজ্ঞতা
- Push notification সাপোর্ট
- দ্রুত এবং smooth পারফরম্যান্স
- অফলাইন ক্ষমতা (Capacitor features দিয়ে)

### 🔔 Admin দের জন্য:
- নতুন সাবস্ক্রিপশন রিকোয়েস্টের জন্য অটো নোটিফিকেশন
- রিয়েল-টাইম আপডেট
- Web এবং Mobile উভয়েই notification

## 📝 গুরুত্বপূর্ণ নোট

1. **Development সময়:** Hot reload সক্রিয় আছে - পরিবর্তন সরাসরি mobile app-এ দেখতে পাবেন
2. **Production এর জন্য:** `capacitor.config.ts` ফাইলে `server.url` সরিয়ে ফেলুন
3. **Code Update করার পর:** সবসময় `npx cap sync` চালান
4. **Android Studio:** Download করুন https://developer.android.com/studio থেকে
5. **Xcode (iOS এর জন্য):** Mac App Store থেকে ইনস্টল করুন

## 🚀 App Store এ Publish করা

### Google Play Store:
1. Google Play Console-এ Developer account তৈরি করুন ($25 one-time fee)
2. Signed APK/AAB build করুন
3. Store listing তৈরি করুন (screenshots, description, etc.)
4. Review এর জন্য submit করুন

### Apple App Store:
1. Apple Developer Program-এ enroll করুন ($99/year)
2. App Store Connect-এ app তৈরি করুন
3. Xcode দিয়ে archive এবং upload করুন
4. Review এর জন্য submit করুন

## 🆘 সাহায্য প্রয়োজন?

- Capacitor Documentation: https://capacitorjs.com/docs
- Firebase Setup Guide: https://firebase.google.com/docs/cloud-messaging
- Lovable Community: আপনার questions শেয়ার করুন!

---

**শুভকামনা আপনার মোবাইল অ্যাপ তৈরিতে! 🎉**
