import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { FluxEngine } from '@/lib/server/engine';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        // 1. Auth Check (Standardized)

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const supabase = createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY,
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Body
        const { nodes, edges } = await request.json();

        if (!nodes || !edges) {
            return NextResponse.json({ error: 'Invalid Graph Data' }, { status: 400 });
        }

        // 3. Run Engine
        const engine = new FluxEngine(nodes, edges);
        const results = await engine.execute();

        // 4. Persist Logs
        // We insert a master record or individual steps?
        // Schema has `execution_logs` with `details` jsonb. Perfect for storing the whole array.

        const { error: dbError } = await supabase.from('execution_logs').insert({
            user_id: user.id,
            trigger_type: 'MANUAL', // For now
            status: results.some(r => r.status === 'ERROR') ? 'ERROR' : 'SUCCESS',
            details: results
        });

        if (dbError) {
            console.error('Failed to save logs:', dbError);
            // Don't fail the request, just warn
        }

        return NextResponse.json({ results });

    } catch (e: unknown) {
        console.error("Execution API Error:", e);
        const message = e instanceof Error ? e.message : 'Unknown Execution Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
