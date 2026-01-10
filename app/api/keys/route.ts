import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateApiKey, hashApiKey } from '@/lib/api/apiKeys';

// GET /api/keys - List user's API keys (masked)
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { data: keys, error } = await supabase
            .from('api_keys')
            .select('id, name, key_prefix, created_at, last_used_at, expires_at, is_active, usage_count')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching API keys:', error);
            return NextResponse.json(
                { error: 'Failed to fetch API keys' },
                { status: 500 }
            );
        }

        return NextResponse.json({ keys });
    } catch (error) {
        console.error('Error in GET /api/keys:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/keys - Create a new API key
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, expiresAt } = body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        // Generate new API key
        const { key, hash, prefix } = generateApiKey();

        // Insert into database
        const { data: keyData, error } = await supabase
            .from('api_keys')
            .insert({
                user_id: user.id,
                name: name.trim(),
                key_hash: hash,
                key_prefix: prefix,
                expires_at: expiresAt || null,
            })
            .select('id, name, key_prefix, created_at, expires_at')
            .single();

        if (error) {
            console.error('Error creating API key:', error);
            return NextResponse.json(
                { error: `Failed to create API key: ${error.message}` },
                { status: 500 }
            );
        }

        // Return the full key only once - it won't be shown again
        return NextResponse.json({
            ...keyData,
            key, // Full key - shown only on creation
        });
    } catch (error) {
        console.error('Error in POST /api/keys:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: `Failed to create API key: ${message}` },
            { status: 500 }
        );
    }
}

// DELETE /api/keys - Delete/revoke an API key
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const keyId = searchParams.get('id');

        if (!keyId) {
            return NextResponse.json(
                { error: 'Key ID is required' },
                { status: 400 }
            );
        }

        // Soft delete by setting is_active to false
        const { error } = await supabase
            .from('api_keys')
            .update({ is_active: false })
            .eq('id', keyId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error revoking API key:', error);
            return NextResponse.json(
                { error: 'Failed to revoke API key' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/keys:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
