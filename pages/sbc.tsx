import { SupabaseClient, createClient } from "@supabase/supabase-js";

const supabaseURL = 'https://klsfvrucjxgjujhimoiy.supabase.co';
const supabaseAnonKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtsc2Z2cnVjanhnanVqaGltb2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODc0MTQ2NjAsImV4cCI6MjAwMjk5MDY2MH0.Hi1WOmZM0xBiZZvz_iQKDRpW1lHNinPc7mtrPaTP1L8';

export const supabase = createClient(supabaseURL, supabaseAnonKey);