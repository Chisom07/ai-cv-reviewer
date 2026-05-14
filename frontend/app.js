const API = 'http://localhost:5000/cv';

async function uploadCV() {
  const file = document.getElementById('cvFile').files[0];
  const formData = new FormData();
  formData.append('cv', file);

  document.getElementById('loading').innerText = 'Uploading...';

  const res = await fetch(`${API}/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();

  const analysis = await fetch(`${API}/analyse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: data.text })
  });

  const result = await analysis.json();

  localStorage.setItem('result', JSON.stringify(result));

  window.location.href = 'results.html';
}

if (window.location.pathname.includes('results.html')) {
  const data = JSON.parse(localStorage.getItem('result'));

  document.getElementById('score').innerText = data.score;

  data.skills_identified.forEach(skill => {
    const el = document.createElement('span');
    el.className = 'tag';
    el.innerText = skill;
    document.getElementById('skills').appendChild(el);
  });

  document.getElementById('gaps').innerText = data.gaps.join(', ');
  document.getElementById('tips').innerText = data.improvement_tips.join(', ');
  document.getElementById('level').innerText = data.seniority_level;

  localStorage.setItem('skills', JSON.stringify(data.skills_identified));
}

async function loadJobs() {
  const skills = JSON.parse(localStorage.getItem('skills'));

  const res = await fetch(`${API}/match-jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skills })
  });

  const jobs = await res.json();

  const container = document.getElementById('jobs');

  jobs.forEach(job => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <h3>${job.title}</h3>
      <p>${job.company}</p>
      <p>${job.location}</p>
      <p>${job.salary}</p>
      <a href="${job.apply_url}" target="_blank">Apply</a>
    `;
    container.appendChild(div);
  });
}

if (window.location.pathname.includes('jobs.html')) {
  loadJobs();
}

async function loadHistory() {
  const res = await fetch(`${API}/history`);
  const data = await res.json();

  const container = document.getElementById('history');

  data.forEach(item => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <h3>Score: ${item.score}</h3>
      <p>${item.cv_text.substring(0, 100)}...</p>
    `;
    container.appendChild(div);
  });
}

if (window.location.pathname.includes('history.html')) {
  loadHistory();
}

