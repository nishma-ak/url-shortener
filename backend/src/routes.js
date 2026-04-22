const express = require('express');
const router = express.Router();
const pool = require('./database');
const { nanoid } = require('nanoid');

// Shorten a URL
router.post('/shorten', async (req, res) => {
  const { original_url, custom_code } = req.body;

  if (!original_url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const short_code = custom_code || nanoid(6);

  if (custom_code) {
    const exists = await pool.query(
      'SELECT * FROM urls WHERE short_code = $1',
      [short_code]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Custom code already taken. Try another.' });
    }
  }

  try {
    const result = await pool.query(
      'INSERT INTO urls (original_url, short_code) VALUES ($1, $2) RETURNING *',
      [original_url, short_code]
    );
    res.json({
      original_url,
      short_code,
      short_url: `https://linksnap-backend-hnns.onrender.com${short_code}`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Analytics — MUST be before redirect route
router.get('/analytics/:short_code', async (req, res) => {
  const { short_code } = req.params;

  const url = await pool.query(
    'SELECT * FROM urls WHERE short_code = $1',
    [short_code]
  );

  if (url.rows.length === 0) {
    return res.status(404).json({ error: 'URL not found' });
  }

  const clicks = await pool.query(
    'SELECT clicked_at FROM clicks WHERE short_code = $1 ORDER BY clicked_at DESC',
    [short_code]
  );

  res.json({
    original_url: url.rows[0].original_url,
    short_code,
    total_clicks: clicks.rows.length,
    clicks: clicks.rows,
  });
});

// Redirect to original URL
router.get('/:short_code', async (req, res) => {
  const { short_code } = req.params;

  const result = await pool.query(
    'SELECT * FROM urls WHERE short_code = $1',
    [short_code]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'URL not found' });
  }

  await pool.query(
    'INSERT INTO clicks (short_code) VALUES ($1)',
    [short_code]
  );

  res.redirect(result.rows[0].original_url);
});

module.exports = router;