import React, { useState } from 'react';
import { LayoutDashboard, Plus, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';

const Sidebar = ({ onNewProject, projects = [], currentProject, onSelectProject }) => {
    const [projectsExpanded, setProjectsExpanded] = useState(false);

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="logo-box">
                <span className="logo">E</span>
            </div>

            {/* Navigation */}
            <nav className="nav-menu">
                {/* Dashboard */}
                <a href="#" className="nav-item active">
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </a>

                {/* My Projects - Collapsible */}
                <div style={{ width: '100%' }}>
                    <div
                        className="nav-item"
                        onClick={() => setProjectsExpanded(!projectsExpanded)}
                        style={{
                            cursor: 'pointer',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FolderOpen size={20} />
                            <span>My Projects</span>
                        </div>
                        {projectsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>

                    {/* Projects List */}
                    {projectsExpanded && (
                        <div style={{
                            paddingLeft: '32px',
                            paddingRight: '12px',
                            marginTop: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px'
                        }}>
                            {projects.length === 0 ? (
                                <div style={{
                                    color: '#666',
                                    fontSize: '0.85rem',
                                    padding: '8px',
                                    fontStyle: 'italic'
                                }}>
                                    No projects yet
                                </div>
                            ) : (
                                projects.map(project => (
                                    <div
                                        key={project.id}
                                        onClick={() => onSelectProject(project)}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            backgroundColor: currentProject?.id === project.id ? 'rgba(0, 224, 150, 0.1)' : 'transparent',
                                            borderLeft: currentProject?.id === project.id ? '3px solid #00e096' : '3px solid transparent',
                                            transition: 'all 0.2s',
                                            fontSize: '0.85rem',
                                            color: currentProject?.id === project.id ? '#00e096' : '#8b92a7',
                                            fontWeight: currentProject?.id === project.id ? '500' : '400',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (currentProject?.id !== project.id) {
                                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                                e.currentTarget.style.color = '#fff';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (currentProject?.id !== project.id) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = '#8b92a7';
                                            }
                                        }}
                                    >
                                        {project.name}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </nav>

            {/* New Project Button */}
            <div style={{ padding: '0 16px', marginTop: 'auto' }}>
                <button
                    onClick={onNewProject}
                    className="btn-primary"
                    style={{
                        width: '100%',
                        fontSize: '0.9rem',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <Plus size={18} />
                    <span>New Project</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
