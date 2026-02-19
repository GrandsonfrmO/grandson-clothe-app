"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Grid, List, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/home/product-card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useProducts } from "@/hooks/use-api"
import { useDebounce } from "@/hooks/use-debounce"

const CATEGORIES = [
  "Tous",
  "Hoodies", 
  "T-Shirts",
  "Pantalons",
  "Vestes",
  "Accessoires"
]

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
const COLORS = ["Noir", "Blanc", "Gris", "Rouge", "Bleu", "Vert", "Beige", "Kaki"]

interface ExplorerClientProps {
  initialProducts: any
  initialCategory?: string
  initialSearch?: string
}

export function ExplorerClient({ 
  initialProducts, 
  initialCategory, 
  initialSearch 
}: ExplorerClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch || "")
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "Tous")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [showNewOnly, setShowNewOnly] = useState(false)
  const [sortBy, setSortBy] = useState<string>("newest")

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Build API parameters with useMemo to stabilize the object reference
  const apiParams = useMemo(() => ({
    search: debouncedSearch || undefined,
    category: selectedCategory !== "Tous" ? selectedCategory : undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 1000000 ? priceRange[1] : undefined,
    sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
    colors: selectedColors.length > 0 ? selectedColors : undefined,
    isNew: showNewOnly ? true : undefined,
    limit: 20,
  }), [debouncedSearch, selectedCategory, priceRange, selectedSizes, selectedColors, showNewOnly])

  const { data, loading, error, refetch } = useProducts(apiParams, {
    initialData: initialProducts,
  })

  const products = data?.products || []

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    )
  }

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    )
  }

  const clearFilters = () => {
    setSelectedCategory("Tous")
    setSearchQuery("")
    setPriceRange([0, 1000000])
    setSelectedSizes([])
    setSelectedColors([])
    setShowNewOnly(false)
  }

  const activeFiltersCount = [
    selectedCategory !== "Tous",
    debouncedSearch,
    priceRange[0] > 0 || priceRange[1] < 1000000,
    selectedSizes.length > 0,
    selectedColors.length > 0,
    showNewOnly
  ].filter(Boolean).length

  if (loading && !data) {
    return (
      <main className="px-4 py-4 space-y-6">
        {/* Search Bar Skeleton */}
        <Skeleton className="h-12 rounded-2xl" />
        
        {/* Categories Skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="px-4 py-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Erreur lors du chargement des produits
          </p>
          <Button onClick={refetch} variant="outline">
            Réessayer
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="px-4 py-4 space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Rechercher des produits..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 h-12 rounded-2xl bg-secondary border-0"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "secondary"}
            className="px-4 py-2 rounded-full whitespace-nowrap cursor-pointer transition-all"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* View Toggle & Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="rounded-xl"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="rounded-xl"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-xl gap-2 relative">
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Filtres</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Prix (GNF)</Label>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000000}
                    min={0}
                    step={10000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{priceRange[0].toLocaleString()}</span>
                    <span>{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tailles</Label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSizes.includes(size) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSizeToggle(size)}
                      className="h-8 w-12"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Couleurs</Label>
                <div className="space-y-2">
                  {COLORS.map((color) => (
                    <div key={color} className="flex items-center space-x-2">
                      <Checkbox
                        id={color}
                        checked={selectedColors.includes(color)}
                        onCheckedChange={() => handleColorToggle(color)}
                      />
                      <Label htmlFor={color} className="text-sm">
                        {color}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* New Products Only */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="new-only"
                  checked={showNewOnly}
                  onCheckedChange={(checked) => setShowNewOnly(checked === true)}
                />
                <Label htmlFor="new-only" className="text-sm">
                  Nouveautés uniquement
                </Label>
              </div>

              {/* Clear Filters */}
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
                disabled={activeFiltersCount === 0}
              >
                Effacer les filtres
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
        </p>
        
        {/* Sort Options */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm bg-transparent border-0 focus:outline-none text-muted-foreground"
        >
          <option value="newest">Plus récents</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
          <option value="name">Nom A-Z</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className={
        viewMode === "grid" 
          ? "grid grid-cols-2 gap-4" 
          : "space-y-4"
      }>
        {products.map((product: any) => (
          <ProductCard 
            key={product.id} 
            product={{
              id: product.id,
              name: product.name,
              price: parseFloat(product.price),
              originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
              image: (product.images && product.images[0]) || '/images/products/placeholder.svg',
              category: product.category?.name || 'Produit',
              isNew: product.isNew
            }}
            size={viewMode === "grid" ? "default" : "large"}
          />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
          <p className="text-muted-foreground mb-4">
            Essayez de modifier vos critères de recherche
          </p>
          <Button onClick={clearFilters} variant="outline">
            Effacer les filtres
          </Button>
        </div>
      )}
    </main>
  )
}
