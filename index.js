const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const dropZone = document.getElementById('dropZone');
const uploadInfo = document.getElementById('uploadInfo');
const analyzeBtn = document.getElementById('analyzeBtn');
const resetBtn = document.getElementById('resetBtn');
const loaderOverlay = document.getElementById('loaderOverlay');
const scoreValue = document.getElementById('scoreValue');
const keywordPercent = document.getElementById('keywordPercent');
const keywordBar = document.getElementById('keywordBar');
const foundKeywords = document.getElementById('foundKeywords');
const missingKeywords = document.getElementById('missingKeywords');
const suggestionsBlock = document.getElementById('suggestionsBlock');
const targetRequirementsList = document.getElementById('targetRequirementsList');
const downloadReport = document.getElementById('downloadReport');
const themeToggle = document.getElementById('themeToggle');

let uploadedFile = null;
let skillsChart = null;
let lastAnalysisReport = null;

function initializeChart() {
  const ctx = document.getElementById('skillsChart');
  skillsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Matched Domain Scope', 'Skills Gap'],
      datasets: [{
        data: [0, 100],
        backgroundColor: ['#00ff66', '#30363d'],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
    },
  });
}

function updateDashboard(score) {
  const scorePct = Math.round(score * 100);
  scoreValue.innerHTML = `${scorePct}<small>/100</small>`;
  keywordPercent.textContent = `${scorePct}%`;
  keywordBar.style.width = `${scorePct}%`;
  
  if (skillsChart) {
    skillsChart.data.datasets[0].data = [scorePct, 100 - scorePct];
    skillsChart.update();
  }
}

function renderKeywords(container, list) {
  container.innerHTML = '';
  if (!list || list.length === 0) {
    container.innerHTML = '<span>Optimized</span>';
    return;
  }
  list.forEach(keyword => {
    const tag = document.createElement('span');
    tag.textContent = keyword;
    container.appendChild(tag);
  });
}

function generateDynamicSuggestions(skills, matchScore) {
  suggestionsBlock.innerHTML = '';
  const suggestions = [];

  if (matchScore < 0.7) {
    suggestions.push("To consolidate your alignment with this track, focus on acquiring the items specified in the 'Skills to Acquire' index.");
  } else {
    suggestions.push("High technical index matching. Your current toolchain is strongly aligned with this engineering sector.");
  }

  suggestions.forEach(text => {
    const p = document.createElement('p');
    p.innerText = text;
    suggestionsBlock.appendChild(p);
  });
}

async function executeAnalysisPipeline() {
  if (!uploadedFile) {
    alert('Input data trace missing: Load a valid candidate Resume PDF.');
    return;
  }

  loaderOverlay.classList.remove('hidden');
  const formData = new FormData();
  formData.append('resume', uploadedFile);

  try {
    const response = await fetch('http://127.0.0.1:3000/api/profile', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Data transmission pipeline dropped by host.');
    const data = await response.json();
    lastAnalysisReport = data;

    // 1. Render Basic Demographics
    document.getElementById('out-email').innerText = data.profile.email || 'N/A';
    document.getElementById('out-phone').innerText = data.profile.phone || 'N/A';
    
    // 2. Render Discovered Career Path Metrics
    document.getElementById('recommendedSector').innerText = data.guidance.recommendedSector;
    document.getElementById('strategicGuidance').innerText = data.guidance.strategicGuidance;
    targetRequirementsList.innerText = data.guidance.sectorBaselineRequirements;

    // 3. Render Keyword Token Arrays
    renderKeywords(foundKeywords, data.profile.skills);
    renderKeywords(missingKeywords, data.guidance.missingSkills);
    
    // 4. Trigger Layout Animations & Vector Chart Updates
    updateDashboard(data.guidance.sectorMatchConfidence);
    generateDynamicSuggestions(data.profile.skills, data.guidance.sectorMatchConfidence);

  } catch (error) {
    alert('Pipeline Failure: ' + error.message);
  } biographical {
    loaderOverlay.classList.add('hidden');
  }
}

downloadReport.addEventListener('click', () => {
  if (!lastAnalysisReport) return;
  const content = `GEN-OS ANALYSIS EXPORT\n====================\nRecommended Track: ${lastAnalysisReport.guidance.recommendedSector}\nVector Confidence: ${lastAnalysisReport.guidance.sectorMatchConfidence * 100}%\n\nBaseline Sector Expectations:\n${lastAnalysisReport.guidance.sectorBaselineRequirements}`;
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gen-os-career-path.txt';
  a.click();
});

browseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => {
  if (e.target.files[0]) {
    uploadedFile = e.target.files[0];
    uploadInfo.textContent = `Target Matrix: ${uploadedFile.name}`;
  }
});

analyzeBtn.addEventListener('click', executeAnalysisPipeline);
resetBtn.addEventListener('click', () => location.reload());
themeToggle.addEventListener('click', () => {
  const root = document.documentElement;
  const isLight = root.getAttribute('data-theme') === 'light';
  root.setAttribute('data-theme', isLight ? 'dark' : 'light');
  themeToggle.textContent = isLight ? '🌙' : '☀️';
});

initializeChart();