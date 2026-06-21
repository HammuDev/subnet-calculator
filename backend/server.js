import express from 'express';
import cors from 'cors';
import { calculateSubnetting } from './subnetCalc.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main calculation endpoint
app.post('/api/calculate', (req, res) => {
  const { ip, subnets, baseCidr } = req.body;

  if (!ip) {
    return res.status(400).json({ error: 'IP address is required.' });
  }

  const subnetsCount = parseInt(subnets, 10);
  if (isNaN(subnetsCount) || subnetsCount < 1) {
    return res.status(400).json({ error: 'Subnets count must be a positive integer.' });
  }

  const baseCidrVal = baseCidr !== undefined && baseCidr !== null ? parseInt(baseCidr, 10) : null;

  try {
    const results = calculateSubnetting(ip, subnetsCount, baseCidrVal);
    
    if (results.error) {
      return res.status(400).json(results);
    }
    
    return res.json(results);
  } catch (err) {
    console.error('Calculation error:', err);
    return res.status(500).json({ error: 'Internal server error occurred during calculation.' });
  }
});

// Health check endpoint for Docker container orchestration
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
