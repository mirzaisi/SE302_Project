<p align="center">
  <img src="resources/icon.png" alt="ExamFlow Logo" width="120" height="120">
</p>

<h1 align="center">ExamFlow</h1>

<p align="center">
  <strong>Intelligent Exam Scheduling Made Simple</strong>
</p>

<p align="center">
  A modern desktop application for universities and institutions to automate exam scheduling while respecting student conflicts, room capacities, and custom constraints.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg" alt="Platform">
  <img src="https://img.shields.io/badge/electron-38+-47848F.svg" alt="Electron">
  <img src="https://img.shields.io/badge/react-19-61DAFB.svg" alt="React">
  <img src="https://img.shields.io/badge/typescript-5.9-3178C6.svg" alt="TypeScript">
</p>

---

## 🎯 What is ExamFlow?

If you've ever had to manually schedule exams for hundreds of students across multiple courses and rooms, you know the pain. ExamFlow takes that headache away.

We built this as part of our SE 302 Software Engineering course project to solve a real problem: creating conflict-free exam schedules that actually work. No more students with overlapping exams, no more rooms packed beyond capacity.

**The core idea is simple:** You import your data (courses, students, classrooms, enrollments), configure your constraints, hit generate, and get a working schedule. If there are unavoidable conflicts, you'll know exactly what they are and why.

---

## ✨ Features

### 📊 Smart Scheduling Engine
- **Conflict Detection** — Automatically identifies students enrolled in multiple courses and ensures they don't have overlapping exams
- **Room Capacity Matching** — Assigns courses to appropriately-sized classrooms
- **Constraint Satisfaction** — Respects hard constraints while allowing soft constraint relaxation when needed

### 📁 Flexible Data Import
- **CSV Support** — Import classrooms, courses, students, and enrollments from CSV files
- **Manual Entry** — Add individual records directly through the interface
- **Bulk Operations** — Clear and reimport data as needed

### ⚙️ Configurable Constraints

**Hard Constraints (Always Enforced):**
- No student has two exams at the same time
- Room capacity is respected (or overflow is tracked)

**Soft Constraints (Configurable):**
- No consecutive exams for students
- Maximum 2 exams per day per student
- Capacity overflow allowance (with percentage limits)

### 🎛️ Optimization Options
- Balance exams evenly across days
- Minimize total days used
- Minimize rooms used
- Schedule difficult courses (high enrollment) early or late

### 📅 Custom Time Slots
- Define exam periods (number of days, slots per day)
- Set custom start/end times for each slot
- Generate 1.5-hour incremental slots automatically
- Fully editable slot names and times

### 📤 Export Options
- **Excel Export** — Download schedules as `.xlsx` files
- **PDF Export** — Print-ready formatted schedules
- **Detailed Violations Report** — See exactly which constraints were violated and why

---

## 🖥️ Screenshots

The app has a clean, modern interface with six main sections:

| Dashboard | Data Management |
|:---------:|:---------------:|
| Quick overview of your data stats | Import/view/manage all your data |

| Configuration | Schedule Generation |
|:-------------:|:-------------------:|
| Set constraints, time slots, and optimization goals | Generate schedules with real-time feedback |

| Schedule View | Help |
|:-------------:|:----:|
| Analyze schedules by room, day, or violations | CSV format guides and documentation |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/examflow.git
cd examflow

# Install dependencies
npm install
```

### Development

```bash
# Start the app in development mode with hot reload
npm run dev
```

### Building for Production

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

The built installer will be in the `dist/` folder.

---

## 📂 Project Structure

```
examflow/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # App entry, window creation, IPC handlers
│   │   └── database.ts    # SQLite database schema and initialization
│   ├── preload/           # Preload scripts (secure IPC bridge)
│   │   └── index.ts       # Exposed APIs for renderer
│   └── renderer/          # React frontend
│       └── src/
│           ├── components/    # Reusable UI components
│           ├── pages/         # Main application views
│           │   ├── Dashboard.tsx
│           │   ├── DataManagement.tsx
│           │   ├── Configuration.tsx
│           │   ├── ScheduleGeneration.tsx
│           │   ├── ScheduleView.tsx
│           │   └── Help.tsx
│           └── services/
│               └── scheduler.ts   # Core scheduling algorithm
├── resources/             # App icons and assets
├── electron-builder.yml   # Build configuration
└── package.json
```

---

## 📋 CSV Format Guide

### Classrooms
```csv
Classroom,Capacity
Room A,50
Room B,30
Lab 1,25
```

### Courses
```csv
CourseCode,CourseName
CS101,Introduction to Programming
MATH201,Calculus II
```

### Students
```csv
StudentID,Name
2021001,John Doe
2021002,Jane Smith
```

### Enrollments
```csv
StudentID,CourseCode
2021001,CS101
2021001,MATH201
2021002,CS101
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Electron 38+ |
| **Frontend** | React 19 + TypeScript |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Radix UI + Lucide Icons |
| **Database** | SQLite (better-sqlite3) |
| **Build Tool** | electron-vite |
| **Packaging** | electron-builder |

---

## 🧠 How the Scheduler Works

The scheduling algorithm uses a constraint-satisfaction approach:

1. **Build conflict graph** — Map which courses share students
2. **Sort courses** — Based on optimization goals (e.g., difficult courses first)
3. **Greedy assignment** — Place each course in the first valid slot/room
4. **Conflict checking** — For each placement, verify no student conflicts exist
5. **Constraint relaxation** — If no valid slot exists, apply allowed relaxations
6. **Track violations** — Record any soft constraint violations for review

The algorithm prioritizes hard constraints (no same-time conflicts) while tracking violations of soft constraints (consecutive exams, capacity overflow) separately.

---

## 🤝 Contributing

We're not actively maintaining this as it was a course project, but feel free to fork it and make it your own. If you do something cool with it, we'd love to hear about it!

---

## 📄 License

This project was created for educational purposes as part of SE 302 - Software Engineering at Izmir University of Economics.

Feel free to use, modify, and distribute this code for educational or personal projects.

---

## 👥 Team

Built with ☕ and late nights by our SE 302 project team.

---

<p align="center">
  <sub>If this helped you or your institution manage exam scheduling, give it a ⭐</sub>
</p>
