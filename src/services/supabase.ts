import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Static user credentials
const STATIC_PASSWORD = "bay3rn08";

export const authenticateUser = async () => {
    try {
        // Sign in with existing credentials
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: `benni.mehlbm@gmail.com`,
            password: STATIC_PASSWORD,
        });

        if (signInError) {
            return { user: null, error: signInError };
        }

        return { user: signInData.user, error: null };
    } catch (error) {
        return { user: null, error };
    }
};

export const getCurrentUser = async () => {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};
