"use client"

import { useState, useEffect } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Home,
  Building,
  Star,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { useApiClient } from "@/hooks/use-api"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { CONAKRY_DELIVERY_ZONES, getDeliveryZonesByCommune, COMMUNES } from "@/lib/delivery-zones"

interface Address {
  id: number
  type: string
  label: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  commune: string
  landmark: string
  isDefault: boolean
}

function AdressesContent() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const api = useApiClient()
  const { user } = useAuth()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({
    type: "home",
    label: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Conakry",
    commune: "",
    deliveryZone: "",
    landmark: ""
  })

  const addressTypes = [
    { value: "home", label: "Domicile", icon: Home },
    { value: "work", label: "Bureau", icon: Building },
    { value: "other", label: "Autre", icon: MapPin }
  ]

  const communes = [
    "Kaloum", "Dixinn", "Matam", "Ratoma", "Matoto"
  ]

  const deliveryZones = formData.commune 
    ? getDeliveryZonesByCommune(formData.commune)
    : []

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await api.getUserAddresses()
      // Transform API addresses to component format
      const transformedAddresses = data.map((addr: any) => ({
        id: addr.id,
        type: addr.type,
        label: addr.label,
        name: `${addr.firstName} ${addr.lastName}`,
        email: addr.email,
        phone: addr.phone,
        address: addr.address,
        city: addr.city,
        commune: addr.commune,
        landmark: addr.landmark,
        isDefault: addr.isDefault
      }))
      setAddresses(transformedAddresses)
    } catch (error) {
      console.error('Error loading addresses:', error)
      toast.error("Erreur lors du chargement des adresses")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveAddress = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      setSaving(true)
      
      // Split name into firstName and lastName
      const nameParts = formData.name.trim().split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || nameParts[0]
      
      const addressData = {
        type: formData.type,
        label: formData.label,
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        commune: formData.commune,
        landmark: formData.landmark,
        isDefault: false
      }
      
      if (editingAddress) {
        // Update existing address
        await api.updateUserAddress(editingAddress, addressData)
        toast.success("Adresse modifiée avec succès")
      } else {
        // Add new address
        await api.createUserAddress(addressData)
        toast.success("Adresse ajoutée avec succès")
      }

      // Reload addresses
      await loadAddresses()

      // Reset form
      setFormData({
        type: "home",
        label: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "Conakry",
        commune: "",
        deliveryZone: "",
        landmark: ""
      })
      setShowAddForm(false)
      setEditingAddress(null)
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  const handleEditAddress = (address: Address) => {
    setFormData({
      type: address.type,
      label: address.label,
      name: address.name,
      email: address.email,
      phone: address.phone,
      address: address.address,
      city: address.city,
      commune: address.commune,
      deliveryZone: address.landmark || "",
      landmark: address.landmark
    })
    setEditingAddress(address.id)
    setShowAddForm(true)
  }

  const handleDeleteAddress = async (id: number) => {
    try {
      await api.deleteUserAddress(id)
      await loadAddresses()
      toast.success("Adresse supprimée")
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleSetDefault = async (id: number) => {
    try {
      await api.setDefaultAddress(id)
      await loadAddresses()
      toast.success("Adresse par défaut mise à jour")
    } catch (error) {
      console.error('Error setting default address:', error)
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const getAddressTypeIcon = (type: string) => {
    const addressType = addressTypes.find(t => t.value === type)
    return addressType ? addressType.icon : MapPin
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Mes adresses" showBack />
        
        <main className="px-4 py-4 space-y-4">
          <Skeleton className="w-full h-12 rounded-2xl" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-4">
                <div className="flex gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Mes adresses" showBack />
      
      <main className="px-4 py-4 space-y-4">
        {/* Add Address Button */}
        {!showAddForm && (
          <Button 
            onClick={() => setShowAddForm(true)}
            className="w-full rounded-2xl h-12 gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une adresse
          </Button>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-card rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {editingAddress ? "Modifier l'adresse" : "Nouvelle adresse"}
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingAddress(null)
                  setFormData({
                    type: "home",
                    label: "",
                    name: "",
                    phone: "",
                    address: "",
                    city: "Conakry",
                    commune: "",
                    deliveryZone: "",
                    landmark: ""
                  })
                }}
              >
                Annuler
              </Button>
            </div>

            {/* Address Type */}
            <div>
              <Label>Type d'adresse</Label>
              <div className="flex gap-2 mt-2">
                {addressTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      onClick={() => handleInputChange("type", type.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                        formData.type === type.value
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Label */}
            <div>
              <Label htmlFor="label">Nom de l'adresse</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => handleInputChange("label", e.target.value)}
                placeholder="Ex: Maison, Bureau..."
                className="mt-1"
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="votre@email.com"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+224 XX XX XX XX"
                className="mt-1"
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Adresse complète *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Rue, quartier, numéro..."
                className="mt-1"
              />
            </div>

            {/* City and Commune */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="commune">Commune</Label>
                <select
                  value={formData.commune}
                  onChange={(e) => handleInputChange("commune", e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-secondary rounded-xl border-0 outline-none"
                >
                  <option value="">Sélectionner...</option>
                  {communes.map(commune => (
                    <option key={commune} value={commune}>{commune}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Delivery Zone */}
            {formData.commune && (
              <div>
                <Label htmlFor="deliveryZone">Zone de livraison</Label>
                <select
                  value={formData.deliveryZone}
                  onChange={(e) => handleInputChange("deliveryZone", e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-secondary rounded-xl border-0 outline-none"
                >
                  <option value="">Sélectionner une zone...</option>
                  {deliveryZones.map(zone => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} - {zone.shippingCost.toLocaleString()} GNF
                    </option>
                  ))}
                </select>
                {formData.deliveryZone && (
                  <div className="mt-2 p-2 bg-accent/10 rounded-lg text-sm">
                    <p className="text-muted-foreground">
                      Quartiers: {deliveryZones.find(z => z.id === formData.deliveryZone)?.neighborhoods.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Landmark */}
            <div>
              <Label htmlFor="landmark">Point de repère</Label>
              <Input
                id="landmark"
                value={formData.landmark}
                onChange={(e) => handleInputChange("landmark", e.target.value)}
                placeholder="Près de..."
                className="mt-1"
              />
            </div>

            <Button onClick={handleSaveAddress} className="w-full" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingAddress ? "Modifier" : "Ajouter"} l'adresse
            </Button>
          </div>
        )}

        {/* Addresses List */}
        <div className="space-y-3">
          {addresses.map((address) => {
            const Icon = getAddressTypeIcon(address.type)
            
            return (
              <div key={address.id} className="bg-card rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {address.label || address.type}
                        </h4>
                        {address.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Par défaut
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{address.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditAddress(address)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{address.address}</p>
                  <p>{address.commune}, {address.city}</p>
                  {address.landmark && <p>📍 {address.landmark}</p>}
                  <p>📞 {address.phone}</p>
                  {address.email && <p>📧 {address.email}</p>}
                </div>

                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                    className="mt-3"
                  >
                    Définir par défaut
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {addresses.length === 0 && !showAddForm && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Aucune adresse</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez une adresse pour faciliter vos commandes
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

export default function AdressesPage() {
  return (
    <ProtectedRoute>
      <AdressesContent />
    </ProtectedRoute>
  )
}