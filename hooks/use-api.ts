import { useState, useEffect, useCallback } from 'react'
import { useDataSync, DATA_SYNC_EVENTS } from './use-data-sync'

// Types
export interface ApiResponse<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export interface Product {
  id: number
  name: string
  slug: string
  description?: string
  price: string
  originalPrice?: string
  images: string[]
  sizes: string[]
  colors: string[]
  features: string[]
  stock: number
  isNew: boolean
  rating: string
  reviewCount: number
  category?: {
    id: number
    name: string
    slug: string
  }
}

export interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: string
  shippingCost: string
  total: string
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  shippingAddress: any
  notes?: string
  createdAt: string
  items: OrderItem[]
}

export interface OrderItem {
  id: number
  quantity: number
  size?: string
  color?: string
  price: string
  total: string
  product: {
    id: number
    name: string
    images: string[]
  }
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  role: string
  loyaltyPoints: number
}

export interface Address {
  id: number
  type: 'home' | 'work' | 'other'
  label?: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  address: string
  city: string
  commune?: string
  landmark?: string
  isDefault: boolean
}

export interface PaymentMethod {
  id: number
  type: 'orange' | 'mtn' | 'card'
  name: string
  number: string
  isDefault: boolean
  isVerified: boolean
}

export interface Notification {
  id: number
  type: 'order' | 'promo' | 'general' | 'favorite'
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: string
}

// Auth token management
let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
  if (token) {
    localStorage.setItem('auth_token', token)
    // Store timestamp for session tracking
    localStorage.setItem('auth_token_time', Date.now().toString())
  } else {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_token_time')
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('auth_token')
  }
  return authToken
}

export function clearAuthToken() {
  authToken = null
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_token_time')
}

// API client
class ApiClient {
  private baseUrl = '/api'

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getAuthToken()
    const url = `${this.baseUrl}${endpoint}`
    
