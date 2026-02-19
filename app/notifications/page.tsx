"use client"

import { useState, useEffect } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Bell, 
  Package, 
  Heart, 
  Gift, 
  Truck, 
  CheckCircle,
  X,
  Settings,
  Loader2
} from "lucide-react"
import { formatRelativeTime } from "@/lib/format"
import { useApiClient } from "@/hooks/use-api"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { toast } from "sonner"

interface Notification {
  id: number
  type: string
  title: string
  message: string
  date: Date
  read: boolean
  icon: any
  color: string
  category: string
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "order": return Truck
    case "promo": return Gift
    case "favorite": return Heart
    case "general": return Package
    default: return Bell
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case "order": return "text-blue-500"
    case "promo": return "text-accent"
    case "favorite": return "text-red-500"
    case "general": return "text-purple-500"
    default: return "text-muted-foreground"
  }
}

const getNotificationCategory = (type: string) => {
  switch (type) {
    case "order": return "orders"
    case "promo": return "promos"
    case "favorite": return "favorites"
    case "general": return "general"
    default: return "general"
  }
}

function NotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const api = useApiClient()
  const { user } = useAuth()

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await api.getUserNotifications()
      // Transform API data to match our interface
      const transformedData = data.map((notification: any) => ({
        ...notification,
        date: new Date(notification.createdAt || notification.date),
        icon: getNotificationIcon(notification.type),
        color: getNotificationColor(notification.type),
        category: getNotificationCategory(notification.type)
      }))
      setNotifications(transformedData)
    } catch (error) {
      console.error('Error loading notifications:', error)
      toast.error("Erreur lors du chargement des notifications")
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (id: number) => {
    try {
      await api.markNotificationAsRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead()
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
      toast.success("Toutes les notifications ont été marquées comme lues")
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      await api.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast.success("Notification supprimée")
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error("Erreur lors de la suppression")
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    return notification.category === activeTab
  })

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Notifications" showBack />
        
        <main className="px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          
          <Skeleton className="w-full h-10" />
          
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-2xl border">
                <div className="flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-24" />
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
      <MobileHeader title="Notifications" showBack />
      
      <main className="px-4 py-4 space-y-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Toutes les notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} non lues
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Tout marquer
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="unread">Non lues</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="promos">Promos</TabsTrigger>
            <TabsTrigger value="general">Général</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Aucune notification</h3>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "unread" 
                    ? "Toutes vos notifications sont lues !" 
                    : "Vous n'avez pas de notifications dans cette catégorie."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const Icon = notification.icon
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        notification.read 
                          ? "border-border bg-transparent" 
                          : "border-accent/20 bg-accent/5"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.read ? "bg-secondary" : "bg-accent/20"
                        }`}>
                          <Icon className={`w-5 h-5 ${notification.color}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`font-semibold text-sm ${
                              !notification.read && "text-accent"
                            }`}>
                              {notification.title}
                            </h4>
                            
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-accent hover:underline"
                                >
                                  Marquer lu
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 hover:bg-secondary rounded-lg transition-colors"
                              >
                                <X className="w-3 h-3 text-muted-foreground" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(notification.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Settings */}
        <div className="bg-card rounded-2xl p-4 space-y-4">
          <h3 className="font-semibold">Paramètres de notification</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications push</p>
                <p className="text-sm text-muted-foreground">Recevoir des notifications sur votre appareil</p>
              </div>
              <Button variant="outline" size="sm">
                Configurer
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications par email</p>
                <p className="text-sm text-muted-foreground">Recevoir des emails pour les commandes importantes</p>
              </div>
              <Button variant="outline" size="sm">
                Configurer
              </Button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  )
}