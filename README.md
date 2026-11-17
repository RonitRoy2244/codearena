# ⚔️ CodeArena

> **High-Performance Online Code Judge & Competitive Programming Platform**  
> A full-stack, LeetCode-style algorithmic coding judge built with **Spring Boot 4**, **Java 17**, **MySQL**, and **React 19** featuring isolated OS subprocess execution, stateless JWT authentication, and the Monaco code editor.

---

## 🌟 Key Features

### ⚡ Robust Code Execution Engine (Judge)
- **Multi-Language Support**: Executes **JavaScript** (Node.js 24) and **Java** (OpenJDK 17).
- **Subprocess Isolation**: User code never runs inside the Spring Boot JVM. Execution takes place via `java.lang.ProcessBuilder` in isolated temporary directories.
- **Process-Tree Termination**: Enforces strict execution time limits (`timeLimitMs`). Timed-out processes and their descendants are terminated cleanly to prevent orphaned background tasks.
- **Hidden Test Case Safety**: Problem test cases are strictly partitioned into sample (public) and hidden (server-only). Hidden cases are evaluated exclusively on the judge and never exposed over any API.
- **Normalized Output Evaluation**: Normalizes CRLF (`\r\n` $\rightarrow$ `\n`), trims trailing whitespace, and truncates streams at 64 KB to protect against memory exhaustion.
- **Custom Testcase Runner**: Interactive custom `stdin` runner allowing users to test edge cases with custom inputs before submitting.

### 🛡️ Enterprise Security & Traffic Control
- **Stateless JWT Authentication**: Secure HMAC-SHA512 token lifecycle with Spring Security 7 and custom bearer filters.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `ROLE_USER` and `ROLE_ADMIN`.
- **BCrypt Password Encryption**: Strong salt-hashed password storage.
- **Per-User Rate Limiting**: Enforces a 1-submission-per-5-second sliding window returning HTTP `429 Too Many Requests`.
- **Concurrency Protection**: Controlled via a FIFO `Semaphore(3)` to cap simultaneous OS process executions and prevent CPU starvation.

### 🎨 Modern LeetCode-Style Frontend
- **Monaco Code Editor**: Powered by the same editor engine as VS Code, with custom syntax themes, customizable font sizing, and starter boilerplate code.
- **Split Resizable Workspace**: Multi-pane resizable layout using `react-resizable-panels`.
- **Keyboard Shortcuts**: <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to Run, <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Enter</kbd> to Submit.
- **Live LocalStorage Auto-Save**: Code drafts are automatically saved per problem and language in browser storage.
- **Activity & Analytics Heatmap**: 365-day interactive submission heatmap, difficulty solve breakdown (Easy, Medium, Hard), and pass rate analytics.
- **Celebration Effects**: Confetti bursts (`canvas-confetti`) on `ACCEPTED` verdicts.
- **Dark & Light Mode**: Accessible CSS variable design system with zero-flicker theme persistence.

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Backend Framework** | Spring Boot 4.1.2 | Enterprise Java microframework |
| **Language & Runtime**| Java 17 (LTS) | Modern Java features, records, streams, process handles |
| **Security** | Spring Security 7 + JJWT 0.12.6 | Stateless JWT authentication (HMAC-SHA512) & BCrypt |
| **Persistence** | Spring Data JPA / Hibernate | ORM mapping with HikariCP connection pooling |
| **Database** | MySQL 8.0 / 5.7 (XAMPP) | Relational database persistence |
| **Testing** | JUnit 5 + MockMvc | 25 automated unit and integration tests |
| **Frontend Framework**| React 19 + Vite | Fast client-side SPA with HMR |
| **Editor** | `@monaco-editor/react` | In-browser code editing environment |
| **UI & Layout** | `react-resizable-panels`, Bootstrap 5 | Flexible split-pane workspace and responsive grid |
| **Animations & Icons** | `framer-motion`, `lucide-react` | Fluid transitions and clean iconography |

---

## 🏛️ System Architecture

```text
[ React 19 SPA (Vite) ]
       │  HTTP / JSON (REST)
       ▼
[ Spring Security 7 (JWT Filter) ]
       │
[ Spring Boot Controllers ] ───► [ DTO Validation (@Valid) ]
       │
[ SubmissionService ] ◄── RateLimiter (1 req / 5s)
       │
[ JudgeService ] ◄────── Semaphore(3) Concurrency Limit
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
[ LocalProcessRunner ]            [ Spring Data JPA ]
       │ (ProcessBuilder)                │
       ▼                                 ▼
[ node.exe / javac / java.exe ]   [ MySQL Database ]
(Isolated Subprocess Tree)        (Users, Problems, Submissions)
```

---

## 📂 Project Structure

