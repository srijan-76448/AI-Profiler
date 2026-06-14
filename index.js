// Runtime Layout Vector Initializer
const toggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);
toggle.textContent = savedTheme === "dark" ? "🌙" : "☀️";

toggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  toggle.textContent = next === "dark" ? "🌙" : "☀️";
});

// High Density Mock Array Generator Factory (50+ Data Slots)
const domains = [
  {
    name: "Embedded Systems & Robotics",
    badge: "badge-embedded",
    titles: ["Firmware Architect", "Robotics Systems Engineer", "Hardware Prototyping Specialist", "PCB Design Engineer", "RTOS Kernel Developer", "Microcontroller Expert (ESP32/STM32)", "IoT Edge Solutions Architect", "Controls & Actuators Engineer"],
    skills: ["C", "C++", "Assembly", "RTOS", "I2C", "SPI", "UART", "KiCad", "EasyEDA", "FreeRTOS", "Verilog"]
  },
  {
    name: "Systems Engineering & GNU/Linux",
    badge: "badge-systems",
    titles: ["Linux Systems Engineer", "Kernel Maintenance Developer", "Infrastructure Automation Architect", "Shell Engineering Specialist", "FOSS Integration Engineer", "Site Reliability Engineer (SRE)", "Systems Automation Engineer", "Arch Deployment Architect"],
    skills: ["Linux", "Arch Linux", "Bash", "i3-wm", "Git", "Makefile", "POSIX C", "Docker", "Rofi", "Python"]
  },
  {
    name: "AI & Quantitative Engineering",
    badge: "badge-ai",
    titles: ["Quantitative Trading Developer", "AI Pipeline Engineer", "Machine Learning Infrastructure Architect", "Tensor Mathematics Optimization Specialist", "Algorithmic System Strategy Engineer", "Vector Similarity Data Engineer", "Go-Lang Pipeline Engineer", "HFT Trading Systems Developer"],
    skills: ["Python", "Go", "TensorFlow", "NumPy", "Pandas", "FastAPI", "Cosine Similarity", "Scikit-Learn", "Bitcoin API"]
  }
];

const locations = ["Kolkata, IN", "Remote, Global", "Bengaluru, IN", "Berlin, DE", "Tokyo, JP", "San Francisco, US", "Munich, DE"];
const types = ["Remote", "On-Site", "Hybrid"];
const companies = ["Helix Robotics", "Quantum Systems", "Aether FOSS Labs", "Neural Matrix", "Apex Trading Group", "Byteforge Global", "Vector Intelligence", "Core-OS Systems"];

const rawJobsDataset = [];

// Construct exactly 54 high-density computational listings
for (let i = 1; i <= 54; i++) {
  const domainChoice = domains[i % domains.length];
  const titleChoice = domainChoice.titles[Math.floor(Math.random() * domainChoice.titles.length)];
  const compChoice = companies[Math.floor(Math.random() * companies.length)];
  const locChoice = locations[Math.floor(Math.random() * locations.length)];
  const typeChoice = types[i % types.length];
  
  // Shuffle skills array subset
  const sampleSkills = [...domainChoice.skills].sort(() => 0.5 - Math.random()).slice(0, 4);
  const compensation = `${12 + (i % 8) * 4}LPA - ${22 + (i % 10) * 5}LPA`;

  rawJobsDataset.push({
    id: i,
    title: `${titleChoice} [Node-${1000 + i}]`,
    company: compChoice,
    domain: domainChoice.name,
    badgeClass: domainChoice.badge,
    location: locChoice,
    type: typeChoice,
    salary: compensation,
    skills: sampleSkills
  });
}

// Dom Ingestion Elements
const container = document.getElementById("jobsContainer");
const searchInput = document.getElementById("searchInput");
const counter = document.getElementById("matchCounter");

function RenderFilteredMatrix() {
  const query = searchInput.value.toLowerCase();
  
  const activeDomains = Array.from(document.querySelectorAll(".domain-filter:checked")).map(el => el.value);
  const activeTypes = Array.from(document.querySelectorAll(".type-filter:checked")).map(el => el.value);

  const items = rawJobsDataset.filter(job => {
    const textMatch = job.title.toLowerCase().includes(query) || 
                      job.company.toLowerCase().includes(query) || 
                      job.skills.some(s => s.toLowerCase().includes(query));
    const domainMatch = activeDomains.includes(job.domain);
    const typeMatch = activeTypes.includes(job.type);
    return textMatch && domainMatch && typeMatch;
  });

  counter.textContent = `${items.length} Target Configurations Found`;
  container.innerHTML = "";

  if(items.length === 0) {
    container.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted); border: 1px dashed var(--border)">Zero nodes matched active pipeline definitions.</div>`;
    return;
  }

  items.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-card";
    card.innerHTML = `
      <div class="job-main">
        <h2>${job.title}</h2>
        <div class="company-meta">${job.company}</div>
        <div class="job-details">
          <span>📍 ${job.location}</span>
          <span>💼 ${job.type}</span>
          <span>📊 ${job.salary}</span>
        </div>
        <div class="tag-container">
          ${job.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
      </div>
      <div class="job-action">
        <span class="domain-badge ${job.badgeClass}">${job.domain.split(' & ')[0]}</span>
        <button class="btn btn-primary" onclick="alert('System Vector Hooked: Payload pipeline initialized for Node-${1000 + job.id}')">Initialize Application</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Dynamic Filter Trigger Hooks
searchInput.addEventListener("input", RenderFilteredMatrix);
document.querySelectorAll(".domain-filter, .type-filter").forEach(input => {
  input.addEventListener("change", RenderFilteredMatrix);
});

// Execute Boot Sequence
RenderFilteredMatrix();