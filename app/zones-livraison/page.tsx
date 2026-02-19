"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MapPin, 
  Truck,
  Clock,
  DollarSign
} from "lucide-react"
import { CONAKRY_DELIVERY_ZONES, COMMUNES, getDeliveryZonesByCommune } from "@/lib/delivery-zones"

export default function ZonesLivraisonPage() {
  const [selectedCommune, setSelectedCommune] = useState<string>(COMMUNES[0])

  const zones = getDeliveryZonesByCommune(selectedCommune)

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Zones de livraison" showBack />
      
      <main className="px-4 py-4 space-y-4">
        {/* Info Banner */}
        <Card className="bg-accent/10 border-accent/20 p-4">
          <div className="flex gap-3">
            <Truck className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Livraison à Conakry</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Nous livrons dans les 5 communes de Conakry avec des frais fixes et des délais rapides.
              </p>
            </div>
          </div>
        </Card>

        {/* Communes Tabs */}
        <Tabs value={selectedCommune} onValueChange={setSelectedCommune} className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            {COMMUNES.map(commune => (
              <TabsTrigger key={commune} value={commune} className="text-xs">
                {commune}
              </TabsTrigger>
            ))}
          </TabsList>

          {COMMUNES.map(commune => (
            <TabsContent key={commune} value={commune} className="space-y-3 mt-4">
              {getDeliveryZonesByCommune(commune).map(zone => (
                <Card key={zone.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    {/* Zone Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{zone.name}</h4>
                          <p className="text-xs text-muted-foreground">{zone.commune}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{zone.shippingCost.toLocaleString()} GNF</Badge>
                    </div>

                    {/* Zone Details */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Délai</p>
                          <p className="text-sm font-medium">{zone.estimatedDays} jour{zone.estimatedDays > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Frais</p>
                          <p className="text-sm font-medium">{zone.shippingCost.toLocaleString()} GNF</p>
                        </div>
                      </div>
                    </div>

                    {/* Neighborhoods */}
                    <div className="pt-2 border-t">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Quartiers couverts:</p>
                      <div className="flex flex-wrap gap-2">
                        {zone.neighborhoods.map(neighborhood => (
                          <Badge key={neighborhood} variant="outline" className="text-xs">
                            {neighborhood}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {/* Summary */}
        <Card className="bg-secondary/50 p-4 mt-6">
          <h3 className="font-semibold mb-3">Résumé des zones</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre de zones:</span>
              <span className="font-medium">{CONAKRY_DELIVERY_ZONES.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Communes couvertes:</span>
              <span className="font-medium">{COMMUNES.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frais de livraison:</span>
              <span className="font-medium">5 000 GNF (fixe)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Délai moyen:</span>
              <span className="font-medium">1 jour</span>
            </div>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}
