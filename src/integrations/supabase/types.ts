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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      despesas: {
        Row: {
          categoria: string | null
          comprovante: string | null
          data: string | null
          data_vencimento: string | null
          descricao: string | null
          empresa: string | null
          id: number
          origem_pagamento: string | null
          status: string | null
          subcategoria: string | null
          user_id: string
          valor: number | null
          valor_juros: number | null
          valor_total: number | null
        }
        Insert: {
          categoria?: string | null
          comprovante?: string | null
          data?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          empresa?: string | null
          id?: number
          origem_pagamento?: string | null
          status?: string | null
          subcategoria?: string | null
          user_id: string
          valor?: number | null
          valor_juros?: number | null
          valor_total?: number | null
        }
        Update: {
          categoria?: string | null
          comprovante?: string | null
          data?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          empresa?: string | null
          id?: number
          origem_pagamento?: string | null
          status?: string | null
          subcategoria?: string | null
          user_id?: string
          valor?: number | null
          valor_juros?: number | null
          valor_total?: number | null
        }
        Relationships: []
      }
      metas_mensais: {
        Row: {
          ano: number
          categoria_receita: string | null
          cor: string | null
          created_at: string
          empresa: string
          id: string
          mes: number
          nome_meta: string
          updated_at: string
          user_id: string
          valor_atual: number
          valor_meta: number
        }
        Insert: {
          ano: number
          categoria_receita?: string | null
          cor?: string | null
          created_at?: string
          empresa: string
          id?: string
          mes: number
          nome_meta: string
          updated_at?: string
          user_id: string
          valor_atual?: number
          valor_meta?: number
        }
        Update: {
          ano?: number
          categoria_receita?: string | null
          cor?: string | null
          created_at?: string
          empresa?: string
          id?: string
          mes?: number
          nome_meta?: string
          updated_at?: string
          user_id?: string
          valor_atual?: number
          valor_meta?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          is_admin: boolean
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_admin?: boolean
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      receitas: {
        Row: {
          categoria: string | null
          created_at: string | null
          data: string
          data_recebimento: string | null
          descricao: string | null
          destino: string | null
          empresa: string | null
          id: number
          updated_at: string | null
          user_id: string
          valor: number | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          data: string
          data_recebimento?: string | null
          descricao?: string | null
          destino?: string | null
          empresa?: string | null
          id?: number
          updated_at?: string | null
          user_id: string
          valor?: number | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          data?: string
          data_recebimento?: string | null
          descricao?: string | null
          destino?: string | null
          empresa?: string | null
          id?: number
          updated_at?: string | null
          user_id?: string
          valor?: number | null
        }
        Relationships: []
      }
      saldos: {
        Row: {
          created_at: string | null
          id: number
          tipo: string
          updated_at: string | null
          valor: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          tipo: string
          updated_at?: string | null
          valor?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          tipo?: string
          updated_at?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      transaction_history: {
        Row: {
          action_type: string
          changed_fields: string[] | null
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          timestamp: string
          transaction_id: number
          transaction_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          changed_fields?: string[] | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          timestamp?: string
          transaction_id: number
          transaction_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          changed_fields?: string[] | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          timestamp?: string
          transaction_id?: number
          transaction_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_tab_permissions: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean
          tab_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean
          tab_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean
          tab_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tab_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_user_role: {
        Args: {
          required_role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Returns: boolean
      }
      is_admin_or_financeiro: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      normalize_category_label: {
        Args: { category_code: string }
        Returns: string
      }
    }
    Enums: {
      user_role: "admin" | "financeiro"
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
      user_role: ["admin", "financeiro"],
    },
  },
} as const
