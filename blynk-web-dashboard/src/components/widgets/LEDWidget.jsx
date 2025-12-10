import React from 'react';

const LEDWidget = ({ widget, value = 0 }) => {
    // LED is on if value > 0
    const isOn = value > 0;
    const ledColor = isOn ? '#22c55e' : '#333';

    return (
        <div className="gauge-widget" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className="widget-label">{widget.label}</div>
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: ledColor,
                boxShadow: isOn ? `0 0 20px ${ledColor}` : 'none',
                transition: 'all 0.3s ease',
                margin: '20px auto'
            }} />
            <div style={{
                fontSize: '1rem',
                color: '#888',
                textAlign: 'center'
            }}>
                {isOn ? 'ON' : 'OFF'}
            </div>
        </div>
    );
};

export default LEDWidget;
