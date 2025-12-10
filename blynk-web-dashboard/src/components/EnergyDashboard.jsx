import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, DollarSign, AlertCircle, X } from 'lucide-react';
import energyOptimizer from '../utils/energyOptimizer';

const EnergyDashboard = ({ widgets, datastreams, isOpen, onClose }) => {
    const [efficiencyScore, setEfficiencyScore] = useState(0);
    const [powerConsumption, setPowerConsumption] = useState(0);
    const [cost, setCost] = useState(null);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const score = energyOptimizer.calculateEfficiencyScore(widgets, datastreams);
            const kWh = energyOptimizer.estimatePowerConsumption(widgets, datastreams);
            const costData = energyOptimizer.calculateCost(kWh);
            const recs = energyOptimizer.getRecommendations(widgets, datastreams);

            setEfficiencyScore(score);
            setPowerConsumption(kWh);
            setCost(costData);
            setRecommendations(recs);
        }
    }, [isOpen, widgets, datastreams]);

    const getScoreColor = (score) => {
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={24} style={{ color: '#f59e0b' }} />
                        <h2>Energy Optimization</h2>
                    </div>
                    <button className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '16px' }}>
                    {/* Efficiency Score */}
                    <div style={{
                        background: '#22252f',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.9rem', color: '#8b92a7', marginBottom: '12px' }}>
                            Efficiency Score
                        </div>
                        <div style={{
                            fontSize: '4rem',
                            fontWeight: '700',
                            color: getScoreColor(efficiencyScore),
                            marginBottom: '8px'
                        }}>
                            {efficiencyScore}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#8b92a7' }}>
                            {efficiencyScore >= 80 ? 'Excellent' : efficiencyScore >= 60 ? 'Good' : 'Needs Improvement'}
                        </div>
                    </div>

                    {/* Power Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '16px',
                        marginBottom: '24px'
                    }}>
                        {/* Daily Power */}
                        <div style={{
                            background: '#22252f',
                            borderRadius: '12px',
                            padding: '16px'
                        }}>
                            <Zap size={20} style={{ color: '#06b6d4', marginBottom: '8px' }} />
                            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#fff' }}>
                                {powerConsumption.toFixed(2)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#8b92a7' }}>kWh/day</div>
                        </div>

                        {/* Daily Cost */}
                        <div style={{
                            background: '#22252f',
                            borderRadius: '12px',
                            padding: '16px'
                        }}>
                            <DollarSign size={20} style={{ color: '#22c55e', marginBottom: '8px' }} />
                            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#fff' }}>
                                ${cost?.daily.toFixed(2)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#8b92a7' }}>Daily</div>
                        </div>

                        {/* Monthly Cost */}
                        <div style={{
                            background: '#22252f',
                            borderRadius: '12px',
                            padding: '16px'
                        }}>
                            <TrendingUp size={20} style={{ color: '#f59e0b', marginBottom: '8px' }} />
                            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#fff' }}>
                                ${cost?.monthly.toFixed(2)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#8b92a7' }}>Monthly</div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                        <h3 style={{
                            fontSize: '1.1rem',
                            color: '#fff',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <AlertCircle size={20} style={{ color: '#f59e0b' }} />
                            Optimization Recommendations
                        </h3>

                        {recommendations.length === 0 ? (
                            <div style={{
                                background: '#22252f',
                                borderRadius: '12px',
                                padding: '24px',
                                textAlign: 'center',
                                color: '#8b92a7'
                            }}>
                                <Zap size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                                <p>Great job! No optimization needed.</p>
                            </div>
                        ) : (
                            recommendations.map((rec, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: '#22252f',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        marginBottom: '12px',
                                        borderLeft: `4px solid ${rec.priority === 'high' ? '#ef4444' : '#f59e0b'}`
                                    }}
                                >
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: rec.priority === 'high' ? '#ef4444' : '#f59e0b',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        marginBottom: '6px'
                                    }}>
                                        {rec.type} • {rec.priority} priority
                                    </div>
                                    <div style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '8px' }}>
                                        {rec.message}
                                    </div>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        color: '#22c55e',
                                        fontWeight: '500'
                                    }}>
                                        💰 Potential Savings: {rec.potentialSavings}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Rate Info */}
                    <div style={{
                        marginTop: '24px',
                        padding: '12px',
                        background: 'rgba(6, 182, 212, 0.1)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#8b92a7'
                    }}>
                        Current Rate: <span style={{ color: '#06b6d4', fontWeight: '600' }}>
                            {cost?.rate === 'peak' ? 'Peak ($0.15/kWh)' : 'Off-Peak ($0.08/kWh)'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnergyDashboard;
