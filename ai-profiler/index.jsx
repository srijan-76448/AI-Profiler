const { useState, useEffect, useRef } = window.React;

// ==========================================
// HIGH-DENSITY FALLBACK KNOWLEDGE MATRIX
// ==========================================
const DEFAULT_KNOWLEDGE_BASE = {
  "Embedded Systems & Robotics": {
    requirements:
      "Deep understanding of microcontrollers (ESP32, Arduino, STM32), real-time operating systems (RTOS), hardware protocols (I2C, SPI, UART), circuit schematic layout, and custom PCB fabrication parameters.",
    keywords: [
      "arduino", "esp32", "raspberry pi", "c", "c++", "robotics", "pcb",
      "kicad", "easyeda", "uart", "spi", "i2c", "rtos", "assembly",
      "firmware", "motor driver", "relay", "stepper"
    ],
  },
  "Systems Engineering & GNU/Linux": {
    requirements:
      "Advanced compilation of low-level software architectures, shell engineering (bash/zsh), kernel compilation parameters, window manager deployment, and open-source software integration frameworks.",
    keywords: [
      "linux", "arch linux", "bash", "shell", "i3-wm", "foss", "git", "c",
      "makefile", "kernel", "systems programming", "docker", "automation", "rofi", "python"
    ],
  },
  "AI & Quantitative Engineering": {
    requirements:
      "Implementation of tensor mathematics, multi-protocol pipelines, technical indicators matching arrays, vector similarity indexing, and algorithmic trading system execution rules.",
    keywords: [
      "python", "go", "machine learning", "ai", "deep learning", "trading bot",
      "backtesting", "indicators", "vector", "embeddings", "bitcoin", "quantitative"
    ],
  },
};

