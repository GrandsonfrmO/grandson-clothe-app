export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number | null
  images: string[]
  category: string
  isNew?: boolean
  description: string
  features: string[]
  sizes: string[]
  colors?: string[]
  rating: number
  reviews: number
  inStock: boolean
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Hoodie Oversize Noir",
    price: 450000,
    originalPrice: null,
    images: [
      "/images/products/hoodie-black.svg",
      "/images/hero-streetwear-1.jpg",
      "/images/hero-streetwear-2.jpg"
    ],
    category: "Hoodies",
    isNew: true,
    description: "Hoodie oversize premium en coton bio. Coupe décontractée parfaite pour le streetwear urbain. Fabriqué avec soin en Guinée.",
    features: [
      "100% coton bio certifié",
      "Coupe oversize confortable", 
      "Capuche doublée",
      "Poche kangourou",
      "Made in Guinea"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Noir", "Blanc", "Gris"],
    rating: 4.8,
    reviews: 24,
    inStock: true
  },
  {
    id: 2,
    name: "T-Shirt Graphic",
    price: 180000,
    originalPrice: 220000,
    images: [
      "/images/products/tshirt-graphic.svg",
      "/images/hero-fashion-1.jpg"
    ],
    category: "T-Shirts",
    isNew: false,
    description: "T-shirt avec design graphique exclusif GRANDSON. Impression haute qualité sur coton premium.",
    features: [
      "Coton premium 180g/m²",
      "Impression sérigraphie",
      "Coupe regular fit",
      "Col rond renforcé"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Noir", "Blanc"],
    rating: 4.6,
    reviews: 18,
    inStock: true
  },
  {
    id: 3,
    name: "Cargo Pants",
    price: 380000,
    originalPrice: null,
    images: [
      "/images/products/cargo-pants.svg",
      "/images/category-pants.jpg"
    ],
    category: "Pantalons",
    isNew: true,
    description: "Pantalon cargo streetwear avec multiples poches. Style urbain et fonctionnel.",
    features: [
      "Tissu résistant",
      "6 poches fonctionnelles",
      "Coupe droite",
      "Taille ajustable"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Kaki", "Noir", "Beige"],
    rating: 4.7,
    reviews: 31,
    inStock: true
  },
  {
    id: 4,
    name: "Bomber Jacket",
    price: 520000,
    originalPrice: 650000,
    images: [
      "/images/products/bomber-jacket.svg",
      "/images/hero-fashion-2.jpg"
    ],
    category: "Vestes",
    isNew: false,
    description: "Veste bomber classique revisitée. Style intemporel avec finitions premium.",
    features: [
      "Tissu satiné",
      "Doublure matelassée",
      "Fermeture éclair YKK",
      "Poches latérales"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Noir", "Vert olive", "Bordeaux"],
    rating: 4.9,
    reviews: 42,
    inStock: true
  },
  {
    id: 5,
    name: "Hoodie Vert Oversize",
    price: 450000,
    originalPrice: null,
    images: [
      "/images/products/hoodie-black.svg",
      "/images/hero-streetwear-1.jpg"
    ],
    category: "Hoodies",
    isNew: true,
    description: "Hoodie oversize dans une teinte verte unique. Même qualité premium que notre modèle noir.",
    features: [
      "100% coton bio certifié",
      "Coupe oversize confortable",
      "Capuche doublée",
      "Poche kangourou",
      "Made in Guinea"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Vert", "Noir", "Blanc"],
    rating: 4.8,
    reviews: 19,
    inStock: true
  },
  {
    id: 6,
    name: "Joggers Premium",
    price: 320000,
    originalPrice: 380000,
    images: [
      "/images/product-joggers.jpg",
      "/images/category-pants.jpg"
    ],
    category: "Pantalons",
    isNew: false,
    description: "Pantalon de jogging premium pour un style décontracté chic.",
    features: [
      "Coton mélangé doux",
      "Taille élastique",
      "Poches zippées",
      "Chevilles resserrées"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Gris", "Noir", "Marine"],
    rating: 4.5,
    reviews: 27,
    inStock: true
  },
  {
    id: 7,
    name: "Casquette Streetwear",
    price: 120000,
    originalPrice: null,
    images: [
      "/images/products/cap.svg",
      "/images/category-accessories.jpg"
    ],
    category: "Accessoires",
    isNew: true,
    description: "Casquette snapback avec logo GRANDSON brodé. Accessoire indispensable du streetwear.",
    features: [
      "Logo brodé haute qualité",
      "Visière plate",
      "Réglage snapback",
      "100% coton"
    ],
    sizes: ["Unique"],
    colors: ["Noir", "Blanc", "Rouge"],
    rating: 4.4,
    reviews: 15,
    inStock: true
  },
  {
    id: 8,
    name: "Sac Bandoulière",
    price: 280000,
    originalPrice: 320000,
    images: [
      "/images/product-bag.jpg",
      "/images/category-accessories.jpg"
    ],
    category: "Accessoires",
    isNew: false,
    description: "Sac bandoulière urbain avec compartiments multiples. Parfait pour le quotidien.",
    features: [
      "Matière résistante à l'eau",
      "Multiples compartiments",
      "Bandoulière ajustable",
      "Fermetures sécurisées"
    ],
    sizes: ["Unique"],
    colors: ["Noir", "Gris"],
    rating: 4.6,
    reviews: 22,
    inStock: true
  }
]

export const FEATURED_PRODUCTS = MOCK_PRODUCTS.slice(0, 4)
export const TRENDING_PRODUCTS = MOCK_PRODUCTS.slice(3, 7)
export const NEW_PRODUCTS = MOCK_PRODUCTS.filter(p => p.isNew)
export const SALE_PRODUCTS = MOCK_PRODUCTS.filter(p => p.originalPrice)