import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/usage - Get usage statistics
export async function GET(request: NextRequest) {
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
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const keyId = searchParams.get('keyId');

        // Build query
        let query = supabase
            .from('api_usage')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        // Apply filters
        if (startDate) {
            query = query.gte('created_at', startDate);
        }
        if (endDate) {
            query = query.lte('created_at', endDate);
        }
        if (keyId) {
            query = query.eq('api_key_id', keyId);
        }

        const { data: usageData, error } = await query.limit(1000);

        if (error) {
            console.error('Error fetching usage data:', error);
            return NextResponse.json(
                { error: 'Failed to fetch usage data' },
                { status: 500 }
            );
        }

        // Calculate summary statistics
        const totalRequests = usageData?.length || 0;
        const successRequests = usageData?.filter(u => u.status_code >= 200 && u.status_code < 300).length || 0;
        const errorRequests = totalRequests - successRequests;
        const avgDuration = usageData?.length
            ? Math.round(usageData.reduce((sum, u) => sum + (u.duration_ms || 0), 0) / usageData.length)
            : 0;

        // Group by date for chart data
        const dailyStats: Record<string, { total: number; success: number; error: number }> = {};
        usageData?.forEach(u => {
            const date = new Date(u.created_at).toISOString().split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = { total: 0, success: 0, error: 0 };
            }
            dailyStats[date].total++;
            if (u.status_code >= 200 && u.status_code < 300) {
                dailyStats[date].success++;
            } else {
                dailyStats[date].error++;
            }
        });

        // Convert to array sorted by date
        const dailyData = Object.entries(dailyStats)
            .map(([date, stats]) => ({ date, ...stats }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json({
            summary: {
                totalRequests,
                successRequests,
                errorRequests,
                successRate: totalRequests > 0 ? Math.round((successRequests / totalRequests) * 100) : 0,
                avgDurationMs: avgDuration,
            },
            dailyData,
            recentRequests: usageData?.slice(0, 50) || [],
        });
    } catch (error) {
        console.error('Error in GET /api/usage:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