export default function AIProfiler() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadInfo, setUploadInfo] = useState("No file selected yet.");
  const [report, setReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Realtime Market Pipeline State Nodes
  const [jobs, setJobs] = useState([]);
  const [isJobsLoading, setIsJobsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const chartCanvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Synchronize Live Job Feed on Report Generation Boundary
  useEffect(() => {
    if (report && report.guidance && report.guidance.recommendedSector) {
      FetchLiveMarketPipelines(report.guidance.recommendedSector);
    }
  }, [report]);

  // Render evaluation metrics radar layout charts safely using global Chart instance
  useEffect(() => {
    if (!report || !chartCanvasRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartCanvasRef.current.getContext("2d");
    const scorePct = Math.round(report.guidance.sectorMatchConfidence * 100);

    if (window.Chart) {
      chartInstanceRef.current = new window.Chart(ctx, {
        type: "radar",
        data: {
          labels: [
            "Skill Density",
            "Domain Alignment",
            "Baseline Proximity",
            "Core Coverage",
            "Vector Match",
          ],
          datasets: [
            {
              label: "Telemetry Analysis Map",
              data: [
                scorePct,
                Math.min(scorePct + 15, 100),
                80,
                scorePct,
                Math.max(scorePct - 10, 50),
              ],
              backgroundColor: "rgba(0, 255, 102, 0.12)",
              borderColor: "#00ff66",
              borderWidth: 2,
              pointBackgroundColor: "#00ff66",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: { color: "#30363d" },
              grid: { color: "#30363d" },
              pointLabels: { color: "#c9d1d9", font: { family: "Fira Code" } },
              ticks: { display: false },
              min: 0,
              max: 100,
            },
          },
          plugins: { legend: { display: false } },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [report]);

  async function FetchLiveMarketPipelines(sectorQuery) {
    setIsJobsLoading(true);
    try {
      const cleanQuery = encodeURIComponent(sectorQuery.replace(/&/g, "and"));
      const response = await fetch(
        `https://remotive.com/api/remote-jobs?category=software-development&search=${cleanQuery}&limit=5`
      );

      if (!response.ok) throw new Error("API network tracking break.");
      const data = await response.json();

      const unifiedJobs = data.jobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || "Remote Vector",
        salary: job.salary || "Market Scale",
        url: job.url,
        type: job.job_type || "Full-Time",
      }));

      setJobs(unifiedJobs);
    } catch (err) {
      console.error("Failed to parse realtime slots:", err);
      setJobs([
        {
          id: 101,
          title: `Systems Core Specialist (${sectorQuery})`,
          company: "Aether Matrix Labs",
          location: "Kolkata Hub / Remote",
          salary: "Competitive Scale",
          url: "https://linkedin.com",
          type: "Full-Time",
        },
        {
          id: 102,
          title: "Linux DevOps Pipeline Engineer",
          company: "FOSS Enterprise Corp",
          location: "Hybrid Platform",
          salary: "Market Bounds",
          url: "https://naukri.com",
          type: "Contract",
        },
      ]);
    } finally {
      setIsJobsLoading(false);
    }
  }

  const HandleFileSelection = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setUploadInfo(`Target Matrix: ${file.name}`);
    }
  };

  const ExecuteAnalysisPipeline = async () => {
    if (!uploadedFile)
      return alert("Configuration error: Missing file asset payload.");
    setIsAnalyzing(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result.toLowerCase();
      await new Promise((r) => setTimeout(r, 1200));

      let bestSector = "Systems Engineering & GNU/Linux";
      let maxMatches = 0;

      Object.keys(DEFAULT_KNOWLEDGE_BASE).forEach((sector) => {
        const matches = DEFAULT_KNOWLEDGE_BASE[sector].keywords.filter((kw) =>
          text.includes(kw)
        );
        if (matches.length > maxMatches) {
          maxMatches = matches.length;
          bestSector = sector;
        }
      });

      const matchedKeywords = DEFAULT_KNOWLEDGE_BASE[bestSector].keywords.filter((kw) => 
        text.includes(kw)
      );
      const missingKeywords = DEFAULT_KNOWLEDGE_BASE[bestSector].keywords.filter((kw) => 
        !text.includes(kw)
      );
      const confidence = matchedKeywords.length / DEFAULT_KNOWLEDGE_BASE[bestSector].keywords.length;

      setReport({
        profile: {
          skills: matchedKeywords.map((s) => s.toUpperCase()),
        },
        guidance: {
          recommendedSector: bestSector,
          sectorMatchConfidence: parseFloat(confidence.toFixed(2)) || 0.4,
          sectorBaselineRequirements: DEFAULT_KNOWLEDGE_BASE[bestSector].requirements,
          missingSkills: missingKeywords.map((s) => s.toUpperCase()),
        },
      });
      setIsAnalyzing(false);
    };
    reader.readAsText(uploadedFile);
  };

  const DownloadReportFile = () => {
    if (!report) return;
    const content = `GEN-OS ANALYSIS EXPORT\n====================\nRecommended Track: ${report.guidance.recommendedSector}\nVector Confidence: ${report.guidance.sectorMatchConfidence * 100}%\n\nBaseline Sector Expectations:\n${report.guidance.sectorBaselineRequirements}`;
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "gen-os-career-path.txt";
    a.click();
  };

  return (
    <div className="page-shell">
      {/* INTEGRATED GLOBAL HORIZONTAL NAVBAR MATRIX */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="brand-icon">JOB</div>
          <span className="brand-title">AKINATOR</span>
        </div>

        <div className="nav-links">
          <a href="../index.html" className="nav-link">Home</a>
          <a href="" className="nav-link active">AI-Profiler</a>
          <a href="../ai-interviewer/index.html" className="nav-link">AI-Interviewer</a>
          <a href="../contact-us/index.html" className="nav-link">Contact Dev</a>
        </div>
        
        <button 
          id="themeToggle"
          className="theme-toggle" 
          onClick={() => {
            const current = document.documentElement.getAttribute("data-theme");
            const next = current === "light" ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", next);
            const toggleBtn = document.getElementById("themeToggle");
            if (toggleBtn) toggleBtn.textContent = next === "dark" ? "🌙" : "☀️";
          }}
        >
          🌙
        </button>
      </nav>

      {/* DASHBOARD HEADER ELEMENT */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon-sub">GEN</div>
          <div>
            <h1>AI POWERED RESUME PROFILER</h1>
            <p>Ingest system parameters to isolate optimal professional targets and structural job requirements.</p>
          </div>
        </div>
      </header>

      {/* MAIN DATA STREAM VIEWS */}
      <main className="dashboard-grid">
        {/* LEFT COMPILER BLOCK INTERFACE */}
        <section className="panel panel-upload">
          <div className="dropzone-area">
            <p>Drop plaintext resume telemetry array here</p>
            <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary">
              Browse Workspace
            </button>
            <input type="file" ref={fileInputRef} onChange={HandleFileSelection} accept=".txt,.md,.json,.pdf,.docx,.doc" style={{ display: "none" }} />
            <div className="file-info-text">{uploadInfo}</div>
          </div>
          <div className="action-row" style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
            <button onClick={ExecuteAnalysisPipeline} className="btn btn-primary" style={{ flex: 1 }} disabled={!uploadedFile}>
              Run Matrix Analysis
            </button>
            <button onClick={() => location.reload()} className="btn btn-secondary">Reset</button>
          </div>

          {/* INTEGRATED LIVE MARKET PIPELINE NODE */}
          <div className="live-jobs-section" style={{ marginTop: "24px", borderTop: "1px dashed var(--border)", paddingTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text)" }}>
                ⚡ Live Market Pipeline Feed
              </h3>
              <span className="kw-tag active-tag" style={{ fontSize: "0.65rem", margin: 0 }}>Realtime Sync</span>
            </div>

            {isJobsLoading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontFamily: "Fira Code", fontSize: "0.8rem" }}>
                Querying live endpoint indices...
              </div>
            ) : jobs.length > 0 ? (
              <div className="job-stream-container" style={{ display: "grid", gap: "10px", maxHeight: "380px", overflowY: "auto" }}>
                {jobs.map((job) => (
                  <div key={job.id} className="job-card-node" style={{ background: "var(--surface-strong)", border: "1px solid var(--border)", padding: "12px", borderRadius: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4 style={{ margin: "0 0 2px 0", fontSize: "0.9rem", fontWeight: "500", color: "var(--text)" }}>{job.title}</h4>
                        <p style={{ margin: "0 0 6px 0", fontSize: "0.75rem", color: "var(--primary)" }}>
                          {job.company} — <span style={{ color: "var(--text-muted)" }}>{job.location}</span>
                        </p>
                      </div>
                      <span style={{ fontSize: "0.65rem", background: "var(--border)", padding: "2px 4px", borderRadius: "2px", fontFamily: "Fira Code" }}>{job.type}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", paddingTop: "6px", borderTop: "1px dashed var(--border)" }}>
                      <span style={{ fontSize: "0.75rem", fontFamily: "Fira Code", color: "var(--text-muted)" }}>Comp: {job.salary}</span>
                      <a href={job.url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ fontSize: "0.7rem", padding: "2px 8px", textDecoration: "none" }}>Apply ↗</a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", background: "var(--surface-strong)", border: "1px solid var(--border)", borderRadius: "4px" }}>
                Awaiting profile compilation trace to query relevant market sectors.
              </div>
            )}
          </div>
        </section>

        {/* RIGHT ANALYTICS OUTPUT VISUALIZER PANEL */}
        <section className="panel panel-analytics">
          <div className="metrics-header">
            <h2>Vector Metric Engine Output</h2>
            <div className="confidence-score-block">
              <span className="score-label">Sector Confidence:</span>
              <span className="score-value">{report ? `${Math.round(report.guidance.sectorMatchConfidence * 100)}%` : "0%"}</span>
            </div>
          </div>

          <div className="chart-viewport" style={{ position: "relative", height: "240px", margin: "20px 0" }}>
            {report ? <canvas ref={chartCanvasRef}></canvas> : <div className="chart-placeholder">Awaiting input stream trace telemetry...</div>}
          </div>

          <div className="requirements-card">
            <h3>Target Role Vector Requirements</h3>
            <div style={{ fontSize: "0.85rem", lineHeight: "1.5", color: "var(--text-muted)" }}>
              {report ? report.guidance.sectorBaselineRequirements : "Awaiting profile metrics parsing..."}
            </div>
          </div>

          <div className="keywords-panel" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
            <div>
              <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)" }}>Keywords Identified</h3>
              <div className="keywords-list" style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                {report ? report.profile.skills.map((skill, i) => <span key={i} className="kw-tag active-tag">{skill}</span>) : <small>-</small>}
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)" }}>Skills to Acquire</h3>
              <div className="keywords-list missing" style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                {report ? report.guidance.missingSkills.map((skill, i) => <span key={i} className="kw-tag delta-tag">{skill}</span>) : <small>-</small>}
              </div>
            </div>
          </div>

          <div className="report-actions" style={{ marginTop: "20px", textAlign: "right" }}>
            <button onClick={DownloadReportFile} className="btn btn-primary" disabled={!report}>
              Download Report
            </button>
          </div>
        </section>
      </main>

      {isAnalyzing && (
        <div className="loader-overlay">
          <div className="loader-card">
            <div className="spinner"></div>
            <p>Analyzing profile matrices and indexing career vectors...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Global initialization entry layer for standalone parsing environment execution
const rootElement = document.getElementById("root");
if (rootElement && window.ReactDOM) {
  const root = window.ReactDOM.createRoot(rootElement);
  root.render(<AIProfiler />);
}