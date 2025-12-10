import React from 'react';

const GaugeWidget = ({ widget, value = 0 }) => {
    // Value normalization
    const min = widget.min || 0;
    const max = widget.max || 100;
    const val = Math.max(min, Math.min(max, value));

    // Geometry
    const size = 120;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 42;
    const strokeWidth = 12;

    // Angles: 0 is 3 o'clock (Right), 90 is 6 o'clock (Bottom)
    // We want gap at bottom. 
    // Start at 135 (Bottom Left), go clockwise to 405 (Bottom Right, which is 45)
    // 135 -> 405 is 270 degrees span.
    const startAngle = 135;
    const endAngle = 405;

    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        var angleInRadians = (angleInDegrees) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    const describeArc = (x, y, radius, startAngle, endAngle) => {
        var start = polarToCartesian(x, y, radius, endAngle);
        var end = polarToCartesian(x, y, radius, startAngle);

        var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        var d = [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");

        return d;
    }

    // Color logic
    const percentage = (val - min) / (max - min);
    const getColor = (pct) => {
        if (pct <= 0.33) return '#22c55e'; // Green
        if (pct <= 0.66) return '#06b6d4'; // Cyan
        return '#ef4444'; // Red
    };
    const color = getColor(percentage);

    // Calculate value arc end angle
    // Map percentage 0-1 to startAngle-endAngle
    const valueEndAngle = startAngle + (percentage * (endAngle - startAngle));

    return (
        <div className="gauge-widget">
            <div className="widget-label">{widget.label}</div>

            <div className="gauge-container" style={{ height: '140px' }}>
                <svg className="gauge-svg" viewBox={`0 0 ${size} ${size}`}>
                    {/* Background Track - Full Arc */}
                    <path
                        d={describeArc(cx, cy, radius, startAngle, endAngle)}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />

                    {/* Value Arc - Dynamic */}
                    <path
                        d={describeArc(cx, cy, radius, startAngle, valueEndAngle)}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        style={{
                            transition: 'd 0.5s ease-out, stroke 0.3s ease',
                            filter: `drop-shadow(0 0 6px ${color}60)`
                        }}
                    />

                    {/* Text */}
                    <g transform={`translate(${cx}, ${cy + 15})`}>
                        <text
                            textAnchor="middle"
                            y="0"
                            className="val-number"
                            style={{
                                fill: '#fff',
                                fontSize: '1.6rem',
                                fontWeight: '700',
                                fontFamily: 'monospace'
                            }}
                        >
                            {Math.round(val)}
                        </text>
                        <text
                            textAnchor="middle"
                            y="18"
                            className="val-range"
                            style={{ fill: '#888', fontSize: '0.7rem' }}
                        >
                            {min} - {max}
                        </text>
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default GaugeWidget;
