// Anomaly Detection Engine using Z-score method

import dataAnalytics from './dataAnalytics';

export class AnomalyDetector {
    constructor(sensitivity = 2.0) {
        this.sensitivity = sensitivity; // Standard deviations threshold (default: 2σ = 95%)
        this.anomalies = [];
        this.maxAnomalyHistory = 100;
    }

    // Check if a value is an anomaly
    isAnomaly(pin, value) {
        const stats = dataAnalytics.getStats(pin);

        // Need at least 10 data points to detect anomalies
        if (stats.count < 10) {
            return false;
        }

        // Z-score calculation
        const zScore = Math.abs((value - stats.mean) / stats.stdDev);

        return zScore > this.sensitivity;
    }

    // Detect and log anomaly
    detectAnomaly(pin, value, label = '') {
        const isAnomalous = this.isAnomaly(pin, value);

        if (isAnomalous) {
            const anomaly = {
                pin,
                value,
                label,
                timestamp: Date.now(),
                stats: dataAnalytics.getStats(pin),
                severity: this.calculateSeverity(pin, value)
            };

            this.anomalies.push(anomaly);

            // Keep only recent anomalies
            if (this.anomalies.length > this.maxAnomalyHistory) {
                this.anomalies.shift();
            }

            return anomaly;
        }

        return null;
    }

    // Calculate severity (low, medium, high, critical)
    calculateSeverity(pin, value) {
        const stats = dataAnalytics.getStats(pin);
        const zScore = Math.abs((value - stats.mean) / stats.stdDev);

        if (zScore > 3.5) return 'critical';
        if (zScore > 3.0) return 'high';
        if (zScore > 2.5) return 'medium';
        return 'low';
    }

    // Get recent anomalies
    getRecentAnomalies(count = 10) {
        return this.anomalies.slice(-count).reverse();
    }

    // Get anomalies for specific pin
    getAnomaliesForPin(pin) {
        return this.anomalies.filter(a => a.pin === pin);
    }

    // Clear anomaly history
    clearAnomalies() {
        this.anomalies = [];
    }

    // Set sensitivity
    setSensitivity(value) {
        this.sensitivity = Math.max(1.0, Math.min(3.5, value));
    }
}

export default new AnomalyDetector();
