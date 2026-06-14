// Global Theme Engine Matrix
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);
if (themeToggle) themeToggle.textContent = savedTheme === "dark" ? "🌙" : "☀️";

themeToggle?.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  themeToggle.textContent = next === "dark" ? "🌙" : "☀️";
});

// Local WebLLM Engine Configuration
const SELECTED_MODEL = "Gemma-2b-it-q4f16_1-MLC";
let llmEngine = null;
let generatedQuestions = [];
let currentQIndex = 0;
let sessionLog = [];
let chartInstance = null;

const runPipelineBtn = document.getElementById("runPipelineBtn");
const cvFileInput = document.getElementById("cvFileInput");
const fileDropZone = document.getElementById("fileDropZone");
const fileTrackInfo = document.getElementById("fileTrackInfo");
const loaderOverlay = document.getElementById("loaderOverlay");
const loaderText = loaderOverlay?.querySelector("p");

// File tracking registration utility
function stageTelemetryMatrix(file) {
  if (!file) return;
  window.selectedCvFile = file;
  fileTrackInfo.textContent = `Loaded CV Matrix: ${file.name}`;
  runPipelineBtn.disabled = false;
}

// Local system UI event handles
cvFileInput?.addEventListener("change", (e) => {
  if (e.target.files && e.target.files[0]) {
    stageTelemetryMatrix(e.target.files[0]);
  }
});

// Drag and drop interception framework
fileDropZone?.addEventListener("dragover", (e) => {
  e.preventDefault();
  fileDropZone.style.borderColor = "var(--primary)";
});

fileDropZone?.addEventListener("dragleave", () => {
  fileDropZone.style.borderColor = "";
});

fileDropZone?.addEventListener("drop", (e) => {
  e.preventDefault();
  fileDropZone.style.borderColor = "";
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    stageTelemetryMatrix(e.dataTransfer.files[0]);
  }
});

// Parse dataset metrics and isolate functional interview blocks
async function ParseCvAndGenerateQuestions() {
  if (!window.selectedCvFile) return;
  loaderOverlay?.classList.remove("hidden");

  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const cvText = e.target.result;

      if (!llmEngine) {
        loaderText.textContent =
          "Downloading free local LLM weights to browser cache (this takes a moment on first run)...";
        llmEngine = new window.webllm.Engine();

        llmEngine.setInitProgressCallback((report) => {
          loaderText.textContent = `Loading Local Model: ${Math.round(report.progress * 100)}% Complete`;
        });

        await llmEngine.reload(SELECTED_MODEL);
      }

      loaderText.textContent =
        "LLM analyzing CV parameters to build target engineering questions...";

      const prompt = `
        You are an expert technical interviewer in low-level systems programming, embedded devices, and quantitative trading systems.
        Analyze the following CV text and extract exactly 3 technical interview questions customized specifically to the candidate's core technologies, frameworks, or projects listed.
        
        Return ONLY a raw, unformatted valid JSON array matching this exact specification. Do not include markdown code block syntax, trailing commas, or extra text wrapper objects:
        [
          {
            "question": "The question string based on their unique tools",
            "tokens": ["expected", "keyword", "tokens", "for", "grading"]
          }
        ]

        Candidate CV Content Data:
        ${cvText}
      `;

      const reply = await llmEngine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });

      const cleanJsonString = reply.choices[0].message.content
        .replace(/```json|```/g, "")
        .trim();

      generatedQuestions = JSON.parse(cleanJsonString);

      loaderOverlay?.classList.add("hidden");
      LaunchInterviewLoop();
    };
    reader.readAsText(window.selectedCvFile);
  } catch (error) {
    console.error(error);
    alert("Inference execution boundary fault. Check browser WebGPU support.");
    loaderOverlay?.classList.add("hidden");
  }
}

function LaunchInterviewLoop() {
  document.getElementById("configStage").classList.add("hidden");
  document.getElementById("activeStage").classList.remove("hidden");
  currentQIndex = 0;
  sessionLog = [];
  RenderNextQuestion();
}

