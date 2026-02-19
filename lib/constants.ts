// App Configuration
export const APP_CONFIG = {
  name: "GRANDSON CLOTHES",
  tagline: "Streetwear authentique depuis la Guinée",
  version: "1.0.0",
  currency: "GNF",
  locale: "fr-GN"
} as const

// Contact Information
export const CONTACT_INFO = {
  phone: "+224 XX XX XX XX",
  email: "support@grandsonclothes.com",
  address: "Conakry, Guinée",
  socialMedia: {
    instagram: "@grandsonclothes",
    facebook: "GRANDSON CLOTHES",
    tiktok: "@grandsonclothes"
  }
} as const

// Business Hours
export const BUSINESS_HOURS = {
  weekdays: "9h00 - 18h00",
  saturday: "10h00 - 16h00",
  sunday: "Fermé"
} as const

// Product Categories
export const CATEGORIES = [
  "Tous",
  "Hoodies", 
  "T-Shirts",
  "Pantalons",
  "Vestes",
  "Accessoires",
  "Homme",
  "Femme"
] as const

// Order Status
export const ORDER_STATUS = {
  PROCESSING: "processing",
  SHIPPING: "shipping", 
  DELIVERED: "delivered",
  CANCELLED: "cancelled"
} as const

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PROCESSING]: "En préparation",
  [ORDER_STATUS.SHIPPING]: "En transit",
  [ORDER_STATUS.DELIVERED]: "Livrée",
  [ORDER_STATUS.CANCELLED]: "Annulée"
} as const

// Shipping
export const SHIPPING_CONFIG = {
  freeShippingThreshold: 500000, // 500,000 GNF
  standardDeliveryDays: "2-5 jours",
  expressDeliveryDays: "1-2 jours"
} as const

// Loyalty Program
export const LOYALTY_CONFIG = {
  pointsPerGNF: 1, // 1 point per 1000 GNF spent
  rewardThreshold: 1000, // Points needed for reward
  vipThreshold: 10000 // Points needed for VIP status
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  FAVORITES: "grandson-favorites",
  CART: "grandson-cart",
  USER_PREFERENCES: "grandson-preferences",
  RECENT_SEARCHES: "grandson-recent-searches"
} as const

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  PRODUCTS: "/api/products",
  ORDERS: "/api/orders",
  USER: "/api/user",
  AUTH: "/api/auth"
} as const