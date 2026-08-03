export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          level: number
          level_name: string
          xp: number
          xp_to_next_level: number
          streak: number
          total_habits_done: number
          onboarding_completed: boolean
          avatar_url: string | null
          theme: 'light' | 'dark' | 'system'
          reminder_enabled: boolean
          reminder_hour: number
          reminder_minute: number
          language: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      habits: {
        Row: {
          id: string
          user_id: string
          icon: string
          title: string
          xp: number
          done: boolean
          desc: string
          benefits: string[]
          impact: string
          streak_days: boolean[]
          streak_count: number
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['habits']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['habits']['Insert']>
      }
      challenges: {
        Row: {
          id: string
          user_id: string
          icon: string
          title: string
          days: number
          progress: number
          reward: string
          color: string
          done: boolean
          joined: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['challenges']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['challenges']['Insert']>
      }
      community_challenges: {
        Row: {
          id: string
          icon: string
          title: string
          days: number
          reward: string
          color: string
          starts_at: string
          ends_at: string
          is_published: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['community_challenges']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['community_challenges']['Insert']>
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          user_id: string
          progress: number
          done: boolean
          joined_at: string
        }
        Insert: Omit<Database['public']['Tables']['challenge_participants']['Row'], 'joined_at'>
        Update: Partial<Database['public']['Tables']['challenge_participants']['Insert']>
      }
      habit_logs: {
        Row: {
          id: string
          user_id: string
          habit_id: string
          completed_on: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['habit_logs']['Row'], 'id' | 'created_at'>
        Update: never
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          from_role: 'user' | 'ai'
          text: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chat_messages']['Row'], 'created_at'>
        Update: never
      }
      weekly_reflections: {
        Row: {
          id: string
          user_id: string
          mood: string
          ai_response: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['weekly_reflections']['Row'], 'created_at'>
        Update: never
      }
    }
  }
}
