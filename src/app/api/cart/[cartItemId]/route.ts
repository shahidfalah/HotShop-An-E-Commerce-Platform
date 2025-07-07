    // src/app/api/cart/[cartItemId]/route.ts
    import { NextResponse } from "next/server";
    import { getServerSession } from "next-auth";
    import { authOptions } from "@/lib/auth";
    import { CartService } from "@/lib/database/cart.service";

    /**
     * PUT /api/cart/[cartItemId]
     * Updates the quantity of a specific cart item.
     * Body: { quantity: number }
     */
    export async function PUT(request: Request, { params }: { params: { cartItemId: string } }) {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
      }

      const { cartItemId } = params;

      try {
        const { quantity } = await request.json();

        if (typeof quantity !== "number" || quantity < 0) {
          return NextResponse.json(
            { message: "Invalid request body: quantity must be a non-negative number." },
            { status: 400 }
          );
        }

        const updatedItem = await CartService.updateCartItemQuantity(
          cartItemId,
          quantity,
          session.user.id // Pass userId for ownership verification
        );

        if (updatedItem === null) {
          // Item was removed because quantity was <= 0
          return NextResponse.json({ message: "Cart item removed successfully." }, { status: 200 });
        }
        return NextResponse.json(updatedItem, { status: 200 });
      } catch (error) {
        console.error(`[API/CART/${cartItemId}/PUT] Error updating cart item:`, error);
        if ((error as Error).message.includes("not found")) {
          return NextResponse.json(
            { message: (error as Error).message },
            { status: 404 }
          );
        }
        if ((error as Error).message.includes("Unauthorized")) {
          return NextResponse.json(
            { message: (error as Error).message },
            { status: 403 }
          );
        }
        if ((error as Error).message.includes("stock")) {
          return NextResponse.json(
            { message: (error as Error).message },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { message: "Failed to update cart item", error: (error as Error).message },
          { status: 500 }
        );
      }
    }

    /**
     * DELETE /api/cart/[cartItemId]
     * Removes a specific cart item.
     */
    export async function DELETE(request: Request, { params }: { params: { cartItemId: string } }) {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
      }

      const { cartItemId } = params;

      try {
        await CartService.removeCartItem(cartItemId, session.user.id); // Pass userId for ownership verification
        return NextResponse.json({ message: "Cart item removed successfully." }, { status: 200 });
      } catch (error) {
        console.error(`[API/CART/${cartItemId}/DELETE] Error removing cart item:`, error);
        if ((error as Error).message.includes("not found")) {
          return NextResponse.json(
            { message: (error as Error).message },
            { status: 404 }
          );
        }
        if ((error as Error).message.includes("Unauthorized")) {
          return NextResponse.json(
            { message: (error as Error).message },
            { status: 403 }
          );
        }
        return NextResponse.json(
          { message: "Failed to remove cart item", error: (error as Error).message },
          { status: 500 }
        );
      }
    }
    