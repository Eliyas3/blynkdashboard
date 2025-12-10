import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddWidgetModal = ({ isOpen, onClose, onAddWidget }) => {
    const [formData, setFormData] = useState({
        label: '',
        type: 'Gauge',
        pin: 'V0',
        min: 0,
        max: 100
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'min' || name === 'max' ? Number(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newWidget = {
            id: `w_${Date.now()}`,
            ...formData
        };

        onAddWidget(newWidget);
        setFormData({ label: '', type: 'Gauge', pin: 'V0', min: 0, max: 100 });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Add Widget</h2>
                    <button className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Widget Label *</label>
                        <input
                            type="text"
                            name="label"
                            className="form-input"
                            value={formData.label}
                            onChange={handleChange}
                            placeholder="e.g. Temperature"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Widget Type</label>
                        <select
                            name="type"
                            className="form-select"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="Gauge">Gauge</option>
                            <option value="Label">Label</option>
                            <option value="LED">LED</option>
                            <option value="Chart">Chart</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Datastream Pin</label>
                        <select
                            name="pin"
                            className="form-select"
                            value={formData.pin}
                            onChange={handleChange}
                        >
                            <option value="V0">V0</option>
                            <option value="V1">V1</option>
                            <option value="V2">V2</option>
                            <option value="V3">V3</option>
                            <option value="V4">V4</option>
                            <option value="V5">V5</option>
                        </select>
                    </div>

                    {formData.type === 'Gauge' && (
                        <>
                            <div className="form-group">
                                <label>Min Value</label>
                                <input
                                    type="number"
                                    name="min"
                                    className="form-input"
                                    value={formData.min}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Max Value</label>
                                <input
                                    type="number"
                                    name="max"
                                    className="form-input"
                                    value={formData.max}
                                    onChange={handleChange}
                                />
                            </div>
                        </>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Add Widget
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddWidgetModal;
