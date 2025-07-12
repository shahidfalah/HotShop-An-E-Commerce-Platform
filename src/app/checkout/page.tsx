/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/checkout/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label'; // Assuming you have a Label component or will create one
import { RadioGroup, RadioGroupItem } from '@/_components/ui/radio-group'; // Assuming you have a RadioGroup component
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, CheckCircle, XCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Define interfaces for cart item and product structure (re-used from cart page)
interface CartProduct {
  id: string;
  title: string;
  price: number;
  salePrice: number | null;
  images: string[]; // This will now contain full public URLs
  stock: number;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: CartProduct;
}

// Define interface for form data
interface FormData {
  fullName: string;
  email: string;
  address1: string;
  address2: string; // Optional
  city: string;
  state: string;
  zipCode: string; // Optional
  country: string; // Optional, assuming a default or selection later
  paymentMethod: 'CREDIT_CARD' | 'PAYPAL' | 'CASH_ON_DELIVERY';
  billingAddressSameAsShipping: boolean;
  // For simplicity, we won't add specific credit card fields here yet,
  // as they'd typically involve a payment gateway integration.
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [errorCart, setErrorCart] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA', // Default country, can be made dynamic
    paymentMethod: 'CASH_ON_DELIVERY', // Set default to COD as others are disabled
    billingAddressSameAsShipping: true,
  });

  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login'); // Redirect to login page
    }
  }, [status, router]);

  // Fetch cart items
  const fetchCartItems = useCallback(async () => {
    setLoadingCart(true);
    setErrorCart(null);
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch cart items.");
      }
      const data: CartItem[] = await response.json();
      setCartItems(data);
    } catch (err: any) {
      console.error("Error fetching cart items:", err);
      setErrorCart(err.message || "An error occurred while fetching your cart.");
    } finally {
      setLoadingCart(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") { // Only fetch cart if authenticated
      fetchCartItems();
    }
  }, [fetchCartItems, status]);

  // Update form data on input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle payment method change
  const handlePaymentMethodChange = (value: string) => {
    // Only allow changing if the option is not disabled
    if (value === 'CREDIT_CARD' || value === 'PAYPAL') {
      // Do nothing, or show a temporary message that it's coming soon
      setOrderMessage({ type: 'error', text: 'This payment method is coming soon!' });
      setTimeout(() => setOrderMessage(null), 3000);
      return;
    }
    setFormData(prev => ({
      ...prev,
      paymentMethod: value as 'CREDIT_CARD' | 'PAYPAL' | 'CASH_ON_DELIVERY',
    }));
  };

  // Calculate order summary
  const subtotal = cartItems.reduce((sum, item) => {
    const productPrice = typeof item.product.price === 'number' ? item.product.price : 0;
    const productSalePrice = typeof item.product.salePrice === 'number' ? item.product.salePrice : null;

    const effectivePrice = productSalePrice !== null && productSalePrice < productPrice
      ? productSalePrice
      : productPrice;
    return sum + (effectivePrice * item.quantity);
  }, 0);

  const discount: number = 0; // Example static discount from your image
  const deliveryFee: number = 0; // Free delivery as per your image

  const total = subtotal - discount + deliveryFee;

  // Handle place order submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderMessage(null);
    setIsProcessingOrder(true);

    if (!session?.user?.id) {
      setOrderMessage({ type: 'error', text: 'You must be logged in to place an order.' });
      setIsProcessingOrder(false);
      return;
    }

    if (cartItems.length === 0) {
      setOrderMessage({ type: 'error', text: 'Your cart is empty. Please add items before checking out.' });
      setIsProcessingOrder(false);
      return;
    }

    // Basic validation (you'll want more robust validation)
    if (!formData.fullName || !formData.email || !formData.address1 || !formData.city || !formData.state) {
      setOrderMessage({ type: 'error', text: 'Please fill in all required shipping details.' });
      setIsProcessingOrder(false);
      return;
    }

    // Ensure only enabled payment methods can be selected
    if (formData.paymentMethod !== 'CASH_ON_DELIVERY') {
      setOrderMessage({ type: 'error', text: 'Please select an available payment method (Cash on Delivery).' });
      setIsProcessingOrder(false);
      return;
    }

    try {
      const orderPayload = {
        userId: session.user.id,
        shippingDetails: {
          fullName: formData.fullName,
          email: formData.email,
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        billingAddressSameAsShipping: formData.billingAddressSameAsShipping,
        // cartItems are not sent in payload, the backend will fetch them from the user's cart
      };

      const response = await fetch("/api/checkout", { // This API route needs to be created
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to place order.");
      }

      setOrderMessage({ type: 'success', text: 'Order placed successfully!' });
      setCartItems([]); // Clear cart after successful order
      router.push('/order-confirmation'); // Redirect to a confirmation page

    } catch (err: any) {
      console.error("Error placing order:", err);
      setOrderMessage({ type: 'error', text: err.message || "An error occurred while placing your order." });
    } finally {
      setIsProcessingOrder(false);
      setTimeout(() => setOrderMessage(null), 5000); // Clear message after 5 seconds
    }
  };

  if (loadingCart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-background)">
        <p className="text-gray-600 text-lg">Loading your cart for checkout...</p>
      </div>
    );
  }

  if (errorCart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-background)">
        <p className="text-red-600 text-lg">{errorCart}</p>
      </div>
    );
  }

  if (cartItems.length === 0 && !loadingCart && !errorCart) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-(--color-background) p-4 text-center">
        <p className="text-xl text-gray-700 mb-6">Your cart is empty. Nothing to checkout!</p>
        <Link href="/products">
          <Button className="bg-(--color-primary) hover:bg-(--color-primary-hover) text-white px-6 py-3">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-(--color-background) text-gray-900 min-h-(calc(100vh-64px))">
      <div className="flex items-center mb-6">
        <Link href="/cart" className="text-gray-500 hover:text-(--color-primary) transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold ml-4">Checkout</h1>
      </div>

      {orderMessage && (
        <div className={`mb-6 p-4 rounded-md flex items-center gap-2 ${
          orderMessage.type === 'success'
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {orderMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span>{orderMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Details */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-6">Shipping Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1">
              <Label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address1" className="mb-1 block text-sm font-medium text-gray-700">Address 1</Label>
              <Input
                id="address1"
                name="address1"
                type="text"
                value={formData.address1}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address2" className="mb-1 block text-sm font-medium text-gray-700">Address 2 (Optional)</Label>
              <Input
                id="address2"
                name="address2"
                type="text"
                value={formData.address2}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="city" className="mb-1 block text-sm font-medium text-gray-700">City</Label>
              <Input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="state" className="mb-1 block text-sm font-medium text-gray-700">State</Label>
              <Input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="zipCode" className="mb-1 block text-sm font-medium text-gray-700">Zip Code (Optional)</Label>
              <Input
                id="zipCode"
                name="zipCode"
                type="text"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="country" className="mb-1 block text-sm font-medium text-gray-700">Country</Label>
              <Input
                id="country"
                name="country"
                type="text"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Order Summary & Payment Method */}
        <div className="lg:col-span-1 flex flex-col space-y-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center mb-4">
                <div className="w-16 h-16 flex-shrink-0 mr-4 rounded-md overflow-hidden border border-gray-200">
                  <Image
                    src={item.product.images[0] || "/placeholder.svg"}
                    alt={item.product.title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/64x64/E0E0E0/0D171C?text=No+Image`;
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800">{item.product.title}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  {item.product.salePrice && item.product.salePrice < item.product.price ? (
                    <p className="text-sm text-(--color-primary)">${item.product.salePrice.toFixed(2)}</p>
                  ) : (
                    <p className="text-sm text-gray-700">${item.product.price.toFixed(2)}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="space-y-3 text-gray-700 border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-red-500">-${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-3 mt-3">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-6">Payment Method</h2>
            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={handlePaymentMethodChange}
              className="space-y-4"
            >
              {/* Credit Card - Disabled */}
              <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
                <RadioGroupItem value="CREDIT_CARD" id="credit-card" disabled />
                <Label htmlFor="credit-card" className="text-gray-700 cursor-not-allowed">
                  Credit Card <span className="text-gray-500 text-xs">(Coming Soon)</span>
                </Label>
              </div>
              {/* Credit Card Input - Always disabled */}
              <Input
                type="text"
                placeholder=".... 8347" // Placeholder for last 4 digits or card number
                className="w-full bg-gray-100 border-gray-300 rounded-md shadow-sm text-gray-500"
                disabled // Always disabled
              />

              {/* PayPal - Disabled */}
              <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
                <RadioGroupItem value="PAYPAL" id="paypal" disabled />
                <Label htmlFor="paypal" className="text-gray-700 cursor-not-allowed">
                  PayPal <span className="text-gray-500 text-xs">(Coming Soon)</span>
                </Label>
              </div>

              {/* Cash on Delivery - Enabled */}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CASH_ON_DELIVERY" id="cash-on-delivery" />
                <Label htmlFor="cash-on-delivery" className="text-gray-700">Cash on Delivery</Label>
              </div>
            </RadioGroup>

            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="billing-same-as-shipping"
                name="billingAddressSameAsShipping"
                checked={formData.billingAddressSameAsShipping}
                onChange={handleInputChange}
                className="h-4 w-4 text-(--color-primary) border-gray-300 rounded focus:ring-(--color-primary)"
              />
              <Label htmlFor="billing-same-as-shipping" className="ml-2 block text-sm text-gray-900">
                Billing Address Same As Shipping
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-(--color-primary) hover:bg-(--color-primary-hover) text-white py-3 text-lg shadow-md"
            disabled={isProcessingOrder || cartItems.length === 0}
          >
            {isProcessingOrder ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
