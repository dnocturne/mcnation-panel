import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ThankYouPage() {
  return (
    <div className="container max-w-3xl py-12">
      <Card className="bg-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl">Thank You for Your Purchase!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Your order has been successfully processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-center">
            <p>
              We've received your payment and are processing your order. You should receive a confirmation email shortly.
            </p>
            <p>
              If you have any questions about your purchase, please contact our support team.
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">What happens next?</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Your items will be credited to your Minecraft account</li>
              <li>You'll receive an email confirmation of your purchase</li>
              <li>You can view your purchase history in your account dashboard</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild variant="default">
              <Link href="/store">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Store
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/account/purchases">
                View Purchase History
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 