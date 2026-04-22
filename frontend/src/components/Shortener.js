import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

function Shortener() {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = async () => {
    if (!url) { setError('Please enter a URL'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await axios.post('https://linksnap-backend-hnns.onrender.com/shorten', {
        original_url: url,
        custom_code: customCode || undefined,
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.short_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2>Shorten a URL</h2>

      <motion.input
        type="text"
        placeholder="Paste your long URL here..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        whileFocus={{ scale: 1.01 }}
        onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
      />

      <motion.input
        type="text"
        placeholder="Custom short code (optional)..."
        value={customCode}
        onChange={(e) => setCustomCode(e.target.value)}
        whileFocus={{ scale: 1.01 }}
        onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
      />

      <motion.button
        onClick={handleShorten}
        disabled={loading}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {loading ? (
          <span className="spinner-row">
            <span className="spinner" /> Shortening...
          </span>
        ) : 'Shorten ⚡'}
      </motion.button>

      <AnimatePresence>
        {error && (
          <motion.p
            className="error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            className="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p>Your short URL</p>
            <div className="url-row">
              <a href={result.short_url} target="_blank" rel="noreferrer">
                {result.short_url}
              </a>
              <motion.button
                onClick={copyToClipboard}
                className="copy-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </motion.button>
            </div>

            <p className="hint">
              Short code: <strong>{result.short_code}</strong> — use in Analytics tab
            </p>

            <motion.div
              className="qr-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p>QR Code</p>
              <QRCodeSVG
                value={result.short_url}
                size={160}
                bgColor="#1a1a1a"
                fgColor="#a855f7"
                level="H"
              />
              <p className="hint">Scan to open</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Shortener;