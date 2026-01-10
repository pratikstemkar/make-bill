import { createClient } from '@/lib/supabase/server';
import { createHash, randomBytes } from 'crypto';

const API_KEY_PREFIX = 'mk_live_';

/**
 * Generate a new API key
 * Returns the full key (only shown once) and the hash for storage
 */
export function generateApiKey(): { key: string; hash: string; prefix: string } {
    // Generate 32 random alphanumeric characters
    const randomPart = randomBytes(24).toString('base64url').substring(0, 32);
    const key = `${API_KEY_PREFIX}${randomPart}`;
    const hash = hashApiKey(key);
    const prefix = key.substring(0, 8); // First 8 chars: "mk_live_"

    return { key, hash, prefix };
}

/**
 * Hash an API key using SHA-256
 */
export function hashApiKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
}

/**
 * Validate an API key and return the user ID if valid
 */
export async function validateApiKey(key: string): Promise<{
    valid: boolean;
    userId?: string;
    keyId?: string;
    error?: string;
}> {
    // Check prefix
    if (!key.startsWith(API_KEY_PREFIX)) {
        return { valid: false, error: 'Invalid API key format' };
    }

    const hash = hashApiKey(key);
    const supabase = await createClient();

    // Look up the key by hash
    const { data: keyData, error } = await supabase
        .from('api_keys')
        .select('id, user_id, is_active, expires_at, usage_count')
        .eq('key_hash', hash)
        .single();

    if (error || !keyData) {
        return { valid: false, error: 'Invalid API key' };
    }

    // Check if key is active
    if (!keyData.is_active) {
        return { valid: false, error: 'API key has been revoked' };
    }

    // Check expiration
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
        return { valid: false, error: 'API key has expired' };
    }

    // Update last_used_at and usage_count
    await supabase
        .from('api_keys')
        .update({
            last_used_at: new Date().toISOString(),
            usage_count: (keyData as any).usage_count + 1,
        })
        .eq('id', keyData.id);

    return {
        valid: true,
        userId: keyData.user_id,
        keyId: keyData.id,
    };
}

/**
 * Log API usage to the api_usage table
 */
export async function logApiUsage(params: {
    userId: string;
    apiKeyId?: string;
    endpoint: string;
    statusCode: number;
    requestSize?: number;
    responseSize?: number;
    durationMs?: number;
    metadata?: Record<string, any>;
}): Promise<void> {
    const supabase = await createClient();

    await supabase.from('api_usage').insert({
        user_id: params.userId,
        api_key_id: params.apiKeyId || null,
        endpoint: params.endpoint,
        status_code: params.statusCode,
        request_size: params.requestSize,
        response_size: params.responseSize,
        duration_ms: params.durationMs,
        metadata: params.metadata,
    });
}

/**
 * Get API key by ID (for display purposes, returns masked key)
 */
export async function getApiKeyById(keyId: string): Promise<any | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('id', keyId)
        .single();

    if (error || !data) {
        return null;
    }

    return data;
}
