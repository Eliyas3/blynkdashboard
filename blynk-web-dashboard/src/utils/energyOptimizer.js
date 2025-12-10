// Energy Optimization Analyzer

import dataAnalytics from './dataAnalytics';

export class EnergyOptimizer {
    constructor() {
        this.powerRates = {
            peak: 0.15,     // $/kWh during peak hours (9am-9pm)
            offPeak: 0.08   // $/kWh during off-peak hours
        };
    }

    // Calculate efficiency score (0-100)
    calculateEfficiencyScore(widgets, datastreams) {
        let totalScore = 0;
        let count = 0;

        widgets.forEach(widget => {
            const stats = dataAnalytics.getStats(widget.pin, 86400000); // Last 24 hours

            if (stats.count > 10) {
                // Lower standard deviation = more efficient (stable operation)
                const variability = stats.stdDev / stats.mean;
                const score = Math.max(0, 100 - (variability * 100));

                totalScore += score;
                count++;
            }
        });

        return count > 0 ? Math.round(totalScore / count) : 0;
    }

    // Estimate power consumption
    estimatePowerConsumption(widgets, datastreams) {
        // Simplified: assume each active widget consumes based on its value
        let dailyKWh = 0;

        widgets.forEach(widget => {
            const value = datastreams[widget.pin] || 0;
            const stats = dataAnalytics.getStats(widget.pin, 86400000);

            if (stats.count > 0) {
                // Estimate: higher values = more power (simplified model)
                const avgValue = stats.mean;
                const normalizedValue = avgValue / (widget.max || 100);

                // Assume 0.1 kWh per day per widget at full capacity
                dailyKWh += normalizedValue * 0.1;
            }
        });

        return dailyKWh;
    }

    // Calculate cost
    calculateCost(kWh, hour = new Date().getHours()) {
        const isPeak = hour >= 9 && hour < 21;
        const rate = isPeak ? this.powerRates.peak : this.powerRates.offPeak;

        return {
            daily: kWh * rate,
            monthly: kWh * rate * 30,
            yearly: kWh * rate * 365,
            rate: isPeak ? 'peak' : 'off-peak'
        };
    }

    // Get optimization recommendations
    getRecommendations(widgets, datastreams) {
        const recommendations = [];

        widgets.forEach(widget => {
            const stats = dataAnalytics.getStats(widget.pin, 86400000);
            const currentValue = datastreams[widget.pin] || 0;

            // High variability recommendation
            if (stats.stdDev > stats.mean * 0.3) {
                recommendations.push({
                    type: 'stability',
                    priority: 'medium',
                    widget: widget.label,
                    message: `${widget.label} shows high variability. Consider stabilizing the system for better efficiency.`,
                    potentialSavings: '10-15%'
                });
            }

            // High value during peak hours
            const hour = new Date().getHours();
            if (hour >= 9 && hour < 21 && currentValue > (widget.max || 100) * 0.7) {
                recommendations.push({
                    type: 'scheduling',
                    priority: 'high',
                    widget: widget.label,
                    message: `${widget.label} is running high during peak hours. Consider scheduling for off-peak times.`,
                    potentialSavings: '20-30%'
                });
            }
        });

        return recommendations;
    }

    // Set custom power rates
    setPowerRates(peak, offPeak) {
        this.powerRates.peak = peak;
        this.powerRates.offPeak = offPeak;
    }
}

export default new EnergyOptimizer();
