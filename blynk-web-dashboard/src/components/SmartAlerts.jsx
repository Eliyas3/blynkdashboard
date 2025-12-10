import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';
import anomalyDetector from '../utils/anomalyDetection';

const SmartAlerts = ({ widgets, isOpen, onClose }) => {
    const [alerts, setAlerts] = useState([]);
    const [filter, setFilter] = useState('all'); // all, critical, high, medium, low

    useEffect(() => {
        const anomalies = anomalyDetector.getRecentAnomalies(50);
        const formattedAlerts = anomalies.map(a => ({
            ...a,
            widgetLabel: widgets.find(w => w.pin === a.pin)?.label || a.pin,
            message: `Unusual reading: ${a.value.toFixed(1)} (expected: ${a.stats.mean.toFixed(1)})`
        }));
        setAlerts(formattedAlerts);
    }, [isOpen, widgets]);

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical': return <AlertTriangle size={20} color="#ef4444" />;
            case 'high': return <AlertCircle size={20} color="#f59e0b" />;
            case 'medium': return <Info size={20} color="#06b6d4" />;
            default: return <CheckCircle size={20} color="#22c55e" />;
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return '#ef4444';
            case 'high': return '#f59e0b';
            case 'medium': return '#06b6d4';
            default: return '#22c55e';
        }
    };

    const filteredAlerts = filter === 'all'
        ? alerts
        : alerts.filter(a => a.severity === filter);

    const getTimeAgo = (timestamp) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return `${seconds}s ago`;
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bell size={24} style={{ color: '#f59e0b' }} />
                        <h2>Smart Alerts</h2>
                        {alerts.length > 0 && (
                            <span style={{
                                background: '#ef4444',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                            }}>
                                {alerts.length}
                            </span>
                        )}
                    </div>
                    <button className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Filter Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '16px',
                    borderBottom: '1px solid #2a2d3a',
                    flexWrap: 'wrap'
                }}>
                    {['all', 'critical', 'high', 'medium', 'low'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: filter === f ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                                color: filter === f ? '#f59e0b' : '#8b92a7',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                textTransform: 'capitalize'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Alerts List */}
                <div style={{
                    padding: '16px',
                    maxHeight: '500px',
                    overflowY: 'auto'
                }}>
                    {filteredAlerts.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: '#8b92a7'
                        }}>
                            <CheckCircle size={48} style={{ opacity: 0.3, marginBottom: '16px', color: '#22c55e' }} />
                            <p>No alerts! Everything is normal.</p>
                        </div>
                    ) : (
                        filteredAlerts.map((alert, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '16px',
                                    marginBottom: '12px',
                                    borderRadius: '12px',
                                    background: '#22252f',
                                    borderLeft: `4px solid ${getSeverityColor(alert.severity)}`
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    {getSeverityIcon(alert.severity)}
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '0.95rem',
                                            color: '#fff',
                                            marginBottom: '4px',
                                            fontWeight: '500'
                                        }}>
                                            {alert.widgetLabel}
                                        </div>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: '#8b92a7',
                                            marginBottom: '8px'
                                        }}>
                                            {alert.message}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '0.8rem',
                                            color: '#5a5f73'
                                        }}>
                                            <span>{getTimeAgo(alert.timestamp)}</span>
                                            <span style={{
                                                textTransform: 'uppercase',
                                                color: getSeverityColor(alert.severity),
                                                fontWeight: '600'
                                            }}>
                                                {alert.severity}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {alerts.length > 0 && (
                    <div style={{
                        padding: '16px',
                        borderTop: '1px solid #2a2d3a',
                        textAlign: 'center'
                    }}>
                        <button
                            onClick={() => {
                                anomalyDetector.clearAnomalies();
                                setAlerts([]);
                            }}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Clear All Alerts
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartAlerts;
