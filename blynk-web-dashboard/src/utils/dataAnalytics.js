// Data Analytics Utility Functions

export class DataAnalytics {
    constructor() {
        this.history = {
            V0: [],
            V1: [],
            V2: [],
            V3: [],
            V4: [],
            V5: []
        };
        this.maxHistorySize = 1000; // Keep last 1000 data points
    }

    // Add new data point
    addDataPoint(pin, value, timestamp = Date.now()) {
        if (!this.history[pin]) {
            this.history[pin] = [];
        }

        this.history[pin].push({ value, timestamp });

        // Keep only last maxHistorySize points
        if (this.history[pin].length > this.maxHistorySize) {
            this.history[pin].shift();
        }
    }

    // Get statistics for a pin
    getStats(pin, timeWindow = null) {
        let data = this.history[pin] || [];

        // Filter by time window if specified (in milliseconds)
        if (timeWindow) {
            const cutoff = Date.now() - timeWindow;
            data = data.filter(d => d.timestamp >= cutoff);
        }

        if (data.length === 0) {
            return { count: 0, mean: 0, min: 0, max: 0, stdDev: 0 };
        }

        const values = data.map(d => d.value);
        const count = values.length;
        const mean = values.reduce((a, b) => a + b, 0) / count;
        const min = Math.min(...values);
        const max = Math.max(...values);

        // Standard deviation
        const squareDiffs = values.map(v => Math.pow(v - mean, 2));
        const variance = squareDiffs.reduce((a, b) => a + b, 0) / count;
        const stdDev = Math.sqrt(variance);

        return { count, mean, min, max, stdDev };
    }

    // Get data for specific time range
    getDataInRange(pin, startTime, endTime) {
        const data = this.history[pin] || [];
        return data.filter(d => d.timestamp >= startTime && d.timestamp <= endTime);
    }

    // Get recent data points
    getRecentData(pin, count = 10) {
        const data = this.history[pin] || [];
        return data.slice(-count);
    }

    // Calculate trend (positive = increasing, negative = decreasing)
    getTrend(pin, windowSize = 10) {
        const recent = this.getRecentData(pin, windowSize);
        if (recent.length < 2) return 0;

        const values = recent.map(d => d.value);
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));

        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        return avgSecond - avgFirst;
    }

    // Get all history
    getAllHistory() {
        return this.history;
    }

    // Clear history
    clearHistory(pin = null) {
        if (pin) {
            this.history[pin] = [];
        } else {
            this.history = {
                V0: [], V1: [], V2: [], V3: [], V4: [], V5: []
            };
        }
    }
}

export default new DataAnalytics();
