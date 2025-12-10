// Prediction Engine using Moving Average and Linear Regression

import dataAnalytics from './dataAnalytics';

export class PredictionEngine {
    // Simple Moving Average prediction
    predictSMA(pin, horizon = 6) {
        const recent = dataAnalytics.getRecentData(pin, 20);
        if (recent.length < 5) return null;

        const values = recent.map(d => d.value);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;

        return {
            pin,
            predicted: avg,
            confidence: this.calculateConfidence(values),
            method: 'SMA',
            horizon: horizon * 10000 // milliseconds
        };
    }

    // Linear Regression prediction
    predictLinearRegression(pin, horizon = 6) {
        const recent = dataAnalytics.getRecentData(pin, 30);
        if (recent.length < 10) return null;

        const n = recent.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

        recent.forEach((point, i) => {
            sumX += i;
            sumY += point.value;
            sumXY += i * point.value;
            sumX2 += i * i;
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Predict next value
        const nextX = n;
        const predicted = slope * nextX + intercept;

        return {
            pin,
            predicted,
            trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
            trendValue: slope,
            confidence: this.calculateRSquared(recent.map(d => d.value), slope, intercept),
            method: 'Linear Regression',
            horizon: horizon * 10000
        };
    }

    // Calculate prediction confidence (simplified R-squared)
    calculateRSquared(values, slope, intercept) {
        const n = values.length;
        const mean = values.reduce((a, b) => a + b, 0) / n;

        let ssRes = 0, ssTot = 0;
        values.forEach((y, x) => {
            const predicted = slope * x + intercept;
            ssRes += Math.pow(y - predicted, 2);
            ssTot += Math.pow(y - mean, 2);
        });

        const rSquared = 1 - (ssRes / ssTot);
        return Math.max(0, Math.min(1, rSquared)) * 100; // Percentage
    }

    // Calculate confidence for SMA
    calculateConfidence(values) {
        if (values.length < 2) return 0;

        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        // Lower standard deviation = higher confidence
        const cv = stdDev / mean; // Coefficient of variation
        const confidence = Math.max(0, 100 - cv * 100);

        return Math.min(100, confidence);
    }

    // Get best prediction (chooses between SMA and Linear Regression)
    getBestPrediction(pin, horizon = 6) {
        const sma = this.predictSMA(pin, horizon);
        const lr = this.predictLinearRegression(pin, horizon);

        if (!sma && !lr) return null;
        if (!sma) return lr;
        if (!lr) return sma;

        // Choose method with higher confidence
        return lr.confidence > sma.confidence ? lr : sma;
    }
}

export default new PredictionEngine();
