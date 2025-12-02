import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Mail, Phone, FileQuestion, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const Support = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("আপনার মেসেজ পাঠানো হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-Friendly Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-xl">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              size="sm"
              className="font-bengali gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">ড্যাশবোর্ডে ফিরে যান</span>
              <span className="sm:hidden">ফিরে যান</span>
            </Button>
            <h1 className="text-base sm:text-xl font-bold font-bengali">সাহায্য ও সহযোগিতা</h1>
            <div className="w-[72px] sm:w-[120px]"></div>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <p className="text-sm sm:text-base text-muted-foreground font-bengali text-center sm:text-left">
            আমরা আপনাকে সাহায্য করতে এখানে আছি। নিচের যেকোনো উপায়ে আমাদের সাথে যোগাযোগ করুন।
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3 mb-6 sm:mb-8">
          <Card className="animate-fade-in hover-scale">
            <CardHeader>
              <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-primary" />
              <CardTitle className="text-base sm:text-lg font-bengali">লাইভ চ্যাট</CardTitle>
              <CardDescription className="text-xs sm:text-sm font-bengali">
                তাৎক্ষণিক সহায়তার জন্য আমাদের সাথে চ্যাট করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full text-sm sm:text-base font-bengali">চ্যাট শুরু করুন</Button>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover-scale" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-primary" />
              <CardTitle className="text-base sm:text-lg font-bengali">ইমেইল</CardTitle>
              <CardDescription className="text-xs sm:text-sm font-bengali">
                support@tvshow.com এ আমাদের লিখুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full text-sm sm:text-base font-bengali">ইমেইল পাঠান</Button>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover-scale" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <Phone className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-primary" />
              <CardTitle className="text-base sm:text-lg font-bengali">ফোন</CardTitle>
              <CardDescription className="text-xs sm:text-sm font-bengali">
                +880 1XXX-XXXXXX (সকাল ৯টা - রাত ৯টা)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full text-sm sm:text-base font-bengali">কল করুন</Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
          <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-bengali">আমাদের মেসেজ পাঠান</CardTitle>
              <CardDescription className="text-xs sm:text-sm font-bengali">
                আপনার সমস্যা বা প্রশ্ন লিখুন এবং আমরা শীঘ্রই উত্তর দেব
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="বিষয়"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="font-bengali text-sm sm:text-base"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="আপনার মেসেজ লিখুন..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    className="font-bengali text-sm sm:text-base"
                  />
                </div>
                <Button type="submit" className="w-full text-sm sm:text-base font-bengali">
                  মেসেজ পাঠান
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <FileQuestion className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-primary" />
              <CardTitle className="text-base sm:text-lg font-bengali">সাধারণ প্রশ্নাবলী (FAQ)</CardTitle>
              <CardDescription className="text-xs sm:text-sm font-bengali">সচরাচর জিজ্ঞাসিত প্রশ্নের উত্তর</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-semibold font-bengali">কিভাবে সাবস্ক্রিপশন নবায়ন করব?</h4>
                <p className="text-xs sm:text-sm text-muted-foreground font-bengali">
                  Plans পেজে গিয়ে আপনার পছন্দের প্ল্যান নির্বাচন করুন এবং পেমেন্ট সম্পন্ন করুন।
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-semibold font-bengali">ZIP পাসওয়ার্ড কোথায় পাব?</h4>
                <p className="text-xs sm:text-sm text-muted-foreground font-bengali">
                  Settings পেজে ZIP Passwords সেকশনে সকল পাসওয়ার্ড পাবেন।
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-semibold font-bengali">ডাউনলোড স্পীড কম কেন?</h4>
                <p className="text-xs sm:text-sm text-muted-foreground font-bengali">
                  আপনার ইন্টারনেট সংযোগ এবং Google Drive সার্ভারের উপর নির্ভর করে। VPN ব্যবহার করে দেখতে পারেন।
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;
