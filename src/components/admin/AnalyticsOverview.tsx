import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, TrendingUp, DollarSign, UserPlus, UserCheck } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsOverviewProps {
  stats: {
    totalUsers: number;
    activeSubscriptions: number;
    totalRevenue: number;
    monthlyRevenue: number;
    newUsersThisMonth: number;
    conversionRate: number;
  };
  revenueData: Array<{ month: string; revenue: number; users: number }>;
  userTypeData: Array<{ name: string; value: number; color: string }>;
  loading?: boolean;
}

export const AnalyticsOverview = ({ stats, revenueData, userTypeData, loading }: AnalyticsOverviewProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-fade-in">
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "মোট ব্যবহারকারী",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "সক্রিয় সাবস্ক্রিপশন",
      value: stats.activeSubscriptions,
      icon: CreditCard,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "মোট রেভিনিউ",
      value: `${stats.totalRevenue.toLocaleString()} ৳`,
      icon: DollarSign,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "মাসিক রেভিনিউ",
      value: `${stats.monthlyRevenue.toLocaleString()} ৳`,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "নতুন ব্যবহারকারী",
      value: stats.newUsersThisMonth,
      icon: UserPlus,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "কনভার্শন রেট",
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: UserCheck,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={stat.title} className="animate-fade-in hover-scale" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-bengali">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend */}
        <Card className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <CardHeader>
            <CardTitle className="font-bengali">রেভিনিউ ট্রেন্ড</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} name="রেভিনিউ (৳)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card className="animate-fade-in" style={{ animationDelay: "0.7s" }}>
          <CardHeader>
            <CardTitle className="font-bengali">ব্যবহারকারী বৃদ্ধি</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="hsl(var(--primary))" name="নতুন ইউজার" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Type Distribution */}
        <Card className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <CardHeader>
            <CardTitle className="font-bengali">ব্যবহারকারী টাইপ</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="animate-fade-in" style={{ animationDelay: "0.9s" }}>
          <CardHeader>
            <CardTitle className="font-bengali">দ্রুত তথ্য</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="font-bengali text-sm">গড় সাবস্ক্রিপশন মূল্য</span>
              <span className="font-bold">{(stats.totalRevenue / (stats.activeSubscriptions || 1)).toFixed(0)} ৳</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="font-bengali text-sm">কনভার্শন রেট</span>
              <span className="font-bold">{stats.conversionRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="font-bengali text-sm">মাসিক বৃদ্ধি</span>
              <span className="font-bold text-green-500">+{stats.newUsersThisMonth}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="font-bengali text-sm">সক্রিয় হার</span>
              <span className="font-bold">{((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
