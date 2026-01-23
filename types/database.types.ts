export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "admin" | "seller" | "buyer";
          name: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: "admin" | "seller" | "buyer";
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "admin" | "seller" | "buyer";
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      shops: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          description: string | null;
          address: string | null;
          google_maps_link: string | null;
          logo_url: string | null;
          cover_url: string | null;
          social_links: Json | null;
          whatsapp: string | null;
          bank_name: string | null;
          bank_account: string | null;
          bank_holder_name: string | null;
          is_manual_closed: boolean;
          auto_accept_order: boolean;
          operating_hours: Json | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          description?: string | null;
          address?: string | null;
          google_maps_link?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          social_links?: Json | null;
          whatsapp?: string | null;
          bank_name?: string | null;
          bank_account?: string | null;
          bank_holder_name?: string | null;
          is_manual_closed?: boolean;
          auto_accept_order?: boolean;
          operating_hours?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          address?: string | null;
          google_maps_link?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          social_links?: Json | null;
          whatsapp?: string | null;
          bank_name?: string | null;
          bank_account?: string | null;
          bank_holder_name?: string | null;
          is_manual_closed?: boolean;
          auto_accept_order?: boolean;
          operating_hours?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          shop_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          price: number;
          stock: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          price: number;
          stock?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          price?: number;
          stock?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          shop_id: string;
          buyer_id: string | null;
          guest_info: Json | null;
          status:
            | "pending_payment"
            | "paid"
            | "pending_confirmation"
            | "accepted"
            | "processing"
            | "ready"
            | "completed"
            | "rejected"
            | "cancelled_by_seller"
            | "cancelled_by_buyer";
          payment_method: "cash" | "gateway" | "balance";
          total_amount: number;
          platform_fee: number;
          gateway_fee: number;
          snap_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          buyer_id?: string | null;
          guest_info?: Json | null;
          status?:
            | "pending_payment"
            | "paid"
            | "pending_confirmation"
            | "accepted"
            | "processing"
            | "ready"
            | "completed"
            | "rejected"
            | "cancelled_by_seller"
            | "cancelled_by_buyer";
          payment_method: "cash" | "gateway" | "balance";
          total_amount: number;
          platform_fee?: number;
          gateway_fee?: number;
          snap_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          buyer_id?: string | null;
          guest_info?: Json | null;
          status?:
            | "pending_payment"
            | "paid"
            | "pending_confirmation"
            | "accepted"
            | "processing"
            | "ready"
            | "completed"
            | "rejected"
            | "cancelled_by_seller"
            | "cancelled_by_buyer";
          payment_method?: "cash" | "gateway" | "balance";
          total_amount?: number;
          platform_fee?: number;
          gateway_fee?: number;
          snap_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          quantity: number;
          price_at_purchase: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          quantity: number;
          price_at_purchase: number;
          subtotal: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          quantity?: number;
          price_at_purchase?: number;
          subtotal?: number;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          wallet_id: string;
          amount: number;
          type:
            | "deposit"
            | "withdrawal"
            | "payment"
            | "refund"
            | "platform_fee"
            | "sales_revenue";
          description: string | null;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          amount: number;
          type:
            | "deposit"
            | "withdrawal"
            | "payment"
            | "refund"
            | "platform_fee"
            | "sales_revenue";
          description?: string | null;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet_id?: string;
          amount?: number;
          type?:
            | "deposit"
            | "withdrawal"
            | "payment"
            | "refund"
            | "platform_fee"
            | "sales_revenue";
          description?: string | null;
          reference_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "admin" | "seller" | "buyer";
      order_status:
        | "pending_payment"
        | "paid"
        | "pending_confirmation"
        | "accepted"
        | "processing"
        | "ready"
        | "completed"
        | "rejected"
        | "cancelled_by_seller"
        | "cancelled_by_buyer";
      payment_method_enum: "cash" | "gateway" | "balance";
    };
  };
};
