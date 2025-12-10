import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Zap, X } from 'lucide-react';
import aiInsights from '../utils/aiInsights';

const AIInsightsPanel = ({ widgets, datastreams, isOpen, onClose }) => {
    const [insights, setInsights] = useState([]);
    const [filter, setFilter] = useState('all'); // all, status, trend, prediction, anomaly

    useEffect(() => {
        if (isOpen) {
            const generated = aiInsights.generateInsights(widgets, datastreams);
            setInsights(generated);
        }
    }, [isOpen, widgets, datastreams]);

    const filteredInsights = filter === 'all'
        ? insights
        : insights.filter(i => i.type === filter);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'normal': return '#06b6d4';
            case 'low': return '#8b92a7';
            default: return '#8b92a7';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lightbulb size={24} style={{ color: '#00e096' }} />
                        <h2>AI Insights</h2>
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
                    {['all', 'status', 'trend', 'prediction', 'anomaly'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: filter === f ? 'rgba(0, 224, 150, 0.1)' : 'transparent',
                                color: filter === f ? '#00e096' : '#8b92a7',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                textTransform: 'capitalize',
                                transition: 'all 0.2s'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Insights List */}
                <div style={{
                    padding: '16px',
                    maxHeight: '500px',
                    overflowY: 'auto'
                }}>
                    {filteredInsights.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: '#8b92a7'
                        }}>
                            <Lightbulb size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                            <p>No insights available yet. Data is being collected...</p>
                        </div>
                    ) : (
                        filteredInsights.map((insight, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '16px',
                                    marginBottom: '12px',
                                    borderRadius: '12px',
                                    background: '#22252f',
                                    borderLeft: `4px solid ${getPriorityColor(insight.priority)}`,
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px'
                                }}>
                                    <span style={{ fontSize: '1.5rem' }}>{insight.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: getPriorityColor(insight.priority),
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            marginBottom: '4px'
                                        }}>
                                            {insight.type}
                                        </div>
                                        <div style={{
                                            fontSize: '0.95rem',
                                            color: '#fff',
                                            marginBottom: '4px'
                                        }}>
                                            {insight.text}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#8b92a7' }}>
                                            {insight.label} ({insight.pin})
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIInsightsPanel;
