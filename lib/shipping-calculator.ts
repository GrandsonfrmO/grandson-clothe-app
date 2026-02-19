/**
 * CALCULATEUR DE FRAIS DE LIVRAISON
 * Logique centralisée pour le calcul des frais de livraison
 */

import { CONAKRY_DELIVERY_ZONES, getDeliveryZone } from './delivery-zones'

export interface ShippingAddress {
  city?: string
  commune?: string
  address?: string
  deliveryZoneId?: string
}

export interface ShippingCalculation {
  cost: number
  isFree: boolean
  reason: string
  estimatedDays: number
}

/**
 * Calcule les frais de livraison basés sur l'adresse
 * PAS DE LIVRAISON GRATUITE - Tarifs selon la zone uniquement
 */
export function calculateShippingCost(
  subtotal: number,
  address: ShippingAddress
): ShippingCalculation {
  // 1. Si une zone de livraison spécifique est sélectionnée
  if (address.deliveryZoneId) {
    const zone = getDeliveryZone(address.deliveryZoneId)
    if (zone) {
      return {
        cost: zone.shippingCost,
        isFree: false,
        reason: `Livraison à ${zone.name}`,
        estimatedDays: zone.estimatedDays
      }
    }
  }

  // 2. Calcul basé sur la commune
  if (address.commune) {
    const communeNormalized = address.commune.trim().toLowerCase()
    
    // Toutes les zones de Conakry ont le même tarif (5000 GNF)
    const conakryCommunes = ['kaloum', 'dixinn', 'matam', 'ratoma', 'matoto']
    
    if (conakryCommunes.includes(communeNormalized)) {
      return {
        cost: 5000,
        isFree: false,
        reason: `Livraison à Conakry (${address.commune})`,
        estimatedDays: 1
      }
    }
  }

  // 3. Calcul basé sur la ville
  if (address.city) {
    const cityNormalized = address.city.trim().toLowerCase()
    
    // Tarifs par ville en Guinée
    const cityRates: Record<string, { cost: number; days: number }> = {
      'conakry': { cost: 5000, days: 1 },
      'kindia': { cost: 20000, days: 2 },
      'mamou': { cost: 30000, days: 3 },
      'labé': { cost: 35000, days: 3 },
      'labe': { cost: 35000, days: 3 },
      'kankan': { cost: 40000, days: 4 },
      'nzérékoré': { cost: 45000, days: 4 },
      'nzerekore': { cost: 45000, days: 4 },
      'boké': { cost: 25000, days: 2 },
      'boke': { cost: 25000, days: 2 },
      'faranah': { cost: 35000, days: 3 },
      'siguiri': { cost: 45000, days: 4 },
    }

    const cityRate = cityRates[cityNormalized]
    if (cityRate) {
      return {
        cost: cityRate.cost,
        isFree: false,
        reason: `Livraison à ${address.city}`,
        estimatedDays: cityRate.days
      }
    }
  }

  // 4. Tarif par défaut (Conakry)
  return {
    cost: 5000,
    isFree: false,
    reason: 'Livraison standard (Conakry)',
    estimatedDays: 1
  }
}

/**
 * Calcule les frais pour le mode "venir chercher"
 */
export function calculatePickupCost(): ShippingCalculation {
  return {
    cost: 0,
    isFree: true,
    reason: 'Venir chercher en magasin',
    estimatedDays: 0
  }
}

/**
 * Obtient les frais de livraison pour une zone spécifique
 */
export function getShippingCostForZone(zoneId: string): ShippingCalculation {
  const zone = getDeliveryZone(zoneId)
  
  if (!zone) {
    return {
      cost: 5000,
      isFree: false,
      reason: 'Zone non trouvée - tarif par défaut',
      estimatedDays: 1
    }
  }

  return {
    cost: zone.shippingCost,
    isFree: false,
    reason: `Livraison à ${zone.name}`,
    estimatedDays: zone.estimatedDays
  }
}

/**
 * Vérifie si la livraison est gratuite pour un montant donné
 * DÉSACTIVÉ - Pas de livraison gratuite
 */
export function isFreeShipping(subtotal: number): boolean {
  return false // Pas de livraison gratuite
}

/**
 * Obtient le montant restant pour la livraison gratuite
 * DÉSACTIVÉ - Pas de livraison gratuite
 */
export function getAmountForFreeShipping(subtotal: number): number {
  return 0 // Pas de livraison gratuite
}

/**
 * Formate le message de livraison gratuite
 * DÉSACTIVÉ - Pas de livraison gratuite
 */
export function getFreeShippingMessage(subtotal: number): string {
  return '' // Pas de livraison gratuite
}
