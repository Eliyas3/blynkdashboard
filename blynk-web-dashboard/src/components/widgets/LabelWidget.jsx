import React from 'react';

const LabelWidget = ({ widget, value = 0 }) => {
    return (
        <div className="gauge-widget" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className="widget-label">{widget.label}</div>
            <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#fff',
                fontFamily: 'monospace',
                textAlign: 'center',
                padding: '20px'
            }}>
                {Math.round(value)}
            </div>
        </div>
    );
};

export default LabelWidget;