```text
codearena/
├── backend/
│   ├── src/main/java/com/codearena/backend/
│   │   ├── config/              # Security, DataSeeder, PasswordEncoder
│   │   ├── controller/          # REST Controllers (Auth, Problems, Run, Submissions, Admin)
│   │   ├── dto/                 # Request & Response Data Transfer Objects
│   │   ├── exception/           # Global Exception Handler & Custom Exceptions
│   │   ├── judge/               # JudgeService, LocalProcessRunner, CodeRunner interface
│   │   ├── model/               # JPA Entities (User, Problem, TestCase, Submission)
│   │   ├── repository/          # Spring Data JPA Repositories
│   │   └── security/            # JWT Service & Authentication Filter
│   ├── src/test/java/           # JUnit 5 test suite (25 automated integration tests)
│   ├── pom.xml                  # Maven dependencies & build configuration
│   └── mvnw.cmd                 # Maven wrapper
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI (Navbar, Footer, Button, Card, Badge, Modal)
│   │   ├── context/             # AuthContext, ThemeContext
│   │   ├── pages/               # LandingPage, ProblemsPage, ProblemDetailPage, SubmissionsPage, ProfilePage, Auth
│   │   ├── styles/              # Design system variables & custom themes
│   │   └── api.js               # Centralized Axios client with JWT interceptors
│   ├── package.json             # NPM dependencies & scripts
│   └── vite.config.js           # Vite dev server & /api proxy configuration
│
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Operating System**: Windows 10/11
- **Java Development Kit**: Java 17+ (JDK 17 configured on `PATH`)
- **Node.js**: Node 20+ / Node 24 (`node` and `npm` on `PATH`)
- **Database**: MySQL (e.g. through XAMPP running on port `3306`)

---

### Step 1: Database Setup
1. Start MySQL in the **XAMPP Control Panel** (port 3306).
2. Open phpMyAdmin (`http://localhost/phpmyadmin`) or MySQL CLI and create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS codearena CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
*(Default settings connect to `localhost:3306` with user `root` and an empty password).*

---

### Step 2: Backend Setup
1. Open PowerShell and navigate to `backend`:
   ```powershell
   cd backend
   ```
2. Run the Spring Boot server:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
3. The server starts on **`http://localhost:8080`**.
4. Health check endpoint:
   ```text
   GET http://localhost:8080/api/health
   Response: {"status":"ok"}
   ```

> **Default Seed Accounts & Data**:
> - **Admin**: Username: `admin` | Password: `Admin@123`
> - **Pre-seeded Problems**: *Sum of Two Numbers*, *Reverse a String*, *FizzBuzz*, *Palindrome Number*, *Valid Parentheses*, *Two Sum*, *Maximum Subarray*, *Binary Search*.

---

### Step 3: Frontend Setup
1. Open a new PowerShell terminal and navigate to `frontend`:
   ```powershell
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```powershell
   npm install
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
4. Open **`http://localhost:5173`** in your browser.

---

## 🧪 Testing

### Backend Automated Test Suite
The backend contains 25 JUnit 5 integration and unit tests covering authentication, problem management, subprocess execution, infinite loops, and judge verdicts:
```powershell
cd backend
.\mvnw.cmd test
```

### Frontend Production Build & Lint
```powershell
cd frontend
npm run lint
npm run build
```

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user (`USER` role) |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile & role |

### 📚 Problems (`/api/problems`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/problems` | Public | List all active problems with difficulty metadata |
| `GET` | `/api/problems/{slug}` | Public | Get problem details and **sample test cases only** |
| `POST` | `/api/admin/problems` | Admin | Create a new problem with sample and hidden test cases |

### ⚡ Code Execution & Judging (`/api/run` & `/api/submissions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/run` | Authenticated | Run code against sample cases or custom `stdin` (not saved) |
| `POST` | `/api/submissions` | Authenticated | Submit code evaluated against **all test cases** (rate-limited) |
| `GET` | `/api/submissions/me` | Authenticated | List all submissions for the logged-in user |
| `GET` | `/api/submissions/{id}` | Authenticated | Get full submission details and source code |

---

## ⚖️ Judge Verdicts

| Verdict | Meaning |
|---|---|
| `ACCEPTED` | Code executed within time limits and produced exact matching output across all test cases. |
| `WRONG_ANSWER` | Code ran successfully, but stdout did not match the expected output. |
| `TIME_LIMIT_EXCEEDED` | Code exceeded the problem's CPU timeout limit (subprocess forcibly killed). |
| `COMPILATION_ERROR` | Java compilation failed (`javac` error details captured and returned). |
| `RUNTIME_ERROR` | Non-zero exit code or unhandled exception thrown during execution. |

---

## 👨‍💻 Author

**Ronit Roy**
- **GitHub**: [@RonitRoy2244](https://github.com/RonitRoy2244)
- **LinkedIn**: [Ronit Roy](https://linkedin.com/in/ronit-roy-a60268225)
- **Email**: royr2866@gmail.com

---

## 📄 License
This project is licensed under the **MIT License**.
