const pdfParse = require('pdf-parse');
const pool = require('../db');
const { analyseCV } = require('../utils/openai');
const { getJobs } = require('../utils/adzuna');

exports.uploadCV = async (req, res) => {
  const data = await pdfParse(req.file.buffer);
  res.json({ text: data.text });
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

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'OpenAI rate limit exceeded. Please wait and try again.'
      });
    }

    return res.status(502).json({
      error: 'Unable to reach OpenAI API. Please check your network or API settings.'
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