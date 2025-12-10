const express = require('express');
const { query } = require('../database/connection');
const { authenticateToken } = require('./auth');

const router = express.Router();
router.use(authenticateToken);

// GET datastreams for template
router.get('/:templateId', async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM datastreams WHERE template_id = $1 ORDER BY pin',
            [req.params.templateId]
        );
        res.json({ datastreams: result.rows });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch datastreams' });
    }
});

// CREATE datastream
router.post('/', async (req, res) => {
    try {
        const { templateId, pin, name, dataType, minValue, maxValue, unit } = req.body;

        const result = await query(
            `INSERT INTO datastreams (template_id, pin, name, data_type, min_value, max_value, unit)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [templateId, pin, name, dataType, minValue, maxValue, unit]
        );

        res.status(201).json({ datastream: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create datastream' });
    }
});

module.exports = router;
