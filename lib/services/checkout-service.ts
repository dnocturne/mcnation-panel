/**
 * Service for processing checkout data
 * 
 * This service provides functions for handling checkout completion and granting
 * purchased items to users.
 */

import { stripe } from '@/lib/stripe';
import { grantPackageToPlayer } from './server-service';
import { kv } from '@/lib/kv-store';

/**
 * Information about a purchased line item
 */
interface PurchasedItem {
  id: string;
  name: string;
  quantity: number;
}

/**
 * Process a completed checkout session
 * 
 * This function fetches the checkout session data, extracts the purchased items,
 * and grants them to the player.
 * 
 * @param session The Stripe checkout session
 */
export async function processCheckoutCompletion(sessionId: string): Promise<void> {
  try {
    // Get session data with line items
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer']
    });
    
    // Get metadata about the purchase
    const minecraftUsername = session.metadata?.minecraft_username;
    
    if (!minecraftUsername) {
      console.error('No Minecraft username found in session metadata:', sessionId);
      return;
    }
    
    // Can't process if no line items
    if (!session.line_items?.data) {
      console.error('No line items found in checkout session:', sessionId);
      return;
    }
    
    console.log(`Processing checkout for ${minecraftUsername} with ${session.line_items.data.length} items`);
    
    // Process each purchased item
    const lineItems = session.line_items.data;
    for (const item of lineItems) {
      try {
        // Get the product details
        const productId = item.price?.product as string;
        const product = await stripe.products.retrieve(productId);
        
        console.log(`Granting item: ${product.name} (${item.quantity}x) to ${minecraftUsername}`);
        
        // Grant the package to the player
        await grantPackageToPlayer(minecraftUsername, product.name);
        
        // Save record of purchase to KV store
        await kv.set(`purchase:${session.id}:${product.id}`, {
          id: product.id,
          name: product.name,
          timestamp: new Date().toISOString(),
          username: minecraftUsername,
          quantity: item.quantity
        });
      } catch (itemError) {
        console.error(`Error processing line item ${item.id}:`, itemError);
      }
    }
    
    console.log(`Successfully processed checkout ${sessionId} for ${minecraftUsername}`);
  } catch (error) {
    console.error('Error processing checkout completion:', error);
    throw error;
  }
} 