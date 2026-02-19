"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Package, Heart, Gift, Truck, CheckCircle, AlertCircle, Users, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/format"
import { useApiClient } from "@/hooks/use-api"

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
  userType?: 'admin' | 'user'
}

interface Notification {
  id: number
  type: string
  title: string
  message: string
  date: Date
  read: boolean
  icon: any
  color: string
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "order": return Truck
    case "promo": return Gift
    case "favorite": return Heart
    case "general": return Package
    case "inventory": return AlertCircle
    case "user": return Users
    default: return Package
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case "order": return "text-blue-500"
    case "promo": return "text-accent"
    case "favorite": return "text-red-500"
    case "general": return "text-purple-500"
    case "inventory": return "text-orange-500"
    case "user": return "text-green-500"
    default: return "text-muted-foreground"
  }
}

export function NotificationsPanel({ isOpen, onClose, userType = 'user' }: NotificationsPanelProps) {
  const router = useRouter()
  const [notificationList, setNotificationList] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const api = useApiClient()
  
  const unreadCount = notificationList.filter(n => !n.read).length

  // Load real notifications from API
  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      
      // Check if user has a token (works for both admin and regular users)
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('auth_token') || localStorage.getItem('token')
        : null
      
      if (!token) {
        setNotificationList([])
        return
      }
      
      const data = await api.getUserNotifications()
      
      // Transform API data to match our interface
      const transformedData = data.map((notification: any) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        date: new Date(notification.createdAt || notification.created_at),
        read: notification.isRead || notification.is_read || false,
        icon: getNotificationIcon(notification.type),
        color: getNotificationColor(notification.type)
      }))
      
      setNotificationList(transformedData)
    } catch (error) {
      console.error('Error loading notifications:', error)
      // Keep empty list on error
      setNotificationList([])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await api.markNotificationAsRead(id)
      setNotificationList(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead()
      setNotificationList(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      await api.deleteNotification(id)
      setNotificationList(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Notifications Panel */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-96 bg-card border-l border-border z-50 transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-lg">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <div className="p-4 border-b border-border">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead}
                className="w-full rounded-xl"
              >
                Marquer tout comme lu
              </Button>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Chargement...</p>
                </div>
              </div>
            ) : notificationList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Aucune notification</h3>
                <p className="text-sm text-muted-foreground">
                  Vous êtes à jour ! Toutes vos notifications apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {notificationList.map((notification) => {
                  const Icon = notification.icon
                  
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer hover:bg-secondary/50",
                        notification.read 
                          ? "border-border bg-transparent" 
                          : "border-accent/20 bg-accent/5"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                          notification.read ? "bg-secondary" : "bg-accent/20"
                        )}>
                          <Icon className={cn("w-5 h-5", notification.color)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={cn(
                              "font-semibold text-sm",
                              !notification.read && "text-accent"
                            )}>
                              {notification.title}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(notification.date)}
                          </p>
                        </div>
                      </div>
                      
                      {!notification.read && (
                        <div className="w-2 h-2 bg-accent rounded-full absolute top-4 right-4" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button variant="outline" className="w-full rounded-xl" onClick={() => {
              onClose()
              router.push('/notifications')
            }}>
              Voir toutes les notifications
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}