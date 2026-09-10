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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_text: string | null
          created_at: string
          id: string
          is_default: boolean
          label: string
          location_url: string | null
          notes: string | null
          user_id: string
          zone_id: string | null
        }
        Insert: {
          address_text?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          location_url?: string | null
          notes?: string | null
          user_id: string
          zone_id?: string | null
        }
        Update: {
          address_text?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          location_url?: string | null
          notes?: string | null
          user_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_active: boolean
          map_url: string | null
          name: string
          phone: string | null
          sort_order: number
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          map_url?: string | null
          name: string
          phone?: string | null
          sort_order?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          map_url?: string | null
          name?: string
          phone?: string | null
          sort_order?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      business_hours: {
        Row: {
          close_time: string
          day_of_week: number
          id: string
          is_closed: boolean
          open_time: string
          updated_at: string
        }
        Insert: {
          close_time?: string
          day_of_week: number
          id?: string
          is_closed?: boolean
          open_time?: string
          updated_at?: string
        }
        Update: {
          close_time?: string
          day_of_week?: number
          id?: string
          is_closed?: boolean
          open_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          emoji: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      coupon_usages: {
        Row: {
          coupon_id: string
          created_at: string
          id: string
          order_id: string | null
          phone: string | null
          user_id: string | null
        }
        Insert: {
          coupon_id: string
          created_at?: string
          id?: string
          order_id?: string | null
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          coupon_id?: string
          created_at?: string
          id?: string
          order_id?: string | null
          phone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usages_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          ends_at: string | null
          id: string
          is_active: boolean
          max_discount: number | null
          min_order_total: number
          starts_at: string | null
          updated_at: string
          usage_limit: number | null
          usage_limit_per_user: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order_total?: number
          starts_at?: string | null
          updated_at?: string
          usage_limit?: number | null
          usage_limit_per_user?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order_total?: number
          starts_at?: string | null
          updated_at?: string
          usage_limit?: number | null
          usage_limit_per_user?: number | null
          used_count?: number
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          branch_id: string | null
          created_at: string
          delivery_fee: number
          eta_minutes: number
          id: string
          is_active: boolean
          min_order_total: number
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          delivery_fee?: number
          eta_minutes?: number
          id?: string
          is_active?: boolean
          min_order_total?: number
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          delivery_fee?: number
          eta_minutes?: number
          id?: string
          is_active?: boolean
          min_order_total?: number
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_zones_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          order_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          order_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          order_id?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          extras: Json
          id: string
          line_total: number
          notes: string | null
          order_id: string
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          size_name: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          extras?: Json
          id?: string
          line_total?: number
          notes?: string | null
          order_id: string
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity?: number
          size_name?: string | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          extras?: Json
          id?: string
          line_total?: number
          notes?: string | null
          order_id?: string
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          size_name?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_notes: string | null
          address_text: string | null
          branch_id: string | null
          client_token: string | null
          coupon_code: string | null
          created_at: string
          customer_name: string
          customer_phone: string
          delivery_fee: number
          delivery_zone_id: string | null
          delivery_zone_name: string | null
          discount: number
          fulfillment: Database["public"]["Enums"]["fulfillment_type"]
          id: string
          items_count: number
          location_url: string | null
          notes: string | null
          order_number: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address_notes?: string | null
          address_text?: string | null
          branch_id?: string | null
          client_token?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_name: string
          customer_phone: string
          delivery_fee?: number
          delivery_zone_id?: string | null
          delivery_zone_name?: string | null
          discount?: number
          fulfillment?: Database["public"]["Enums"]["fulfillment_type"]
          id?: string
          items_count?: number
          location_url?: string | null
          notes?: string | null
          order_number?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address_notes?: string | null
          address_text?: string | null
          branch_id?: string | null
          client_token?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string
          delivery_fee?: number
          delivery_zone_id?: string | null
          delivery_zone_name?: string | null
          discount?: number
          fulfillment?: Database["public"]["Enums"]["fulfillment_type"]
          id?: string
          items_count?: number
          location_url?: string | null
          notes?: string | null
          order_number?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      product_extras: {
        Row: {
          id: string
          is_active: boolean
          is_required: boolean
          max_qty: number
          min_qty: number
          name: string
          price: number
          product_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          is_required?: boolean
          max_qty?: number
          min_qty?: number
          name: string
          price?: number
          product_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          is_required?: boolean
          max_qty?: number
          min_qty?: number
          name?: string
          price?: number
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_extras_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sizes: {
        Row: {
          id: string
          is_active: boolean
          name: string
          price: number
          product_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          name: string
          price?: number
          product_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badge: string | null
          category_id: string | null
          compare_at_price: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          is_featured: boolean
          is_new: boolean
          is_popular: boolean
          keywords: string | null
          name: string
          price: number
          sku: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          badge?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_popular?: boolean
          keywords?: string | null
          name: string
          price?: number
          sku?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          badge?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_popular?: boolean
          keywords?: string | null
          name?: string
          price?: number
          sku?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          badge: string | null
          button_label: string | null
          compare_at_price: number | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string | null
          price: number | null
          sort_order: number
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          badge?: string | null
          button_label?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          price?: number | null
          sort_order?: number
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          badge?: string | null
          button_label?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          price?: number | null
          sort_order?: number
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurant_settings: {
        Row: {
          about_text: string | null
          address: string | null
          allow_order_when_closed: boolean
          currency: string
          default_delivery_fee: number
          delivery_enabled: boolean
          description: string | null
          email: string | null
          footer_text: string | null
          free_delivery_threshold: number | null
          guest_orders_enabled: boolean
          hero_subtitle: string | null
          hero_title: string | null
          id: number
          logo_url: string | null
          map_url: string | null
          min_order_total: number
          name: string
          orders_enabled: boolean
          phone: string | null
          pickup_enabled: boolean
          prep_minutes: number
          scheduled_orders_enabled: boolean
          social_instagram: string | null
          social_snapchat: string | null
          social_twitter: string | null
          tagline: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          about_text?: string | null
          address?: string | null
          allow_order_when_closed?: boolean
          currency?: string
          default_delivery_fee?: number
          delivery_enabled?: boolean
          description?: string | null
          email?: string | null
          footer_text?: string | null
          free_delivery_threshold?: number | null
          guest_orders_enabled?: boolean
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: number
          logo_url?: string | null
          map_url?: string | null
          min_order_total?: number
          name?: string
          orders_enabled?: boolean
          phone?: string | null
          pickup_enabled?: boolean
          prep_minutes?: number
          scheduled_orders_enabled?: boolean
          social_instagram?: string | null
          social_snapchat?: string | null
          social_twitter?: string | null
          tagline?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          about_text?: string | null
          address?: string | null
          allow_order_when_closed?: boolean
          currency?: string
          default_delivery_fee?: number
          delivery_enabled?: boolean
          description?: string | null
          email?: string | null
          footer_text?: string | null
          free_delivery_threshold?: number | null
          guest_orders_enabled?: boolean
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: number
          logo_url?: string | null
          map_url?: string | null
          min_order_total?: number
          name?: string
          orders_enabled?: boolean
          phone?: string | null
          pickup_enabled?: boolean
          prep_minutes?: number
          scheduled_orders_enabled?: boolean
          social_instagram?: string | null
          social_snapchat?: string | null
          social_twitter?: string | null
          tagline?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          admin_reply: string | null
          author_name: string | null
          comment: string | null
          created_at: string
          id: string
          is_approved: boolean
          order_id: string | null
          product_id: string | null
          rating: number
          user_id: string | null
        }
        Insert: {
          admin_reply?: string | null
          author_name?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          order_id?: string | null
          product_id?: string | null
          rating: number
          user_id?: string | null
        }
        Update: {
          admin_reply?: string | null
          author_name?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          order_id?: string | null
          product_id?: string | null
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_visits: {
        Row: {
          count: number
          id: string
          visit_date: string
        }
        Insert: {
          count?: number
          id?: string
          visit_date?: string
        }
        Update: {
          count?: number
          id?: string
          visit_date?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_menu: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      track_visit: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "super_admin" | "manager" | "employee" | "editor"
      discount_type: "percentage" | "fixed"
      fulfillment_type: "pickup" | "delivery"
      order_status:
        | "new"
        | "received"
        | "preparing"
        | "ready"
        | "out_for_delivery"
        | "delivered"
        | "picked_up"
        | "cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["super_admin", "manager", "employee", "editor"],
      discount_type: ["percentage", "fixed"],
      fulfillment_type: ["pickup", "delivery"],
      order_status: [
        "new",
        "received",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "picked_up",
        "cancelled",
      ],
    },
  },
} as const
