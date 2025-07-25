import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { LuArrowDown, LuArrowUp, LuDollarSign, LuBadgePercent, LuBox, LuShoppingCart, LuTrendingUp } from "react-icons/lu";
import { useState } from "react";

// Temporary placeholder data
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState("7days");

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard', dateFilter],
    queryFn: () => {
      // Calculate date range based on filter
      const today = new Date();
      let startDate = new Date();
      
      switch (dateFilter) {
        case "7days":
          startDate.setDate(today.getDate() - 7);
          break;
        case "30days":
          startDate.setDate(today.getDate() - 30);
          break;
        case "90days":
          startDate.setDate(today.getDate() - 90);
          break;
        case "year":
          startDate.setFullYear(today.getFullYear() - 1);
          break;
      }
      
      return apiRequest(`/api/dashboard?startDate=${startDate.toISOString()}`);
    }
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Use actual data from the server
  const data = dashboardData || {
    totalIncome: 0,
    totalExpenses: 0,
    profit: 0,
    topSellingProducts: [],
    topExpenses: [],
    recentTransactions: []
  };

  // Prepare data for charts
  const productSalesData = data.topSellingProducts.map((product: any) => ({
    name: product.productName,
    value: product.totalRevenue
  }));

  const expensesData = data.topExpenses.map((expense: any) => ({
    name: expense.expenseName,
    value: expense.amount
  }));

  // Generate chart data from real transactions
  const generateSalesTrend = () => {
    if (!data.recentTransactions || data.recentTransactions.length === 0) {
      return [
        { name: 'No Data', sales: 0 }
      ];
    }

    // Group sales by weeks for the trend chart
    const salesByWeek = new Map();
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekName = `Week ${4 - i}`;
      
      const weekSales = data.recentTransactions
        .filter((t: any) => t.type === 'sale' && new Date(t.date) >= weekStart && new Date(t.date) < weekEnd)
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      
      salesByWeek.set(weekName, weekSales);
    }
    
    return Array.from(salesByWeek.entries()).map(([name, sales]) => ({ name, sales }));
  };

  const salesTrend = generateSalesTrend();

  // Format profit percentage
  const profitPercentage = (data.profit / data.totalIncome) * 100;
  const profitIncreased = true; // This would come from the API in a real app

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
        <Tabs value={dateFilter} onValueChange={setDateFilter} className="w-full md:w-[400px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="7days" className="text-xs md:text-sm">{t("days7")}</TabsTrigger>
            <TabsTrigger value="30days" className="text-xs md:text-sm">{t("days30")}</TabsTrigger>
            <TabsTrigger value="90days" className="text-xs md:text-sm">{t("days90")}</TabsTrigger>
            <TabsTrigger value="year" className="text-xs md:text-sm">{t("year")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalRevenue")}</CardTitle>
            <LuDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{formatCurrency(data.totalIncome)}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% {t("fromLastMonth")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalExpenses")}</CardTitle>
            <LuShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{formatCurrency(data.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              +5.2% {t("fromLastMonth")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("profit")}</CardTitle>
            <LuTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{formatCurrency(data.profit)}</div>
            <div className="flex items-center pt-1">
              {profitIncreased ? (
                <LuArrowUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <LuArrowDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs ${profitIncreased ? 'text-green-500' : 'text-red-500'}`}>
                {profitPercentage.toFixed(1)}% {t("margin")}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalProducts")}</CardTitle>
            <LuBox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{data.topSellingProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              {data.topSellingProducts.reduce((sum: any, product: any) => sum + product.totalSold, 0)} {t("unitsSold")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>{t("salesOverview")}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={salesTrend}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), t("sales")]}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t("topProducts")}</CardTitle>
            <CardDescription>
              {t("revenueDistribution")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productSalesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productSalesData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Expenses breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>
            Top expenses by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={expensesData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("recentTransactions")}</CardTitle>
          <CardDescription>
            Last {dateFilter === "7days" ? "7" : dateFilter === "30days" ? "30" : dateFilter === "90days" ? "90" : "365"} days of activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {data.recentTransactions.length > 0 ? (
              data.recentTransactions.slice(0, 5).map((transaction: any) => (
                <div key={transaction.id} className="flex items-center">
                  <div className={`mr-4 rounded-full p-2 ${transaction.type === 'sale' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {transaction.type === 'sale' ? 
                      <LuArrowUp className={`h-4 w-4 text-green-500`} /> : 
                      <LuArrowDown className={`h-4 w-4 text-red-500`} />
                    }
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <div className={transaction.type === 'sale' ? 'text-green-500' : 'text-red-500'}>
                    {transaction.type === 'sale' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">{t("noDataFound")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}