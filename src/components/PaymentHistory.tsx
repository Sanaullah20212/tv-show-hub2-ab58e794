import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Subscription {
  id: string;
  plan_months: number;
  price_taka: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  payment_method: string | null;
  payment_last_digits: string | null;
}

export const PaymentHistory = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      active: { variant: "default", label: "সক্রিয়" },
      pending: { variant: "secondary", label: "অপেক্ষমান" },
      expired: { variant: "outline", label: "মেয়াদ শেষ" },
      cancelled: { variant: "destructive", label: "বাতিল" },
    };

    const config = statusMap[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-bengali">পেমেন্ট হিস্ট্রি</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8 font-bengali">
            কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bengali">পেমেন্ট হিস্ট্রি</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bengali">প্ল্যান</TableHead>
                <TableHead className="font-bengali">মূল্য</TableHead>
                <TableHead className="font-bengali">স্ট্যাটাস</TableHead>
                <TableHead className="font-bengali">শুরুর তারিখ</TableHead>
                <TableHead className="font-bengali">শেষ তারিখ</TableHead>
                <TableHead className="font-bengali">পেমেন্ট মেথড</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-bengali">
                    {subscription.plan_months} মাস
                  </TableCell>
                  <TableCell className="font-bengali">
                    ৳{subscription.price_taka}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(subscription.status)}
                  </TableCell>
                  <TableCell className="font-bengali">
                    {format(new Date(subscription.start_date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="font-bengali">
                    {format(new Date(subscription.end_date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="font-bengali">
                    {subscription.payment_method 
                      ? `${subscription.payment_method} ${subscription.payment_last_digits ? `****${subscription.payment_last_digits}` : ''}`
                      : "N/A"
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
