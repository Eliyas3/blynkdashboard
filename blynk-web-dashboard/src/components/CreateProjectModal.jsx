import React, { useState } from 'react';
import { X } from 'lucide-react';

const CreateProjectModal = ({ isOpen, onClose, onCreateProject }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        connectionType: 'WiFi'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newProject = {
            id: `proj_${Date.now()}`,
            name: formData.name,
            description: formData.description,
            connectionType: formData.connectionType,
            authToken: `${Math.random().toString(36).slice(2, 12)}${Math.random().toString(36).slice(2, 12)}`.toUpperCase(),
            widgets: [],
            createdAt: new Date().toISOString()
        };

        onCreateProject(newProject);
        setFormData({ name: '', description: '', connectionType: 'WiFi' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Create New Project</h2>
                    <button className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Project Name *</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Smart Home Monitor"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            name="description"
                            className="form-input"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Optional description"
                        />
                    </div>

                    <div className="form-group">
                        <label>Connection Type</label>
                        <select
                            name="connectionType"
                            className="form-select"
                            value={formData.connectionType}
                            onChange={handleChange}
                        >
                            <option value="WiFi">WiFi</option>
                            <option value="Ethernet">Ethernet</option>
                            <option value="Cellular">Cellular</option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;
