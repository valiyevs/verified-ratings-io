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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          average_rating: number | null
          avg_response_time_hours: number | null
          category: string
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_sponsored: boolean | null
          logo_url: string | null
          name: string
          owner_id: string | null
          phone: string | null
          response_rate: number | null
          review_count: number | null
          status: string
          subscription_expires_at: string | null
          subscription_plan: string | null
          surveys_created_this_month: number | null
          updated_at: string
          verified_reviews_count: number | null
          website: string | null
        }
        Insert: {
          address?: string | null
          average_rating?: number | null
          avg_response_time_hours?: number | null
          category: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_sponsored?: boolean | null
          logo_url?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          response_rate?: number | null
          review_count?: number | null
          status?: string
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          surveys_created_this_month?: number | null
          updated_at?: string
          verified_reviews_count?: number | null
          website?: string | null
        }
        Update: {
          address?: string | null
          average_rating?: number | null
          avg_response_time_hours?: number | null
          category?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_sponsored?: boolean | null
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          response_rate?: number | null
          review_count?: number | null
          status?: string
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          surveys_created_this_month?: number | null
          updated_at?: string
          verified_reviews_count?: number | null
          website?: string | null
        }
        Relationships: []
      }
      company_followers: {
        Row: {
          company_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_followers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_followers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["company_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["company_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["company_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          company_id: string
          content: string
          created_at: string
          id: string
          sent_at: string | null
          sent_count: number | null
          status: string
          subject: string
        }
        Insert: {
          company_id: string
          content: string
          created_at?: string
          id?: string
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject: string
        }
        Update: {
          company_id?: string
          content?: string
          created_at?: string
          id?: string
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard: {
        Row: {
          badge_count: number | null
          full_name: string | null
          id: string
          period: string | null
          rank: number | null
          total_helpful: number | null
          total_points: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          badge_count?: number | null
          full_name?: string | null
          id?: string
          period?: string | null
          rank?: number | null
          total_helpful?: number | null
          total_points?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          badge_count?: number | null
          full_name?: string | null
          id?: string
          period?: string | null
          rank?: number | null
          total_helpful?: number | null
          total_points?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          block_reason: string | null
          company_update_notifications: boolean | null
          created_at: string
          email: string | null
          email_notifications_enabled: boolean | null
          full_name: string | null
          id: string
          is_blocked: boolean
          is_fin_verified: boolean | null
          last_login_date: string | null
          login_streak: number | null
          longest_streak: number | null
          phone: string | null
          platform_activity_months: number | null
          review_reply_notifications: boolean | null
          survey_participation_count: number | null
          total_points: number | null
          total_reviews_count: number | null
          trust_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          block_reason?: string | null
          company_update_notifications?: boolean | null
          created_at?: string
          email?: string | null
          email_notifications_enabled?: boolean | null
          full_name?: string | null
          id?: string
          is_blocked?: boolean
          is_fin_verified?: boolean | null
          last_login_date?: string | null
          login_streak?: number | null
          longest_streak?: number | null
          phone?: string | null
          platform_activity_months?: number | null
          review_reply_notifications?: boolean | null
          survey_participation_count?: number | null
          total_points?: number | null
          total_reviews_count?: number | null
          trust_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          block_reason?: string | null
          company_update_notifications?: boolean | null
          created_at?: string
          email?: string | null
          email_notifications_enabled?: boolean | null
          full_name?: string | null
          id?: string
          is_blocked?: boolean
          is_fin_verified?: boolean | null
          last_login_date?: string | null
          login_streak?: number | null
          longest_streak?: number | null
          phone?: string | null
          platform_activity_months?: number | null
          review_reply_notifications?: boolean | null
          survey_participation_count?: number | null
          total_points?: number | null
          total_reviews_count?: number | null
          trust_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      response_templates: {
        Row: {
          category: string | null
          company_id: string
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          company_id: string
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          company_id?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "response_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public"
            referencedColumns: ["id"]
          },
        ]
      }
      review_contests: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          id: string
          prize_description: string | null
          prize_points: number | null
          start_date: string
          status: string | null
          title: string
          winner_review_id: string | null
          winner_user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          id?: string
          prize_description?: string | null
          prize_points?: number | null
          start_date?: string
          status?: string | null
          title: string
          winner_review_id?: string | null
          winner_user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          id?: string
          prize_description?: string | null
          prize_points?: number | null
          start_date?: string
          status?: string | null
          title?: string
          winner_review_id?: string | null
          winner_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_contests_winner_review_id_fkey"
            columns: ["winner_review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_contests_winner_review_id_fkey"
            columns: ["winner_review_id"]
            isOneToOne: false
            referencedRelation: "reviews_public"
            referencedColumns: ["id"]
          },
        ]
      }
      review_fraud_logs: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          fraud_type: string | null
          id: string
          ip_address: string | null
          is_copy_paste: boolean | null
          review_id: string | null
          risk_score: number | null
          similar_review_id: string | null
          similarity_score: number | null
          typing_speed_wpm: number | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          fraud_type?: string | null
          id?: string
          ip_address?: string | null
          is_copy_paste?: boolean | null
          review_id?: string | null
          risk_score?: number | null
          similar_review_id?: string | null
          similarity_score?: number | null
          typing_speed_wpm?: number | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          fraud_type?: string | null
          id?: string
          ip_address?: string | null
          is_copy_paste?: boolean | null
          review_id?: string | null
          risk_score?: number | null
          similar_review_id?: string | null
          similarity_score?: number | null
          typing_speed_wpm?: number | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_fraud_logs_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_fraud_logs_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_fraud_logs_similar_review_id_fkey"
            columns: ["similar_review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_fraud_logs_similar_review_id_fkey"
            columns: ["similar_review_id"]
            isOneToOne: false
            referencedRelation: "reviews_public"
            referencedColumns: ["id"]
          },
        ]
      }
      review_helpful: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_helpful_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews_public"
            referencedColumns: ["id"]
          },
        ]
      }
      review_history: {
        Row: {
          created_at: string
          id: string
          old_content: string | null
          old_rating: number | null
          old_title: string | null
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          old_content?: string | null
          old_rating?: number | null
          old_title?: string | null
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          old_content?: string | null
          old_rating?: number | null
          old_title?: string | null
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_history_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_history_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews_public"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          company_id: string
          company_reply: string | null
          company_reply_at: string | null
          content: string
          created_at: string
          flag_reason: string | null
          helpful_count: number | null
          id: string
          image_url: string | null
          is_flagged: boolean | null
          price_rating: number | null
          quality_rating: number | null
          rating: number
          service_rating: number | null
          speed_rating: number | null
          status: string
          submission_ip: string | null
          title: string
          trust_score: number | null
          updated_at: string
          user_id: string
          weighted_rating: number | null
          writing_duration_seconds: number | null
        }
        Insert: {
          company_id: string
          company_reply?: string | null
          company_reply_at?: string | null
          content: string
          created_at?: string
          flag_reason?: string | null
          helpful_count?: number | null
          id?: string
          image_url?: string | null
          is_flagged?: boolean | null
          price_rating?: number | null
          quality_rating?: number | null
          rating: number
          service_rating?: number | null
          speed_rating?: number | null
          status?: string
          submission_ip?: string | null
          title: string
          trust_score?: number | null
          updated_at?: string
          user_id: string
          weighted_rating?: number | null
          writing_duration_seconds?: number | null
        }
        Update: {
          company_id?: string
          company_reply?: string | null
          company_reply_at?: string | null
          content?: string
          created_at?: string
          flag_reason?: string | null
          helpful_count?: number | null
          id?: string
          image_url?: string | null
          is_flagged?: boolean | null
          price_rating?: number | null
          quality_rating?: number | null
          rating?: number
          service_rating?: number | null
          speed_rating?: number | null
          status?: string
          submission_ip?: string | null
          title?: string
          trust_score?: number | null
          updated_at?: string
          user_id?: string
          weighted_rating?: number | null
          writing_duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          answers: Json
          created_at: string | null
          id: string
          survey_id: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string | null
          id?: string
          survey_id: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string | null
          id?: string
          survey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          questions: Json
          reward_points: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          questions?: Json
          reward_points?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          questions?: Json
          reward_points?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surveys_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_description: string | null
          badge_icon: string
          badge_name: string
          badge_type: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_icon: string
          badge_name: string
          badge_type: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_description?: string | null
          badge_icon?: string
          badge_name?: string
          badge_type?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_rewards: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          id: string
          points: number
          reference_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          user_id?: string
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
    }
    Views: {
      companies_public: {
        Row: {
          address: string | null
          average_rating: number | null
          avg_response_time_hours: number | null
          category: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string | null
          is_sponsored: boolean | null
          logo_url: string | null
          name: string | null
          phone: string | null
          response_rate: number | null
          review_count: number | null
          status: string | null
          updated_at: string | null
          verified_reviews_count: number | null
          website: string | null
        }
        Insert: {
          address?: string | null
          average_rating?: number | null
          avg_response_time_hours?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          email?: never
          id?: string | null
          is_sponsored?: boolean | null
          logo_url?: string | null
          name?: string | null
          phone?: never
          response_rate?: number | null
          review_count?: number | null
          status?: string | null
          updated_at?: string | null
          verified_reviews_count?: number | null
          website?: string | null
        }
        Update: {
          address?: string | null
          average_rating?: number | null
          avg_response_time_hours?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          email?: never
          id?: string | null
          is_sponsored?: boolean | null
          logo_url?: string | null
          name?: string | null
          phone?: never
          response_rate?: number | null
          review_count?: number | null
          status?: string | null
          updated_at?: string | null
          verified_reviews_count?: number | null
          website?: string | null
        }
        Relationships: []
      }
      reviews_public: {
        Row: {
          company_id: string | null
          company_reply: string | null
          company_reply_at: string | null
          content: string | null
          created_at: string | null
          flag_reason: string | null
          helpful_count: number | null
          id: string | null
          image_url: string | null
          is_flagged: boolean | null
          price_rating: number | null
          quality_rating: number | null
          rating: number | null
          service_rating: number | null
          speed_rating: number | null
          status: string | null
          title: string | null
          trust_score: number | null
          updated_at: string | null
          user_id: string | null
          weighted_rating: number | null
        }
        Insert: {
          company_id?: string | null
          company_reply?: string | null
          company_reply_at?: string | null
          content?: string | null
          created_at?: string | null
          flag_reason?: string | null
          helpful_count?: number | null
          id?: string | null
          image_url?: string | null
          is_flagged?: boolean | null
          price_rating?: number | null
          quality_rating?: number | null
          rating?: number | null
          service_rating?: number | null
          speed_rating?: number | null
          status?: string | null
          title?: string | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: never
          weighted_rating?: number | null
        }
        Update: {
          company_id?: string | null
          company_reply?: string | null
          company_reply_at?: string | null
          content?: string | null
          created_at?: string | null
          flag_reason?: string | null
          helpful_count?: number | null
          id?: string | null
          image_url?: string | null
          is_flagged?: boolean | null
          price_rating?: number | null
          quality_rating?: number | null
          rating?: number | null
          service_rating?: number | null
          speed_rating?: number | null
          status?: string | null
          title?: string | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: never
          weighted_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_company_member_role: {
        Args: { _company_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["company_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_any_company_member: { Args: { _user_id: string }; Returns: boolean }
      is_company_member: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_company_owner: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      company_role: "manager" | "employee"
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
      app_role: ["admin", "moderator", "user"],
      company_role: ["manager", "employee"],
    },
  },
} as const
