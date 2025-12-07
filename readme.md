
# Dynamic PDF Extraction & Table Storage System  
---
# 🌐 Deployed Link

# [Demo Link](https://onestack-vtnx.onrender.com)

---
## Description
This project is a **complete PDF data-extraction system** that automatically:

- Extracts **tables** from PDFs  
- Extracts **full text**  
- Extracts **key–value (KV) fields** from text  
- Creates **dynamic SQL tables** based on each table found in the PDF  
- Stores **each PDF table as a separate table in PostgreSQL**  
- Makes all extracted data accessible through clean REST APIs  
- Includes a **minimal React frontend** to view tables, text, uploads & analytics  

The system is built to be fully **automated, dynamic, scalable, and schema-agnostic**, meaning **it works with any type of PDF** without manually defining columns or schema.

---

## 🚀 Features

### ✔ 1. Automatic Table Extraction  
Uses **Camelot** to detect and extract tables from PDFs (both lattice & stream mode).

### ✔ 2. Full Text Extraction  
Uses **PyMuPDF** to read and store full text from the PDF.

### ✔ 3. Key–Value Extraction  
Short "key: value" lines from the PDF text are converted into structured data.

### ✔ 4. Dynamic Table Creation  
Each table becomes a new SQL table:

```
pdf_table_1_4      → table 1 from PDF ID 4
pdf_table_2_4      → table 2 from PDF ID 4
pdf_table_1_7      → table 1 from PDF ID 7

```
This means **1000 PDFs = 1000× tables**, all independent and safely stored.

### ✔ 5. Cleaned Data  
- Empty columns removed  
- Invalid rows/columns filtered  
- Headers automatically sanitized  
- Unknown/blank-only tables ignored  

### ✔ 6. Full REST APIs  
APIs to upload, list PDFs, view tables, view text, and analytics.

### ✔ 7. Minimal React Frontend  
Pages:
- Upload PDF  
- View list of PDFs  
- View extracted tables for each PDF  
- View extracted text  
- Analytics page  

---

# 🏗 System Architecture (Brief)

```

PDF → Extractor (Text + Tables) →
DB:
• pdf_data (raw JSON)
• pdf_full_text (full text)
• pdf_table_X_Y (dynamic tables)
API → React Frontend

```

---

# 📌 Backend Tech Stack

| Component | Technology |
|----------|------------|
| Language | Python |
| Framework | Flask |
| PDF Table Extraction | Camelot |
| PDF Text Extraction | PyMuPDF |
| DB | PostgreSQL |
| ORM/SQL | SQLAlchemy Core |
| CORS | flask-cors |

---

# 📌 Frontend Tech Stack

| Component | Technology |
|----------|------------|
| Library | React.js |
| UI | Plain CSS (clean + minimal) |
| Routing | React Router |
| REST Calls | Axios |

---

# 🧠 How Dynamic Tables Work (Important)

This is the **core logic** of the assignment.

### Step 1 — Extract tables  
Camelot returns each table as a dataframe.

### Step 2 — Convert df → JSON  
- First row becomes headers  
- Remaining rows become a list of dicts

### Step 3 — Clean the table  
- Drop useless columns  
- Remove unknown rows  
- Normalize header names  
- Remove blank-only tables  

### Step 4 — Create a table in PostgreSQL  
Each PDF table becomes:

```

pdf_table_<table_number>_<pdf_id>

```

Example:
```

pdf_table_1_6
pdf_table_2_6
pdf_table_3_6

````

### Step 5 — Insert rows  
Column-wise → row-wise conversion  
Every row inserted into its dedicated SQL table.

---

# 🧪 API Documentation

## ▶ Upload PDF  
`POST /upload`

**Response**
```json
{
  "message": "PDF processed successfully",
  "pdf_id": 6,
  "tables": { ... },
  "text_fields": { ... },
  "full_text": "...."
}
````

---

## ▶ List all PDF IDs

`GET /pdf_ids`

**Response**

```json
[
  { "pdf_id": 1, "filename": "file1.pdf" },
  { "pdf_id": 2, "filename": "report.pdf" }
]
```

---

## ▶ List tables for a PDF

`GET /pdf/<pdf_id>/tables`

Returns dynamic table names.

---

## ▶ Get data from a specific table

`GET /table/<table_name>`

---

## ▶ Get full extracted text

`GET /text/<pdf_id>`

---

# 🖥 Minimal Frontend Pages

### 1. Upload Page

Upload PDF → hits `/upload`.

### 2. PDF List Page

Calls `/pdf_ids` and displays clickable cards.

### 3. Table Viewer

Calls `/pdf/<id>/tables` → then fetches `/table/<name>`.

### 4. Text Viewer

Shows extracted text from `/text/<id>`.

### 5. Analytics Page

Show numeric summary for columns.

---

# 🗂 Folder Structure

```
backend/
│ app.py
│ config.py
│ dynamic_tables.py
│ pdf_extractor.py
│
├── routes/
│   ├── upload_route.py
│   └── data_route.py
│
├── database/
│   ├── db.py
│   └── pdf_text_table.py
│
frontend/
│ src/
│   ├── pages/
│   ├── components/
│   ├── api/
│   └── App.jsx
```

---

# 🧪 Sample Output

### Table stored as:

```
pdf_table_1_6
pdf_table_2_6
pdf_table_3_6
```

### Text stored in:

```
pdf_full_text
```

---

# 📦 Installation & Setup

### Backend

```bash
activate virtual environment
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
npm install
npm run dev
```

---




---

# ✨ Author

### **Shikhar Gupta**

B.Tech — CSE
Indian Institute of Information Technology (IIIT) Sonepat

---

