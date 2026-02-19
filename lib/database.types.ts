export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          id: string
          target_property_id: string | null
          target_user_id: string | null
          target_vehicle_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_property_id?: string | null
          target_user_id?: string | null
          target_vehicle_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_property_id?: string | null
          target_user_id?: string | null
          target_vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_target_property_id_fkey"
            columns: ["target_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_logs_target_vehicle_id_fkey"
            columns: ["target_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          created_at: string
          criteria: Json
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          criteria: Json
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          property_id: string | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          property_id?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          property_id?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string | null
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          property_id?: string | null
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string | null
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          property_id: string | null
          storage_path: string | null
          url: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          property_id?: string | null
          storage_path?: string | null
          url: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          property_id?: string | null
          storage_path?: string | null
          url?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "images_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          property_id: string | null
          recipient_id: string
          sender_id: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          property_id?: string | null
          recipient_id: string
          sender_id: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          property_id?: string | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_queue: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          item_id: string
          item_type: string
          notes: string | null
          reason: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          notes?: string | null
          reason?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          notes?: string | null
          reason?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_records: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          status: string | null
          transaction_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          annonces_count: number | null
          created_at: string
          email: string | null
          id: string
          nom: string
          signalements_count: number | null
          suspended_at: string | null
          suspension_reason: string | null
          telephone: string | null
          trust_score: number | null
          type_annonceur: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          annonces_count?: number | null
          created_at?: string
          email?: string | null
          id?: string
          nom: string
          signalements_count?: number | null
          suspended_at?: string | null
          suspension_reason?: string | null
          telephone?: string | null
          trust_score?: number | null
          type_annonceur?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          annonces_count?: number | null
          created_at?: string
          email?: string | null
          id?: string
          nom?: string
          signalements_count?: number | null
          suspended_at?: string | null
          suspension_reason?: string | null
          telephone?: string | null
          trust_score?: number | null
          type_annonceur?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          acces_vehicule: boolean | null
          caution: number
          chambres: number | null
          commune: string
          cour: boolean | null
          created_at: string
          description: string | null
          douches: number | null
          eau: boolean | null
          electricite: boolean | null
          id: string
          image_url: string | null
          images: string[] | null
          latitude: number | null
          longitude: number | null
          meuble: boolean | null
          mois_avance: number
          price: number
          quartier: string
          salons: number | null
          signalements_count: number | null
          status: string | null
          surface: number | null
          title: string
          type_logement: string
          updated_at: string
          usage_type: string | null
          user_id: string
          ville: string
        }
        Insert: {
          acces_vehicule?: boolean | null
          caution?: number
          chambres?: number | null
          commune: string
          cour?: boolean | null
          created_at?: string
          description?: string | null
          douches?: number | null
          eau?: boolean | null
          electricite?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          meuble?: boolean | null
          mois_avance?: number
          price: number
          quartier: string
          salons?: number | null
          signalements_count?: number | null
          status?: string | null
          surface?: number | null
          title: string
          type_logement: string
          updated_at?: string
          usage_type?: string | null
          user_id: string
          ville?: string
        }
        Update: {
          acces_vehicule?: boolean | null
          caution?: number
          chambres?: number | null
          commune?: string
          cour?: boolean | null
          created_at?: string
          description?: string | null
          douches?: number | null
          eau?: boolean | null
          electricite?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          meuble?: boolean | null
          mois_avance?: number
          price?: number
          quartier?: string
          salons?: number | null
          signalements_count?: number | null
          status?: string | null
          surface?: number | null
          title?: string
          type_logement?: string
          updated_at?: string
          usage_type?: string | null
          user_id?: string
          ville?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reportable_id: string
          reportable_type: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reportable_id: string
          reportable_type: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reportable_id?: string
          reportable_type?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          property_id: string | null
          rating: number
          reviewed_user_id: string
          reviewer_id: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          property_id?: string | null
          rating: number
          reviewed_user_id: string
          reviewer_id: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          property_id?: string | null
          rating?: number
          reviewed_user_id?: string
          reviewer_id?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_verification: {
        Row: {
          created_at: string
          email_verified: boolean | null
          id: string
          id_verified: boolean | null
          phone_verified: boolean | null
          updated_at: string
          user_id: string
          verification_expires_at: string | null
          verification_token: string | null
        }
        Insert: {
          created_at?: string
          email_verified?: boolean | null
          id?: string
          id_verified?: boolean | null
          phone_verified?: boolean | null
          updated_at?: string
          user_id: string
          verification_expires_at?: string | null
          verification_token?: string | null
        }
        Update: {
          created_at?: string
          email_verified?: boolean | null
          id?: string
          id_verified?: boolean | null
          phone_verified?: boolean | null
          updated_at?: string
          user_id?: string
          verification_expires_at?: string | null
          verification_token?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          annee: number | null
          carburant: string | null
          commune: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          images: string[] | null
          kilometrage: number | null
          latitude: number | null
          longitude: number | null
          marque: string
          modele: string
          prix: number
          signalements_count: number | null
          status: string | null
          telephone: string | null
          title: string
          transmission: string | null
          type_annonce: string
          type_vehicule: string
          updated_at: string
          user_id: string
          ville: string
          whatsapp: string | null
        }
        Insert: {
          annee?: number | null
          carburant?: string | null
          commune: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          kilometrage?: number | null
          latitude?: number | null
          longitude?: number | null
          marque: string
          modele: string
          prix: number
          signalements_count?: number | null
          status?: string | null
          telephone?: string | null
          title: string
          transmission?: string | null
          type_annonce: string
          type_vehicule: string
          updated_at?: string
          user_id: string
          ville?: string
          whatsapp?: string | null
        }
        Update: {
          annee?: number | null
          carburant?: string | null
          commune?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          kilometrage?: number | null
          latitude?: number | null
          longitude?: number | null
          marque?: string
          modele?: string
          prix?: number
          signalements_count?: number | null
          status?: string | null
          telephone?: string | null
          title?: string
          transmission?: string | null
          type_annonce?: string
          type_vehicule?: string
          updated_at?: string
          user_id?: string
          ville?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
