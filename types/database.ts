export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      bug_activity: {
        Row: {
          action: string;
          actor_id: string | null;
          bug_id: string;
          created_at: string;
          detail: string | null;
          id: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          bug_id: string;
          created_at?: string;
          detail?: string | null;
          id?: string;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          bug_id?: string;
          created_at?: string;
          detail?: string | null;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bug_activity_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bug_activity_bug_id_fkey";
            columns: ["bug_id"];
            isOneToOne: false;
            referencedRelation: "bugs";
            referencedColumns: ["id"];
          },
        ];
      };
      bug_attachments: {
        Row: {
          bug_id: string;
          created_at: string;
          file_name: string;
          file_path: string;
          file_size: number;
          id: string;
          uploaded_by: string;
        };
        Insert: {
          bug_id: string;
          created_at?: string;
          file_name: string;
          file_path: string;
          file_size: number;
          id?: string;
          uploaded_by: string;
        };
        Update: {
          bug_id?: string;
          created_at?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          id?: string;
          uploaded_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bug_attachments_bug_id_fkey";
            columns: ["bug_id"];
            isOneToOne: false;
            referencedRelation: "bugs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bug_attachments_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      bug_comments: {
        Row: {
          author_id: string;
          body: string;
          bug_id: string;
          created_at: string;
          id: string;
        };
        Insert: {
          author_id: string;
          body: string;
          bug_id: string;
          created_at?: string;
          id?: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          bug_id?: string;
          created_at?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bug_comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bug_comments_bug_id_fkey";
            columns: ["bug_id"];
            isOneToOne: false;
            referencedRelation: "bugs";
            referencedColumns: ["id"];
          },
        ];
      };
      bug_labels: {
        Row: {
          bug_id: string;
          label: Database["public"]["Enums"]["bug_label"];
        };
        Insert: {
          bug_id: string;
          label: Database["public"]["Enums"]["bug_label"];
        };
        Update: {
          bug_id?: string;
          label?: Database["public"]["Enums"]["bug_label"];
        };
        Relationships: [
          {
            foreignKeyName: "bug_labels_bug_id_fkey";
            columns: ["bug_id"];
            isOneToOne: false;
            referencedRelation: "bugs";
            referencedColumns: ["id"];
          },
        ];
      };
      bugs: {
        Row: {
          actual_result: string | null;
          additional_context: string | null;
          assignee_id: string | null;
          created_at: string;
          expected_result: string | null;
          id: string;
          priority: Database["public"]["Enums"]["bug_priority"];
          project_id: string;
          reporter_id: string;
          sequence_number: number;
          severity: Database["public"]["Enums"]["bug_severity"];
          source: Database["public"]["Enums"]["bug_source"];
          status: Database["public"]["Enums"]["bug_status"];
          steps_to_reproduce: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          actual_result?: string | null;
          additional_context?: string | null;
          assignee_id?: string | null;
          created_at?: string;
          expected_result?: string | null;
          id?: string;
          priority?: Database["public"]["Enums"]["bug_priority"];
          project_id: string;
          reporter_id: string;
          sequence_number: number;
          severity: Database["public"]["Enums"]["bug_severity"];
          source?: Database["public"]["Enums"]["bug_source"];
          status?: Database["public"]["Enums"]["bug_status"];
          steps_to_reproduce: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          actual_result?: string | null;
          additional_context?: string | null;
          assignee_id?: string | null;
          created_at?: string;
          expected_result?: string | null;
          id?: string;
          priority?: Database["public"]["Enums"]["bug_priority"];
          project_id?: string;
          reporter_id?: string;
          sequence_number?: number;
          severity?: Database["public"]["Enums"]["bug_severity"];
          source?: Database["public"]["Enums"]["bug_source"];
          status?: Database["public"]["Enums"]["bug_status"];
          steps_to_reproduce?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bugs_assignee_id_fkey";
            columns: ["assignee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bugs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bugs_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          actor_id: string | null;
          bug_id: string | null;
          created_at: string;
          id: string;
          is_read: boolean;
          message: string;
          recipient_id: string;
          type: Database["public"]["Enums"]["notification_type"];
        };
        Insert: {
          actor_id?: string | null;
          bug_id?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          message: string;
          recipient_id: string;
          type: Database["public"]["Enums"]["notification_type"];
        };
        Update: {
          actor_id?: string | null;
          bug_id?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          message?: string;
          recipient_id?: string;
          type?: Database["public"]["Enums"]["notification_type"];
        };
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_bug_id_fkey";
            columns: ["bug_id"];
            isOneToOne: false;
            referencedRelation: "bugs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          notification_preferences: Json;
          role: Database["public"]["Enums"]["user_role"];
          status: Database["public"]["Enums"]["user_status"];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id: string;
          notification_preferences?: Json;
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["user_status"];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          notification_preferences?: Json;
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["user_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      project_members: {
        Row: {
          added_at: string;
          project_id: string;
          user_id: string;
        };
        Insert: {
          added_at?: string;
          project_id: string;
          user_id: string;
        };
        Update: {
          added_at?: string;
          project_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          key: string;
          name: string;
          status: Database["public"]["Enums"]["project_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          key: string;
          name: string;
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          key?: string;
          name?: string;
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      auth_role: {
        Args: never;
        Returns: Database["public"]["Enums"]["user_role"];
      };
      is_admin: { Args: never; Returns: boolean };
      is_admin_or_manager: { Args: never; Returns: boolean };
      is_project_member: { Args: { pid: string }; Returns: boolean };
    };
    Enums: {
      bug_label:
        | "UI"
        | "Functional"
        | "API"
        | "Performance"
        | "Security"
        | "Database"
        | "Compatibility"
        | "Regression";
      bug_priority: "p1" | "p2" | "p3" | "p4";
      bug_severity: "critical" | "high" | "medium" | "low";
      bug_source: "manual" | "automation" | "user_reported";
      bug_status: "open" | "in_progress" | "resolved" | "closed";
      notification_type:
        "bug_assigned" | "status_changed" | "comment_added" | "mentioned" | "bug_reopened";
      project_status: "active" | "archived";
      user_role: "admin" | "manager" | "developer" | "tester" | "viewer";
      user_status: "active" | "inactive";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      bug_label: [
        "UI",
        "Functional",
        "API",
        "Performance",
        "Security",
        "Database",
        "Compatibility",
        "Regression",
      ],
      bug_priority: ["p1", "p2", "p3", "p4"],
      bug_severity: ["critical", "high", "medium", "low"],
      bug_source: ["manual", "automation", "user_reported"],
      bug_status: ["open", "in_progress", "resolved", "closed"],
      notification_type: [
        "bug_assigned",
        "status_changed",
        "comment_added",
        "mentioned",
        "bug_reopened",
      ],
      project_status: ["active", "archived"],
      user_role: ["admin", "manager", "developer", "tester", "viewer"],
      user_status: ["active", "inactive"],
    },
  },
} as const;
