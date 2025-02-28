import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { kv } from "@/lib/kv-store";
import { syncStripeDataToKV } from "@/lib/services/stripe-service";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Server component that handles checkout success and syncs Stripe data
 */
export default async function CheckoutSuccessPage() {
  // Verify user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return redirect("/auth/login?redirect=/store/checkout/success");
  }

  // Get customer ID and sync data
  const userId = session.user.id;
  const stripeCustomerId = await kv.get<string>(`stripe:user:${userId}`);
  
  if (stripeCustomerId) {
    // Sync Stripe data to KV
    await syncStripeDataToKV(stripeCustomerId);
  }

  return (
    <div className="container max-w-3xl py-12">
      <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-full">
          <CheckCircle className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Thank You for Your Purchase!</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Your transaction was successful, and your items will be delivered to your Minecraft account shortly.
        </p>
      </div>
      
      <div className="bg-card p-8 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">What happens next?</h2>
        <ul className="space-y-3 mb-6">
          <li className="flex items-start">
            <div className="bg-primary/10 p-1 rounded-full mr-3 mt-0.5">
              <span className="block h-4 w-4 rounded-full bg-primary" />
            </div>
            <p>Your purchased items will be automatically applied to your Minecraft account within 5 minutes.</p>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/10 p-1 rounded-full mr-3 mt-0.5">
              <span className="block h-4 w-4 rounded-full bg-primary" />
            </div>
            <p>You'll need to be online in the game to receive your items. If you're not online, they'll be delivered the next time you log in.</p>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/10 p-1 rounded-full mr-3 mt-0.5">
              <span className="block h-4 w-4 rounded-full bg-primary" />
            </div>
            <p>A receipt has been sent to your email address.</p>
          </li>
        </ul>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/store">
              Continue Shopping
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/account/purchases">
              View My Purchases
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 