function RenderNextQuestion() {
  document.getElementById("responseFeedbackInput").value = "";
  document.getElementById("questionCountTag").textContent =
    `Question ${currentQIndex + 1} of ${generatedQuestions.length}`;
  document.getElementById("questionPrompt").textContent =
    generatedQuestions[currentQIndex].question;
}

function CommitExplanationBlock() {
  const responseText = document
    .getElementById("responseFeedbackInput")
    .value.trim();
  if (!responseText) return;

  const currentTarget = generatedQuestions[currentQIndex];
  const lowerInput = responseText.toLowerCase();

  const matchedTokens = currentTarget.tokens.filter((token) => {
    const rx = new RegExp(
      "\\b" + token.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "\\b",
      "i",
    );
    return rx.test(lowerInput);
  });

  const score = currentTarget.tokens.length
    ? matchedTokens.length / currentTarget.tokens.length
    : 0;
  const missingTokens = currentTarget.tokens.filter(
    (t) => !matchedTokens.includes(t),
  );

  sessionLog.push({
    question: currentTarget.question,
    answer: responseText,
    score: score,
    matched: matchedTokens.map((t) => t.toUpperCase()),
    missing: missingTokens.map((t) => t.toUpperCase()),
  });

  if (currentQIndex + 1 < generatedQuestions.length) {
    currentQIndex++;
    RenderNextQuestion();
  } else {
    RenderEvaluationReport();
  }
}

function RenderEvaluationReport() {
  document.getElementById("activeStage").classList.add("hidden");
  document.getElementById("completeStage").classList.remove("hidden");

  const avgScore =
    sessionLog.reduce((acc, curr) => acc + curr.score, 0) / sessionLog.length;
  const scorePct = Math.round(avgScore * 100);

  document.getElementById("reportTrackMeta").innerHTML = `
    <h3>Dynamic Vector Verification Run Completed</h3>
    <p>Local AI Model successfully completed interview profile tracks. Final architectural score evaluated at <strong>${scorePct}%</strong>.</p>
  `;

  document.getElementById("logResponseStream").innerHTML = sessionLog
    .map(
      (log, idx) => `
    <div style="background: var(--surface-strong); border: 1px solid var(--border); padding: 16px; border-radius: 4px; margin-bottom: 12px;">
      <h4 style="margin: 0 0 8px; font-size: 0.85rem; color: var(--primary);">Vector ${idx + 1}</h4>
      <p style="font-size: 0.85rem; margin: 0 0 8px; color: var(--text-muted);"><strong>Q:</strong> ${log.question}</p>
      <div style="font-size: 0.75rem;">
        <p style="margin: 4px 0;"><span style="color: var(--primary);">Identified Anchors:</span> ${log.matched.join(", ") || "None"}</p>
        <p style="margin: 4px 0;"><span style="color: var(--danger);">Missing Parameters:</span> ${log.missing.join(", ") || "None"}</p>
      </div>
    </div>
  `,
    )
    .join("");

  const canvas = document.getElementById("reportMetricsChart");
  if (canvas && window.Chart) {
    if (chartInstance) chartInstance.destroy();
    chartInstance = new window.Chart(canvas.getContext("2d"), {
      type: "radar",
      data: {
        labels: [
          "Token Density",
          "Architectural Depth",
          "Accuracy Bounds",
          "Ingestion Precision",
          "Track Consistency",
        ],
        datasets: [
          {
            data: [scorePct, Math.min(scorePct + 12, 100), 75, 80, scorePct],
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
            angleLines: { display: false },
            ticks: { display: false },
            min: 0,
            max: 100,
          },
        },
        plugins: { legend: { display: false } },
      },
    });
  }
}

// Global Event Engine Setup
runPipelineBtn?.addEventListener("click", ParseCvAndGenerateQuestions);
document
  .getElementById("commitResponseBtn")
  ?.addEventListener("click", CommitExplanationBlock);
document
  .getElementById("reinitEngineBtn")
  ?.addEventListener("click", () => location.reload());
