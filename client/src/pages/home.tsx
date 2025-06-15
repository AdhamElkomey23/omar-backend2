import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { t, isRTL } from '@/lib/i18n';
import logoImage from "@assets/الواصلون (1)_1749400506920.png";
import { 
  Factory, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  Warehouse,
  BarChart3,
  ArrowRight,
  Banknote,
  Target
} from 'lucide-react';

export default function Home() {
  // Fetch dashboard data for overview
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['/api/dashboard'],
  });

  return (
    <div className="space-y-8" dir={isRTL() ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 to-green-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <img 
              src={logoImage} 
              alt="Al-Wasiloon Logo" 
              className="h-32 w-32 mx-auto mb-6 object-contain"
            />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('appTitle')}
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-2xl mx-auto">
              {t('appDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-green-800 hover:bg-green-50">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  {t('dashboard')}
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-green-800">
                  <Package className="h-5 w-5 mr-2" />
                  {t('products')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Overview */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">{t('quickOverview')}</h2>
          {dashboardLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('totalIncome')}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(dashboardData?.totalIncome || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('totalExpenses')}</CardTitle>
                  <Banknote className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(dashboardData?.totalExpenses || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('netProfit')}</CardTitle>
                  <Target className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(dashboardData?.profit || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('totalProducts')}</CardTitle>
                  <Package className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardData?.topSellingProducts?.length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('mainFeatures')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Products Management */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Package className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>{t('products')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t('manageYourProducts')}
                </p>
                <Link href="/products">
                  <Button className="w-full">
                    {t('viewProducts')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Sales Tracking */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <ShoppingCart className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>{t('sales')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t('trackYourSales')}
                </p>
                <Link href="/sales">
                  <Button className="w-full">
                    {t('viewSales')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Workers Management */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>{t('workers')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t('manageYourTeam')}
                </p>
                <Link href="/workers">
                  <Button className="w-full">
                    {t('viewWorkers')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Storage Management */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Warehouse className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>{t('storage')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t('manageInventory')}
                </p>
                <Link href="/storage">
                  <Button className="w-full">
                    {t('viewStorage')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Expenses Tracking */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Banknote className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>{t('expenses')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t('trackExpenses')}
                </p>
                <Link href="/expenses">
                  <Button className="w-full">
                    {t('viewExpenses')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Reports & Analytics */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>{t('reports')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t('viewReports')}
                </p>
                <Link href="/reports">
                  <Button className="w-full">
                    {t('viewReports')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('getStarted')}</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            {t('startManaging')}
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-green-800 hover:bg-green-50">
              <BarChart3 className="h-5 w-5 mr-2" />
              {t('goToDashboard')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
