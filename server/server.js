import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (req, res) => {
  console.log('Health check endpoint accessed');
  res.status(200).json({ status: 'Gemini API server is running' });
});

app.get('/api/test', (req, res) => {
  console.log('Test endpoint accessed');
  res.status(200).json({ message: 'API is working correctly' });
});

app.post('/api/gemini', async (req, res) => {
  console.log('Gemini API endpoint accessed with body:', req.body);
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      console.log('Error: No prompt provided');
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('Error: No API key configured');
      return res.status(500).json({ error: 'Gemini API key is not configured' });
    }
    
    console.log('Sending request to Gemini API with prompt:', prompt.substring(0, 100) + '...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Error from Gemini API', 
        details: errorData 
      });
    }
    
    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;
    console.log('Successfully received response from Gemini API');
    
    return res.json({ reply });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

app.use((req, res) => {
  console.log(`404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} for the health check endpoint`);
  console.log(`API endpoint available at http://localhost:${PORT}/api/gemini`);
}); 