import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

const DeviceCredentialsModal = ({ isOpen, onClose, widget }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !widget) return null;

    const handleCopy = () => {
        // Now copies the deviceId (Auth Token) directly
        navigator.clipboard.writeText(widget.deviceId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content credentials-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Device Credentials</h2>
                    <button className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="credentials-content">
                    <div className="credential-item">
                        <label>Device Name</label>
                        <div className="credential-value">{widget.label}</div>
                    </div>

                    <div className="credential-item">
                        <label>Auth Token (Device ID)</label>
                        <div className="credential-value device-id-box">
                            {widget.deviceId}
                            <button className="btn-copy-inline" onClick={handleCopy} title="Copy to clipboard">
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                        {copied && <span className="copy-success">✓ Copied to clipboard!</span>}
                    </div>

                    <div className="credential-item">
                        <label>Virtual Pin</label>
                        <div className="credential-value">{widget.pin}</div>
                    </div>

                    <div className="credential-item">
                        <label>Sensor Type</label>
                        <div className="credential-value">{widget.sensorType || 'Custom'}</div>
                    </div>

                    <div className="info-box">
                        <strong>📋 How to Use:</strong>
                        <ol>
                            <li>Copy the <strong>Auth Token</strong> above</li>
                            <li>Open your Arduino code</li>
                            <li>Paste it in the <code>deviceId</code> variable</li>
                            <li>Upload to ESP8266/ESP32</li>
                        </ol>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-primary" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeviceCredentialsModal;
