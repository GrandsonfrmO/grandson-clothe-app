#!/usr/bin/env tsx

import { db } from '@/lib/database'
import { products } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const PRODUCT_IMAGES_MAP: Record<number, string[]> = {
  1: ['/images/products/hoodie-black.svg', '/images/hero-streetwear-1.jpg'],
  2: ['/images/products/tshirt-graphic.svg', '/images/hero-fashion-1.jpg'],
  3: ['/images/products/cargo-pants.svg', '/images/category-pants.jpg'],
  4: ['/images/products/bomber-jacket.svg', '/images/hero-fashion-2.jpg'],
  5: ['/images/products/hoodie-black.svg', '/images/hero-streetwear-1.jpg'],
  6: ['/images/products/cargo-pants.svg', '/images/category-pants.jpg'],
  7: ['/images/products/cap.svg', '/images/category-accessories.jpg'],
  8: ['/images/products/placeholder.svg', '/images/category-accessories.jpg'],
}

async function updateProductImages() {
  console.log('🔄 Mise à jour des images de produits...\n')

  try {
    for (const [productId, images] of Object.entries(PRODUCT_IMAGES_MAP)) {
      const id = parseInt(productId)
      
      await db!
        .update(products)
        .set({ images: JSON.stringify(images) })
        .where(eq(products.id, id))

      console.log(`✅ Produit ${id}: Images mises à jour`)
    }

    console.log('\n✨ Toutes les images ont été mises à jour avec succès!')
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
    process.exit(1)
  }
}

updateProductImages()
