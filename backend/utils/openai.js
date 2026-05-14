const axios = require('axios');
const axiosRetryModule = require('axios-retry');
const axiosRetry = axiosRetryModule.default ?? axiosRetryModule;

const openaiClient = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

axiosRetry(openaiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return error.response?.status === 429 || axiosRetry.isRetryableError(error);
  }
});

exports.analyseCV = async (cvText) => {
  const response = await openaiClient.post('/chat/completions', {
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are an expert CV analyzer. Analyze the CV and return ONLY a valid JSON object with exactly these fields: score (number 0-100), skills_identified (array of strings), gaps (array of strings), improvement_tips (array of strings), seniority_level (string). Do not include any other text or formatting.'
      },
      {
        role: 'user',
        content: `Analyze this CV:\n${cvText}`
      }
    ],
    response_format: { type: 'json_object' }
  });

  const content = response.data.choices[0].message.content;
  console.log('OpenAI response content:', content);

  try {
    const result = JSON.parse(content);
    console.log('Parsed result:', result);

    // Validate required fields
    if (typeof result.score !== 'number' || !Array.isArray(result.skills_identified) || !Array.isArray(result.gaps) || !Array.isArray(result.improvement_tips) || typeof result.seniority_level !== 'string') {
      throw new Error('Invalid response format: missing required fields');
    }

    return result;
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    console.error('Raw content:', content);
    throw new Error('Failed to parse OpenAI response as JSON');
  }
};