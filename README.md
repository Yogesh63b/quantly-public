# Quantly: Autonomous Quantitative Analysis Engine

> 🎥 **[Watch the 3-Minute Deep-Dive System Demo Here]**
> https://www.loom.com/share/33c858ea99c445a9ad89f209fc594f67

An enterprise-grade financial machine learning and asynchronous orchestration pipeline. The platform autonomously tracks equities, normalizes macro-economic indicators, isolates market anomalies, and dynamically forecasts corporate cash flows.

---

## 🚀 Elite Architectural Components

### 1. Vectorized Analytics & Parquet Data Lakes
* **The System:** Migrated away from traditional relational lookups to an immutable, columnar **Parquet Data Lake** structure.
* **The Impact:** Enabled instantaneous time-series slicing across millions of rows, matching real-time microsecond performance metrics necessary for historical quantitative backtesting.

### 2. Unsupervised Machine Learning Frameworks
* **Isolation Forests:** Deployed Scikit-Learn `IsolationForest` architectures to execute rolling multi-variate price anomaly sweeps across 11,000+ public securities.
* **Dimensionality Reduction (PCA + K-Means):** Engineered a pipeline using Principal Component Analysis to distill volatile multi-index yield curves, feeding into a K-Means clustering algorithm to compute live macro **Market Regime** shifts.

### 3. Supervised Nowcasting Engine with Explainable AI (XAI)
* **XGBoost Regressor:** Implemented an optimized `XGBoost` pipeline calculating real-time cash flow metrics utilizing continuous price velocity and momentum transformations.
* **SHAP (SHapley Additive exPlanations):** Solved the ML "black box" dilemma by computing raw game-theoretic attribution arrays, outputting the exact basis-point impact each operational variable had on the underlying macro prediction.

---

## 🛠️ The Tech Stack

* **Core Engine:** Python 3.12, FastAPI (Async Workloads), Uvicorn.
* **Data & Machine Learning:** Scikit-Learn, XGBoost, SHAP, Pandas, PyArrow (Parquet Core).
* **Orchestration & Containerization:** Multi-Container Docker Architecture, WatchFiles Automated Hot-Reloaders.
* **Visualization Layer:** Next.js 14 (App Router), TypeScript, Recharts Interactivity.

---

## 📈 Enterprise Scale Roadmap
* **Cloud Native Ingestion:** Transitioning local Parquet lakes into managed Amazon S3 instances queried via AWS Athena/PySpark.
* **DAG Workflows:** Replacing native cron triggers with Apache Airflow to handle high-availability, dependency-aware extraction chains.
