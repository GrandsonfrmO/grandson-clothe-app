/**
 * PAYMENT GATEWAYS - DÉSACTIVÉ
 * Orange Money et MTN Money ont été supprimés
 * Seul le paiement à la livraison (cash) est disponible
 */

export interface PaymentRequest {
  amount: string
  currency: string
  phoneNumber: string
  orderId: string
  description: string
}

export interface PaymentResponse {
  success: boolean
  transactionId?: string
  message: string
  data?: any
}

// Classe désactivée - Paiement à la livraison uniquement
export class PaymentGatewayFactory {
  static getGateway(paymentMethod: string) {
    throw new Error('Paiement en ligne désactivé. Utilisez le paiement à la livraison.')
  }

  static async processPayment(
    paymentMethod: string,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    return {
      success: false,
      message: 'Paiement en ligne désactivé. Utilisez le paiement à la livraison.',
    }
  }

  static async verifyPayment(
    paymentMethod: string,
    transactionId: string
  ): Promise<PaymentResponse> {
    return {
      success: false,
      message: 'Paiement en ligne désactivé.',
    }
  }
}

// Utility functions conservées pour compatibilité
export function formatPhoneNumber(phone: string): string {
  let formatted = phone.replace(/\s+/g, '')
  
  if (formatted.startsWith('00224')) {
    formatted = '+' + formatted.substring(2)
  } else if (formatted.startsWith('224')) {
    formatted = '+' + formatted
  } else if (!formatted.startsWith('+224')) {
    formatted = '+224' + formatted
  }
  
  return formatted
}

export function validatePhoneNumber(phone: string, operator?: 'orange' | 'mtn'): boolean {
  const formatted = formatPhoneNumber(phone)
  const guineaRegex = /^\+224[0-9]{8,9}$/
  return guineaRegex.test(formatted)
}

export function getOperatorFromPhone(phone: string): 'orange' | 'mtn' | null {
  return null // Désactivé
}
