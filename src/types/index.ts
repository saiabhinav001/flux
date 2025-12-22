import { Node } from '@xyflow/react';

export type ExecutionStatus = 'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR';

export type FluxNodeType = 'trigger' | 'action' | 'condition' | 'log';

export interface FluxNodeData extends Record<string, unknown> {
    label: string;
    status: ExecutionStatus;
    lastRun?: string;
    output?: unknown;
    url?: string;
    method?: string;
    cron?: string;
}

export type FluxNode = Node<FluxNodeData>;

export interface PendingConnection {
    source: string;
    sourceHandle: string | null;
    target: string | null;
    targetHandle: string | null;
}

export interface Command {
    id: string;
    name: string;
    shortcut?: string[]; // e.g. ["⌘", "K"]
    action: () => void;
    group: 'General' | 'Canvas' | 'System';
}
