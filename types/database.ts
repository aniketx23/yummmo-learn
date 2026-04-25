export type UserRole = "super_admin" | "instructor" | "student";
export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: UserRole;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon_url: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon_url?: string | null;
          display_order?: number;
        };
        Update: {
          name?: string;
          slug?: string;
          icon_url?: string | null;
          display_order?: number;
        };
      };
      courses: {
        Row: {
          id: string;
          instructor_id: string | null;
          category_id: string | null;
          title: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          thumbnail_url: string | null;
          language: string;
          level: CourseLevel;
          is_free: boolean;
          price: string;
          original_price: string | null;
          is_published: boolean;
          total_lessons: number;
          total_duration_minutes: number;
          tags: string[] | null;
          search_vector: unknown | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          instructor_id?: string | null;
          category_id?: string | null;
          title: string;
          slug: string;
          description?: string | null;
          short_description?: string | null;
          thumbnail_url?: string | null;
          language?: string;
          level?: CourseLevel;
          is_free?: boolean;
          price?: string;
          original_price?: string | null;
          is_published?: boolean;
          total_lessons?: number;
          total_duration_minutes?: number;
          tags?: string[] | null;
        };
        Update: {
          instructor_id?: string | null;
          category_id?: string | null;
          title?: string;
          slug?: string;
          description?: string | null;
          short_description?: string | null;
          thumbnail_url?: string | null;
          language?: string;
          level?: CourseLevel;
          is_free?: boolean;
          price?: string;
          original_price?: string | null;
          is_published?: boolean;
          total_lessons?: number;
          total_duration_minutes?: number;
          tags?: string[] | null;
        };
      };
      sections: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          display_order?: number;
        };
        Update: {
          title?: string;
          display_order?: number;
        };
      };
      lessons: {
        Row: {
          id: string;
          section_id: string;
          course_id: string;
          title: string;
          description: string | null;
          video_bunny_id: string | null;
          video_url: string | null;
          video_duration_seconds: number;
          is_free_preview: boolean;
          display_order: number;
          attachments: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          course_id: string;
          title: string;
          description?: string | null;
          video_bunny_id?: string | null;
          video_url?: string | null;
          video_duration_seconds?: number;
          is_free_preview?: boolean;
          display_order?: number;
          attachments?: Json;
        };
        Update: {
          title?: string;
          description?: string | null;
          video_bunny_id?: string | null;
          video_url?: string | null;
          video_duration_seconds?: number;
          is_free_preview?: boolean;
          display_order?: number;
          attachments?: Json;
        };
      };
      payments: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          amount: string;
          currency: string;
          status: PaymentStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          amount: string;
          currency?: string;
          status?: PaymentStatus;
        };
        Update: {
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          amount?: string;
          status?: PaymentStatus;
        };
      };
      enrollments: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          enrolled_at: string;
          is_free: boolean;
          payment_id: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
          is_free?: boolean;
          payment_id?: string | null;
          completed_at?: string | null;
        };
        Update: {
          completed_at?: string | null;
          payment_id?: string | null;
        };
      };
      progress: {
        Row: {
          id: string;
          student_id: string;
          lesson_id: string;
          course_id: string;
          is_completed: boolean;
          last_watched_seconds: number;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          lesson_id: string;
          course_id: string;
          is_completed?: boolean;
          last_watched_seconds?: number;
          completed_at?: string | null;
        };
        Update: {
          is_completed?: boolean;
          last_watched_seconds?: number;
          completed_at?: string | null;
        };
      };
      wishlists: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
        };
        Update: Record<string, never>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
