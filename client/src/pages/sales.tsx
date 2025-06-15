import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Plus, Filter, TrendingUp, DollarSign, Edit, Trash2, Download } from "lucide-react";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { insertSaleSchema, type Sale, type StorageItem } from "../../../shared/schema";
import { t, isRTL } from "@/lib/i18n";

// Form validation schema
const saleFormSchema = insertSaleSchema.extend({
  saleDate: z.date({
    required_error: "Sale date is required.",
  }),
});

type SaleFormValues = z.infer<typeof saleFormSchema>;

export default function Sales() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [productFilter, setProductFilter] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  // Fetch sales
  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['/api/sales', productFilter],
    queryFn: async () => {
      let queryParams = '';
      if (productFilter && productFilter !== 'all') {
        queryParams = `?productId=${productFilter}`;
      }
      
      const response = await fetch(`/api/sales${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch sales');
      return response.json() as Promise<Sale[]>;
    }
  });

  // Fetch storage items for the dropdown (only show items with available quantity)
  const { data: storageItems = [] } = useQuery({
    queryKey: ['/api/storage'],
    queryFn: async () => {
      const response = await fetch('/api/storage');
      if (!response.ok) throw new Error('Failed to fetch storage items');
      return response.json() as Promise<StorageItem[]>;
    }
  });

  // Group storage items by material and calculate total available quantities
  const availableProducts = storageItems.reduce((acc, item) => {
    const existing = acc.find(p => p.itemName === item.itemName);
    if (existing) {
      existing.totalQuantity += item.quantityInTons;
      existing.avgPrice = (existing.avgPrice + item.purchasePricePerTon) / 2;
    } else {
      acc.push({
        itemName: item.itemName,
        totalQuantity: item.quantityInTons,
        avgPrice: item.purchasePricePerTon,
        storageItems: [item]
      });
    }
    return acc;
  }, [] as Array<{itemName: string, totalQuantity: number, avgPrice: number, storageItems: StorageItem[]}>)
  .filter(item => item.totalQuantity > 0);

  const addSaleMutation = useMutation({
    mutationFn: async (values: SaleFormValues) => {
      // First create the sale record
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error('Failed to add sale');
      
      // Then deduct quantity from storage
      await fetch('/api/storage/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: values.productName,
          quantity: values.quantity
        }),
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/storage'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "تم تسجيل البيع",
        description: "تم تسجيل البيع بنجاح وتحديث المخزون.",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تسجيل البيع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  });

  const deleteSaleMutation = useMutation({
    mutationFn: async (sale: Sale) => {
      // First add quantity back to storage
      await fetch('/api/storage/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: sale.productName,
          quantity: sale.quantity
        }),
      });

      // Then delete the sale record
      const response = await fetch(`/api/sales/${sale.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete sale');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/storage'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "تم حذف البيع",
        description: "تم حذف البيع واستعادة المخزون.",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف البيع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  });

  const editSaleMutation = useMutation({
    mutationFn: async ({ id, values, originalSale }: { id: number, values: SaleFormValues, originalSale: Sale }) => {
      // First restore original quantity to storage
      await fetch('/api/storage/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: originalSale.productName,
          quantity: originalSale.quantity
        }),
      });

      // Then deduct new quantity from storage
      await fetch('/api/storage/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: values.productName,
          quantity: values.quantity
        }),
      });

      // Finally update the sale record
      const response = await fetch(`/api/sales/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error('Failed to update sale');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/storage'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      setIsEditDialogOpen(false);
      setEditingSale(null);
      form.reset();
      toast({
        title: "تم تحديث البيع",
        description: "تم تحديث البيع وتعديل المخزون.",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث البيع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  });

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      productName: "",
      quantity: 1,
      totalAmount: 0,
      saleDate: new Date(),
      clientName: "",
      clientContact: "",
    },
  });

  // PDF generation function
  const generatePDF = (saleData: Sale | Sale[]) => {
    const isMultiple = Array.isArray(saleData);
    const sales = isMultiple ? saleData : [saleData];
    
    // Create a simple HTML invoice
    const invoiceHTML = `
      <html>
        <head>
          <title>${isMultiple ? 'Sales Report' : 'Invoice'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Al-Wasiloon for Mining and Chemical Industries</h1>
            <h2>${isMultiple ? 'Sales Report' : 'Invoice'}</h2>
            <p>Date: ${format(new Date(), "MMM dd, yyyy")}</p>
          </div>
          
          ${sales.map(sale => `
            <div class="invoice-details">
              ${!isMultiple ? `<h3>Invoice #${sale.id}</h3>` : ''}
              <p><strong>Customer:</strong> ${sale.clientName}</p>
              ${sale.clientContact ? `<p><strong>Contact:</strong> ${sale.clientContact}</p>` : ''}
              <p><strong>Sale Date:</strong> ${format(new Date(sale.saleDate), "MMM dd, yyyy")}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${sale.productName}</td>
                  <td>${sale.quantity}</td>
                  <td>$${(sale.totalAmount / sale.quantity).toFixed(2)}</td>
                  <td>$${sale.totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            ${!isMultiple ? '<div style="page-break-after: always;"></div>' : ''}
          `).join('')}
          
          ${isMultiple ? `
            <div class="total">
              <h3>Total Sales: $${sales.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2)}</h3>
              <p>Total Items Sold: ${sales.reduce((sum, sale) => sum + sale.quantity, 0)}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `;
    
    // Create a blob and download
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${isMultiple ? 'sales_report' : `invoice_${sales[0].id}`}_${format(new Date(), "yyyy-MM-dd")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle edit form submission
  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    form.reset({
      productName: sale.productName,
      quantity: sale.quantity,
      totalAmount: sale.totalAmount,
      clientName: sale.clientName,
      clientContact: sale.clientContact || '',
      saleDate: format(new Date(sale.saleDate), "yyyy-MM-dd") as any,
    });
    setIsEditDialogOpen(true);
  };

  function onSubmit(values: SaleFormValues) {
    if (editingSale) {
      editSaleMutation.mutate({ id: editingSale.id, values, originalSale: editingSale });
    } else {
      addSaleMutation.mutate(values);
    }
  }

  // Calculate summary data
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  
  // Sales already have productName field, no need to map
  const salesWithProducts = sales;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('sales')}</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              {t('recordSale')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('recordSale')}</DialogTitle>
              <DialogDescription>
                سجل معاملة بيع جديدة لعملك.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('product')}</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر منتج" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableProducts.map((product) => (
                            <SelectItem key={product.itemName} value={product.itemName}>
                              {product.itemName} (المتاح: {product.totalQuantity} طن)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('quantity')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          placeholder="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('totalAmount')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clientName')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="مثال: مزارع الوادي الأخضر" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clientContact')} (اختياري)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="مثال: +20 100 123 4567" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={addSaleMutation.isPending}>
                    {addSaleMutation.isPending ? "جارٍ التسجيل..." : "تسجيل البيع"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalSales')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الوحدات المباعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>المرشحات</CardTitle>
          <CardDescription>ترشيح المبيعات حسب المنتج</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-filter">{t('product')}</Label>
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع المنتجات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المنتجات</SelectItem>
                  {availableProducts.map((product) => (
                    <SelectItem key={product.itemName} value={product.itemName}>
                      {product.itemName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setProductFilter(undefined)} 
                className="w-full"
              >
                <Filter className="mr-2 h-4 w-4" />
                مسح المرشحات
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales List */}
      <Card>
        <CardHeader>
          <CardTitle>المبيعات الأخيرة</CardTitle>
          <CardDescription>
            {sales.length > 0 ? `تم العثور على ${sales.length} مبيعة` : "لم يتم العثور على مبيعات"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {salesLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">جارٍ تحميل المبيعات...</div>
            </div>
          ) : sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 space-y-2">
              <div className="text-muted-foreground">لم يتم تسجيل أي مبيعات بعد</div>
              <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
                سجل أول عملية بيع
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add Export All Sales button */}
              <div className="flex justify-end mb-4">
                <Button
                  onClick={() => generatePDF(sales)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  تصدير جميع المبيعات
                </Button>
              </div>
              
              {sales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1 flex-1">
                    <p className="font-medium">{sale.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('quantity')}: {sale.quantity} • {format(new Date(sale.saleDate), "MMM dd, yyyy")}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      العميل: {sale.clientName}
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-green-600">${sale.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      ${(sale.totalAmount / sale.quantity).toFixed(2)} للوحدة
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generatePDF(sale)}
                      className="p-2"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(sale)}
                      className="p-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف المبيعة</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف هذه المبيعة؟ سيتم إرجاع {sale.quantity} وحدة من {sale.productName} إلى المخزون.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteSaleMutation.mutate(sale)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            حذف المبيعة
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Sale Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل المبيعة</DialogTitle>
            <DialogDescription>
              تحديث تفاصيل المبيعة. سيتم تعديل المخزون تلقائياً.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('product')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر منتج" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableProducts.map((product) => (
                          <SelectItem key={product.itemName} value={product.itemName}>
                            {product.itemName} (المتاح: {product.totalQuantity} طن)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('quantity')} (طن)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="أدخل الكمية" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('totalAmount')} (جنيه)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="أدخل المبلغ الإجمالي" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientName')}</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل اسم العميل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientContact')} (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل معلومات الاتصال" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="saleDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('saleDate')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={typeof field.value === 'string' ? field.value : format(new Date(field.value), "yyyy-MM-dd")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingSale(null);
                    form.reset();
                  }}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={editSaleMutation.isPending}>
                  {editSaleMutation.isPending ? "جارٍ التحديث..." : "تحديث المبيعة"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}