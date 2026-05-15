const pdfParse = require('pdf-parse');
const pool = require('../db');
const { analyseCV } = require('../utils/openai');
const { getJobs } = require('../utils/adzuna');

exports.uploadCV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CV file uploaded. Please attach a PDF file under the "cv" field.' });
  }

  try {
    const data = await pdfParse(req.file.buffer);
    res.json({ text: data.text });
  } catch (error) {
    console.error('CV upload parsing failed:', error);
    res.status(500).json({ error: 'Unable to parse the uploaded CV. Ensure it is a valid PDF file.' });
  }
};

exports.analyse = async (req, res) => {
  const { text } = req.body;

  try {
    const result = await analyseCV(text);

    await pool.query(
      'INSERT INTO cv_analyses (cv_text, score, skills) VALUES ($1, $2, $3)',
      [text, result.score, JSON.stringify(result.skills_identified)]
    );

    return res.json(result);
  } catch (error) {
    console.error('OpenAI request failed:', error.response?.data || error.message || error);

    if (error.message?.includes('Missing OPENAI_API_KEY')) {
      return res.status(500).json({
        error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in Render environment variables.'
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'OpenAI rate limit exceeded. Please wait and try again.'
      });
    }

    const openAIError = error.response?.data?.error?.message || error.response?.data?.error || error.message;
    console.error('OpenAI failure details:', openAIError);

    return res.status(502).json({
      error: `OpenAI request failed: ${openAIError}`
    });
  }
};

exports.matchJobs = async (req, res) => {
  const { skills } = req.body;
  const jobs = await getJobs(skills);
  res.json(jobs);
};

exports.history = async (req, res) => {
  const result = await pool.query('SELECT * FROM cv_analyses ORDER BY created_at DESC');
  res.json(result.rows);
};