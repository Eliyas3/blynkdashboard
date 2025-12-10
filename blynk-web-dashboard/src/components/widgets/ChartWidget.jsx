import React from 'react';

const ChartWidget = ({ widget, value = 0 }) => {
    return (
        <div className="gauge-widget" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className="widget-label">{widget.label}</div>
            <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#888'
            }}>
                <svg width="200" height="100" viewBox="0 0 200 100">
                    <polyline
                        points="10,80 40,60 70,70 100,40 130,50 160,30 190,45"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2"
                    />
                </svg>
                <div style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                    Current: {Math.round(value)}
                </div>
            </div>
        </div>
    );
};

export default ChartWidget;
