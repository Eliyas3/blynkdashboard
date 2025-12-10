import React, { useState } from 'react';
import GaugeWidget from './widgets/GaugeWidget';
import LabelWidget from './widgets/LabelWidget';
import LEDWidget from './widgets/LEDWidget';
import ChartWidget from './widgets/ChartWidget';
import AddWidgetModal from './AddWidgetModal';
import EditWidgetModal from './EditWidgetModal';
import ProjectAuthModal from './ProjectAuthModal';
import AIInsightsPanel from './AIInsightsPanel';
import SmartAlerts from './SmartAlerts';
import EnergyDashboard from './EnergyDashboard';
import AIChatbot from './AIChatbot';
import { Plus, Settings, Trash2, Download, Edit, Wifi, WifiOff, Save, Check, Lightbulb, Bell, Zap } from 'lucide-react';

const DashboardCanvas = ({ project, datastreams, onAddWidget, onRemoveWidget, onUpdateWidget, wsConnected, onNewProject }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingWidget, setEditingWidget] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [projectSaved, setProjectSaved] = useState(false);
    const [showAIInsights, setShowAIInsights] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const [showEnergy, setShowEnergy] = useState(false);

    const handleEditWidget = (widget) => {
        setEditingWidget(widget);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = (updatedWidget) => {
        onUpdateWidget(updatedWidget);
        setIsEditModalOpen(false);
        setEditingWidget(null);
    };

    const handleExportCsv = () => {
        window.location.href = 'http://localhost:8080/export-csv';
    };

    const handleSaveProject = () => {
        setShowAuthModal(true);
        setProjectSaved(true);
        // Reset the saved state after 2 seconds
        setTimeout(() => {
            setProjectSaved(false);
        }, 2000);
    };

    const renderWidget = (w) => {
        const val = datastreams[w.pin] !== undefined ? datastreams[w.pin] : 0;

        switch (w.type) {
            case 'Gauge':
                return <GaugeWidget widget={w} value={val} />;
            case 'Label':
                return <LabelWidget widget={w} value={val} />;
            case 'LED':
                return <LEDWidget widget={w} value={val} />;
            case 'Chart':
                return <ChartWidget widget={w} value={val} />;
            default:
                return (
                    <div className="gauge-widget" style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <div className="widget-label">{w.label || 'Unknown Widget'}</div>
                        <div style={{ padding: '20px', color: '#888', textAlign: 'center' }}>
                            Widget type "{w.type}" not supported yet
                        </div>
                    </div>
                );
        }
    };

    return (
        <main className="dashboard-container">

            {/* Header */}
            <header className="dashboard-header">
                <div className="device-info">
                    <div className="device-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 4h4v3h-4V4zm10 16H4V9h16v11z" fill="currentColor" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="project-title">{project.name}</h1>
                        <div className="status-badge">
                            <span className="status-dot"></span>
                            <span>Active • {project.widgets.length} Widget{project.widgets.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>
                <div className="header-actions">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: wsConnected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${wsConnected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        marginRight: '12px'
                    }}>
                        {wsConnected ? (
                            <Wifi size={18} style={{ color: '#22c55e' }} />
                        ) : (
                            <WifiOff size={18} style={{ color: '#ef4444' }} />
                        )}
                        <span style={{
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            color: wsConnected ? '#22c55e' : '#ef4444'
                        }}>
                            {wsConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                    <button className="btn-secondary" onClick={handleExportCsv} title="Download Sensor Data">
                        <Download size={18} style={{ marginRight: '6px' }} />
                        Export CSV
                    </button>
                    <button className="btn-secondary" onClick={() => setShowAIInsights(true)} title="AI Insights">
                        <Lightbulb size={18} style={{ marginRight: '6px' }} />
                        AI Insights
                    </button>
                    <button className="btn-secondary" onClick={() => setShowAlerts(true)} title="Smart Alerts">
                        <Bell size={18} style={{ marginRight: '6px' }} />
                        Alerts
                    </button>
                    <button className="btn-secondary" onClick={() => setShowEnergy(true)} title="Energy Optimization">
                        <Zap size={18} style={{ marginRight: '6px' }} />
                        Energy
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleSaveProject}
                        title="Save and get project auth token"
                        style={{
                            backgroundColor: projectSaved ? '#22c55e' : undefined,
                            borderColor: projectSaved ? '#22c55e' : undefined,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {projectSaved ? (
                            <>
                                <Check size={18} style={{ marginRight: '6px' }} />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save size={18} style={{ marginRight: '6px' }} />
                                Save Project
                            </>
                        )}
                    </button>
                    <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={18} style={{ marginRight: '6px' }} />
                        Add Widget
                    </button>
                </div>
            </header>

            {/* Widget Grid */}
            <div className="widget-grid">
                {project.widgets.map(w => (
                    <div key={w.id} className="widget-wrapper">
                        {renderWidget(w)}
                        <div className="widget-actions">
                            <button
                                className="widget-action-btn"
                                onClick={() => handleEditWidget(w)}
                                title="Edit widget"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                className="widget-action-btn delete"
                                onClick={() => onRemoveWidget(w.id)}
                                title="Delete widget"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

            </div>

            {/* Modals */}
            <AddWidgetModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddWidget={onAddWidget}
            />

            <EditWidgetModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                widget={editingWidget}
                onSave={handleSaveEdit}
            />

            <ProjectAuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                project={project}
            />

            <AIInsightsPanel
                widgets={project.widgets}
                datastreams={datastreams}
                isOpen={showAIInsights}
                onClose={() => setShowAIInsights(false)}
            />

            <SmartAlerts
                widgets={project.widgets}
                isOpen={showAlerts}
                onClose={() => setShowAlerts(false)}
            />

            <EnergyDashboard
                widgets={project.widgets}
                datastreams={datastreams}
                isOpen={showEnergy}
                onClose={() => setShowEnergy(false)}
            />

            <AIChatbot
                widgets={project.widgets}
                datastreams={datastreams}
                project={project}
            />

        </main>
    );
};

export default DashboardCanvas;
