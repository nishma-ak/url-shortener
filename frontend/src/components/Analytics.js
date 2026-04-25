import React, { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function Analytics() {
  const [code, setCode] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    if (!code) { setError('Please enter a short code'); return; }
    setError('');
    try {
      const response = await axios.get(`https://linksnap-tbon.onrender.com/analytics/${code}`);
      const clicks = response.data.clicks.reduce((acc, click) => {
        const date = click.clicked_at.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      setData({
        ...response.data,
        chartData: Object.entries(clicks).map(([date, count]) => ({ date, count })),
      });
    } catch (err) {
      setError('Short code not found.');
    }
  };

  return (
    <div className="card">
      <h2>Analytics</h2>
      <input
        type="text"
        placeholder="Enter your short code..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={fetchAnalytics}>Get Analytics</button>
      {error && <p className="error">{error}</p>}
      {data && (
        <div className="analytics-result">
          <p>Original URL: <a href={data.original_url} target="_blank" rel="noreferrer">{data.original_url}</a></p>
          <p>Total clicks: <strong>{data.total_clicks}</strong></p>
          {data.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No clicks yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Analytics;