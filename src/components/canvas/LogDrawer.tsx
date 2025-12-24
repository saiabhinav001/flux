
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, CheckCircle2, XCircle, Clock, ChevronRight, ChevronDown } from 'lucide-react'; // Replaced CheckCircle with CheckCircle2
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface LogDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ExecutionLog {
    id: string;
    status: 'SUCCESS' | 'ERROR';
    trigger_type: string;
    details: Record<string, unknown>;
    created_at: string;
}

export function LogDrawer({ isOpen, onClose }: LogDrawerProps) {
    const [logs, setLogs] = useState<ExecutionLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('execution_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching logs:', error);
        }

        if (data) setLogs(data as unknown as ExecutionLog[]);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            fetchLogs();

            // Subscribe for real-time
            const channel = supabase
                .channel('realtime-logs')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'execution_logs' }, (payload) => {
                    const newLog = payload.new as unknown as ExecutionLog;
                    setLogs(prev => [newLog, ...prev]);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [isOpen, fetchLogs]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0A0A0A]">
                            <div className="flex items-center gap-2 text-white font-semibold">
                                <Terminal className="w-5 h-5 text-cyan-400" />
                                <span>System Logs</span>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {loading && logs.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">Loading traces...</div>
                            ) : logs.length === 0 ? (
                                <div className="text-center text-gray-500 py-10 flex flex-col items-center gap-2">
                                    <Clock className="w-8 h-8 opacity-20" />
                                    <p>No execution history found.</p>
                                </div>
                            ) : (
                                logs.map(log => (
                                    <LogItem
                                        key={log.id}
                                        log={log}
                                        expanded={selectedLogId === log.id}
                                        onToggle={() => setSelectedLogId(selectedLogId === log.id ? null : log.id)}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function LogItem({ log, expanded, onToggle }: { log: ExecutionLog, expanded: boolean, onToggle: () => void }) {
    const isSuccess = log.status === 'SUCCESS';

    return (
        <div className="border border-white/5 rounded-lg bg-white/[0.02] overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <div>
                        <div className="text-sm font-medium text-white flex items-center gap-2">
                            {log.trigger_type} Execution
                            {isSuccess ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400 border border-green-500/20">OK</span>
                            ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">FAIL</span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </div>
                    </div>
                </div>
                {expanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
            </button>

            {expanded && (
                <div className="p-3 border-t border-white/5 bg-black/20">
                    <pre className="text-[10px] font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(log.details, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
