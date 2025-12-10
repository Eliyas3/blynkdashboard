import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddDeviceModal = ({ isOpen, onClose, onAddDevice }) => {
    const [deviceName, setDeviceName] = useState('');
    const [sensorType, setSensorType] = useState('temperature');
    const [widgetType, setWidgetType] = useState('gauge');
    const [pinNumber, setPinNumber] = useState('V0');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!deviceName.trim()) {
            alert('Please enter a device name');
            return;
        }

        // Generate unique device ID
        const deviceId = generateDeviceId();

        const newWidget = {
            id: `w_${Date.now()}`,
            type: widgetType === 'gauge' ? 'Gauge' : 'Chart',
            label: deviceName,
            pin: pinNumber,
            min: sensorType === 'temperature' ? -10 : 0,
            max: sensorType === 'temperature' ? 50 : sensorType === 'humidity' ? 100 : 1000,
            deviceId: deviceId,
            sensorType: sensorType
        };

        onAddDevice(newWidget);

        // Reset form
        setDeviceName('');
        setSensorType('temperature');
        setWidgetType('gauge');
        setPinNumber('V0');
    };

    const generateDeviceId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        for (let i = 0; i < 20; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Device</h2>
                    <button className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Device Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Living Room Sensor"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            className="form-input"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Sensor Type</label>
                        <select
                            value={sensorType}
                            onChange={(e) => setSensorType(e.target.value)}
                            className="form-select"
                        >
                            <option value="temperature">Temperature (°C)</option>
                            <option value="humidity">Humidity (%)</option>
                            <option value="pressure">Pressure (hPa)</option>
                            <option value="light">Light (lux)</option>
                            <option value="gas">Gas (ppm)</option>
                            <option value="motion">Motion</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Widget Type</label>
                        <select
                            value={widgetType}
                            onChange={(e) => setWidgetType(e.target.value)}
                            className="form-select"
                        >
                            <option value="gauge">Gauge (Circular)</option>
                            <option value="chart">Chart (Coming Soon)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Virtual Pin</label>
                        <select
                            value={pinNumber}
                            onChange={(e) => setPinNumber(e.target.value)}
                            className="form-select"
                        >
                            <option value="V0">V0</option>
                            <option value="V1">V1</option>
                            <option value="V2">V2</option>
                            <option value="V3">V3</option>
                            <option value="V4">V4</option>
                            <option value="V5">V5</option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Create Device
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDeviceModal;
