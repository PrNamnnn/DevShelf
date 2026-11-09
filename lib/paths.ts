export interface LearningPath {
  id: string;
  title: string;
  summary: string;
  stages: { title: string; lessons: string[] }[];
}


/** Paths only reference lessons. Nothing is duplicated, so progress is shared everywhere. */
export const learningPaths: LearningPath[] = [
  {
    id: "data-analyst",
    title: "Data Analyst",
    summary: "Clean data, query it, describe it, test it, and communicate what it means.",
    stages: [
      { title: "Think like an analyst", lessons: ["statistics/what-is-data-analysis", "statistics/asking-analytical-questions", "statistics/data-types-and-scales", "statistics/sampling-and-bias"] },
      { title: "Spreadsheets", lessons: ["excel/workbooks-cells-and-references", "excel/conditional-aggregation", "excel/lookups", "excel/pivot-tables-and-charts", "excel/power-query-and-data-model"] },
      { title: "SQL", lessons: ["postgresql/queries-and-joins", "postgresql/aggregates-windows-and-ctes"] },
      { title: "Python analysis", lessons: ["python/pandas-essentials", "statistics/exploratory-data-analysis", "statistics/missing-data", "statistics/inconsistent-data-and-validation"] },
      { title: "Statistics", lessons: ["statistics/central-tendency", "statistics/dispersion", "statistics/outliers-and-z-scores", "statistics/univariate-analysis", "statistics/bivariate-analysis", "statistics/estimation-and-confidence-intervals", "statistics/hypothesis-testing-logic", "statistics/choosing-the-right-test"] },
      { title: "Reporting", lessons: ["powerbi/star-schema-and-relationships", "powerbi/dax-fundamentals-and-context", "powerbi/calculate-and-filter-functions", "statistics/choosing-the-right-chart", "statistics/dashboards-and-misleading-visuals", "statistics/storytelling-and-uncertainty"] },
    ],
  },
  {
    id: "product-analyst",
    title: "Product Analyst",
    summary: "Define metrics, understand behaviour, and make decisions through experiments.",
    stages: [
      { title: "Metrics", lessons: ["statistics/kpis-and-north-star", "statistics/conversion-retention-churn", "statistics/revenue-ltv-cac"] },
      { title: "Behaviour", lessons: ["postgresql/aggregates-windows-and-ctes", "statistics/funnel-analysis", "statistics/cohort-and-retention-curves", "statistics/segmentation-rfm-and-baskets", "statistics/growth-accounting-and-decomposition", "statistics/diagnostic-analysis"] },
      { title: "Statistical footing", lessons: ["statistics/sampling-distributions-clt", "statistics/estimation-and-confidence-intervals", "statistics/hypothesis-testing-logic", "statistics/errors-power-and-effect-size"] },
      { title: "Experimentation", lessons: ["statistics/ab-testing-foundations", "statistics/experiment-design-and-metrics", "statistics/sample-size-and-duration", "statistics/analyzing-ab-tests", "statistics/peeking-and-sequential-testing", "statistics/multiple-testing-and-fdr", "statistics/srm-and-aa-tests", "statistics/cuped-and-variance-reduction", "statistics/interpreting-experiments"] },
      { title: "Influence", lessons: ["statistics/storytelling-and-uncertainty"] },
    ],
  },
  {
    id: "business-analyst",
    title: "Business Analyst",
    summary: "Translate business problems into analysis, models and clear recommendations.",
    stages: [
      { title: "Framing", lessons: ["statistics/what-is-data-analysis", "statistics/asking-analytical-questions", "statistics/kpis-and-north-star"] },
      { title: "Excel for business", lessons: ["excel/essential-functions-and-logic", "excel/lookups", "excel/tables-validation-and-formatting", "excel/pivot-tables-and-charts", "excel/dashboards-and-business-analysis"] },
      { title: "Power BI", lessons: ["powerbi/platform-and-storage-modes", "powerbi/power-query-and-m", "powerbi/star-schema-and-relationships", "powerbi/dax-fundamentals-and-context", "powerbi/time-intelligence", "powerbi/visuals-and-report-design"] },
      { title: "Analysis", lessons: ["statistics/central-tendency", "statistics/diagnostic-analysis", "statistics/predictive-and-prescriptive-analysis", "statistics/growth-accounting-and-decomposition", "statistics/revenue-ltv-cac"] },
      { title: "Recommendations", lessons: ["statistics/choosing-the-right-chart", "statistics/storytelling-and-uncertainty"] },
    ],
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    summary: "Combine statistics, modelling and experimentation to solve ambiguous problems.",
    stages: [
      { title: "Tools", lessons: ["python/collections-and-comprehensions", "python/pandas-essentials", "postgresql/aggregates-windows-and-ctes"] },
      { title: "Probability and inference", lessons: ["statistics/probability-and-bayes", "statistics/random-variables-and-discrete-distributions", "statistics/continuous-distributions", "statistics/sampling-distributions-clt", "statistics/hypothesis-testing-logic", "statistics/choosing-the-right-test", "statistics/ab-testing-foundations"] },
      { title: "Regression", lessons: ["statistics/correlation-and-causation", "statistics/simple-linear-regression", "statistics/multiple-linear-regression", "statistics/regression-diagnostics", "statistics/logistic-regression", "statistics/polynomial-and-regularization"] },
      { title: "Data preparation", lessons: ["statistics/exploratory-data-analysis", "statistics/missing-data", "statistics/data-quality-and-leakage", "statistics/encoding-categoricals", "statistics/feature-selection-and-pipelines"] },
      { title: "Machine learning", lessons: ["machine-learning/ml-foundations", "machine-learning/bias-variance-and-regularization", "machine-learning/cross-validation-and-tuning", "machine-learning/decision-trees", "machine-learning/ensembles-and-boosting", "machine-learning/clustering", "machine-learning/pca-and-dimensionality-reduction"] },
      { title: "Evaluation", lessons: ["machine-learning/classification-metrics", "machine-learning/roc-pr-and-calibration", "machine-learning/imbalance-and-cost-sensitive-learning"] },
      { title: "Forecasting and deep learning", lessons: ["statistics/time-series-fundamentals", "statistics/forecast-evaluation", "deep-learning/neurons-and-activation", "deep-learning/backpropagation-and-gradient-descent"] },
    ],
  },
  {
    id: "ml-engineer",
    title: "ML Engineer",
    summary: "Build, ship and operate machine learning systems reliably.",
    stages: [
      { title: "Engineering base", lessons: ["python/modules-and-packages", "python/errors-logging-and-typing", "python/threads-processes-and-the-gil", "express/rest-api-design"] },
      { title: "Model foundations", lessons: ["machine-learning/ml-foundations", "machine-learning/cross-validation-and-tuning", "machine-learning/ensembles-and-boosting", "machine-learning/classification-metrics", "statistics/data-quality-and-leakage", "statistics/feature-selection-and-pipelines"] },
      { title: "Deep learning", lessons: ["deep-learning/neurons-and-activation", "deep-learning/backpropagation-and-gradient-descent", "deep-learning/training-losses-and-optimizers", "deep-learning/embeddings-attention-and-transformers"] },
      { title: "Data platform", lessons: ["data-engineering/etl-elt-and-pipelines", "data-engineering/warehouses-lakes-and-lakehouses", "data-engineering/spark-fundamentals", "data-engineering/airflow-orchestration"] },
      { title: "Production", lessons: ["mlops/ml-project-lifecycle", "mlops/model-serving-and-inference", "mlops/docker-and-deployment", "mlops/feature-stores-and-pipelines", "mlops/monitoring-drift-and-retraining"] },
    ],
  },
];

