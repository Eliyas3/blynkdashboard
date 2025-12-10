// AI Insights Generator - Natural Language Summaries

import dataAnalytics from './dataAnalytics';
import anomalyDetector from './anomalyDetection';
import predictionEngine from './predictions';

export class AIInsightsGenerator {
    // Generate comprehensive insights for a project
    generateInsights(widgets, datastreams) {
        const insights = [];

        widgets.forEach(widget => {
            const pin = widget.pin;
            const currentValue = datastreams[pin] || 0;
            const stats = dataAnalytics.getStats(pin, 3600000); // Last hour
            const trend = dataAnalytics.getTrend(pin);
            const prediction = predictionEngine.getBestPrediction(pin);
            const recentAnomalies = anomalyDetector.getAnomaliesForPin(pin);

            // Current status insight
            if (stats.count > 0) {
                insights.push({
                    type: 'status',
                    pin,
                    label: widget.label,
                    icon: this.getIconForWidget(widget.type),
                    text: this.generateStatusText(widget, currentValue, stats),
                    priority: 'normal'
                });
            }

            // Trend insight
            if (Math.abs(trend) > 0.5) {
                insights.push({
                    type: 'trend',
                    pin,
                    label: widget.label,
                    icon: trend > 0 ? '📈' : '📉',
                    text: this.generateTrendText(widget, trend, currentValue),
                    priority: 'normal'
                });
            }

            // Prediction insight
            if (prediction && prediction.confidence > 50) {
                insights.push({
                    type: 'prediction',
                    pin,
                    label: widget.label,
                    icon: '🔮',
                    text: this.generatePredictionText(widget, prediction),
                    priority: 'low'
                });
            }

            // Anomaly insight
            if (recentAnomalies.length > 0) {
                const latest = recentAnomalies[0];
                insights.push({
                    type: 'anomaly',
                    pin,
                    label: widget.label,
                    icon: '⚠️',
                    text: this.generateAnomalyText(widget, latest),
                    priority: latest.severity === 'critical' ? 'high' : 'normal'
                });
            }
        });

        // Sort by priority
        return insights.sort((a, b) => {
            const priority = { high: 3, normal: 2, low: 1 };
            return priority[b.priority] - priority[a.priority];
        });
    }

    generateStatusText(widget, currentValue, stats) {
        const duration = this.getTimeSince(stats.count * 2000); // Approximate

        if (Math.abs(currentValue - stats.mean) < stats.stdDev * 0.5) {
            return `${widget.label} is stable at ${currentValue.toFixed(1)} (avg: ${stats.mean.toFixed(1)})`;
        }

        if (currentValue > stats.mean) {
            return `${widget.label} is above average at ${currentValue.toFixed(1)} (avg: ${stats.mean.toFixed(1)})`;
        }

        return `${widget.label} is below average at ${currentValue.toFixed(1)} (avg: ${stats.mean.toFixed(1)})`;
    }

    generateTrendText(widget, trend, currentValue) {
        const direction = trend > 0 ? 'increasing' : 'decreasing';
        const rate = Math.abs(trend).toFixed(2);

        return `${widget.label} is ${direction} (${rate} per reading). Current: ${currentValue.toFixed(1)}`;
    }

    generatePredictionText(widget, prediction) {
        const confidence = prediction.confidence.toFixed(0);
        return `${widget.label} predicted to be ${prediction.predicted.toFixed(1)} in next hour (${confidence}% confidence)`;
    }

    generateAnomalyText(widget, anomaly) {
        const timeSince = this.getTimeSince(Date.now() - anomaly.timestamp);
        return `Unusual ${widget.label} detected ${timeSince}: ${anomaly.value.toFixed(1)} (expected: ${anomaly.stats.mean.toFixed(1)})`;
    }

    getIconForWidget(type) {
        const icons = {
            Gauge: '📊',
            Label: '🔢',
            LED: '💡',
            Chart: '📈'
        };
        return icons[type] || '📌';
    }

    getTimeSince(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return `${seconds}s ago`;
    }
}

export default new AIInsightsGenerator();
