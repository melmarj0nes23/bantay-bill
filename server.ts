import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Groq Client safely
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("Warning: GROQ_API_KEY is not defined in process environment variables.");
    return null;
  }
  return new Groq({ apiKey: apiKey });
};

// Secure API endpoint proxy for BantayBill financial tips
app.post('/api/insights', async (req, res) => {
  const { bills } = req.body;
  
  if (!bills || !Array.isArray(bills)) {
    return res.status(400).json({ error: "Invalid bills database." });
  }

  const groq = getGroqClient();
  if (!groq) {
    return res.json({ 
      insight: "AI Recommendation: Your water usage tracking has settled nicely. By bundling Globe Plan with your dynamic rent cycle, you can streamline bank clearings. Your upcoming electricity settlement is upcoming on the 15th." 
    });
  }

  try {
    const formattedBills = bills.map((b: any) => `- Name: ${b.name}, Category: ${b.category}, Amount: ${b.amount}, Status: ${b.status}, Date: ${b.dueDate}`).join('\n');
    
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: `You are BantayBill AI, a premium literal household financial advisor. Today's date is ${currentDate}. Analyze this member's current bills:\n${formattedBills}\n\nProvide exactly ONE paragraph containing actionable advice, utilities audit, and subscriptions tips under 50 words. Avoid self-praising or flowery jargon. Speak with professional composure.` }],
      model: 'llama-3.1-8b-instant',
    });

    const text = response.choices[0]?.message?.content || "AI suggestion: Keep settlement cycles on track to prevent overdue penalties.";
    res.json({ insight: text.trim() });
  } catch (error: any) {
    console.error("Groq API server-side failure:", error);
    res.status(500).json({ error: "Groq server-side evaluation failed", details: error.message });
  }
});

// Configure Vite integration for SPA + Backend Router
const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    // Use Vite middleware in development
    app.use(vite.middlewares);
    console.log("Vite development server connected as Express middleware.");
  } else {
    // Serve static files in production from dist
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`BantayBill full-stack server running successfully on port ${port}`);
  });
};

startServer().catch(console.error);
