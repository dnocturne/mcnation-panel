import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StoreProvider } from '@/app/store/store-context'
import { StoreItemClient } from './page-client'
import { getStoreItemById } from '@/lib/services/store-service'
import { getPaymentMethods } from '@/lib/services/store-service'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = parseInt(params.id)
  
  if (isNaN(id)) {
    return {
      title: 'Item Not Found - MCNation Store',
      description: 'The requested item could not be found.',
    }
  }
  
  try {
    const item = await getStoreItemById(id)
    
    if (!item) {
      return {
        title: 'Item Not Found - MCNation Store',
        description: 'The requested item could not be found.',
      }
    }
    
    return {
      title: `${item.name} - MCNation Store`,
      description: item.description || 'View item details and purchase options',
    }
  } catch (error) {
    console.error(`Error fetching item metadata for ID ${id}:`, error)
    return {
      title: 'Error - MCNation Store',
      description: 'There was an error loading the item details.',
    }
  }
}

export default async function StoreItemPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  
  if (isNaN(id)) {
    notFound()
  }
  
  try {
    // Check if the item exists
    const item = await getStoreItemById(id)
    
    if (!item) {
      notFound()
    }
    
    // Get payment methods
    const paymentMethods = await getPaymentMethods()
    
    return (
      <StoreProvider>
        <div className="space-y-6">
          <StoreItemClient 
            itemId={id} 
            paymentMethods={paymentMethods.map(pm => ({
              id: pm.id,
              name: pm.name
            }))}
          />
        </div>
      </StoreProvider>
    )
  } catch (error) {
    // If we have an error fetching the item, let the client component handle it
    return (
      <StoreProvider>
        <div className="space-y-6">
          <StoreItemClient 
            itemId={id}
            paymentMethods={[]}
          />
        </div>
      </StoreProvider>
    )
  }
} 