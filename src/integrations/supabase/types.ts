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
      admin_audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      brand_themes: {
        Row: {
          accent_color: string
          background_color: string
          derived_from_logo: boolean
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          primary_color: string
          secondary_color: string
          text_color: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          background_color?: string
          derived_from_logo?: boolean
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          primary_color?: string
          secondary_color?: string
          text_color?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          background_color?: string
          derived_from_logo?: boolean
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          primary_color?: string
          secondary_color?: string
          text_color?: string
          updated_at?: string
        }
        Relationships: []
      }
      donor_profiles: {
        Row: {
          amount_total: number
          created_at: string
          id: string
          last_donation_at: string | null
          lead_id: string
          notes: string | null
          perk_tier: string | null
        }
        Insert: {
          amount_total?: number
          created_at?: string
          id?: string
          last_donation_at?: string | null
          lead_id: string
          notes?: string | null
          perk_tier?: string | null
        }
        Update: {
          amount_total?: number
          created_at?: string
          id?: string
          last_donation_at?: string | null
          lead_id?: string
          notes?: string | null
          perk_tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donor_profiles_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "user_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      email_messages: {
        Row: {
          body_html: string | null
          created_at: string
          error: string | null
          id: string
          lead_id: string
          provider_message_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["email_status"]
          step_id: string | null
          subject: string | null
          workflow_template_id: string | null
        }
        Insert: {
          body_html?: string | null
          created_at?: string
          error?: string | null
          id?: string
          lead_id: string
          provider_message_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_status"]
          step_id?: string | null
          subject?: string | null
          workflow_template_id?: string | null
        }
        Update: {
          body_html?: string | null
          created_at?: string
          error?: string | null
          id?: string
          lead_id?: string
          provider_message_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_status"]
          step_id?: string | null
          subject?: string | null
          workflow_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "user_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_messages_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_messages_workflow_template_id_fkey"
            columns: ["workflow_template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          lead_id: string | null
          payload: Json | null
        }
        Insert: {
          created_at?: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          lead_id?: string | null
          payload?: Json | null
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          lead_id?: string | null
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "user_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_access_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          label: string | null
          max_uses: number | null
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          max_uses?: number | null
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          max_uses?: number | null
          uses_count?: number
        }
        Relationships: []
      }
      investor_profiles: {
        Row: {
          accredited: boolean | null
          check_size_range: string | null
          created_at: string
          fund_name: string | null
          id: string
          lead_id: string
          notes: string | null
          stage_focus: string | null
        }
        Insert: {
          accredited?: boolean | null
          check_size_range?: string | null
          created_at?: string
          fund_name?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          stage_focus?: string | null
        }
        Update: {
          accredited?: boolean | null
          check_size_range?: string | null
          created_at?: string
          fund_name?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          stage_focus?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_profiles_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "user_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressions: {
        Row: {
          created_at: string
          email: string
          id: string
          reason: Database["public"]["Enums"]["suppression_reason"]
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          reason: Database["public"]["Enums"]["suppression_reason"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          reason?: Database["public"]["Enums"]["suppression_reason"]
        }
        Relationships: []
      }
      user_leads: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          lead_type: Database["public"]["Enums"]["lead_type"]
          source: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          lead_type?: Database["public"]["Enums"]["lead_type"]
          source?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          lead_type?: Database["public"]["Enums"]["lead_type"]
          source?: string | null
          tags?: string[] | null
          updated_at?: string
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
      workflow_enrollments: {
        Row: {
          completed_at: string | null
          current_step: number
          enrolled_at: string
          id: string
          lead_id: string
          status: string
          workflow_template_id: string
        }
        Insert: {
          completed_at?: string | null
          current_step?: number
          enrolled_at?: string
          id?: string
          lead_id: string
          status?: string
          workflow_template_id: string
        }
        Update: {
          completed_at?: string | null
          current_step?: number
          enrolled_at?: string
          id?: string
          lead_id?: string
          status?: string
          workflow_template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_enrollments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "user_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_enrollments_workflow_template_id_fkey"
            columns: ["workflow_template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          body_template: string
          channel: string
          conditions: Json | null
          created_at: string
          delay_minutes: number
          from_email: string | null
          from_name: string | null
          id: string
          reply_to: string | null
          step_order: number
          subject_template: string
          template_id: string
          variant: string | null
          variant_weight: number | null
        }
        Insert: {
          body_template: string
          channel?: string
          conditions?: Json | null
          created_at?: string
          delay_minutes?: number
          from_email?: string | null
          from_name?: string | null
          id?: string
          reply_to?: string | null
          step_order: number
          subject_template: string
          template_id: string
          variant?: string | null
          variant_weight?: number | null
        }
        Update: {
          body_template?: string
          channel?: string
          conditions?: Json | null
          created_at?: string
          delay_minutes?: number
          from_email?: string | null
          from_name?: string | null
          id?: string
          reply_to?: string | null
          step_order?: number
          subject_template?: string
          template_id?: string
          variant?: string | null
          variant_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          audience_type: Database["public"]["Enums"]["lead_type"]
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          key: string
          name: string
          status: Database["public"]["Enums"]["workflow_status"]
          updated_at: string
          version: number
        }
        Insert: {
          audience_type: Database["public"]["Enums"]["lead_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key: string
          name: string
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string
          version?: number
        }
        Update: {
          audience_type?: Database["public"]["Enums"]["lead_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key?: string
          name?: string
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "superadmin" | "readonly"
      email_status: "queued" | "sent" | "failed" | "skipped"
      event_type:
        | "WAITLIST_SIGNUP"
        | "DONATION_CREATED"
        | "INVESTOR_INFO_REQUEST"
        | "PITCH_VIEW"
        | "DEMO_VIEW"
        | "WORKFLOW_TOGGLED"
        | "TEMPLATE_UPDATED"
        | "EMAIL_SENT"
        | "EMAIL_FAILED"
        | "UNSUBSCRIBE"
        | "BOUNCE"
        | "COMPLAINT"
      lead_type: "waitlist" | "donor" | "investor"
      suppression_reason: "unsubscribed" | "bounce" | "complaint" | "manual"
      workflow_status: "OFF" | "SHADOW" | "LIVE"
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
      app_role: ["admin", "superadmin", "readonly"],
      email_status: ["queued", "sent", "failed", "skipped"],
      event_type: [
        "WAITLIST_SIGNUP",
        "DONATION_CREATED",
        "INVESTOR_INFO_REQUEST",
        "PITCH_VIEW",
        "DEMO_VIEW",
        "WORKFLOW_TOGGLED",
        "TEMPLATE_UPDATED",
        "EMAIL_SENT",
        "EMAIL_FAILED",
        "UNSUBSCRIBE",
        "BOUNCE",
        "COMPLAINT",
      ],
      lead_type: ["waitlist", "donor", "investor"],
      suppression_reason: ["unsubscribed", "bounce", "complaint", "manual"],
      workflow_status: ["OFF", "SHADOW", "LIVE"],
    },
  },
} as const
