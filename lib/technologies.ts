export type GroupId = "programming" | "analytics" | "science";

export type CategoryId = "languages" | "frontend" | "backend" | "data" | "analysis" | "analyst-tools" | "machine-learning" | "engineering";

export const groups: { id: GroupId; name: string }[] = [
  { id: "analytics", name: "Analytical Knowledge" },
  { id: "science", name: "Data Science and Engineering" },
  { id: "programming", name: "Programming Technologies" },
];

export const categories: { id: CategoryId; group: GroupId; name: string; note: string }[] = [
  { id: "analysis", group: "analytics", name: "Analysis", note: "From first question to experiment" },
  { id: "analyst-tools", group: "analytics", name: "Analyst Tools", note: "Spreadsheets and reporting" },
  { id: "machine-learning", group: "science", name: "Machine Learning", note: "Models and evaluation" },
  { id: "engineering", group: "science", name: "Engineering", note: "Pipelines and production" },
  { id: "languages", group: "programming", name: "Languages", note: "The ground everything stands on" },
  { id: "frontend", group: "programming", name: "Interfaces", note: "Rendering, state and styling" },
  { id: "backend", group: "programming", name: "Services and AI", note: "APIs, pipelines and agents" },
  { id: "data", group: "programming", name: "Data", note: "Storage, queries and plans" },
];

export interface Technology {
  id: string;
  name: string;
  blurb: string;
  category: CategoryId;
  volume: number;
  spine: string;
  deep: string;
  foil: string;
}

/** Add a technology here, add its sections in lib/curriculum.ts, then create content/<id>/. */
export const technologies: Technology[] = [
  { id: "python", name: "Python", blurb: "Objects, iteration and the standard library.", category: "languages", volume: 1, spine: "#21405f", deep: "#142a42", foil: "#e6cd92" },
  { id: "javascript", name: "JavaScript", blurb: "The language and its runtime model.", category: "languages", volume: 2, spine: "#a67e2a", deep: "#7a5b1a", foil: "#fdf3d8" },
  { id: "react", name: "React", blurb: "Rendering, state and reconciliation.", category: "frontend", volume: 3, spine: "#143f4f", deep: "#0b2a36", foil: "#a9dfec" },
  { id: "vue", name: "Vue.js", blurb: "Reactivity and dependency tracking.", category: "frontend", volume: 4, spine: "#265c49", deep: "#183f32", foil: "#c3e9d5" },
  { id: "nextjs", name: "Next.js", blurb: "Rendering strategies and caching.", category: "frontend", volume: 5, spine: "#25272d", deep: "#141519", foil: "#e9e9ec" },
  { id: "tailwind", name: "Tailwind CSS", blurb: "Utility-first styling in practice.", category: "frontend", volume: 6, spine: "#2b7687", deep: "#1b5261", foil: "#d3f2f3" },
  { id: "express", name: "Express.js", blurb: "Middleware, routing and errors.", category: "backend", volume: 7, spine: "#50545c", deep: "#34373d", foil: "#ece6d8" },
  { id: "langchain", name: "LangChain", blurb: "Retrieval, tools and agents.", category: "backend", volume: 8, spine: "#6c3349", deep: "#4a2132", foil: "#f5ccdb" },
  { id: "postgresql", name: "PostgreSQL", blurb: "Query plans, indexes and transactions.", category: "data", volume: 9, spine: "#2e517f", deep: "#1e365a", foil: "#d4e0f5" },
  { id: "sqlserver", name: "SQL Server", blurb: "T-SQL and SSMS for daily work.", category: "data", volume: 10, spine: "#8b3236", deep: "#612125", foil: "#f2d3c8" },
  { id: "mongodb", name: "MongoDB", blurb: "Documents, aggregation and production patterns.", category: "data", volume: 11, spine: "#2f6b4f", deep: "#1c4633", foil: "#d5efd9" },
  { id: "statistics", name: "Data Analysis & Statistics", blurb: "The complete analytical process, from data types to experiments.", category: "analysis", volume: 12, spine: "#3b3a78", deep: "#26254f", foil: "#e8dcc0" },
  { id: "excel", name: "Excel", blurb: "Formulas, Pivot Tables and Power Query for real business work.", category: "analyst-tools", volume: 13, spine: "#22704a", deep: "#144a30", foil: "#e3f1dc" },
  { id: "powerbi", name: "Power BI", blurb: "Models, DAX and reports people can trust.", category: "analyst-tools", volume: 14, spine: "#a4811d", deep: "#725912", foil: "#2a2108" },
  { id: "machine-learning", name: "Machine Learning", blurb: "Algorithms, evaluation and generalization.", category: "machine-learning", volume: 15, spine: "#7a4a2c", deep: "#54301a", foil: "#f4dcc6" },
  { id: "deep-learning", name: "Deep Learning", blurb: "Networks, gradients and attention.", category: "machine-learning", volume: 16, spine: "#2c3d4f", deep: "#1a2733", foil: "#d4e4f2" },
  { id: "mlops", name: "ML Engineering", blurb: "Taking models to production and keeping them healthy.", category: "engineering", volume: 17, spine: "#6a4a7a", deep: "#462f52", foil: "#ecdcf2" },
  { id: "data-engineering", name: "Data Engineering", blurb: "Warehouses, pipelines and orchestration.", category: "engineering", volume: 18, spine: "#3d5a5a", deep: "#253b3b", foil: "#d6ece9" },
];

export function getTechnology(id: string): Technology | undefined {
  return technologies.find((technology) => technology.id === id);
}
