import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

export default function AnimatedEdge({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: 2, stroke: '#333' }} />
            {/* Animated Flow Overlay */}
            <circle r="3" fill="#00F0FF">
                <animateMotion dur="1.5s" repeatCount="indefinite" path={edgePath}>
                </animateMotion>
            </circle>
        </>
    );
}
