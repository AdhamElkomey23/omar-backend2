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
import { TrendingUp, TrendingDown, DollarSign, Users, Package, ShoppingCart } from "lucide-react";
import { useState } from "react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['/api/sales'],
    queryFn: () => apiRequest('/api/sales')
  });

  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['/api/expenses'],
    queryFn: () => apiRequest('/api/expenses')
  });

  const { data: workersData, isLoading: workersLoading } = useQuery({
    queryKey: ['/api/workers'],
    queryFn: () => apiRequest('/api/workers')
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: () => apiRequest('/api/products')
  });

  if (salesLoading || expensesLoading || workersLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate report data
  const totalRevenue = salesData?.reduce((sum: number, sale: any) => sum + sale.totalAmount, 0) || 0;
  const totalExpenses = expensesData?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0;
  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  // Monthly sales trend
  const monthlyData = [
    { month: t("january"), revenue: 45000, expenses: 32000 },
    { month: t("february"), revenue: 52000, expenses: 38000 },
    { month: t("march"), revenue: 48000, expenses: 35000 },
    { month: t("april"), revenue: 61000, expenses: 42000 },
    { month: t("may"), revenue: 58000, expenses: 39000 },
    { month: t("june"), revenue: 67000, expenses: 45000 }
  ];

  // Department expenses
  const departmentExpenses = [
    { name: t("production"), value: 45000, color: '#0088FE' },
    { name: t("qualityControl"), value: 23000, color: '#00C49F' },
    { name: t("administration"), value: 18000, color: '#FFBB28' },
    { name: t("maintenance"), value: 15000, color: '#FF8042' },
    { name: t("logistics"), value: 12000, color: '#A569BD' }
  ];

  // Product performance
  const productPerformance = [
    { name: t("npkFertilizer"), sales: 45, revenue: 112500 },
    { name: t("ureaFertilizer"), sales: 35, revenue: 87500 },
    { name: t("organicCompost"), sales: 28, revenue: 67200 },
    { name: t("phosphateFertilizer"), sales: 22, revenue: 52800 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t("reports")}</h1>
        <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">{t("weekly")}</TabsTrigger>
            <TabsTrigger value="monthly">{t("monthly")}</TabsTrigger>
            <TabsTrigger value="yearly">{t("yearly")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalRevenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" />
              +12.5% {t("fromLastMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalExpenses")}</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-red-500" />
              +8.2% {t("fromLastMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("netProfit")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(profit)}</div>
            <p className="text-xs text-muted-foreground">
              {t("profitMargin")} {profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalWorkers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workersData?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("activeWorkers")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("monthlyRevenueExpensesTrend")}</CardTitle>
            <CardDescription>{t("revenueExpensesComparison")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    formatCurrency(value as number),
                    name === 'revenue' ? t("revenue") : t("expenses")
                  ]}
                />
                <Legend 
                  formatter={(value) => value === 'revenue' ? t("revenue") : t("expenses")}
                />
                <Bar dataKey="revenue" fill="#0088FE" />
                <Bar dataKey="expenses" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("expenseDistributionByDepartment")}</CardTitle>
            <CardDescription>{t("departmentExpensePercentage")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentExpenses}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                >
                  {departmentExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("productPerformance")}</CardTitle>
            <CardDescription>{t("mainProductsSalesRevenue")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sales' ? `${value} ${t("units")}` : formatCurrency(value as number),
                    name === 'sales' ? t("sales") : t("revenue")
                  ]}
                />
                <Bar dataKey="revenue" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("financialPerformanceSummary")}</CardTitle>
          <CardDescription>{t("keyFinancialIndicatorsOverview")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="font-medium">{t("indicator")}</div>
              <div className="font-medium">{t("currentValue")}</div>
              <div className="font-medium">{t("changePercent")}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm border-t pt-2">
              <div>{t("totalRevenue")}</div>
              <div>{formatCurrency(totalRevenue)}</div>
              <div className="text-green-600">+12.5%</div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>{t("totalExpenses")}</div>
              <div>{formatCurrency(totalExpenses)}</div>
              <div className="text-red-600">+8.2%</div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>{t("netProfit")}</div>
              <div>{formatCurrency(profit)}</div>
              <div className="text-green-600">+18.7%</div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>{t("profitMargin")}</div>
              <div>{profitMargin.toFixed(1)}%</div>
              <div className="text-green-600">+4.2%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}