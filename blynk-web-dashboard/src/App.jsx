import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardCanvas from './components/DashboardCanvas';
import CreateProjectModal from './components/CreateProjectModal';
import dataAnalytics from './utils/dataAnalytics';
import anomalyDetector from './utils/anomalyDetection';

function App() {
  // Load projects from localStorage or empty array
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentProject, setCurrentProject] = useState(() => {
    const savedProjectId = localStorage.getItem('currentProjectId');
    if (savedProjectId && projects.length > 0) {
      return projects.find(p => p.id === savedProjectId) || projects[0];
    }
    return null;
  });

  const [showCreateProject, setShowCreateProject] = useState(false);

  const [datastreams, setDatastreams] = useState({
    V0: 0,
    V1: 0,
    V2: 0,
    V3: 0,
    V4: 0,
    V5: 0
  });

  const [wsConnected, setWsConnected] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(false);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  // Save current project ID
  useEffect(() => {
    if (currentProject) {
      localStorage.setItem('currentProjectId', currentProject.id);
    }
  }, [currentProject]);

  const handleCreateProject = (newProject) => {
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
    setShowCreateProject(false);
  };

  const handleAddWidget = (newWidget) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      widgets: [...currentProject.widgets, newWidget]
    };

    setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p));
    setCurrentProject(updatedProject);
  };

  const handleRemoveWidget = (widgetId) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      widgets: currentProject.widgets.filter(w => w.id !== widgetId)
    };

    setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p));
    setCurrentProject(updatedProject);
  };

  const handleUpdateWidget = (updatedWidget) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      widgets: currentProject.widgets.map(w => w.id === updatedWidget.id ? updatedWidget : w)
    };

    setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p));
    setCurrentProject(updatedProject);
  };

  useEffect(() => {
    // Try to connect to WebSocket server
    let ws;
    let reconnectTimeout;

    const connect = () => {
      try {
        ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
          console.log('✅ Connected to WebSocket server');
          setWsConnected(true);
          // Identify as web client
          ws.send(JSON.stringify({ type: 'client' }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📥 Received data:', data);

            // Handle device connection status
            if (data.type === 'deviceStatus') {
              setDeviceConnected(data.deviceConnected);
              return;
            }

            // Update datastreams
            setDatastreams(prev => ({
              ...prev,
              ...data
            }));

            // Track data in AI analytics
            Object.keys(data).forEach(pin => {
              if (pin.startsWith('V')) {
                const value = parseFloat(data[pin]);
                dataAnalytics.addDataPoint(pin, value);

                // Detect anomalies
                if (currentProject) {
                  const widget = currentProject.widgets.find(w => w.pin === pin);
                  if (widget) {
                    anomalyDetector.detectAnomaly(pin, value, widget.label);
                  }
                }
              }
            });
          } catch (e) {
            console.error('Error parsing WebSocket message:', e);
          }
        };

        ws.onclose = () => {
          console.log('❌ Disconnected from WebSocket');
          setWsConnected(false);
          setDeviceConnected(false);
          // Try to reconnect after 5 seconds
          reconnectTimeout = setTimeout(connect, 5000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          ws.close();
        };
      } catch (e) {
        console.error('Failed to create WebSocket:', e);
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  const handleSelectProject = (project) => {
    setCurrentProject(project);
  };

  return (
    <>
      <Sidebar
        onNewProject={() => setShowCreateProject(true)}
        projects={projects}
        currentProject={currentProject}
        onSelectProject={handleSelectProject}
      />

      {currentProject ? (
        <DashboardCanvas
          project={currentProject}
          datastreams={datastreams}
          onAddWidget={handleAddWidget}
          onRemoveWidget={handleRemoveWidget}
          onUpdateWidget={handleUpdateWidget}
          wsConnected={deviceConnected}
          onNewProject={() => setShowCreateProject(true)}
        />
      ) : (
        <main className="dashboard-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem' }}>📋</div>
          <h2>Welcome to Eliyas IoT Dashboard</h2>
          <p style={{ color: '#888', maxWidth: '400px' }}>
            Get started by creating your first project. A project can contain multiple widgets that share a single auth token.
          </p>
          <button className="btn-primary" onClick={() => setShowCreateProject(true)}>
            Create New Project
          </button>
        </main>
      )}

      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onCreateProject={handleCreateProject}
      />
    </>
  );
}

export default App;
