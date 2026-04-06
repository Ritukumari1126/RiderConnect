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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_date: string
          created_at: string
          driver_id: string
          from_location: string | null
          id: string
          purpose: string | null
          rental_id: string | null
          rider_id: string
          rider_name: string
          rider_phone: string | null
          status: string
          to_location: string | null
          updated_at: string
        }
        Insert: {
          booking_date: string
          created_at?: string
          driver_id: string
          from_location?: string | null
          id?: string
          purpose?: string | null
          rental_id?: string | null
          rider_id: string
          rider_name: string
          rider_phone?: string | null
          status?: string
          to_location?: string | null
          updated_at?: string
        }
        Update: {
          booking_date?: string
          created_at?: string
          driver_id?: string
          from_location?: string | null
          id?: string
          purpose?: string | null
          rental_id?: string | null
          rider_id?: string
          rider_name?: string
          rider_phone?: string | null
          status?: string
          to_location?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "vehicle_rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          avatar_url: string | null
          created_at: string
          district: string | null
          id: string
          sender_name: string
          state: string | null
          text: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          district?: string | null
          id?: string
          sender_name: string
          state?: string | null
          text: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          district?: string | null
          id?: string
          sender_name?: string
          state?: string | null
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      driver_profiles: {
        Row: {
          about: string | null
          age: number | null
          created_at: string
          from_district: string | null
          from_location: string | null
          from_state: string | null
          id: string
          license_number: string | null
          license_photo_url: string | null
          name: string
          phone: string
          profile_photo_url: string | null
          rating: number | null
          to_district: string | null
          to_location: string | null
          to_state: string | null
          transport_number: string | null
          trips: number | null
          updated_at: string
          user_id: string
          vehicle_type: string
        }
        Insert: {
          about?: string | null
          age?: number | null
          created_at?: string
          from_district?: string | null
          from_location?: string | null
          from_state?: string | null
          id?: string
          license_number?: string | null
          license_photo_url?: string | null
          name: string
          phone: string
          profile_photo_url?: string | null
          rating?: number | null
          to_district?: string | null
          to_location?: string | null
          to_state?: string | null
          transport_number?: string | null
          trips?: number | null
          updated_at?: string
          user_id: string
          vehicle_type: string
        }
        Update: {
          about?: string | null
          age?: number | null
          created_at?: string
          from_district?: string | null
          from_location?: string | null
          from_state?: string | null
          id?: string
          license_number?: string | null
          license_photo_url?: string | null
          name?: string
          phone?: string
          profile_photo_url?: string | null
          rating?: number | null
          to_district?: string | null
          to_location?: string | null
          to_state?: string | null
          transport_number?: string | null
          trips?: number | null
          updated_at?: string
          user_id?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      lost_items: {
        Row: {
          category: string | null
          created_at: string
          date: string | null
          description: string | null
          district: string | null
          id: string
          item_photo_url: string | null
          location: string | null
          reporter_name: string | null
          reporter_phone: string | null
          state: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          district?: string | null
          id?: string
          item_photo_url?: string | null
          location?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          state?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          district?: string | null
          id?: string
          item_photo_url?: string | null
          location?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          state?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          district: string | null
          full_name: string
          id: string
          phone: string | null
          profile_photo_url: string | null
          role: string
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          district?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          profile_photo_url?: string | null
          role?: string
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          district?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          profile_photo_url?: string | null
          role?: string
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vehicle_rentals: {
        Row: {
          available: boolean
          created_at: string
          description: string | null
          driver_id: string
          from_district: string | null
          from_location: string | null
          from_state: string | null
          id: string
          price_per_day: number | null
          to_district: string | null
          to_location: string | null
          to_state: string | null
          updated_at: string
          user_id: string
          vehicle_type: string
        }
        Insert: {
          available?: boolean
          created_at?: string
          description?: string | null
          driver_id: string
          from_district?: string | null
          from_location?: string | null
          from_state?: string | null
          id?: string
          price_per_day?: number | null
          to_district?: string | null
          to_location?: string | null
          to_state?: string | null
          updated_at?: string
          user_id: string
          vehicle_type: string
        }
        Update: {
          available?: boolean
          created_at?: string
          description?: string | null
          driver_id?: string
          from_district?: string | null
          from_location?: string | null
          from_state?: string | null
          id?: string
          price_per_day?: number | null
          to_district?: string | null
          to_location?: string | null
          to_state?: string | null
          updated_at?: string
          user_id?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_rentals_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
