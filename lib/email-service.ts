import { config } from 'dotenv'
import { Resend } from 'resend'

// Load environment variables first
config({ path: '.env.local' })

const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  console.warn('⚠️ RESEND_API_KEY not found in environment variables')
}

const resend = new Resend(apiKey || 're_test_key')

// Determine sender email based on environment
const getSenderEmail = () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  if (isDevelopment) {
    return 'onboarding@resend.dev' // Use Resend test email in development
  }
  // In production, use your verified domain
  return process.env.RESEND_FROM_EMAIL || 'noreply@grandsonclothes.com'
}

export interface OrderConfirmationData {
  orderNumber: string
  email: string
  firstName: string
  lastName: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
    size?: string
    color?: string
    image?: string
  }>
  subtotal: number
  shippingCost: number
  total: number
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    commune?: string
    phone: string
  }
  paymentMethod: string
  estimatedDelivery?: string
}

export interface OrderStatusUpdateData {
  orderNumber: string
  email: string
  firstName: string
  status: string
  trackingNumber?: string
  estimatedDelivery?: string
}

export interface ShippingNotificationData {
  orderNumber: string
  email: string
  firstName: string
  trackingNumber: string
  carrier: string
  estimatedDelivery: string
}

// Email templates
const orderConfirmationTemplate = (data: OrderConfirmationData) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Confirmation de commande - ${data.orderNumber}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
    /* Base styles */
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f4f4;
      color: #333333;
      line-height: 1.6;
    }
    
    /* Container */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    /* Header */
    .header {
      background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
      padding: 40px 20px;
      text-align: center;
      border-radius: 0;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #ffffff;
      text-transform: uppercase;
    }
    .header .tagline {
      margin: 10px 0 0 0;
      font-size: 14px;
      color: #FF5722;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    
    /* Success badge */
    .success-badge {
      background-color: #4CAF50;
      color: white;
      padding: 12px 24px;
      border-radius: 50px;
      display: inline-block;
      margin: 20px 0;
      font-weight: bold;
      font-size: 16px;
    }
    
    /* Content */
    .content {
      padding: 30px 20px;
    }
    
    .greeting {
      font-size: 20px;
      font-weight: 600;
      color: #000000;
      margin-bottom: 15px;
    }
    
    .intro-text {
      font-size: 16px;
      color: #555555;
      margin-bottom: 25px;
      line-height: 1.8;
    }
    
    /* Order info box */
    .order-info-box {
      background: linear-gradient(135deg, #FF5722 0%, #FF7043 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      margin: 25px 0;
      box-shadow: 0 4px 15px rgba(255, 87, 34, 0.3);
    }
    .order-info-box h2 {
      margin: 0 0 15px 0;
      font-size: 18px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .order-number {
      font-size: 28px;
      font-weight: 900;
      font-family: 'Courier New', monospace;
      letter-spacing: 2px;
      margin: 10px 0;
    }
    .order-date {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 10px;
    }
    
    /* Section title */
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #000000;
      margin: 30px 0 20px 0;
      padding-bottom: 10px;
      border-bottom: 3px solid #FF5722;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    /* Product items */
    .items-container {
      margin: 20px 0;
    }
    .product-item {
      background: #ffffff;
      border: 2px solid #f0f0f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
      display: table;
      width: 100%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }
    .product-item:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border-color: #FF5722;
    }
    .product-image {
      display: table-cell;
      width: 120px;
      vertical-align: top;
      padding-right: 20px;
    }
    .product-image img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: 8px;
      border: 2px solid #f0f0f0;
    }
    .product-details {
      display: table-cell;
      vertical-align: top;
    }
    .product-name {
      font-size: 18px;
      font-weight: 700;
      color: #000000;
      margin: 0 0 10px 0;
    }
    .product-specs {
      font-size: 14px;
      color: #666666;
      margin: 5px 0;
      line-height: 1.6;
    }
    .product-specs span {
      display: inline-block;
      background: #f5f5f5;
      padding: 4px 12px;
      border-radius: 20px;
      margin: 3px 5px 3px 0;
      font-weight: 600;
    }
    .product-price {
      font-size: 20px;
      font-weight: 900;
      color: #FF5722;
      margin-top: 10px;
    }
    
    /* Summary box */
    .summary-box {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      padding: 25px;
      margin: 30px 0;
      border: 2px solid #dee2e6;
    }
    .summary-row {
      display: table;
      width: 100%;
      padding: 12px 0;
      border-bottom: 1px solid #dee2e6;
      font-size: 16px;
    }
    .summary-row:last-child {
      border-bottom: none;
    }
    .summary-label {
      display: table-cell;
      color: #495057;
      font-weight: 600;
    }
    .summary-value {
      display: table-cell;
      text-align: right;
      color: #212529;
      font-weight: 700;
    }
    .summary-row.total {
      padding-top: 20px;
      margin-top: 10px;
      border-top: 3px solid #FF5722;
      font-size: 24px;
    }
    .summary-row.total .summary-label,
    .summary-row.total .summary-value {
      color: #FF5722;
      font-weight: 900;
    }
    
    /* Address box */
    .address-box {
      background: #ffffff;
      border: 2px solid #e9ecef;
      border-left: 5px solid #FF5722;
      border-radius: 8px;
      padding: 25px;
      margin: 20px 0;
    }
    .address-box h3 {
      margin: 0 0 15px 0;
      font-size: 18px;
      font-weight: 700;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .address-box p {
      margin: 8px 0;
      font-size: 15px;
      color: #495057;
      line-height: 1.8;
    }
    .address-box strong {
      color: #000000;
      font-weight: 700;
    }
    
    /* Timeline */
    .timeline {
      background: #ffffff;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 25px;
      margin: 25px 0;
    }
    .timeline h3 {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 700;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .timeline-step {
      display: table;
      width: 100%;
      margin: 15px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #FF5722;
    }
    .timeline-icon {
      display: table-cell;
      width: 40px;
      vertical-align: middle;
      font-size: 24px;
    }
    .timeline-content {
      display: table-cell;
      vertical-align: middle;
      padding-left: 15px;
    }
    .timeline-title {
      font-weight: 700;
      color: #000000;
      font-size: 16px;
      margin-bottom: 5px;
    }
    .timeline-desc {
      color: #666666;
      font-size: 14px;
    }
    
    /* CTA Button */
    .cta-container {
      text-align: center;
      margin: 35px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #FF5722 0%, #FF7043 100%);
      color: #ffffff !important;
      padding: 18px 45px;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 700;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 0 4px 15px rgba(255, 87, 34, 0.4);
      transition: all 0.3s ease;
    }
    .cta-button:hover {
      box-shadow: 0 6px 20px rgba(255, 87, 34, 0.6);
      transform: translateY(-2px);
    }
    
    /* Support box */
    .support-box {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 25px;
      margin: 25px 0;
      text-align: center;
      border: 2px dashed #dee2e6;
    }
    .support-box p {
      margin: 10px 0;
      font-size: 15px;
      color: #495057;
    }
    .support-box strong {
      color: #FF5722;
      font-weight: 700;
    }
    
    /* Footer */
    .footer {
      background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
      color: #ffffff;
      padding: 35px 20px;
      text-align: center;
      border-radius: 0;
    }
    .footer p {
      margin: 8px 0;
      font-size: 14px;
      line-height: 1.6;
    }
    .footer .brand {
      font-size: 16px;
      font-weight: 700;
      color: #FF5722;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .footer .copyright {
      font-size: 12px;
      color: #999999;
      margin-top: 15px;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      .content {
        padding: 20px 15px !important;
      }
      .header h1 {
        font-size: 24px !important;
      }
      .product-item {
        display: block !important;
      }
      .product-image {
        display: block !important;
        width: 100% !important;
        padding-right: 0 !important;
        margin-bottom: 15px;
      }
      .product-image img {
        width: 100% !important;
        height: 200px !important;
      }
      .product-details {
        display: block !important;
      }
      .summary-row {
        font-size: 14px !important;
      }
      .summary-row.total {
        font-size: 20px !important;
      }
      .order-number {
        font-size: 22px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td class="header">
              <h1>GRANDSON CLOTHES</h1>
              <p class="tagline">Streetwear Authentique</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content">
              
              <!-- Success Badge -->
              <div style="text-align: center;">
                <span class="success-badge">✓ Commande Confirmée</span>
              </div>
              
              <!-- Greeting -->
              <p class="greeting">Bonjour ${data.firstName} 👋</p>
              
              <p class="intro-text">
                Merci pour votre confiance ! Votre commande a été reçue avec succès et notre équipe commence immédiatement à préparer votre colis avec soin.
              </p>
              
              <!-- Order Info Box -->
              <div class="order-info-box">
                <h2>📦 Votre Commande</h2>
                <div class="order-number">#${data.orderNumber}</div>
                <div class="order-date">📅 ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              
              <!-- Products Section -->
              <h2 class="section-title">🛍️ Articles Commandés</h2>
              
              <div class="items-container">
                ${data.items.map(item => `
                  <div class="product-item">
                    <div class="product-image">
                      <img src="${item.image || 'https://via.placeholder.com/120x120/000000/FF5722?text=GC'}" alt="${item.name}" />
                    </div>
                    <div class="product-details">
                      <div class="product-name">${item.name}</div>
                      <div class="product-specs">
                        <span>📦 Qté: ${item.quantity}</span>
                        ${item.size ? `<span>📏 ${item.size}</span>` : ''}
                        ${item.color ? `<span>🎨 ${item.color}</span>` : ''}
                      </div>
                      <div class="product-price">${item.total.toLocaleString()} GNF</div>
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <!-- Summary -->
              <div class="summary-box">
                <div class="summary-row">
                  <div class="summary-label">Sous-total</div>
                  <div class="summary-value">${data.subtotal.toLocaleString()} GNF</div>
                </div>
                <div class="summary-row">
                  <div class="summary-label">Frais de livraison</div>
                  <div class="summary-value">${data.shippingCost === 0 ? 'GRATUIT 🎉' : `${data.shippingCost.toLocaleString()} GNF`}</div>
                </div>
                <div class="summary-row total">
                  <div class="summary-label">TOTAL</div>
                  <div class="summary-value">${data.total.toLocaleString()} GNF</div>
                </div>
              </div>
              
              <!-- Shipping Address -->
              <div class="address-box">
                <h3>📍 Adresse de Livraison</h3>
                <p><strong>${data.shippingAddress.firstName} ${data.shippingAddress.lastName}</strong></p>
                <p>${data.shippingAddress.address}</p>
                <p>${data.shippingAddress.city}${data.shippingAddress.commune ? `, ${data.shippingAddress.commune}` : ''}</p>
                <p><strong>📞 Téléphone:</strong> ${data.shippingAddress.phone}</p>
              </div>
              
              <!-- Timeline -->
              <div class="timeline">
                <h3>🚀 Prochaines Étapes</h3>
                
                <div class="timeline-step">
                  <div class="timeline-icon">✅</div>
                  <div class="timeline-content">
                    <div class="timeline-title">1. Commande Reçue</div>
                    <div class="timeline-desc">Votre commande est confirmée et enregistrée</div>
                  </div>
                </div>
                
                <div class="timeline-step">
                  <div class="timeline-icon">📦</div>
                  <div class="timeline-content">
                    <div class="timeline-title">2. Préparation (24-48h)</div>
                    <div class="timeline-desc">Nous préparons soigneusement votre colis</div>
                  </div>
                </div>
                
                <div class="timeline-step">
                  <div class="timeline-icon">🚚</div>
                  <div class="timeline-content">
                    <div class="timeline-title">3. Expédition</div>
                    <div class="timeline-desc">Envoi avec numéro de suivi</div>
                  </div>
                </div>
                
                <div class="timeline-step">
                  <div class="timeline-icon">🎉</div>
                  <div class="timeline-content">
                    <div class="timeline-title">4. Livraison (${data.estimatedDelivery || '2-5 jours'})</div>
                    <div class="timeline-desc">Réception à votre adresse</div>
                  </div>
                </div>
              </div>
              
              <!-- CTA Button -->
              <div class="cta-container">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://grandsonclothes.com'}/commandes/${data.orderNumber}" class="cta-button">
                  Suivre Ma Commande →
                </a>
              </div>
              
              <!-- Support Box -->
              <div class="support-box">
                <p>💬 <strong>Besoin d'aide ?</strong></p>
                <p>Notre équipe est là pour vous !</p>
                <p>📧 <strong>support@grandsonclothes.com</strong></p>
                <p>📱 <strong>+224 621 234 567</strong></p>
                <p style="font-size: 13px; color: #999; margin-top: 15px;">
                  Disponible du Lundi au Samedi, 9h-18h GMT
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p class="brand">GRANDSON CLOTHES</p>
              <p>Streetwear Authentique depuis la Guinée 🇬🇳</p>
              <p style="margin-top: 15px;">Style • Qualité • Authenticité</p>
              <p class="copyright">
                &copy; 2026 GRANDSON CLOTHES. Tous droits réservés.<br>
                Conakry, Guinée, Afrique de l'Ouest
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

const orderStatusTemplate = (data: OrderStatusUpdateData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #000; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .status-box { background: #fff; padding: 20px; margin: 20px 0; border-left: 4px solid #FF5722; border-radius: 4px; }
    .status-badge { display: inline-block; background: #FF5722; color: #fff; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
    .footer { background: #000; color: #fff; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GRANDSON CLOTHES</h1>
      <p>Mise à jour de votre commande</p>
    </div>
    
    <div class="content">
      <p>Bonjour ${data.firstName},</p>
      
      <div class="status-box">
        <p><strong>Commande:</strong> ${data.orderNumber}</p>
        <p><strong>Nouveau statut:</strong> <span class="status-badge">${data.status}</span></p>
        ${data.trackingNumber ? `<p><strong>Numéro de suivi:</strong> ${data.trackingNumber}</p>` : ''}
        ${data.estimatedDelivery ? `<p><strong>Livraison estimée:</strong> ${data.estimatedDelivery}</p>` : ''}
      </div>
      
      <p>Vous pouvez suivre votre commande à tout moment sur notre site.</p>
      
      <p style="color: #666; font-size: 14px;">
        Si vous avez des questions, contactez-nous à <strong>support@grandsonclothes.com</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>&copy; 2026 GRANDSON CLOTHES. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
`

const shippingNotificationTemplate = (data: ShippingNotificationData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #000; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .tracking-box { background: #fff; padding: 20px; margin: 20px 0; border-radius: 4px; border: 2px solid #FF5722; }
    .tracking-number { font-size: 24px; font-weight: bold; color: #FF5722; font-family: monospace; }
    .footer { background: #000; color: #fff; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GRANDSON CLOTHES</h1>
      <p>Votre colis est en route !</p>
    </div>
    
    <div class="content">
      <p>Bonjour ${data.firstName},</p>
      
      <p>Bonne nouvelle ! Votre commande <strong>${data.orderNumber}</strong> a été expédiée et est en route vers vous.</p>
      
      <div class="tracking-box">
        <p style="margin: 0 0 10px 0; color: #666;">Numéro de suivi ${data.carrier}:</p>
        <div class="tracking-number">${data.trackingNumber}</div>
        <p style="margin: 10px 0 0 0; color: #666;">Livraison estimée: <strong>${data.estimatedDelivery}</strong></p>
      </div>
      
      <p>Vous pouvez suivre votre colis en temps réel sur le site du transporteur.</p>
      
      <p style="color: #666; font-size: 14px;">
        Des questions ? Contactez-nous à <strong>support@grandsonclothes.com</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>&copy; 2026 GRANDSON CLOTHES. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
`

// Email sending functions
export async function sendOrderConfirmation(data: OrderConfirmationData) {
  try {
    const result = await resend.emails.send({
      from: getSenderEmail(),
      to: data.email,
      subject: `Confirmation de commande - ${data.orderNumber}`,
      html: orderConfirmationTemplate(data),
    })
    
    if (result.error) {
      console.error('Error sending order confirmation email:', result.error)
      throw new Error(result.error.message)
    }
    
    console.log('✅ Order confirmation email sent:', result.data?.id)
    return result
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    throw error
  }
}

export async function sendOrderStatusUpdate(data: OrderStatusUpdateData) {
  try {
    const result = await resend.emails.send({
      from: getSenderEmail(),
      to: data.email,
      subject: `Mise à jour de votre commande - ${data.orderNumber}`,
      html: orderStatusTemplate(data),
    })
    
    if (result.error) {
      console.error('Error sending order status update email:', result.error)
      throw new Error(result.error.message)
    }
    
    console.log('✅ Order status update email sent:', result.data?.id)
    return result
  } catch (error) {
    console.error('Error sending order status update email:', error)
    throw error
  }
}

export async function sendShippingNotification(data: ShippingNotificationData) {
  try {
    const result = await resend.emails.send({
      from: getSenderEmail(),
      to: data.email,
      subject: `Votre colis est en route - ${data.orderNumber}`,
      html: shippingNotificationTemplate(data),
    })
    
    if (result.error) {
      console.error('Error sending shipping notification email:', result.error)
      throw new Error(result.error.message)
    }
    
    console.log('✅ Shipping notification email sent:', result.data?.id)
    return result
  } catch (error) {
    console.error('Error sending shipping notification email:', error)
    throw error
  }
}
