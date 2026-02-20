"use client"

import { Suspense } from "react"
import { MobileHeaderSimple } from "@/components/mobile-header-simple"
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

const SectionSkeleton = () => (
  <div className="px-4 py-8">
    <div className="h-48 bg-muted rounded-2xl animate-pulse" />
  </div>
)

// ✅ Client Component - Évite les problèmes de server actions
export default function Home() {
  return (
    <ClientProviders>
      <div className="min-h-screen bg-background pb-20">
        <MobileHeaderSimple />
        
        <main className="space-y-2">
          {/* Critical sections */}
          <HeroBanner />
          <QuickCategories />
          <FeaturedProducts title="Nouveautés" />
          
          {/* Non-critical sections - with Suspense */}
          <Suspense fallback={<SectionSkeleton />}>
            <SpecialOfferSection />
          </Suspense>
          
          <Suspense fallback={<SectionSkeleton />}>
            <GallerySection />
          </Suspense>
          
          <PromoCard />
          
          <Suspense fallback={<SectionSkeleton />}>
            <VideosSection />
          </Suspense>
          
          <Suspense fallback={<SectionSkeleton />}>
            <ModelsSection />
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
