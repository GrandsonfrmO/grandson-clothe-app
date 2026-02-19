"use client"

import { useState, useEffect } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { ProductCard } from "@/components/home/product-card"
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal,
  Grid,
  List
} from "lucide-react"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { CATEGORIES } from "@/lib/constants"

const sizes = ["XS", "S", "M", "L", "XL", "XXL"]
const colors = ["Noir", "Blanc", "Gris", "Vert", "Rouge", "Bleu", "Beige", "Kaki"]
const sortOptions = [
  { value: "relevance", label: "Pertinence" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "newest", label: "Plus récent" },
  { value: "rating", label: "Mieux notés" }
]

export default function RecherchePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [sortBy, setSortBy] = useState("relevance")
  const [showNewOnly, setShowNewOnly] = useState(false)
  const [showSaleOnly, setShowSaleOnly] = useState(false)

  const toggleFilter = (filterArray: string[], setFilter: (arr: string[]) => void, value: string) => {
    if (filterArray.includes(value)) {
      setFilter(filterArray.filter(item => item !== value))
    } else {
      setFilter([...filterArray, value])
    }
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedSizes([])
    setSelectedColors([])
    setPriceRange([0, 1000000])
    setShowNewOnly(false)
    setShowSaleOnly(false)
    setSortBy("relevance")
  }

  const filteredProducts = MOCK_PRODUCTS.filter(product => {
    // Search query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Categories
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false
    }
    
    // Price range
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false
    }
    
    // New only
    if (showNewOnly && !product.isNew) {
      return false
    }
    
    // Sale only
    if (showSaleOnly && !product.originalPrice) {
      return false
    }
    
    return true
  }).sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price
      case "price-desc":
        return b.price - a.price
      case "newest":
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
      case "rating":
        return b.rating - a.rating
      default:
        return 0
    }
  })

  const activeFiltersCount = selectedCategories.length + selectedSizes.length + selectedColors.length + 
    (showNewOnly ? 1 : 0) + (showSaleOnly ? 1 : 0) + 
    (priceRange[0] > 0 || priceRange[1] < 1000000 ? 1 : 0)

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Recherche" showBack />
      
      <main className="px-4 py-4 space-y-4">
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

        {/* Filters Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-xl gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="rounded-xl text-muted-foreground"
              >
                Effacer
              </Button>
            )}
          </div>

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
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card rounded-2xl p-4 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-3">Catégories</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.slice(1).map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategories.includes(category) ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter(selectedCategories, setSelectedCategories, category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold mb-3">Prix (GNF)</h3>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={1000000}
                  step={10000}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{priceRange[0].toLocaleString()}</span>
                  <span>{priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="font-semibold mb-3">Tailles</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <Badge
                    key={size}
                    variant={selectedSizes.includes(size) ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter(selectedSizes, setSelectedSizes, size)}
                  >
                    {size}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="font-semibold mb-3">Couleurs</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <Badge
                    key={color}
                    variant={selectedColors.includes(color) ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter(selectedColors, setSelectedColors, color)}
                  >
                    {color}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Special Filters */}
            <div>
              <h3 className="font-semibold mb-3">Spécial</h3>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={showNewOnly ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setShowNewOnly(!showNewOnly)}
                >
                  Nouveautés
                </Badge>
                <Badge
                  variant={showSaleOnly ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setShowSaleOnly(!showSaleOnly)}
                >
                  En promotion
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Sort and Results */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
          </p>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-secondary rounded-xl px-3 py-1 text-sm border-0 outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-2 gap-4" 
            : "space-y-4"
        }>
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: (product.images && product.images[0]) || '/images/products/placeholder.svg',
                category: product.category,
                isNew: product.isNew
              }}
              size={viewMode === "grid" ? "default" : "large"}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Essayez de modifier vos critères de recherche
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              Effacer tous les filtres
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}