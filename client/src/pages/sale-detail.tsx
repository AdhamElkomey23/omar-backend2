import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { LuArrowLeft, LuPackage } from "react-icons/lu";

export default function SaleDetail() {
  const { id } = useParams();
  const saleId = parseInt(id);
  
  // Fetch sale details
  const { data: sale, isLoading: saleLoading } = useQuery({
    queryKey: ['/api/sales', saleId],
    queryFn: () => apiRequest(`/api/sales/${saleId}`),
    enabled: !isNaN(saleId)
  });
  
  // Fetch product details for this sale
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['/api/products', sale?.productId],
    queryFn: () => apiRequest(`/api/products/${sale?.productId}`),
    enabled: !!sale?.productId
  });
  
  const isLoading = saleLoading || productLoading;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <h2 className="text-2xl font-bold">Sale not found</h2>
        <p className="text-muted-foreground">The sale you're looking for doesn't exist or has been deleted.</p>
        <Button asChild>
          <Link href="/sales">Back to Sales</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Sale Details</h1>
        <Button variant="outline" asChild>
          <Link href="/sales" className="flex items-center gap-2">
            <LuArrowLeft className="h-4 w-4" />
            Back to Sales
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sale Information */}
        <Card>
          <CardHeader>
            <CardTitle>Sale Information</CardTitle>
            <CardDescription>
              Transaction details for sale #{saleId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Date</dt>
                <dd className="text-base">
                  {new Date(sale.saleDate).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Time</dt>
                <dd className="text-base">
                  {new Date(sale.saleDate).toLocaleTimeString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Quantity</dt>
                <dd className="text-base">{sale.quantity} units</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Total Amount</dt>
                <dd className="text-lg font-bold text-primary">
                  {formatCurrency(sale.totalAmount)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Transaction ID</dt>
                <dd className="text-base font-mono">{sale.id}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        {/* Product Information */}
        {product && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <LuPackage className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>
                  Product Details
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Unit Price</dt>
                  <dd className="text-base">{formatCurrency(product.unitPrice)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Current Stock</dt>
                  <dd className="text-base">{product.stockQuantity} units</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Product ID</dt>
                  <dd className="text-base font-mono">{product.id}</dd>
                </div>
                <div className="col-span-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/products/${product.id}`}>
                      View Product Details
                    </Link>
                  </Button>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Sales Calculation */}
      <Card>
        <CardHeader>
          <CardTitle>Sale Calculation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Unit Price</span>
              <span>{formatCurrency(product?.unitPrice || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantity</span>
              <span>× {sale.quantity}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(sale.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}