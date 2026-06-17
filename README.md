# Job-Akinator 🚀

An AI-powered interactive resume profiling and career-matching pipeline. Built on the core logic of gamified elimination, **Job-Akinator** bypasses passive, legacy keyword-matching systems. Instead, it relies on an interactive state machine powered by Large Language Models (LLMs) and dense semantic vector spaces to deduce hidden candidate competencies and evaluate alignment against complex target architectures.

---

## 🏗️ System Architecture & Mechanics

The engine decouples structural extraction from the stochastic interactive reasoning loop to minimize high-compute overhead:

```
              ┌──────────────────────────────┐
              │      Unstructured PDF        │
              └──────────────┬───────────────┘
                             │ Ingestion Layer
                             ▼
              ┌──────────────────────────────┐
              │ Determinsitic Parser Engine  │
              └──────────────┬───────────────┘
                             │
              ┌──────────────┴───────────────┐
              │ Entity Indexing & Mapping    │
              └──────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │    Dense Vector Space Embeds │
              └──────────────┬───────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                   INTERACTIVE ORCHESTRATION LOOP               │
│                                                                │
│    ┌───────────────┐  Dynamic Context   ┌──────────────────┐   │
│    │   LLM Engine  ├───────────────────>│ Stateful UI/CLI  │   │
│    │  (Prompt Gen) │                    │(Elimination Loop)│   │
│    └───────▲───────┘                    └────────┬─────────┘   │
│            │                                     │             │
│            └─────────────────────────────────────┘             │
│                     Structured Vector Feedback                 │
└────────────────────────────────────────────────────────────────┘
```

### Core Pipeline Layers
1. **Deterministic Ingestion**: Processes multi-format byte streams without losing metadata. Strips non-functional structural indicators to avoid token inflation.
2. **Semantic Vector Store**: Map skills, tools, frameworks, and system architectures into a dense vector space to enable mathematical calculations of structural alignment.
3. **Stateful Eliminative Loop**: Tracks a probabilistic weighting array. Fires targeted, context-isolated questions to the user to reveal experience elements that standard static parsing processes typically miss.

---

## 📊 Alignment Scoring Framework

The match evaluation vector uses a strict multi-variable formula to compute compatibility scores:

$$\text{Final Profiling Index} = \alpha \cdot \mathbf{S}_{v} + \beta \cdot \mathbf{A}_{m} - \gamma \cdot \mathbf{D}_{k}$$

Where:

* $\mathbf{S}_{v}$: **Semantic Similarity Matrix** (Cosine distance between profile vector space and job architecture coordinates).
* $\mathbf{A}_{m}$: **Architectural Alignment Index** (Hard matching verification for core tech stacks).
* $\mathbf{D}_{k}$: **Deficit Knowledge Defect** (Quantified deduction tracking critical domain skills missing from the user matrix).

---

## 🤝 Contribution Guidelines

We enforce clean, modular commits to optimize both parsing efficiency and state management logic.

1. Fork the codebase repository.
2. Spin up a clear tracking branch: `git checkout -b feature/OptimizationRefactor`.
3. Stage and commit deterministic patches cleanly: `git commit -m 'Refactor: Optimize chunking overhead in vector pipeline'`.
4. Push and issue an atomic Pull Request explaining performance variations.

---

## 📜 License

This project is open-source and distributed under the terms of the **MIT License**.
