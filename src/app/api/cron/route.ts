import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    // 1. Security Check (Basic MVP)
    // In production, check Authorization header
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (key !== 'flux-secret-cron-key') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch Triggers
    const { data: nodes } = await supabase
        .from('nodes')
        .select('*')
        .eq('type', 'trigger');

    if (!nodes || nodes.length === 0) {
        return NextResponse.json({ message: 'No triggers found' });
    }

    // 3. Execute "Graph" (Simplified Server-Side Logic)
    // We manipulate the DB directly, and the Client (FluxCanvas) will see updates via Realtime.

    const results = [];

    for (const trigger of nodes) {
        // A. Set Trigger to RUNNING
        await updateNodeStatus(trigger.id, 'RUNNING');

        // B. Find connections (naive BFS)
        const { data: edges } = await supabase
            .from('edges')
            .select('*')
            .eq('source', trigger.id);

        // C. Wait simulated processing time
        await new Promise(r => setTimeout(r, 1000));
        await updateNodeStatus(trigger.id, 'SUCCESS');

        // D. Trigger Downstream Actions
        if (edges) {
            for (const edge of edges) {
                const targetId = edge.target;
                await updateNodeStatus(targetId, 'RUNNING');
                // Simulate Action Work (e.g. Fetch)
                await new Promise(r => setTimeout(r, 1500));
                await updateNodeStatus(targetId, 'SUCCESS');
            }
        }

        // E. Log Execution
        await supabase.from('execution_logs').insert({
            trigger_id: trigger.id,
            status: 'SUCCESS',
            logs: [`Executed trigger ${trigger.id}`]
        });

        results.push(trigger.id);
    }

    return NextResponse.json({ success: true, executed: results });
}

async function updateNodeStatus(id: string, status: string) {
    // We need to fetch current data first to merge, or use a jsonb update if supported easily.
    // For MVP, we'll just patch the data object assuming we know the structure.

    // First fetch to preserve other data
    const { data: current } = await supabase
        .from('nodes')
        .select('data')
        .eq('id', id)
        .single();

    if (current) {
        const newData = { ...current.data, status };
        await supabase
            .from('nodes')
            .update({ data: newData })
            .eq('id', id);
    }
}
