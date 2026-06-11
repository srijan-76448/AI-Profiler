const { useState, useEffect, useRef } = React;

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

function App() {
  const [theme, setTheme] = useState('dark');
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState(DEFAULT_KNOWLEDGE_BASE);
  const [report, setReport] = useState(null);
  
  const fileInputRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

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
    const skillsFound = new Set();
    
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
    if (!file) return alert('Input data trace missing.');
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
        setReport({
          profile: parsedProfile,
          guidance: {
            recommendedSector: bestSector,
            sectorMatchConfidence: parseFloat(highestScore.toFixed(4)),
            sectorBaselineRequirements: knowledgeBase[bestSector].requirements,
            strategicGuidance: evaluationOutput.matched.length > 0
              ? `Your profile demonstrates substantial technical alignment with '${bestSector}'. Analysis reveals core competencies in ${coreStrengths}.`
              : `Your core text blocks match closest with the '${bestSector}' domain blueprint.`,
            missingSkills: evaluationOutput.missing
          }
        });
      } catch (err) {
        alert("Pipeline Processing Error.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsText(file);
  };

  const scorePct = report ? Math.round(report.guidance.sectorMatchConfidence * 100) : 0;

  return (
    <div className="page-shell">
      <nav className="navbar">
        <div className="nav-brand">
          <div className="brand-icon">GEN</div>
          <span className="brand-title">CORE-OS</span>
        </div>
        <div className="nav-links">
          <a href="../index.html" class="nav-link">Home</a>
          <a href="index.html" class="nav-link active">AI-Profiler</a>
          <a href="../contact-us/index.html" class="nav-link">Contact Dev</a>
        </div>
        <button onClick={() => setTheme(p => p === 'dark' ? 'light' : 'dark')} className="theme-toggle">
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </nav>

      <div className="content-viewport">
        <div className="dashboard-grid">
          <section className="panel">
            <div className="panel-header"><h2>Input Control Matrix</h2></div>
            <div className="upload-dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }}>
              <p>Drag & drop file here or</p>
              <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary" style={{marginTop:'8px'}}>Browse</button>
              <input ref={fileInputRef} type="file" onChange={e => e.target.files[0] && setFile(e.target.files[0])} hidden />
            </div>
            <div className="upload-info">{file ? `File: ${file.name}` : "No file loaded."}</div>
            <div className="action-row">
              <button onClick={TriggerPipelineExecution} className="btn btn-primary">Execute Pipeline</button>
            </div>
          </section>

          <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
            <section className="panel">
              <div className="panel-header"><h2>AI Career Path Analyzer</h2></div>
              <div className="career-guidance-card">
                <span className="card-meta">Optimal Role Fit Classification:</span>
                <h3>{report ? report.guidance.recommendedSector : "Awaiting Execution..."}</h3>
                <p>{report ? report.guidance.strategicGuidance : ""}</p>
              </div>
              <div className="metrics-grid" style={{ marginTop: '16px' }}>
                <div className="metric-card">
                  <span>Profile Vector Alignment</span>
                  <div className="score-circle"><span>{scorePct}</span><small>/100</small></div>
                </div>
                <div className="metric-card">
                  <span>Core Skill Coverage</span>
                  <div className="progress-bar"><span style={{ width: `${scorePct}%`, display: 'block', height: '100%' }}></span></div>
                </div>
              </div>
              <div className="chart-wrapper"><canvas ref={chartRef}></canvas></div>
            </section>

            <section className="panel">
              <div className="panel-header"><h2>Analysis Output</h2></div>
              <div className="status-card">
                <p><strong>Email:</strong> {report ? report.profile.email : "-"}</p>
                <p><strong>Phone:</strong> {report ? report.profile.phone : "-"}</p>
              </div>
              <div className="keywords-panel">
                <div>
                  <h3>Keywords Found</h3>
                  <div className="keywords-list">{report && report.profile.skills.map((s, i) => <span key={i}>{s}</span>)}</div>
                </div>
                <div>
                  <h3>Skills to Acquire</h3>
                  <div className="keywords-list missing">{report && report.guidance.missingSkills.map((s, i) => <span key={i}>{s}</span>)}</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {isAnalyzing && <div className="loader-overlay"><div className="loader-card"><div className="spinner"></div><p>Processing vectors...</p></div></div>}
    </div>
  );
}

const container = document.getElementById('root');
if (container) ReactDOM.createRoot(container).render(<App />);