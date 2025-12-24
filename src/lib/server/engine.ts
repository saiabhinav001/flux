import { FluxNode, ExecutionStatus } from '@/types';

// We redefine Edge slightly to avoid importing @xyflow/react on server if possible,
// but for now let's just use a compatible minimal interface.
interface SimpleEdge {
    id: string;
    source: string;
    target: string;
}

export interface ExecutionResult {
    nodeId: string;
    nodeLabel: string;
    status: ExecutionStatus;
    output?: unknown;
    error?: string;
    timestamp: string;
}

export class FluxEngine {
    private nodes: Map<string, FluxNode>;
    private edges: SimpleEdge[];
    private executionLog: ExecutionResult[] = [];

    constructor(nodes: FluxNode[], edges: SimpleEdge[]) {
        this.nodes = new Map(nodes.map(n => [n.id, n]));
        this.edges = edges;
    }

    /**
     * core execution method: Topo sort -> Execute one by one
     */
    async execute(): Promise<ExecutionResult[]> {
        const sortedNodes = this.topologicalSort();

        // If cycle detected or empty
        if (!sortedNodes) {
            console.error("Cycle detected or empty graph");
            return [];
        }

        const context: Record<string, unknown> = {}; // Store outputs: { nodeId: output }

        for (const nodeId of sortedNodes) {
            const node = this.nodes.get(nodeId);
            if (!node) continue;

            const result = await this.processNode(node);
            this.executionLog.push(result);

            // Store output for children
            if (result.status === 'SUCCESS') {
                context[nodeId] = result.output;
            } else if (result.status === 'ERROR') {
                // If a node fails, should we stop? For now, yes, or skip dependents.
                // Let's break for simplicity in v1.
                break;
            }
        }

        return this.executionLog;
    }

    private topologicalSort(): string[] | null {
        const inDegree = new Map<string, number>();
        const adj = new Map<string, string[]>();

        // Initialize
        for (const nodeId of this.nodes.keys()) {
            inDegree.set(nodeId, 0);
            adj.set(nodeId, []);
        }

        // Build Graph
        for (const edge of this.edges) {
            if (!this.nodes.has(edge.source) || !this.nodes.has(edge.target)) continue;

            adj.get(edge.source)?.push(edge.target);
            inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
        }

        // Queue for 0 in-degree
        const queue: string[] = [];
        for (const [nodeId, deg] of inDegree.entries()) {
            if (deg === 0) queue.push(nodeId);
        }

        const result: string[] = [];
        while (queue.length > 0) {
            const u = queue.shift()!;
            result.push(u);

            const neighbors = adj.get(u) || [];
            for (const v of neighbors) {
                inDegree.set(v, (inDegree.get(v) || 0) - 1);
                if (inDegree.get(v) === 0) {
                    queue.push(v);
                }
            }
        }

        if (result.length !== this.nodes.size) {
            return null; // Cycle detected
        }

        return result;
    }

    private async processNode(node: FluxNode): Promise<ExecutionResult> {
        const start = new Date().toISOString();

        try {
            let output: unknown = null;

            switch (node.type) {
                case 'trigger':
                    // Triggers just pass through in manual flow
                    output = { manual: true, time: start };
                    break;

                case 'action':
                    // Assume it's an HTTP Request if url is present
                    // We need to parse previous node outputs if we implement variable substitution later.
                    // For now, straight fetch.
                    if (node.data.url && node.data.method) {
                        const response = await fetch(node.data.url as string, {
                            method: node.data.method as string,
                            headers: { 'Content-Type': 'application/json' },
                            // body: node.data.body // TODO: Implement body
                        });

                        const contentType = response.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            output = await response.json();
                        } else {
                            output = await response.text();
                        }

                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}: ${JSON.stringify(output)}`);
                        }
                    } else {
                        // Generic action / placeholder
                        output = { message: "Executed successfully (Mock)" };
                        // Simulate delay
                        await new Promise(r => setTimeout(r, 500));
                    }
                    break;

                default:
                    output = {};
            }

            return {
                nodeId: node.id,
                nodeLabel: node.data.label as string,
                status: 'SUCCESS',
                output,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                nodeId: node.id,
                nodeLabel: node.data.label as string,
                status: 'ERROR',
                error: errorMessage,
                timestamp: new Date().toISOString()
            };
        }
    }
}
