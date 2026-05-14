const axios = require('axios');

exports.getJobs = async (skills) => {
  const query = skills.join(' ');
  const url = `https://api.adzuna.com/v1/api/jobs/gb/search/1`;

  const res = await axios.get(url, {
    params: {
      app_id: process.env.ADZUNA_APP_ID,
      app_key: process.env.ADZUNA_APP_KEY,
      what: query,
      results_per_page: 10
    }
  });

  return res.data.results.map(job => ({
    title: job.title,
    company: job.company.display_name,
    location: job.location.display_name,
    salary: job.salary_max || 'N/A',
    apply_url: job.redirect_url
  }));
};