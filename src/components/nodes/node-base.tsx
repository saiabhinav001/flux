import { ReactNode } from 'react';
import { Handle, Position } from '@xyflow/react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { ExecutionStatus } from '@/types';

interface NodeBaseProps {
    selected?: boolean;
    title: string;
    icon?: ReactNode;
    status?: ExecutionStatus;
    children?: ReactNode;
    headerColor?: string;
    showInputHandle?: boolean;
    showOutputHandle?: boolean;
}

export const NodeBase = ({
    selected,
    title,
    icon,
    status = 'IDLE',
    children,
    headerColor = 'text-gray-200',
    showInputHandle = true,
    showOutputHandle = true,
}: NodeBaseProps) => {
    const statusColors = {
        IDLE: 'border-white/10 shadow-none',
        RUNNING: 'border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.3)]',
        SUCCESS: 'border-green-500/50 shadow-[0_0_20px_rgba(0,255,148,0.3)]',
        ERROR: 'border-red-500/50 shadow-[0_0_20px_rgba(255,50,50,0.3)]',
    };

    return (
        <motion.div
            layout
            transition={{ duration: 0.2 }}
            className={clsx(
                "relative min-w-[280px] rounded-xl bg-[#0A0A0A]/90 backdrop-blur-xl border transition-all duration-300",
                selected ? "border-white/40 ring-1 ring-white/20" : statusColors[status]
            )}
        >
            {/* Handles */}
            {showInputHandle && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className="!w-3 !h-3 !-top-1.5 !bg-gray-600 !border-2 !border-[#0A0A0A] transition-colors hover:!bg-cyan-400"
                />
            )}

            {/* Header */}
            <div className="flex items-center gap-2 p-3 border-b border-white/5 bg-white/5 rounded-t-xl">
                {icon && <span className="opacity-80">{icon}</span>}
                <span className={clsx("text-sm font-semibold tracking-wide", headerColor)}>
                    {title}
                </span>
                {status === 'RUNNING' && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
            </div>

            {/* Body */}
            <div className="p-3">
                {children}
            </div>

            {showOutputHandle && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="!w-3 !h-3 !-bottom-1.5 !bg-gray-600 !border-2 !border-[#0A0A0A] transition-colors hover:!bg-cyan-400"
                />
            )}
        </motion.div>
    );
};
