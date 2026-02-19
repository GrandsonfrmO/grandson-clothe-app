// Zones de livraison de Conakry
export interface DeliveryZone {
  id: string
  name: string
  commune: string
  neighborhoods: string[]
  shippingCost: number
  estimatedDays: number
}

export const CONAKRY_DELIVERY_ZONES: DeliveryZone[] = [
  // Kaloum
  {
    id: "kaloum-centre",
    name: "Kaloum Centre",
    commune: "Kaloum",
    neighborhoods: [
      "Centre-ville",
      "Marché du 28 septembre",
      "Almamya",
      "Coléah",
      "Tombo",
      "Île de Tombo"
    ],
    shippingCost: 5000,
    estimatedDays: 1
  },
  {
    id: "kaloum-ouest",
    name: "Kaloum Ouest",
    commune: "Kaloum",
    neighborhoods: [
      "Kaloum Ouest",
      "Quartier 4",
      "Quartier 5",
      "Quartier 6"
    ],
    shippingCost: 5000,
    estimatedDays: 1
  },

  // Dixinn
  {
    id: "dixinn-centre",
    name: "Dixinn Centre",
    commune: "Dixinn",
    neighborhoods: [
      "Dixinn Centre",
      "Quartier 1",
      "Quartier 2",
      "Quartier 3",
      "Quartier 4"
    ],
    shippingCost: 5000,
    estimatedDays: 1
  },
  {
    id: "dixinn-nord",
    name: "Dixinn Nord",
    commune: "Dixinn",
    neighborhoods: [
      "Dixinn Nord",
      "Quartier 5",
      "Quartier 6",
      "Quartier 7",
      "Quartier 8"
    ],
    shippingCost: 5000,
    estimatedDays: 1
  },
  {
    id: "dixinn-sud",
    name: "Dixinn Sud",
    commune: "Dixinn",
    neighborhoods: [
      "Dixinn Sud",
      "Quartier 9",
      "Quartier 10",
      "Quartier 11"
    ],
    shippingCost: 5000,
    estimatedDays: 1
  },

  // Matam
  {
    id: "matam-centre",
    name: "Matam Centre",
    commune: "Matam",
    neighborhoods: [
      "Matam Centre",
      "Quartier 1",
      "Quartier 2",
      "Quartier 3",
      "Quartier 4"
    ],
    shippingCost: 5000,
    estimatedDays: 1
  },
  {
    id: "matam-nord",
    name: "Matam Nord",
    commune: "Matam",
    neighborhoods: [
      "Matam Nord",
      "Quartier 5",
      "Quartier 6",
      "Quartier 7",
      "Quartier 8",
      "Quartier 9"
    ],
    shippingCost: 5000,
    estimatedDays: 1
  },
  {
    id: "matam-sud",
    name: "Matam Sud",
    commune: "Matam",
    neighborhoods: [
      "Matam Sud",
      "Quartier 10",
      "Quartier 11",
      "Quartier 12"
    ],
    shippingCost: 5000,
    estimatedDays: 1
  },

  // Ratoma
  {
    id: "ratoma-centre",
    name: "Ratoma Centre",
    commune: "Ratoma",
    neighborhoods: [
      "Ratoma Centre",
      "Quartier 1",
      "Quartier 2",
      "Quartier 3",
      "Quartier 4",
      "Quartier 5"
    ],
    shippingCost: 5000,
    estimatedDays: 1
  },
  {
    id: "ratoma-nord",
    name: "Ratoma Nord",
    commune: "Ratoma",
    neighborhoods: [
      "Ratoma Nord",
      "Quartier 6",
      "Quartier 7",
      "Quartier 8",
      "Quartier 9"
    ],
    shippingCost: 5000,
    estimatedDays: 1
  },
  {
    id: "ratoma-sud",
    name: "Ratoma Sud",
    commune: "Ratoma",
    neighborhoods: [
      "Ratoma Sud",
      "Quartier 10",
      "Quartier 11",
      "Quartier 12",
      "Quartier 13"
    ],
    shippingCost: 5000,
    estimatedDays: 1
  },
  {
    id: "ratoma-ouest",
    name: "Ratoma Ouest",
    commune: "Ratoma",
    neighborhoods: [
      "Ratoma Ouest",
      "Quartier 14",
      "Quartier 15",
      "Quartier 16"
    ],
    shippingCost: 5000,
    estimatedDays: 1
  },

  // Matoto
  {
    id: "matoto-centre",
    name: "Matoto Centre",
    commune: "Matoto",
    neighborhoods: [
      "Matoto Centre",
      "Quartier 1",
      "Quartier 2",
      "Quartier 3",
      "Quartier 4"
    ],
    shippingCost: 5000,
    estimatedDays: 1
  },
  {
    id: "matoto-nord",
    name: "Matoto Nord",
    commune: "Matoto",
    neighborhoods: [
      "Matoto Nord",
      "Quartier 5",
      "Quartier 6",
      "Quartier 7",
      "Quartier 8"
    ],
    shippingCost: 5000,
    estimatedDays: 1
  },
  {
    id: "matoto-sud",
    name: "Matoto Sud",
    commune: "Matoto",
    neighborhoods: [
      "Matoto Sud",
      "Quartier 9",
      "Quartier 10",
      "Quartier 11"
    ],
    shippingCost: 5000,
    estimatedDays: 1
  }
]

// Helper functions
export function getDeliveryZonesByCommune(commune: string): DeliveryZone[] {
  return CONAKRY_DELIVERY_ZONES.filter(zone => zone.commune === commune)
}

export function getDeliveryZone(zoneId: string): DeliveryZone | undefined {
  return CONAKRY_DELIVERY_ZONES.find(zone => zone.id === zoneId)
}

export function getShippingCost(zoneId: string): number {
  const zone = getDeliveryZone(zoneId)
  return zone?.shippingCost || 5000
}

export function getEstimatedDeliveryDays(zoneId: string): number {
  const zone = getDeliveryZone(zoneId)
  return zone?.estimatedDays || 1
}

export const COMMUNES = [
  "Kaloum",
  "Dixinn",
  "Matam",
  "Ratoma",
  "Matoto"
]
