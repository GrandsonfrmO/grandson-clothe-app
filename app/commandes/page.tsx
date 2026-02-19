"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductImage } from "@/components/ui/product-image"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useOrders } from "@/hooks/use-api"
import { Package, Truck, CheckCircle, Clock, ChevronRight, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered":
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case "shipped":
      return <Truck className="w-5 h-5 text-blue-500" />
    case "processing":
      return <Clock className="w-5 h-5 text-orange-500" />
    case "cancelled":
      return <AlertCircle className="w-5 h-5 text-red-500" />
    default:
      return <Package className="w-5 h-5 text-muted-foreground" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-500/10 text-green-500 border-green-500/20"
    case "shipped":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    case "processing":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20"
    case "cancelled":
      return "bg-red-500/10 text-red-500 border-red-500/20"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "processing":
      return "En préparation"
    case "shipped":
      return "Expédiée"
    case "delivered":
      return "Livrée"
    case "cancelled":
      return "Annulée"
    default:
      return status
  }
}

function CommandesContent() {
  const { data, loading, error, refetch } = useOrders()
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Mes commandes" showBack />
        <main className="px-4 py-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </main>
        <BottomNav />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Mes commandes" showBack />
        <main className="px-4 py-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Erreur lors du chargement de vos commandes
            </p>
            <Button onClick={refetch} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  const orders = data?.orders || []

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Mes commandes" showBack />
        
        <main className="flex flex-col items-center justify-center px-4 py-12 min-h-[60vh]">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
            <Package className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Aucune commande</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-sm">
            Vous n'avez pas encore passé de commande. Découvrez notre collection et commandez vos articles préférés.
          </p>
          <Link href="/explorer">
            <Button className="rounded-full px-8">
              Découvrir nos produits
            </Button>
          </Link>
        </main>

        <BottomNav />
      </div>
    )
  }

  // Filter orders by status
  const filteredOrders = selectedStatus === "all" 
    ? orders 
    : orders.filter(order => order.status === selectedStatus)

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Mes commandes" showBack />
      
      <main className="px-4 py-4 space-y-4">
        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { key: "all", label: "Toutes" },
            { key: "pending", label: "En attente" },
            { key: "processing", label: "En préparation" },
            { key: "shipped", label: "Expédiées" },
            { key: "delivered", label: "Livrées" },
            { key: "cancelled", label: "Annulées" },
          ].map((status) => (
            <Badge
              key={status.key}
              variant={selectedStatus === status.key ? "default" : "secondary"}
              className="px-4 py-2 rounded-full whitespace-nowrap cursor-pointer transition-all"
              onClick={() => setSelectedStatus(status.key)}
            >
              {status.label} ({statusCounts[status.key as keyof typeof statusCounts]})
            </Badge>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-card rounded-2xl p-4 space-y-4">
            {/* Order Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{order.orderNumber}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.createdAt), "dd MMM yyyy", { locale: fr })}
                </p>
              </div>
              <Badge className={getStatusColor(order.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  {getStatusLabel(order.status)}
                </div>
              </Badge>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    <ProductImage
                      src={item.product.images[0] || "/placeholder.svg"}
                      alt={item.product.name}
                      width={48}
                      height={48}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {item.size && `Taille: ${item.size}`}
                      {item.color && ` • Couleur: ${item.color}`}
                      {` • Qté: ${item.quantity}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {parseFloat(item.total).toLocaleString()} GNF
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Status */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Paiement:</span>
              <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                {order.paymentStatus === "paid" ? "Payé" : 
                 order.paymentStatus === "pending" ? "En attente" :
                 order.paymentStatus === "failed" ? "Échoué" : "Remboursé"}
              </Badge>
            </div>

            {/* Order Total */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="font-semibold">Total</span>
              <span className="font-bold">
                {parseFloat(order.total).toLocaleString()} GNF
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Link href={`/commandes/${order.orderNumber}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full rounded-xl">
                  Voir détails
                </Button>
              </Link>
              {order.status === "delivered" && (
                <Button variant="outline" size="sm" className="flex-1 rounded-xl">
                  Racheter
                </Button>
              )}
              {order.status === "shipped" && (
                <Link href={`/commandes/${order.orderNumber}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full rounded-xl">
                    Suivre
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && selectedStatus !== "all" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
            <p className="text-muted-foreground">
              Aucune commande avec ce statut
            </p>
          </div>
        )}

        {/* Order Summary */}
        {orders.length > 0 && (
          <div className="bg-card rounded-2xl p-4 space-y-3">
            <h3 className="font-semibold">Résumé</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-accent">
                  {orders.length}
                </div>
                <div className="text-xs text-muted-foreground">Commandes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">
                  {orders
                    .reduce((sum, order) => sum + parseFloat(order.total), 0)
                    .toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total GNF</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">
                  {orders.filter(o => o.status === "delivered").length}
                </div>
                <div className="text-xs text-muted-foreground">Livrées</div>
              </div>
            </div>
          </div>
        )}

        {/* Help */}
        <div className="text-center pt-4">
          <Link 
            href="/aide" 
            className="text-accent hover:underline text-sm flex items-center justify-center gap-1"
          >
            Besoin d'aide avec une commande ?
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default function CommandesPage() {
  return (
    <ProtectedRoute>
      <CommandesContent />
    </ProtectedRoute>
  )
}