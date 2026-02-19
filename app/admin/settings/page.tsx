'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Store, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard,
  Bell,
  Shield,
  Palette,
  Save
} from 'lucide-react'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Mock settings data
  const [settings, setSettings] = useState({
    // Store Information
    storeName: 'Grandson Clothes',
    storeDescription: 'Votre boutique de mode streetwear en Guinée',
    storeEmail: 'contact@grandsonclothes.com',
    storePhone: '+224 123 456 789',
    storeAddress: 'Conakry, Guinée',
    
    // Payment Settings - DÉSACTIVÉ (paiement à la livraison uniquement)
    enableCashOnDelivery: true,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    lowStockAlerts: true,
    
    // Security Settings
    requireEmailVerification: true,
    enableTwoFactor: false,
    sessionTimeout: '24',
    
    // Display Settings
    productsPerPage: '20',
    enableReviews: true,
    enableWishlist: true,
    showOutOfStock: false
  })

  const handleSave = async (section: string) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(`Paramètres ${section} sauvegardés avec succès`)
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600">Configurez votre boutique et vos préférences</p>
      </div>

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="h-5 w-5 mr-2" />
              Informations de la boutique
            </CardTitle>
            <CardDescription>
              Détails généraux de votre boutique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Nom de la boutique</Label>
              <Input
                id="storeName"
                value={settings.storeName}
                onChange={(e) => updateSetting('storeName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeDescription">Description</Label>
              <Textarea
                id="storeDescription"
                value={settings.storeDescription}
                onChange={(e) => updateSetting('storeDescription', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="storeEmail"
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) => updateSetting('storeEmail', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storePhone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="storePhone"
                    value={settings.storePhone}
                    onChange={(e) => updateSetting('storePhone', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeAddress">Adresse</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                <Textarea
                  id="storeAddress"
                  value={settings.storeAddress}
                  onChange={(e) => updateSetting('storeAddress', e.target.value)}
                  className="pl-10"
                  rows={2}
                />
              </div>
            </div>

            <Button onClick={() => handleSave('boutique')} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Paramètres de paiement
            </CardTitle>
            <CardDescription>
              Configuration des méthodes de paiement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableCashOnDelivery">Paiement à la livraison</Label>
                <p className="text-sm text-gray-500">Seul mode de paiement disponible</p>
              </div>
              <Switch
                id="enableCashOnDelivery"
                checked={true}
                disabled={true}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ℹ️ Les paiements en ligne (Orange Money, MTN Money) ont été désactivés. 
                Seul le paiement à la livraison est disponible.
              </p>
            </div>

            <Button onClick={() => handleSave('paiement')} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
            <CardDescription>
              Gérez vos préférences de notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Notifications par email</Label>
                <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="smsNotifications">Notifications SMS</Label>
                <p className="text-sm text-gray-500">Recevoir les notifications par SMS</p>
              </div>
              <Switch
                id="smsNotifications"
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="orderNotifications">Nouvelles commandes</Label>
                <p className="text-sm text-gray-500">Être notifié des nouvelles commandes</p>
              </div>
              <Switch
                id="orderNotifications"
                checked={settings.orderNotifications}
                onCheckedChange={(checked) => updateSetting('orderNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="lowStockAlerts">Alertes stock faible</Label>
                <p className="text-sm text-gray-500">Alertes quand le stock est bas</p>
              </div>
              <Switch
                id="lowStockAlerts"
                checked={settings.lowStockAlerts}
                onCheckedChange={(checked) => updateSetting('lowStockAlerts', checked)}
              />
            </div>

            <Button onClick={() => handleSave('notifications')} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Paramètres de sécurité et authentification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireEmailVerification">Vérification email obligatoire</Label>
                <p className="text-sm text-gray-500">Exiger la vérification email pour les nouveaux comptes</p>
              </div>
              <Switch
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => updateSetting('requireEmailVerification', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableTwoFactor">Authentification à deux facteurs</Label>
                <p className="text-sm text-gray-500">Activer 2FA pour les administrateurs</p>
              </div>
              <Switch
                id="enableTwoFactor"
                checked={settings.enableTwoFactor}
                onCheckedChange={(checked) => updateSetting('enableTwoFactor', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Délai d'expiration de session (heures)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
                min="1"
                max="168"
              />
            </div>

            <Button onClick={() => handleSave('sécurité')} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Affichage et fonctionnalités
            </CardTitle>
            <CardDescription>
              Paramètres d'affichage de la boutique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productsPerPage">Produits par page</Label>
                  <Input
                    id="productsPerPage"
                    type="number"
                    value={settings.productsPerPage}
                    onChange={(e) => updateSetting('productsPerPage', e.target.value)}
                    min="5"
                    max="50"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableReviews">Avis clients</Label>
                    <p className="text-sm text-gray-500">Permettre aux clients de laisser des avis</p>
                  </div>
                  <Switch
                    id="enableReviews"
                    checked={settings.enableReviews}
                    onCheckedChange={(checked) => updateSetting('enableReviews', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableWishlist">Liste de souhaits</Label>
                    <p className="text-sm text-gray-500">Activer la fonctionnalité favoris</p>
                  </div>
                  <Switch
                    id="enableWishlist"
                    checked={settings.enableWishlist}
                    onCheckedChange={(checked) => updateSetting('enableWishlist', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showOutOfStock">Afficher produits en rupture</Label>
                    <p className="text-sm text-gray-500">Montrer les produits sans stock</p>
                  </div>
                  <Switch
                    id="showOutOfStock"
                    checked={settings.showOutOfStock}
                    onCheckedChange={(checked) => updateSetting('showOutOfStock', checked)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={() => handleSave('affichage')} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Note about functionality */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-white font-bold">i</span>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Interface de démonstration</p>
              <p className="text-sm text-blue-700 mt-1">
                Cette page de paramètres est fonctionnelle côté interface. L'intégration avec le backend 
                pour la persistance des paramètres sera ajoutée selon vos besoins.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}