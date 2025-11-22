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
      <div className="container max-w-6xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 animate-fade-in"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          ড্যাশবোর্ডে ফিরে যান
        </Button>

        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">সাহায্য ও সহযোগিতা</h1>
          <p className="text-muted-foreground">
            আমরা আপনাকে সাহায্য করতে এখানে আছি। নিচের যেকোনো উপায়ে আমাদের সাথে যোগাযোগ করুন।
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="animate-fade-in hover-scale">
            <CardHeader>
              <MessageCircle className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>লাইভ চ্যাট</CardTitle>
              <CardDescription>
                তাৎক্ষণিক সহায়তার জন্য আমাদের সাথে চ্যাট করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">চ্যাট শুরু করুন</Button>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover-scale" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <Mail className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>ইমেইল</CardTitle>
              <CardDescription>
                support@tvshow.com এ আমাদের লিখুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">ইমেইল পাঠান</Button>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover-scale" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <Phone className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>ফোন</CardTitle>
              <CardDescription>
                +880 1XXX-XXXXXX (সকাল ৯টা - রাত ৯টা)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">কল করুন</Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle>আমাদের মেসেজ পাঠান</CardTitle>
              <CardDescription>
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
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="আপনার মেসেজ লিখুন..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                  />
                </div>
                <Button type="submit" className="w-full">
                  মেসেজ পাঠান
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <FileQuestion className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>সাধারণ প্রশ্নাবলী (FAQ)</CardTitle>
              <CardDescription>সচরাচর জিজ্ঞাসিত প্রশ্নের উত্তর</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">কিভাবে সাবস্ক্রিপশন নবায়ন করব?</h4>
                <p className="text-sm text-muted-foreground">
                  Plans পেজে গিয়ে আপনার পছন্দের প্ল্যান নির্বাচন করুন এবং পেমেন্ট সম্পন্ন করুন।
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">ZIP পাসওয়ার্ড কোথায় পাব?</h4>
                <p className="text-sm text-muted-foreground">
                  Settings পেজে ZIP Passwords সেকশনে সকল পাসওয়ার্ড পাবেন।
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">ডাউনলোড স্পীড কম কেন?</h4>
                <p className="text-sm text-muted-foreground">
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
