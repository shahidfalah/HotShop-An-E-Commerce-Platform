// src/lib/events.ts

/**
 * Custom event names for global updates.
 */
export const CART_UPDATED_EVENT = 'cartUpdated';
export const WISHLIST_UPDATED_EVENT = 'wishlistUpdated';

/**
 * Dispatches a custom event to signal that the cart has been updated.
 * Components listening for this event can react accordingly (e.g., re-fetch cart count).
 */
export function dispatchCartUpdated() {
  if (typeof window !== 'undefined') { // Ensure this runs only in the browser
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
}

/**
 * Dispatches a custom event to signal that the wishlist has been updated.
 * Components listening for this event can react accordingly (e.g., re-fetch wishlist count).
 */
export function dispatchWishlistUpdated() {
  if (typeof window !== 'undefined') { // Ensure this runs only in the browser
    window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
  }
}
