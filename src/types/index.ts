import { Node, Edge } from '@xyflow/react';

export type ExecutionStatus = 'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR';

export type FluxNodeType = 'trigger' | 'action' | 'condition' | 'log';

export interface FluxNodeData extends Record<string, unknown> {
    label: string;
    status: ExecutionStatus;
    lastRun?: string;
    output?: unknown;
}

export type FluxNode = Node<FluxNodeData>;

export interface Command {
    id: string;
    name: string;
    shortcut?: string[]; // e.g. ["⌘", "K"]
    action: () => void;
    group: 'General' | 'Canvas' | 'System';
}
