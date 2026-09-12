export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          birth_date: string | null;
          zodiac_sign: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          birth_date?: string | null;
          zodiac_sign?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          birth_date?: string | null;
          zodiac_sign?: string | null;
          created_at?: string;
        };
      };
      daily_horoscopes: {
        Row: {
          id: string;
          sign: string;
          date: string;
          genel: string;
          ask: string;
          kariyer: string;
          saglik: string;
          sansli_sayi: number;
          sansli_renk: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sign: string;
          date: string;
          genel: string;
          ask: string;
          kariyer: string;
          saglik: string;
          sansli_sayi: number;
          sansli_renk: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['daily_horoscopes']['Insert']>;
      };
      fal_requests: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          input_summary: string;
          image_path: string | null;
          result: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          input_summary: string;
          image_path?: string | null;
          result?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['fal_requests']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
