export type Stage = "Beginner" | "Intermediate" | "Advanced" | "Internals" | "Industry";

export const stages: Stage[] = ["Beginner", "Intermediate", "Advanced", "Internals", "Industry"];

export interface SectionDefinition {
  id: string;
  title: string;
  stage: Stage;
}

/**
 * The order of each book. A lesson joins a section through its `section` frontmatter,
 * so adding an MDX file updates the tree and every percentage automatically.
 */
export const curriculum: Record<string, SectionDefinition[]> = {
  python: [
    { id: "fundamentals", title: "Fundamentals", stage: "Beginner" },
    { id: "control-flow", title: "Control Flow", stage: "Beginner" },
    { id: "data-structures", title: "Data Structures", stage: "Beginner" },
    { id: "functions", title: "Functions", stage: "Intermediate" },
    { id: "iteration", title: "Iteration Internals", stage: "Intermediate" },
    { id: "oop", title: "Object-Oriented Programming", stage: "Intermediate" },
    { id: "errors", title: "Errors and Reliability", stage: "Intermediate" },
    { id: "files", title: "Files and Paths", stage: "Intermediate" },
    { id: "modules", title: "Modules and Packages", stage: "Intermediate" },
    { id: "concurrency", title: "Concurrency", stage: "Advanced" },
    { id: "stdlib", title: "Standard Library", stage: "Advanced" },
    { id: "analysis", title: "Data Analysis", stage: "Industry" },
    { id: "internals", title: "Performance and Internals", stage: "Internals" },
  ],
  javascript: [
    { id: "fundamentals", title: "Fundamentals", stage: "Beginner" },
    { id: "functions", title: "Functions and Scope", stage: "Intermediate" },
    { id: "objects", title: "Objects and Collections", stage: "Intermediate" },
    { id: "async", title: "Asynchronous JavaScript", stage: "Advanced" },
    { id: "browser", title: "The Browser", stage: "Advanced" },
    { id: "modules", title: "Modules and Tooling", stage: "Industry" },
    { id: "internals", title: "Engine Internals", stage: "Internals" },
  ],
  react: [
    { id: "foundations", title: "Foundations", stage: "Beginner" },
    { id: "state", title: "State and Events", stage: "Beginner" },
    { id: "hooks", title: "Hooks", stage: "Intermediate" },
    { id: "architecture", title: "State Architecture", stage: "Intermediate" },
    { id: "rendering", title: "Rendering Internals", stage: "Internals" },
    { id: "performance", title: "Performance", stage: "Advanced" },
    { id: "async-ui", title: "Async UI and Server", stage: "Advanced" },
  ],
  vue: [
    { id: "foundations", title: "Foundations", stage: "Beginner" },
    { id: "reactivity", title: "Reactivity", stage: "Intermediate" },
    { id: "components", title: "Components", stage: "Intermediate" },
    { id: "reuse", title: "Reuse and Ecosystem", stage: "Advanced" },
    { id: "internals", title: "Rendering Internals", stage: "Internals" },
  ],
  nextjs: [
    { id: "routing", title: "Routing", stage: "Beginner" },
    { id: "rendering", title: "Rendering Model", stage: "Intermediate" },
    { id: "data", title: "Data and Mutations", stage: "Advanced" },
    { id: "platform", title: "Platform Features", stage: "Advanced" },
    { id: "production", title: "Production", stage: "Industry" },
  ],
  tailwind: [
    { id: "foundations", title: "Foundations", stage: "Beginner" },
    { id: "layout", title: "Layout and Type", stage: "Beginner" },
    { id: "interaction", title: "Responsive and State", stage: "Intermediate" },
    { id: "theming", title: "Theming", stage: "Intermediate" },
    { id: "extending", title: "Extending Tailwind", stage: "Advanced" },
    { id: "production", title: "Production", stage: "Industry" },
  ],
  express: [
    { id: "http", title: "HTTP and Routing", stage: "Beginner" },
    { id: "pipeline", title: "The Middleware Pipeline", stage: "Intermediate" },
    { id: "data", title: "Data and APIs", stage: "Intermediate" },
    { id: "security", title: "Security", stage: "Advanced" },
    { id: "production", title: "Production", stage: "Industry" },
  ],
  langchain: [
    { id: "foundations", title: "Foundations", stage: "Beginner" },
    { id: "structured", title: "Structured Output", stage: "Intermediate" },
    { id: "agents", title: "Tools and Agents", stage: "Intermediate" },
    { id: "retrieval", title: "Retrieval", stage: "Advanced" },
    { id: "state", title: "State and Graphs", stage: "Advanced" },
    { id: "production", title: "AI Engineering in Production", stage: "Industry" },
  ],
  postgresql: [
    { id: "foundations", title: "Schema and Writes", stage: "Beginner" },
    { id: "querying", title: "Querying", stage: "Beginner" },
    { id: "advanced-sql", title: "Advanced SQL", stage: "Intermediate" },
    { id: "performance", title: "Indexes and Plans", stage: "Advanced" },
    { id: "concurrency", title: "Concurrency", stage: "Internals" },
    { id: "operations", title: "Operations", stage: "Industry" },
  ],
  mongodb: [
    { id: "foundations", title: "Documents and CRUD", stage: "Beginner" },
    { id: "modeling", title: "Data Modelling", stage: "Intermediate" },
    { id: "querying", title: "Aggregation and Indexes", stage: "Intermediate" },
    { id: "distributed", title: "Transactions and Scale", stage: "Advanced" },
    { id: "production", title: "Applications and Production", stage: "Industry" },
  ],
  statistics: [
    { id: "foundations", title: "Foundations of Data Analysis", stage: "Beginner" },
    { id: "descriptive", title: "Descriptive Statistics", stage: "Beginner" },
    { id: "analysis-types", title: "Types of Data Analysis", stage: "Intermediate" },
    { id: "probability", title: "Probability and Distributions", stage: "Intermediate" },
    { id: "inference", title: "Inferential Statistics", stage: "Intermediate" },
    { id: "tests", title: "Statistical Tests", stage: "Advanced" },
    { id: "experimentation", title: "A/B Testing and Experimentation", stage: "Advanced" },
    { id: "regression", title: "Correlation and Regression", stage: "Advanced" },
    { id: "time-series", title: "Time Series Analysis", stage: "Advanced" },
    { id: "cleaning", title: "Data Cleaning and Quality", stage: "Industry" },
    { id: "features", title: "Feature Engineering", stage: "Industry" },
    { id: "business", title: "Business and Product Analytics", stage: "Industry" },
    { id: "communication", title: "Visualization and Communication", stage: "Industry" },
  ],
  excel: [
    { id: "foundations", title: "Foundations", stage: "Beginner" },
    { id: "functions", title: "Everyday Functions", stage: "Beginner" },
    { id: "structure", title: "Tables and Controls", stage: "Intermediate" },
    { id: "analysis", title: "Analysis at Scale", stage: "Advanced" },
    { id: "professional", title: "Professional Practice", stage: "Industry" },
  ],
  powerbi: [
    { id: "platform", title: "The Platform", stage: "Beginner" },
    { id: "modeling", title: "Data Preparation and Modelling", stage: "Beginner" },
    { id: "dax", title: "DAX", stage: "Intermediate" },
    { id: "advanced-dax", title: "Advanced DAX", stage: "Advanced" },
    { id: "reporting", title: "Reports", stage: "Intermediate" },
    { id: "production", title: "Security and Operations", stage: "Industry" },
  ],
  "machine-learning": [
    { id: "foundations", title: "Foundations", stage: "Beginner" },
    { id: "algorithms", title: "Supervised Algorithms", stage: "Intermediate" },
    { id: "unsupervised", title: "Unsupervised Learning", stage: "Intermediate" },
    { id: "evaluation", title: "Model Evaluation", stage: "Advanced" },
  ],
  "deep-learning": [
    { id: "foundations", title: "How Networks Learn", stage: "Intermediate" },
    { id: "architectures", title: "Architectures", stage: "Advanced" },
  ],
  mlops: [
    { id: "foundations", title: "Project Foundations", stage: "Intermediate" },
    { id: "serving", title: "Serving and Deployment", stage: "Advanced" },
    { id: "operations", title: "Operating Models", stage: "Industry" },
  ],
  "data-engineering": [
    { id: "foundations", title: "Foundations", stage: "Intermediate" },
    { id: "modeling", title: "Warehouse Modelling", stage: "Intermediate" },
    { id: "processing", title: "Processing and Orchestration", stage: "Advanced" },
  ],
  sqlserver: [
    { id: "foundations", title: "T-SQL Foundations", stage: "Beginner" },
    { id: "querying", title: "Querying", stage: "Intermediate" },
    { id: "programmability", title: "Programmability", stage: "Intermediate" },
    { id: "performance", title: "Indexes and Plans", stage: "Advanced" },
    { id: "concurrency", title: "Concurrency", stage: "Internals" },
    { id: "operations", title: "Operations", stage: "Industry" },
  ],
};
