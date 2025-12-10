const express = require('express');
const { query } = require('../database/connection');
const { authenticateToken } = require('./auth');

const router = express.Router();
router.use(authenticateToken);

// GET all templates for user
router.get('/', async (req, res) => {
    try {
        const result = await query(
            `SELECT * FROM templates 
             WHERE user_id = $1 OR is_public = true 
             ORDER BY created_at DESC`,
            [req.user.userId]
        );
        res.json({ templates: result.rows });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// CREATE template
router.post('/', async (req, res) => {
    try {
        const { name, description, hardwareType, connectionType } = req.body;

        const result = await query(
            `INSERT INTO templates (name, description, hardware_type, connection_type, user_id, organization_id)
             VALUES ($1, $2, $3, $4, $5, (SELECT organization_id FROM users WHERE id = $5))
             RETURNING *`,
            [name, description, hardwareType, connectionType, req.user.userId]
        );

        res.status(201).json({ template: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create template' });
    }
});

module.exports = router;
