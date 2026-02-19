import { Suspense } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { HeroBanner } from "@/components/home/hero-banner"
import { QuickCategories } from "@/components/home/quick-categories"
import { FeaturedProducts } from "@/components/home/featured-products"
import { PromoCard } from "@/components/home/promo-card"
import { SpecialOfferSection } from "@/components/home/special-offer-section"
import { GallerySection } from "@/components/home/gallery-section"
import { VideosSection } from "@/components/home/videos-section"
import { ModelsSection } from "@/components/home/models-section"
import { TrendingSection } from "@/components/home/trending-section"
import { ClientProviders } from "@/components/client-providers"
import { getCachedFeaturedProducts, getCachedHomePageContent } from "@/lib/server-actions"

const SectionSkeleton = () => (
  <div className="px-4 py-8">
    <div className="h-48 bg-muted rounded-2xl animate-pulse" />
  </div>
)

// ✅ Server Component - Fetch data côté serveur
export default async function Home() {
  // Fetch data en parallèle côté serveur
  const [featuredProducts, homeContent] = await Promise.all([
    getCachedFeaturedProducts(10),
    getCachedHomePageContent(),
  ])

  return (
    <ClientProviders>
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader />
        
        <main className="space-y-2">
          {/* Critical sections - rendered server-side */}
          <HeroBanner />
          <QuickCategories />
          <FeaturedProducts title="Nouveautes" initialProducts={featuredProducts} />
          
          {/* Non-critical sections - with Suspense */}
          <Suspense fallback={<SectionSkeleton />}>
            <SpecialOfferSection initialData={homeContent.specialOffer} />
          </Suspense>
          
          <Suspense fallback={<SectionSkeleton />}>
            <GallerySection initialData={homeContent.gallery} />
          </Suspense>
          
          <PromoCard />
          
          <Suspense fallback={<SectionSkeleton />}>
            <VideosSection initialData={homeContent.videos} />
          </Suspense>
          
          <Suspense fallback={<SectionSkeleton />}>
            <ModelsSection initialData={homeContent.models} />
          </Suspense>
          
          <Suspense fallback={<SectionSkeleton />}>
            <TrendingSection />
          </Suspense>
        </main>

        <BottomNav />
      </div>
    </ClientProviders>
  )
}

// ✅ Metadata pour SEO
export const metadata = {
  title: 'Accueil - Boutique E-commerce',
  description: 'Découvrez nos dernières collections et offres spéciales',
}

// ✅ Revalidation toutes les 5 minutes
export const revalidate = 300
