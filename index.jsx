const { useState, useEffect, useRef } = React;

// ==========================================
// HIGH-DENSITY FALLBACK KNOWLEDGE MATRIX
// ==========================================
const DEFAULT_KNOWLEDGE_BASE = {
  "Embedded Systems & Robotics": {
    "requirements": "Deep understanding of microcontrollers (ESP32, Arduino, STM32), real-time operating systems (RTOS), hardware protocols (I2C, SPI, UART), circuit schematic layout, and custom PCB fabrication parameters.",
    "keywords": ["arduino", "esp32", "raspberry pi", "c", "c++", "robotics", "pcb", "kicad", "easyeda", "uart", "spi", "i2c", "rtos", "assembly", "firmware", "motor driver", "relay", "stepper"]
  },
  "Systems Engineering & GNU/Linux": {
    "requirements": "Advanced compilation of low-level software architectures, shell engineering (bash/zsh), kernel compilation parameters, window manager deployment, and open-source software integration frameworks.",
    "keywords": ["linux", "arch linux", "bash", "shell", "i3-wm", "foss", "git", "c", "makefile", "kernel", "systems programming", "docker", "automation", "rofi", "python"]
  },
  "AI & Quantitative Engineering": {
    "requirements": "Implementation of tensor mathematics, multi-protocol pipelines, technical indicators matching arrays, vector similarity indexing, and algorithmic trading system execution rules.",
    "keywords": ["python", "go", "machine learning", "ai", "bitcoin", "trading bot", "numpy", "pandas", "tensor", "fastapi", "vector", "cosine similarity", "scikit-learn", "quantitative"]
  }
};

const Tokenize = (text) => text.toLowerCase().match(/\b[a-z0-9\-]+\b/g) || [];

const CalculateMatchConfidence = (resumeText, domainKeywords, domainRequirements) => {
  const resumeTokens = new Set(Tokenize(resumeText));
  const matchedKeywords = domainKeywords.filter(kw => resumeTokens.has(kw.toLowerCase()));
  const keywordScore = domainKeywords.length ? (matchedKeywords.length / domainKeywords.length) : 0;
  
  const reqTokens = Tokenize(domainRequirements);
  let reqMatchCount = 0;
  reqTokens.forEach(token => {
    if (resumeTokens.has(token)) reqMatchCount++;
  });
  const reqScore = reqTokens.length ? (reqMatchCount / reqTokens.length) : 0;
  
  const finalScore = (keywordScore * 0.7) + (reqScore * 0.3);
  return {
    score: Math.min(Math.max(finalScore, 0), 1),
    matched: matchedKeywords.map(k => k.toUpperCase()),
    missing: domainKeywords.filter(kw => !resumeTokens.has(kw.toLowerCase())).map(k => k.toUpperCase())
  };
};

