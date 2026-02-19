"use client"

import { toast } from "sonner"
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    icon: <CheckCircle className="h-4 w-4" />,
    duration: 3000,
  })
}

export const showErrorToast = (message: string) => {
  toast.error(message, {
    icon: <XCircle className="h-4 w-4" />,
    duration: 5000,
  })
}

export const showWarningToast = (message: string) => {
  toast.warning(message, {
    icon: <AlertCircle className="h-4 w-4" />,
    duration: 4000,
  })
}

export const showInfoToast = (message: string) => {
  toast.info(message, {
    icon: <Info className="h-4 w-4" />,
    duration: 3000,
  })
}

// Messages prédéfinis pour les actions CRUD
export const productToasts = {
  created: () => showSuccessToast("Produit créé avec succès"),
  updated: () => showSuccessToast("Produit mis à jour avec succès"),
  deleted: () => showSuccessToast("Produit supprimé avec succès"),
  createError: () => showErrorToast("Erreur lors de la création du produit"),
  updateError: () => showErrorToast("Erreur lors de la mise à jour du produit"),
  deleteError: () => showErrorToast("Erreur lors de la suppression du produit"),
  notFound: () => showErrorToast("Produit non trouvé"),
}

export const orderToasts = {
  statusUpdated: () => showSuccessToast("Statut de la commande mis à jour"),
  updateError: () => showErrorToast("Erreur lors de la mise à jour du statut"),
}

export const authToasts = {
  loginSuccess: () => showSuccessToast("Connexion réussie"),
  loginError: () => showErrorToast("Erreur de connexion"),
  logoutSuccess: () => showInfoToast("Déconnexion réussie"),
  accessDenied: () => showErrorToast("Accès refusé"),
}