import { Suspense } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { ExplorerClient } from "@/components/explorer/explorer-client"
import { getCachedProducts } from "@/lib/server-actions"

// ✅ Server Component - Fetch initial data server-side
export default async function ExplorerPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  // Unwrap searchParams Promise (Next.js 15+)
  const params = await searchParams
  
  // Fetch initial products server-side
  const initialProducts = await getCachedProducts({
    category: params.category,
    search: params.search,
    limit: 20,
  })

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Explorer" showBack />
      
      <Suspense fallback={
        <div className="px-4 py-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-secondary rounded-2xl"></div>
            <div className="flex gap-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-8 w-20 bg-secondary rounded-full"></div>
              ))}
            </div>
          </div>
        </div>
      }>
        <ExplorerClient 
          initialProducts={initialProducts}
          initialCategory={params.category}
          initialSearch={params.search}
        />
      </Suspense>

      <BottomNav />
    </div>
  )
}

// ✅ Metadata pour SEO
export const metadata = {
  title: 'Explorer - Boutique E-commerce',
  description: 'Découvrez tous nos produits et trouvez ce que vous cherchez',
}

// ✅ Revalidation toutes les 5 minutes
export const revalidate = 300