// ==========================================
// SUB-COMPONENT: AI PROFILER ENGINE PAGE
// ==========================================
function AIProfiler({ theme }) {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState(DEFAULT_KNOWLEDGE_BASE);
  const [report, setReport] = useState(null);
  
  const fileInputRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ScrapeExternalKnowledgeBase = async () => {
      try {
        const targetUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://raw.githubusercontent.com/srijanbhattacharyya/career-matrix/main/knowledge.json');
        const res = await fetch(targetUrl);
        if (!res.ok) throw new Error();
        const wrapper = await res.json();
        const parsed = JSON.parse(wrapper.contents);
        if (parsed && typeof parsed === 'object') setKnowledgeBase(parsed);
      } catch (e) {
        setKnowledgeBase(DEFAULT_KNOWLEDGE_BASE);
      }
    };
    ScrapeExternalKnowledgeBase();
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    const scorePct = report ? Math.round(report.guidance.sectorMatchConfidence * 100) : 0;
    const ctx = chartRef.current.getContext('2d');
    
    if (ctx && window.Chart) {
      chartInstance.current = new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Matched Domain Scope', 'Skills Gap'],
          datasets: [{
            data: [scorePct, 100 - scorePct],
            backgroundColor: [theme === 'dark' ? '#00ff66' : '#059669', theme === 'dark' ? '#30363d' : '#d1d5da'],
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: !!report },
          },
        },
      });
    }

    return () => { 
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      } 
    };
  }, [report, theme]);

  const ParseResumeTextLocal = (rawText) => {
    const emailMatch = rawText.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    const phoneMatch = rawText.match(/\+?\d{1,4}[ \-\d]{7,15}/);
    const lines = rawText.split('\n');
    const skillsFound = new Set();
    
    lines.forEach(line => {
      if (/(?:languages|hardware|embedded|systems|tools|libraries|skills|technologies)\s*:/i.test(line)) {
        const parts = line.split(':');
        if (parts[1]) {
          parts[1].split(',').forEach(item => {
            const cleaned = item.trim().toLowerCase();
            if (cleaned) skillsFound.add(cleaned);
          });
        }
      }
    });

    Object.values(knowledgeBase).forEach(sector => {
      sector.keywords.forEach(kw => {
        const rx = new RegExp('\\b' + kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'i');
        if (rx.test(rawText)) skillsFound.add(kw.toLowerCase());
      });
    });

    return {
      email: emailMatch ? emailMatch[0].trim() : 'N/A',
      phone: phoneMatch ? phoneMatch[0].trim() : 'N/A',
      skills: Array.from(skillsFound).map(s => s.toUpperCase())
    };
  };

  const TriggerPipelineExecution = async () => {
    if (!file) {
      alert('Input data trace missing: Load a valid candidate Resume file.');
      return;
    }
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const textContent = e.target.result;
        await new Promise(r => setTimeout(r, 1200));
        const parsedProfile = ParseResumeTextLocal(textContent);
        
        let highestScore = -1;
        let bestSector = Object.keys(knowledgeBase)[0];
        let evaluationOutput = { score: 0, matched: [], missing: [] };

        Object.entries(knowledgeBase).forEach(([sectorName, meta]) => {
          const evalRes = CalculateMatchConfidence(textContent, meta.keywords, meta.requirements);
          if (evalRes.score > highestScore) {
            highestScore = evalRes.score;
            bestSector = sectorName;
            evaluationOutput = evalRes;
          }
        });

        const coreStrengths = evaluationOutput.matched.slice(0, 4).join(', ');
        const strategicGuidanceText = evaluationOutput.matched.length > 0
          ? `Your profile demonstrates substantial technical alignment with '${bestSector}'. Analysis of your repository markers reveals core competencies in ${coreStrengths}. To maximize system performance and vector placement on this track, prioritize bridging the architectural delta by incorporating missing structural proficiencies.`
          : `Your core text blocks match closest with the '${bestSector}' domain blueprint. However, the skill matrix lacks direct keyword intersection. Focus on implementing the baseline parameters outlined in the domain requirements.`;

        setReport({
          profile: parsedProfile,
          guidance: {
            recommendedSector: bestSector,
            sectorMatchConfidence: parseFloat(highestScore.toFixed(4)),
            sectorBaselineRequirements: knowledgeBase[bestSector].requirements,
            strategicGuidance: strategicGuidanceText,
            missingSkills: evaluationOutput.missing
          }
        });
      } catch (err) {
        alert("Pipeline Processing Error: Internal system parsing limits exceeded.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsText(file);
  };

  const DownloadReportFile = () => {
    if (!report) return;
    const content = `GEN-OS ANALYSIS EXPORT\n====================\nRecommended Track: ${report.guidance.recommendedSector}\nVector Confidence: ${(report.guidance.sectorMatchConfidence * 100).toFixed(2)}%\n\nBaseline Sector Expectations:\n${report.guidance.sectorBaselineRequirements}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gen-os-career-path.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const scorePct = report ? Math.round(report.guidance.sectorMatchConfidence * 100) : 0;

  return (
    <main className="dashboard-grid">
      <section className="panel panel-upload">
        <div className="panel-header">
          <h2>Input Control Matrix</h2>
          <span className="tag">Local Ingestion Engine</span>
        </div>
        <div 
          className="upload-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
          }}
        >
          <div>
            <p>Drag & drop resume configuration data here</p>
            <p>or</p>
            <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary">Browse File</button>
          </div>
          <input ref={fileInputRef} type="file" onChange={(e) => e.target.files[0] && setFile(e.target.files[0])} hidden />
        </div>
        <div className="upload-info">{file ? `Target Matrix: ${file.name}` : "No file selected yet."}</div>
        <div className="action-row">
          <button onClick={TriggerPipelineExecution} className="btn btn-primary">Execute Profiler Pipeline</button>
          <button onClick={() => { setFile(null); setReport(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="btn btn-muted">Reset Matrix</button>
        </div>
      </section>

      <section className="panel panel-summary">
        <div className="panel-header">
          <h2>AI Career Path Analyzer</h2>
          <span className="tag status">Algorithmic Match</span>
        </div>
        <div className="career-guidance-card">
          <span className="card-meta">Optimal Role Fit Classification:</span>
          <h3>{report ? report.guidance.recommendedSector : "Awaiting Pipeline Execution..."}</h3>
          <p>{report ? report.guidance.strategicGuidance : ""}</p>
        </div>
        <div className="metrics-grid" style={{ marginTop: '16px' }}>
          <div className="metric-card">
            <span>Profile Vector Alignment</span>
            <div className="score-circle"><span>{scorePct}</span><small>/100</small></div>
          </div>
          <div className="metric-card">
            <span>Core Skill Coverage</span>
            <div className="progress-block">
              <div className="progress-value">{scorePct}%</div>
              <div className="progress-bar"><span style={{ width: `${scorePct}%`, display: 'block', height: '100%' }}></span></div>
            </div>
          </div>
        </div>
        <div className="chart-wrapper"><canvas ref={chartRef} aria-label="Skill match chart"></canvas></div>
      </section>

      <section className="panel panel-details">
        <div className="panel-header">
          <h2>Analysis Output Extraction</h2>
          <span>Parsed Entity Arrays</span>
        </div>
        <div className="status-group">
          <div className="status-card">
            <h3>Extracted Identity Matrix</h3>
            <p><strong>Email:</strong> <span>{report ? report.profile.email : "-"}</span></p>
            <p><strong>Phone:</strong> <span>{report ? report.profile.phone : "-"}</span></p>
          </div>
        </div>
        <div className="requirements-reveal-panel" style={{ marginBottom: '20px', background: 'var(--surface-strong)', border: '1px solid var(--border)', padding: '16px', borderRadius: '4px' }}>
          <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', margin: '0 0 12px', color: 'var(--primary)' }}>AI Discovered Target Requirements</h3>
          <div style={{ fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--text-muted)' }}>{report ? report.guidance.sectorBaselineRequirements : "Awaiting profile metrics parsing..."}</div>
        </div>
        <div className="keywords-panel">
          <div>
            <h3>Keywords Found In Profile</h3>
            <div className="keywords-list">{report && report.profile.skills.length > 0 ? report.profile.skills.map((skill, i) => <span key={i}>{skill}</span>) : <span>Empty Array</span>}</div>
          </div>
          <div>
            <h3>Skills to Acquire for Target Role</h3>
            <div className="keywords-list missing">{report && report.guidance.missingSkills.length > 0 ? report.guidance.missingSkills.map((skill, i) => <span key={i}>{skill}</span>) : <span>Optimized</span>}</div>
          </div>
        </div>
        <div className="report-actions">
          <button onClick={DownloadReportFile} className="btn btn-primary" disabled={!report}>Download Report</button>
        </div>
      </section>

      {isAnalyzing && (
        <div className="loader-overlay">
          <div className="loader-card">
            <div className="spinner"></div>
            <p>Analyzing profile matrices and indexing career vectors...</p>
          </div>
        </div>
      )}
    </main>
  );
}

// ==========================================
// STATIC NAVIGATION CONTENT COMPONENT MATRIX
// ==========================================
function HomePage({ setPage }) {
  return (
    <div className="static-container">
      <h2>Welcome to Career Core Matrix</h2>
      <p>An automated diagnostic framework configured to analyze complex vector structures inside unstructured candidate datasets.</p>
      <div style={{ marginTop: '24px' }}>
        <button className="btn btn-primary" onClick={() => setPage('profiler')}>Launch AI-Profiler Pipeline</button>
      </div>
    </div>
  );
}

function ContactPage() {
  return (
    <div className="static-container">
      <h2>Systems Administrator Interface</h2>
      <p>File telemetry pipelines, repository configuration issues, or core architectural feedback parameters can be routed directly below.</p>
      <div className="status-card" style={{ marginTop: '16px', maxWidth: '400px' }}>
        <p><strong>Developer Alias:</strong> Srijan / Rohit</p>
        <p><strong>Routing Node:</strong> system-admin@domain.local</p>
        <p><strong>Environment Status:</strong> Production / Stable</p>
      </div>
    </div>
  );
}

// ==========================================
// MASTER ROOT APPLICATION COMPONENT
// ==========================================
function App() {
  const [theme, setTheme] = useState('dark');
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="page-shell">
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setCurrentPage('home')}>
          <div className="brand-icon">GEN</div>
          <span className="brand-title">CORE-OS</span>
        </div>
        
        <div className="nav-links">
          <button className={`nav-link ${currentPage === 'home' ? 'active' : ''}`} onClick={() => setCurrentPage('home')}>Home</button>
          <button className={`nav-link ${currentPage === 'profiler' ? 'active' : ''}`} onClick={() => setCurrentPage('profiler')}>AI-Profiler</button>
          <button className={`nav-link ${currentPage === 'contact' ? 'active' : ''}`} onClick={() => setCurrentPage('contact')}>Contact Dev</button>
        </div>

        <button 
          onClick={() => setTheme(p => p === 'dark' ? 'light' : 'dark')} 
          className="theme-toggle"
          aria-label="Toggle runtime presentation theme"
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </nav>

      <div className="content-viewport">
        {currentPage === 'home' && <HomePage setPage={setCurrentPage} />}
        {currentPage === 'profiler' && <AIProfiler theme={theme} />}
        {currentPage === 'contact' && <ContactPage />}
      </div>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
}