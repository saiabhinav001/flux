import { NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { NodeBase } from './node-base';
import { FluxNode } from '@/types';

export function TriggerNode({ data, selected }: NodeProps<FluxNode>) {
    return (
        <NodeBase
            title={data.label}
            icon={<Zap className="w-4 h-4 text-cyan-400" />}
            status={data.status}
            selected={selected}
            headerColor="text-cyan-400"
            showInputHandle={false} // Triggers start the flow
        >
            <div className="space-y-2">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-mono">
                    Trigger
                </div>
                <div className="text-sm text-gray-300 font-mono bg-black/20 p-2 rounded border border-white/5">
                    {data.triggerType === 'cron' ? (data.cron as string || '*/5 * * * *') : 'Manual Invocation'}
                </div>
            </div>
        </NodeBase>
    );
}
