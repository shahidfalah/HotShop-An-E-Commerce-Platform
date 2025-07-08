// src/app/api/checkout/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Import your Prisma client
import { Decimal } from 'decimal.js'; // CORRECTED: Import Decimal from decimal.js

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const {
      shippingDetails,
      paymentMethod,
      billingAddressSameAsShipping,
    } = await request.json();

    // --- 1. Basic Validation ---
    if (!shippingDetails || !shippingDetails.fullName || !shippingDetails.email ||
        !shippingDetails.address1 || !shippingDetails.city || !shippingDetails.state ||
        !paymentMethod) {
      return NextResponse.json(
        { message: "Missing required shipping or payment details." },
        { status: 400 }
      );
    }

    // --- 2. Fetch User's Cart Items ---
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: true, // Include product details to get price and stock
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { message: "Your cart is empty. Cannot place an order." },
        { status: 400 }
      );
    }

    // --- 3. Validate Stock and Calculate Total ---
    let totalOrderAmount = new Decimal(0);
    const orderItemsData: { productId: string; quantity: number; price: Decimal }[] = [];
    const productsToUpdateStock: { id: string; newStock: number }[] = [];

    for (const item of cartItems) {
      const product = item.product;
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { message: `Insufficient stock for product: ${product?.title || 'Unknown Product'}. Available: ${product?.stock || 0}, Requested: ${item.quantity}` },
          { status: 400 }
        );
      }

      // Determine the price to charge (salePrice if applicable, else regular price)
      // Ensure product.price and product.salePrice are converted to Decimal instances for comparison
      const productPriceDecimal = new Decimal(product.price.toString());
      const productSalePriceDecimal = product.salePrice ? new Decimal(product.salePrice.toString()) : null;

      const effectivePrice = (productSalePriceDecimal && productSalePriceDecimal.lessThan(productPriceDecimal))
        ? productSalePriceDecimal
        : productPriceDecimal;

      totalOrderAmount = totalOrderAmount.plus(effectivePrice.times(item.quantity));

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: effectivePrice, // Store the effective price charged
      });

      productsToUpdateStock.push({
        id: product.id,
        newStock: product.stock - item.quantity,
      });
    }

    // --- 4. Create Order (within a transaction for atomicity) ---
    const result = await prisma.$transaction(async (tx) => {
      // Create Shipping Address (OrderAddress)
      const createdShippingAddress = await tx.orderAddress.create({
        data: {
          fullName: shippingDetails.fullName,
          email: shippingDetails.email,
          address1: shippingDetails.address1,
          address2: shippingDetails.address2,
          city: shippingDetails.city,
          state: shippingDetails.state,
          zipCode: shippingDetails.zipCode,
          country: shippingDetails.country,
          // originalAddressId: If you want to link to a saved Address, you'd find it here
        },
      });

      const createdBillingAddressId = createdShippingAddress.id;
      if (!billingAddressSameAsShipping) {
        // If billing is different, you'd need to collect billing details
        // For simplicity, this example assumes billing is same if checkbox is unchecked,
        // but in a real app, you'd have a separate billing address form.
        // If you had a separate billing form, you'd create another OrderAddress here.
        console.warn("Billing address different from shipping is not fully implemented in this simplified example. Using shipping address for billing.");
      }

      // Create the Order
      const createdOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          total: totalOrderAmount,
          status: "PENDING", // Initial status
          shippingAddressId: createdShippingAddress.id,
          billingAddressId: createdBillingAddressId, // Use the same for now
        },
      });

      // Create OrderItems
      await tx.orderItem.createMany({
        data: orderItemsData.map(item => ({
          ...item,
          orderId: createdOrder.id,
        })),
      });

      // Create Payment Record (simplified for Cash on Delivery)
      await tx.payment.create({
        data: {
          orderId: createdOrder.id,
          paymentType: paymentMethod, // 'CREDIT_CARD', 'PAYPAL', or 'CASH_ON_DELIVERY'
          status: paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PENDING', // Payment status
          amount: totalOrderAmount,
          // transactionId: null for COD, or actual ID from gateway for others
        },
      });

      // Update Product Stock
      for (const productUpdate of productsToUpdateStock) {
        await tx.product.update({
          where: { id: productUpdate.id },
          data: { stock: productUpdate.newStock },
        });
      }

      // Clear User's Cart
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id },
      });

      return createdOrder; // Return the created order
    });

    return NextResponse.json({ success: true, message: "Order placed successfully!", orderId: result.id }, { status: 200 });

  } catch (error: any) {
    console.error("[API/CHECKOUT/POST] Error placing order:", error);
    // More specific error messages for frontend if needed
    if (error.message.includes("stock")) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Failed to place order", error: error.message },
      { status: 500 }
    );
  }
}