    // Check if we can use cache for GET requests
    const isGetRequest = !options.method || options.method === 'GET'
    if (isGetRequest && typeof window !== 'undefined') {
      const { cachedFetch } = await import('@/lib/request-cache')
      return cachedFetch<T>(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      })
    }
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorText = await response.text()
      let error
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { error: errorText || 'Network error' }
      }
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setAuthToken(response.token)
    return response
  }

  async register(data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) {
    const response = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    setAuthToken(response.token)
    return response
  }

  // Products
  async getProducts(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    sizes?: string[]
    colors?: string[]
    isNew?: boolean
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v))
          } else {
            searchParams.append(key, value.toString())
          }
        }
      })
    }
    
    return this.request<{
      products: Product[]
      pagination: {
        page: number
        limit: number
        total: number
        pages: number
      }
    }>(`/products?${searchParams}`)
  }

  async getProduct(id: number) {
    return this.request<{ product: Product }>(`/products/${id}`)
  }

  // Orders
  async getOrders(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    return this.request<{
      orders: Order[]
      pagination: {
        page: number
        limit: number
        total: number
        pages: number
      }
    }>(`/orders?${searchParams}`)
  }

  async createOrder(data: {
    items: Array<{
      productId: number
      quantity: number
      size?: string
      color?: string
    }>
    shippingAddress: any
    paymentMethod: string
    notes?: string
    subtotal?: number
    shippingCost?: number
    total?: number
    isGuest?: boolean
    guestEmail?: string
    guestPhone?: string
  }) {
    return this.request<{ message: string; order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Favorites
  async getFavorites() {
    return this.request<{
      favorites: Array<{
        id: number
        createdAt: string
        product: Product
      }>
      total: number
    }>('/favorites')
  }

  async addToFavorites(productId: number) {
    return this.request<{ message: string }>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    })
  }

  async removeFromFavorites(productId: number) {
    return this.request<{ message: string }>(`/favorites?productId=${productId}`, {
      method: 'DELETE',
    })
  }

  // User Profile
  async getProfile() {
    return this.request<{ user: User }>('/user/profile')
  }

  async updateProfile(data: {
    firstName: string
    lastName: string
    phone?: string
    avatar?: string
  }) {
    return this.request<{ message: string; user: User }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async changePassword(data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) {
    return this.request<{ message: string }>('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // User Settings
  async getSettings() {
    return this.request<{ settings: any }>('/user/settings')
  }

  async updateSettings(data: {
    emailNotifications?: boolean
    smsNotifications?: boolean
    pushNotifications?: boolean
    newsletter?: boolean
    marketingEmails?: boolean
    privacyMode?: boolean
    dataCollection?: boolean
  }) {
    return this.request<{ message: string; settings: any }>('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Order Details
  async getOrderDetails(orderNumber: string) {
    return this.request<{ order: Order }>(`/orders/${orderNumber}`)
  }

  async getOrderInvoice(orderNumber: string) {
    return this.request<{ invoice: any }>(`/orders/${orderNumber}/invoice`)
  }

  // Addresses
  async getAddresses() {
    return this.request<{
      addresses: Address[]
      total: number
    }>('/user/addresses')
  }

  async addAddress(data: Omit<Address, 'id'>) {
    return this.request<{ message: string; address: Address }>('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateAddress(id: number, data: Omit<Address, 'id'>) {
    return this.request<{ message: string; address: Address }>(`/user/addresses?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteAddress(id: number) {
    return this.request<{ message: string }>(`/user/addresses?id=${id}`, {
      method: 'DELETE',
    })
  }

  // Payment Methods
  async getPaymentMethods() {
    return this.request<{
      paymentMethods: PaymentMethod[]
      total: number
    }>('/user/payment-methods')
  }

  async addPaymentMethod(data: Omit<PaymentMethod, 'id' | 'isVerified'>) {
    return this.request<{ message: string; paymentMethod: PaymentMethod }>('/user/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePaymentMethod(id: number, data: Omit<PaymentMethod, 'id' | 'isVerified'>) {
    return this.request<{ message: string; paymentMethod: PaymentMethod }>(`/user/payment-methods?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deletePaymentMethod(id: number) {
    return this.request<{ message: string }>(`/user/payment-methods?id=${id}`, {
      method: 'DELETE',
    })
  }

  // Notifications
  async getNotifications(params?: {
    page?: number
    limit?: number
    type?: string
    unreadOnly?: boolean
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    return this.request<{
      notifications: Notification[]
      pagination: {
        page: number
        limit: number
        total: number
        pages: number
      }
      unreadCount: number
    }>(`/user/notifications?${searchParams}`)
  }

  async markNotificationsRead(data: {
    notificationIds?: number[]
    markAll?: boolean
  }) {
    return this.request<{ message: string }>('/user/notifications', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteNotification(id: number) {
    return this.request<{ message: string }>(`/user/notifications?id=${id}`, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient()

// Custom hooks
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

// Specific hooks
export function useProducts(
  params?: Parameters<typeof apiClient.getProducts>[0],
  options?: { initialData?: any; skip?: boolean }
) {
  const paramsKey = params ? JSON.stringify(params) : 'no-params'
  const [data, setData] = useState<any>(options?.initialData || null)
  const [loading, setLoading] = useState(!options?.skip && !options?.initialData)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (options?.skip) return
    
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.getProducts(params)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }, [paramsKey, options?.skip])

  useEffect(() => {
    // Ne pas fetch si on a déjà des données initiales et que les params n'ont pas changé
    if (options?.initialData && !data) {
      setData(options.initialData)
      return
    }
    
    if (!options?.skip) {
      fetchData()
    }
  }, [fetchData, options?.skip])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

export function useProduct(id: number) {
  return useApi(() => apiClient.getProduct(id), [id])
}

export function useOrders(params?: Parameters<typeof apiClient.getOrders>[0]) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const paramsKey = params ? JSON.stringify(params) : 'no-params'
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const result = useApi(() => apiClient.getOrders(params), [paramsKey, refreshTrigger])
  
  // Listen for order creation events
  useDataSync(DATA_SYNC_EVENTS.ORDER_CREATED, () => {
    setRefreshTrigger(prev => prev + 1)
  })
  
  // Expose refetch method
  const originalRefetch = result.refetch
  result.refetch = () => {
    setRefreshTrigger(prev => prev + 1)
    return originalRefetch()
  }
  
  return result
}

export function useFavorites() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const result = useApi(() => apiClient.getFavorites(), [refreshTrigger])
  
  // Listen for favorite events
  useDataSync(DATA_SYNC_EVENTS.FAVORITE_ADDED, () => {
    setRefreshTrigger(prev => prev + 1)
  })
  useDataSync(DATA_SYNC_EVENTS.FAVORITE_REMOVED, () => {
    setRefreshTrigger(prev => prev + 1)
  })
  
  // Expose refetch method
  const originalRefetch = result.refetch
  result.refetch = () => {
    setRefreshTrigger(prev => prev + 1)
    return originalRefetch()
  }
  
  return result
}

export function useProfile() {
  return useApi(() => apiClient.getProfile(), [])
}

export function useAddresses() {
  return useApi(() => apiClient.getAddresses(), [])
}

export function usePaymentMethods() {
  return useApi(() => apiClient.getPaymentMethods(), [])
}

export function useNotifications(params?: Parameters<typeof apiClient.getNotifications>[0]) {
  const paramsKey = params ? JSON.stringify(params) : 'no-params'
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useApi(() => apiClient.getNotifications(params), [paramsKey])
}

// Simple API client hook
export function useApiClient() {
  return {
    // User addresses
    getUserAddresses: () => apiClient.getAddresses().then(res => res.addresses),
    createUserAddress: (data: any) => apiClient.addAddress(data),
    updateUserAddress: (id: number, data: any) => apiClient.updateAddress(id, data),
    deleteUserAddress: (id: number) => apiClient.deleteAddress(id),
    setDefaultAddress: (id: number) => apiClient.updateAddress(id, { isDefault: true } as any),

    // User payment methods
    getUserPaymentMethods: () => apiClient.getPaymentMethods().then(res => res.paymentMethods),
    createUserPaymentMethod: (data: any) => apiClient.addPaymentMethod(data),
    updateUserPaymentMethod: (id: number, data: any) => apiClient.updatePaymentMethod(id, data),
    deleteUserPaymentMethod: (id: number) => apiClient.deletePaymentMethod(id),
    setDefaultPaymentMethod: (id: number) => apiClient.updatePaymentMethod(id, { isDefault: true } as any),
    verifyPaymentMethod: (id: number) => apiClient.updatePaymentMethod(id, { isVerified: true } as any),

    // User notifications
    getUserNotifications: async () => {
      const res = await apiClient.getNotifications()
      return res.notifications || []
    },
    markNotificationAsRead: (id: number) => apiClient.markNotificationsRead({ notificationIds: [id] }),
    markAllNotificationsAsRead: () => apiClient.markNotificationsRead({ markAll: true }),
    deleteNotification: (id: number) => apiClient.deleteNotification(id),

    // Products
    getProducts: (params?: any) => apiClient.getProducts(params).then(res => res.products),
    getProduct: (id: number) => apiClient.getProduct(id).then(res => res.product),

    // Favorites
    getFavorites: () => apiClient.getFavorites().then(res => res.favorites),
    addToFavorites: (productId: number) => apiClient.addToFavorites(productId),
    removeFromFavorites: (productId: number) => apiClient.removeFromFavorites(productId),

    // Orders
    getOrders: (params?: any) => apiClient.getOrders(params).then(res => res.orders),
    createOrder: (data: any) => apiClient.createOrder(data),

    // Profile
    getProfile: () => apiClient.getProfile().then(res => res.user),
    updateProfile: (data: any) => apiClient.updateProfile(data),
    changePassword: (data: any) => apiClient.changePassword(data),

    // Settings
    getSettings: () => apiClient.getSettings().then(res => res.settings),
    updateSettings: (data: any) => apiClient.updateSettings(data),

    // Order Details
    getOrderDetails: (orderNumber: string) => apiClient.getOrderDetails(orderNumber).then(res => res.order),
    getOrderInvoice: (orderNumber: string) => apiClient.getOrderInvoice(orderNumber).then(res => res.invoice),

    // Auth
    login: (email: string, password: string) => apiClient.login(email, password),
    register: (data: any) => apiClient.register(data),
  }
}