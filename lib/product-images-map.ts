// Mapping des produits aux images SVG disponibles
export const PRODUCT_IMAGES_MAP: Record<number, string> = {
  1: '/images/products/hoodie-black.svg',      // Hoodie Oversize Noir
  2: '/images/products/tshirt-graphic.svg',    // T-Shirt Graphic
  3: '/images/products/cargo-pants.svg',       // Cargo Pants
  4: '/images/products/bomber-jacket.svg',     // Bomber Jacket
  5: '/images/products/hoodie-black.svg',      // Hoodie Vert Oversize (même image)
  6: '/images/products/cargo-pants.svg',       // Joggers Premium (réutiliser cargo)
  7: '/images/products/cap.svg',               // Casquette Streetwear
  8: '/images/products/placeholder.svg',       // Sac Bandoulière (placeholder)
}

// Images SVG disponibles
export const AVAILABLE_SVG_IMAGES = [
  '/images/products/hoodie-black.svg',
  '/images/products/tshirt-graphic.svg',
  '/images/products/cargo-pants.svg',
  '/images/products/bomber-jacket.svg',
  '/images/products/cap.svg',
  '/images/products/placeholder.svg',
]

// Fonction pour obtenir l'image SVG d'un produit
export function getProductSvgImage(productId: number): string {
  return PRODUCT_IMAGES_MAP[productId] || '/images/products/placeholder.svg'
}
