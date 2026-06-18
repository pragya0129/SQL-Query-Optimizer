# ⚡ Optimizer Engine: Edge-Compute SQL Telemetry Studio

![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge\&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge\&logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.x-black?style=for-the-badge\&logo=framer)
![WebAssembly](https://img.shields.io/badge/WebAssembly-WASM-654FF0?style=for-the-badge\&logo=webassembly)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge\&logo=nodedotjs)
![Groq](https://img.shields.io/badge/Groq_API-Llama_3_70B-f55036?style=for-the-badge)

> A premium full-stack database optimization dashboard. It utilizes WebAssembly (WASM) for zero-latency edge-compute benchmarking and LLM-driven heuristic analysis to detect, explain, and refactor complex SQL anti-patterns.

---

## 📸 Application Preview

> Replace the placeholder below with your own high-resolution screenshot or demo GIF.

```md
![App Screenshot](\img1.png)
```

---

## 🧠 Core Architecture

Traditional query optimizers rely on expensive backend sandbox databases. Optimizer Engine flips this paradigm using a **Hybrid Edge-LLM Architecture**.

### 1. Edge Execution (WASM)

Users upload a local SQLite database (`.db` or `.sqlite`). The engine spins up a WebAssembly database directly inside the browser's memory using `sql.js`.

### 2. Real Benchmarking

The original query executes locally inside the browser.

The engine captures:

* Real execution latency using `performance.now()`
* Database schema metadata
* `EXPLAIN QUERY PLAN` output
* Query execution telemetry

### 3. AI Heuristic Modeling

The backend Groq API (powered by Llama 3 70B) ingests:

* Database schema
* Raw SQL query
* Execution plan
* Runtime telemetry

The model then:

* Detects SQL anti-patterns
* Explains bottlenecks
* Rewrites inefficient queries
* Recommends indexes
* Estimates cost and row-scan reductions

### 4. Live Validation

The optimized query returns to the client and executes inside the browser's WASM database.

The dashboard compares:

* Original vs optimized latency
* Estimated execution cost
* Rows scanned
* Performance gains

---

## ✨ Key Features

### 🗄️ Bring Your Own Database (BYODB)

* Drag-and-drop SQLite database support
* Automatic schema extraction
* Zero backend database dependencies

### ⚡ Intelligent Query Refactoring

Automatically detects and optimizes:

* Non-SARGable predicates
* Correlated subqueries
* `SELECT *` usage
* Function-wrapped indexed columns
* Missing index opportunities
* Inefficient filtering patterns

### 🧪 Tiny Database Paradox Analyzer

Demonstrates scenarios where:

> Full table scans outperform index seeks on small datasets.

Uses real benchmarking instead of theoretical estimates.

### 📊 Real-Time Telemetry Dashboard

Visualize:

* Execution cost delta
* Rows scanned
* Latency improvements
* Efficiency gains

### 🎨 Premium UI Experience

Built with:

* React
* Tailwind CSS
* Framer Motion

Includes:

* Glassmorphism effects
* Spring-based animations
* Side-by-side query comparisons
* Syntax highlighting
* Interactive charts

### 🛡️ Robust API Design

* Strict JSON validation
* Structured AI responses
* Dynamic context injection
* Fault-tolerant execution pipeline

---

## 🛠️ Tech Stack

### Frontend

* React 18
* Tailwind CSS
* Framer Motion
* Recharts
* Lucide React
* Vite

### Database Engine

* SQLite
* sql.js
* WebAssembly (WASM)

### Backend

* Node.js
* Express.js

### AI Layer

* Groq API
* Llama 3 70B Versatile

---

## 🏗️ System Workflow

```text
SQLite Database Upload
           │
           ▼
      sql.js (WASM)
           │
           ▼
   Execute Original Query
           │
           ▼
 EXPLAIN QUERY PLAN + Metrics
           │
           ▼
     Groq API (Llama 3)
           │
           ▼
    Query Optimization
           │
           ▼
 Execute Optimized Query
           │
           ▼
     Telemetry Dashboard
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js v18 or higher
* npm or yarn
* Groq API key

Get your API key here:

https://console.groq.com/

---

### 1. Clone the Repository

```bash
git clone https://github.com/pragya0129/SQL-Query-Optimizer.git

cd optimizer-engine
```

---

### 2. Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file inside the `backend` directory.

```env
GROQ_API_KEY=gsk_your_api_key_here
PORT=5000
```

Start the backend server:

```bash
npm run dev
```

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

npm install
```

Start the development server:

```bash
npm run dev
```

---

### 4. Launch the Application

Navigate to:

```text
http://localhost:5173
```

---

## 🧪 Testing the Optimizer

1. Upload a sample SQLite database.

   Recommended:

   * Chinook Database
   * Northwind Database

2. Enter a deliberately inefficient query.

Example:

```sql
SELECT *
FROM orders
WHERE strftime('%Y', order_date) = '2025';
```

3. Click **Execute Pipeline**.

4. Compare:

* Original query
* Optimized rewrite
* Cost metrics
* Rows scanned
* Execution latency

---

## 📈 Example Optimization

### Original Query

```sql
SELECT *
FROM orders
WHERE YEAR(order_date) = 2025;
```

### Optimized Query

```sql
SELECT id, customer_id, order_date
FROM orders
WHERE order_date >= '2025-01-01'
  AND order_date < '2026-01-01';
```

### Result

| Metric       | Original | Optimized |
| ------------ | -------: | --------: |
| Cost         |     1200 |       300 |
| Rows Scanned |    10000 |      5000 |
| Latency      |  12.4 ms |    4.8 ms |

---

## 🤝 Contributing

Contributions are welcome.

To contribute:

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes

```bash
git commit -m "Add amazing feature"
```

4. Push your branch

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License.

See `LICENSE` for more information.

---

## ⭐ Acknowledgements

* Groq
* sql.js
* SQLite
* React
* Tailwind CSS
* Framer Motion
* Recharts

---

<p align="center">
  Built with ⚡ WebAssembly, 🧠 LLMs, and ❤️ for database engineers.
</p>
