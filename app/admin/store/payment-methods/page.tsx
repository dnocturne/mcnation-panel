import { Metadata } from "next"
import PaymentMethodsList from "./payment-methods-list"

export const metadata: Metadata = {
  title: "Admin - Payment Methods",
  description: "Manage your webstore payment methods",
}

export default function PaymentMethodsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payment Methods</h2>
        <p className="text-muted-foreground">
          Configure payment methods for your webstore.
        </p>
      </div>
      
      <PaymentMethodsList />
    </div>
  )
} 