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

  // Placeholder for actual data
  const data = dashboardData || {
    totalIncome: 169100,
    totalExpenses: 120000,
    profit: 49100,
    topSellingProducts: [
      { productId: 1, productName: "NPK Fertilizer", totalSold: 45, totalRevenue: 112500 },
      { productId: 2, productName: "Urea", totalSold: 15, totalRevenue: 27000 },
      { productId: 3, productName: "Organic Compost", totalSold: 10, totalRevenue: 12000 },
      { productId: 4, productName: "Phosphate", totalSold: 8, totalRevenue: 17600 }
    ],
    topExpenses: [
      { expenseName: "Worker Salaries", amount: 50000, category: "Salaries" },
      { expenseName: "Raw Materials", amount: 35000, category: "RawMaterials" },
      { expenseName: "Electricity Bill", amount: 15000, category: "Utilities" },
      { expenseName: "Transportation", amount: 12000, category: "Transportation" },
      { expenseName: "Equipment Repair", amount: 8000, category: "Maintenance" }
    ],
    recentTransactions: []
  };

  // Prepare data for charts
  const productSalesData = data.topSellingProducts.map(product => ({
    name: product.productName,
    value: product.totalRevenue
  }));

  const expensesData = data.topExpenses.map(expense => ({
    name: expense.expenseName,
    value: expense.amount
  }));

  // Generate sample chart data
  const salesTrend = [
    { name: 'Week 1', sales: 35000 },
    { name: 'Week 2', sales: 42000 },
    { name: 'Week 3', sales: 38000 },
    { name: 'Week 4', sales: 54100 }
  ];

  // Format profit percentage
  const profitPercentage = (data.profit / data.totalIncome) * 100;
  const profitIncreased = true; // This would come from the API in a real app

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
        <Tabs value={dateFilter} onValueChange={setDateFilter} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="7days">{t("days7")}</TabsTrigger>
            <TabsTrigger value="30days">{t("days30")}</TabsTrigger>
            <TabsTrigger value="90days">{t("days90")}</TabsTrigger>
            <TabsTrigger value="year">{t("year")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalRevenue")}</CardTitle>
            <LuDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalIncome)}</div>
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
            <div className="text-2xl font-bold">{formatCurrency(data.totalExpenses)}</div>
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
            <div className="text-2xl font-bold">{formatCurrency(data.profit)}</div>
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
            <div className="text-2xl font-bold">{data.topSellingProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              {data.topSellingProducts.reduce((sum, product) => sum + product.totalSold, 0)} {t("unitsSold")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t("salesOverview")}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
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
                  {productSalesData.map((entry, index) => (
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
              data.recentTransactions.slice(0, 5).map((transaction) => (
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