import { notFound } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { ProductClient } from "@/components/product/product-client"
import { getCachedProduct } from "@/lib/server-actions"

// ✅ Server Component - Fetch product data server-side
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Unwrap params Promise (Next.js 15+)
  const { id } = await params
  const productId = parseInt(id)
  
  if (isNaN(productId)) {
    notFound()
  }

  // Fetch product data server-side
  const product = await getCachedProduct(productId)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader showBack />
      
      <ProductClient product={product} />

      <BottomNav />
    </div>
  )
}

// ✅ Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const productId = parseInt(id)
  
  if (isNaN(productId)) {
    return {
      title: 'Produit non trouvé',
    }
  }

  const product = await getCachedProduct(productId)

  if (!product) {
    return {
      title: 'Produit non trouvé',
    }
  }

  return {
    title: `${product.name} - Boutique E-commerce`,
    description: product.description || `Découvrez ${product.name} dans notre boutique`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images || [],
    },
  }
}

// ✅ Revalidation toutes les 5 minutes
export const revalidate = 300
