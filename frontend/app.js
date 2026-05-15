const API = 'http://localhost:5000/cv';

// Drag and drop functionality
document.addEventListener('DOMContentLoaded', function() {
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('cvFile');

  if (uploadArea && fileInput) {
    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        // Create a new DataTransfer to properly set files
        const dt = new DataTransfer();
        dt.items.add(files[0]);
        fileInput.files = dt.files;

        const label = uploadArea.querySelector('p');
        if (label) {
          label.textContent = `File selected: ${files[0].name}`;
        }
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const label = uploadArea.querySelector('p');
        if (label) {
          label.textContent = `File selected: ${e.target.files[0].name}`;
        }
      }
    });
  }

  // Highlight active navigation
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  const uploadBtn = document.getElementById('uploadBtn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', uploadCV);
  }
});

async function uploadCV() {
  const fileInput = document.getElementById('cvFile');
  if (!fileInput) {
    showError('File input not found. Please refresh the page.');
    return;
  }

  const file = fileInput.files[0];
  if (!file) {
    showError('Please select a CV file first.');
    return;
  }

  const uploadBtn = document.getElementById('uploadBtn');
  const loading = document.getElementById('loading');
  const errorDiv = document.getElementById('error');
  const successDiv = document.getElementById('success');

  uploadBtn.disabled = true;
  loading.style.display = 'block';
  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';

  try {
    const formData = new FormData();
    formData.append('cv', file);

    const uploadRes = await fetch(`${API}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!uploadRes.ok) {
      throw new Error('Failed to upload file');
    }

    const uploadData = await uploadRes.json();

    const analysisRes = await fetch(`${API}/analyse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: uploadData.text })
    });

    if (!analysisRes.ok) {
      const errorData = await analysisRes.json();
      throw new Error(errorData.error || 'Analysis failed');
    }

    const result = await analysisRes.json();

    localStorage.setItem('result', JSON.stringify(result));
    showSuccess('CV analyzed successfully! Redirecting...');

    setTimeout(() => {
      window.location.href = 'results.html';
    }, 1500);

  } catch (error) {
    console.error('Upload error:', error);
    showError(error.message || 'An error occurred during analysis. Please try again.');
  } finally {
    uploadBtn.disabled = false;
    loading.style.display = 'none';
  }
}

function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function showSuccess(message) {
  const successDiv = document.getElementById('success');
  successDiv.textContent = message;
  successDiv.style.display = 'block';
}

if (window.location.pathname.includes('results.html')) {
  const data = JSON.parse(localStorage.getItem('result'));

  // Animate score circle
  const scoreElement = document.getElementById('score');
  const scoreCircle = document.getElementById('scoreCircle');
  const targetScore = data.score;

  scoreCircle.style.setProperty('--score', `${targetScore}%`);

  let currentScore = 0;
  const increment = targetScore / 50; // Animate over 50 steps

  const animateScore = () => {
    currentScore += increment;
    if (currentScore >= targetScore) {
      currentScore = targetScore;
      scoreElement.textContent = Math.round(currentScore);
    } else {
      scoreElement.textContent = Math.round(currentScore);
      requestAnimationFrame(animateScore);
    }
  };

  animateScore();

  document.getElementById('level').textContent = `Level: ${data.seniority_level}`;

  // Display skills with animation
  const skillsContainer = document.getElementById('skills');
  data.skills_identified.forEach((skill, index) => {
    setTimeout(() => {
      const el = document.createElement('span');
      el.className = 'tag';
      el.innerText = skill;
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      skillsContainer.appendChild(el);

      // Animate in
      setTimeout(() => {
        el.style.transition = 'all 0.3s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 50);
    }, index * 100);
  });

  document.getElementById('gaps').innerText = data.gaps.join(', ');
  document.getElementById('tips').innerText = data.improvement_tips.join(', ');

  localStorage.setItem('skills', JSON.stringify(data.skills_identified));
}

async function loadJobs() {
  const skills = JSON.parse(localStorage.getItem('skills'));

  const container = document.getElementById('jobs');
  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Finding matching jobs...</p></div>';

  try {
    const res = await fetch(`${API}/match-jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills })
    });

    if (!res.ok) {
      throw new Error('Failed to fetch jobs');
    }

    const jobs = await res.json();

    container.innerHTML = '';

    if (jobs.length === 0) {
      container.innerHTML = '<div class="card"><p>No jobs found matching your skills. Try uploading a different CV.</p></div>';
      return;
    }

    jobs.forEach((job, index) => {
      setTimeout(() => {
        const div = document.createElement('div');
        div.className = 'job-card card';
        div.style.opacity = '0';
        div.style.transform = 'translateY(20px)';
        div.innerHTML = `
          <h3>${job.title}</h3>
          <p><strong>Company:</strong> ${job.company}</p>
          <p><strong>Location:</strong> ${job.location}</p>
          <p><strong>Salary:</strong> ${job.salary}</p>
          <a href="${job.apply_url}" target="_blank">Apply Now</a>
        `;
        container.appendChild(div);

        // Animate in
        setTimeout(() => {
          div.style.transition = 'all 0.3s ease';
          div.style.opacity = '1';
          div.style.transform = 'translateY(0)';
        }, 50);
      }, index * 150);
    });
  } catch (error) {
    console.error('Jobs error:', error);
    container.innerHTML = '<div class="error">Failed to load jobs. Please try again later.</div>';
  }
}

if (window.location.pathname.includes('jobs.html')) {
  loadJobs();
}

async function loadHistory() {
  const container = document.getElementById('history');
  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading history...</p></div>';

  try {
    const res = await fetch(`${API}/history`);

    if (!res.ok) {
      throw new Error('Failed to fetch history');
    }

    const data = await res.json();

    container.innerHTML = '';

    if (data.length === 0) {
      container.innerHTML = '<div class="card"><p>No analysis history found. Upload your first CV!</p></div>';
      return;
    }

    data.forEach((item, index) => {
      setTimeout(() => {
        const div = document.createElement('div');
        div.className = 'card';
        div.style.opacity = '0';
        div.style.transform = 'translateY(20px)';
        div.innerHTML = `
          <h3>Score: ${item.score}/100</h3>
          <p><strong>Analyzed:</strong> ${new Date(item.created_at).toLocaleDateString()}</p>
          <p>${item.cv_text.substring(0, 200)}...</p>
        `;
        container.appendChild(div);

        // Animate in
        setTimeout(() => {
          div.style.transition = 'all 0.3s ease';
          div.style.opacity = '1';
          div.style.transform = 'translateY(0)';
        }, 50);
      }, index * 100);
    });
  } catch (error) {
    console.error('History error:', error);
    container.innerHTML = '<div class="error">Failed to load history. Please try again later.</div>';
  }
}

if (window.location.pathname.includes('history.html')) {
  loadHistory();
}

