const express = require('express');
const crypto = require('crypto');
const { query } = require('../database/connection');
const { authenticateToken } = require('./auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ===========================================
// GET ALL DEVICES (for current user)
// ===========================================

router.get('/', async (req, res) => {
    try {
        const result = await query(
            `SELECT d.id, d.name, d.description, d.auth_token, d.status, d.last_seen,
                    d.firmware_version, d.metadata, d.created_at,
                    t.name as template_name
             FROM devices d
             LEFT JOIN templates t ON d.template_id = t.id
             WHERE d.user_id = $1
             ORDER BY d.created_at DESC`,
            [req.user.userId]
        );

        res.json({ devices: result.rows });

    } catch (error) {
        console.error('Get devices error:', error);
        res.status(500).json({ error: 'Failed to fetch devices' });
    }
});

// ===========================================
// GET SINGLE DEVICE
// ===========================================

router.get('/:id', async (req, res) => {
    try {
        const result = await query(
            `SELECT d.*, t.name as template_name
             FROM devices d
             LEFT JOIN templates t ON d.template_id = t.id
             WHERE d.id = $1 AND d.user_id = $2`,
            [req.params.id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        res.json({ device: result.rows[0] });

    } catch (error) {
        console.error('Get device error:', error);
        res.status(500).json({ error: 'Failed to fetch device' });
    }
});

// ===========================================
// CREATE DEVICE
// ===========================================

router.post('/', async (req, res) => {
    try {
        const { name, description, templateId } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Device name is required' });
        }

        // Generate unique auth token
        const authToken = crypto.randomBytes(32).toString('hex');

        // Get user's organization
        const userResult = await query(
            'SELECT organization_id FROM users WHERE id = $1',
            [req.user.userId]
        );

        const organizationId = userResult.rows[0].organization_id;

        // Create device
        const result = await query(
            `INSERT INTO devices (name, description, template_id, user_id, organization_id, auth_token)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [name, description || null, templateId || null, req.user.userId, organizationId, authToken]
        );

        const device = result.rows[0];

        res.status(201).json({
            message: 'Device created successfully',
            device: {
                id: device.id,
                name: device.name,
                authToken: device.auth_token,
                status: device.status,
                createdAt: device.created_at
            }
        });

    } catch (error) {
        console.error('Create device error:', error);
        res.status(500).json({ error: 'Failed to create device' });
    }
});

// ===========================================
// UPDATE DEVICE
// ===========================================

router.put('/:id', async (req, res) => {
    try {
        const { name, description, templateId, metadata } = req.body;

        const result = await query(
            `UPDATE devices 
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 template_id = COALESCE($3, template_id),
                 metadata = COALESCE($4, metadata)
             WHERE id = $5 AND user_id = $6
             RETURNING *`,
            [name, description, templateId, metadata, req.params.id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        res.json({
            message: 'Device updated successfully',
            device: result.rows[0]
        });

    } catch (error) {
        console.error('Update device error:', error);
        res.status(500).json({ error: 'Failed to update device' });
    }
});

// ===========================================
// DELETE DEVICE
// ===========================================

router.delete('/:id', async (req, res) => {
    try {
        const result = await query(
            'DELETE FROM devices WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        res.json({ message: 'Device deleted successfully' });

    } catch (error) {
        console.error('Delete device error:', error);
        res.status(500).json({ error: 'Failed to delete device' });
    }
});

// ===========================================
// GET DEVICE DATA (Time-series)
// ===========================================

router.get('/:id/data', async (req, res) => {
    try {
        const { pin, start, end, limit = 100 } = req.query;

        // Verify device ownership
        const deviceCheck = await query(
            'SELECT id FROM devices WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.userId]
        );

        if (deviceCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        let queryText = `
            SELECT time, pin, value
            FROM sensor_data
            WHERE device_id = $1
        `;
        const params = [req.params.id];
        let paramCount = 1;

        if (pin) {
            paramCount++;
            queryText += ` AND pin = $${paramCount}`;
            params.push(pin);
        }

        if (start) {
            paramCount++;
            queryText += ` AND time >= $${paramCount}`;
            params.push(start);
        }

        if (end) {
            paramCount++;
            queryText += ` AND time <= $${paramCount}`;
            params.push(end);
        }

        queryText += ` ORDER BY time DESC LIMIT $${paramCount + 1}`;
        params.push(limit);

        const result = await query(queryText, params);

        res.json({ data: result.rows });

    } catch (error) {
        console.error('Get device data error:', error);
        res.status(500).json({ error: 'Failed to fetch device data' });
    }
});

module.exports = router;
