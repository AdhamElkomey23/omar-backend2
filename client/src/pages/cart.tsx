import { useState } from 'react';
import { Link } from 'wouter';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCart();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState('');

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart."
    });
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) {
      toast({
        title: "No coupon entered",
        description: "Please enter a coupon code.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Invalid coupon",
      description: "The coupon code you entered is invalid or expired.",
      variant: "destructive"
    });
  };

  const handleCheckout = () => {
    toast({
      title: "Checkout initiated",
      description: "Proceeding to checkout...",
    });
    // In a real app, we would navigate to a checkout page
  };

  const subtotal = getTotal();
  const shipping = subtotal >= 50 || items.length === 0 ? 0 : 4.99;
  const total = subtotal + shipping;

  return (
    <div className="bg-neutral py-12">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-3xl font-bold mb-8">Your Shopping Cart</h1>
        
        {items.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="font-heading text-xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link href="/categories">
              <Button className="bg-primary hover:bg-primary-dark text-white">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="w-full lg:w-8/12">
              <div className="bg-white rounded-lg p-6">
                <div className="hidden md:grid grid-cols-12 gap-4 mb-4 text-sm font-medium text-gray-500">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                
                <Separator />
                
                {items.map((item) => (
                  <div key={item.id} className="py-6 border-b border-gray-100 last:border-0">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="col-span-1 md:col-span-2">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full max-w-[100px] h-auto rounded-md" 
                        />
                      </div>
                      
                      <div className="col-span-11 md:col-span-4">
                        <Link href={`/product/${item.productId}`} className="font-heading font-bold hover:text-primary">
                          {item.name}
                        </Link>
                        {item.customizations && Object.keys(item.customizations).length > 0 && (
                          <div className="mt-2 text-sm text-gray-600 space-y-1">
                            {Object.entries(item.customizations).map(([key, value]) => (
                              value && (
                                <p key={key} className="capitalize">
                                  {key}: {value}
                                </p>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="col-span-4 md:col-span-2 text-left md:text-center">
                        <span className="md:hidden text-gray-500 mr-2">Price:</span>
                        <span className="font-medium">{formatCurrency(item.price)}</span>
                      </div>
                      
                      <div className="col-span-4 md:col-span-2 flex items-center">
                        <span className="md:hidden text-gray-500 mr-2">Quantity:</span>
                        <div className="flex border border-gray-300 rounded-md">
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="px-2 py-1 border-r border-gray-300 text-gray-600 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            min="1" 
                            className="w-10 text-center focus:outline-none"
                          />
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-2 py-1 border-l border-gray-300 text-gray-600 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="col-span-3 md:col-span-2 text-right flex justify-between md:justify-end items-center">
                        <span className="md:hidden text-gray-500">Total:</span>
                        <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                      
                      <div className="col-span-1 text-right">
                        <Button 
                          onClick={() => handleRemoveItem(item.id)}
                          variant="ghost" 
                          size="icon"
                          className="text-gray-400 hover:text-red-500"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between mt-6">
                  <Link href="/categories">
                    <Button variant="outline">
                      <i className="ri-arrow-left-line mr-2"></i> Continue Shopping
                    </Button>
                  </Link>
                  <Button 
                    onClick={clearCart}
                    variant="outline" 
                    className="text-red-500 border-red-200 hover:bg-red-50"
                  >
                    <i className="ri-delete-bin-line mr-2"></i> Clear Cart
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="w-full lg:w-4/12">
              <div className="bg-white rounded-lg p-6">
                <h2 className="font-heading text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                    </span>
                  </div>
                  
                  {/* Coupon Code Form */}
                  <div className="pt-3 pb-4">
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <Input 
                        type="text" 
                        placeholder="Coupon code" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" variant="outline">Apply</Button>
                    </form>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between pt-2">
                    <span className="text-gray-900 font-bold">Total</span>
                    <span className="font-bold text-lg">{formatCurrency(total)}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    {subtotal < 50 && (
                      <p>Add {formatCurrency(50 - subtotal)} more to qualify for free shipping!</p>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={handleCheckout}
                  className="w-full mt-6 bg-primary hover:bg-primary-dark text-white py-3"
                >
                  Proceed to Checkout
                </Button>
                
                <div className="mt-4 text-xs text-center text-gray-500">
                  <p>
                    We accept various payment methods for your convenience:
                  </p>
                  <div className="flex justify-center space-x-2 mt-2">
                    <i className="ri-visa-line text-lg"></i>
                    <i className="ri-mastercard-line text-lg"></i>
                    <i className="ri-paypal-line text-lg"></i>
                    <i className="ri-apple-fill text-lg"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
