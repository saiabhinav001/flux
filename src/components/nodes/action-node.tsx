import { NodeProps } from '@xyflow/react';
import { Activity, Globe, Database } from 'lucide-react';
import { NodeBase } from './node-base';
import { FluxNode } from '@/types';

export function ActionNode({ data, selected }: NodeProps<FluxNode>) {
    return (
        <NodeBase
            title={data.label}
            icon={<Globe className="w-4 h-4 text-violet-400" />}
            status={data.status}
            selected={selected}
            headerColor="text-violet-400"
        >
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-mono">Method</span>
                    <span className={`text-xs font-mono ${data.method === 'DELETE' ? 'text-red-400' : 'text-green-400'}`}>
                        {data.method as string || 'GET'}
                    </span>
                </div>
                <div className="text-sm text-gray-300 font-mono bg-black/20 p-2 rounded border border-white/5 truncate">
                    {data.url as string || 'https://api.example.com'}
                </div>
            </div>
        </NodeBase>
    );
}
