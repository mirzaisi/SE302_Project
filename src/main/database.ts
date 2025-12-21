import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import * as fs from 'fs'

let db: Database.Database | null = null

export function initDatabase(): Database.Database {
  // Get the user data directory for storing the database
  const userDataPath = app.getPath('userData')
  const dbPath = join(userDataPath, 'examflow.db')

  // Ensure the directory exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true })
  }

  // Initialize the database
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL') // Better performance for concurrent reads/writes

  // Create tables
  createTables()

  return db
}

function createTables(): void {
  if (!db) return

  // Create classrooms table
  db.exec(`
    CREATE TABLE IF NOT EXISTS classrooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create courses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create students table
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create enrollments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      UNIQUE(student_id, course_id)
    )
  `)

  // Create exam_period_config table
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_period_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      num_days INTEGER NOT NULL DEFAULT 5,
      slots_per_day INTEGER NOT NULL DEFAULT 3,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create time_slots table
  db.exec(`
    CREATE TABLE IF NOT EXISTS time_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_number INTEGER NOT NULL,
      slot_number INTEGER NOT NULL,
      display_name TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      UNIQUE(day_number, slot_number)
    )
  `)

  // Create optimization_settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS optimization_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      balance_across_days BOOLEAN DEFAULT 1,
      minimize_days_used BOOLEAN DEFAULT 0,
      minimize_rooms_used BOOLEAN DEFAULT 0,
      place_difficult_early BOOLEAN DEFAULT 0,
      place_difficult_late BOOLEAN DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create constraint_relaxations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS constraint_relaxations (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      allow_consecutive_slots BOOLEAN DEFAULT 0,
      max_consecutive_violations INTEGER DEFAULT 0,
      allow_three_per_day BOOLEAN DEFAULT 0,
      max_three_per_day_violations INTEGER DEFAULT 0,
      allow_capacity_overflow BOOLEAN DEFAULT 0,
      max_capacity_overflow_percent INTEGER DEFAULT 10,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create schedules table (for storing generated schedules)
  db.exec(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      is_feasible BOOLEAN DEFAULT 1,
      total_violations INTEGER DEFAULT 0,
      violations_json TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Add violations_json column if it doesn't exist (migration for existing databases)
  try {
    db.exec(`ALTER TABLE schedules ADD COLUMN violations_json TEXT DEFAULT '[]'`)
  } catch {
    // Column already exists, ignore
  }

  // Create schedule_assignments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS schedule_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      schedule_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      classroom_id INTEGER NOT NULL,
      day_number INTEGER NOT NULL,
      slot_number INTEGER NOT NULL,
      violation_type TEXT,
      FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
    )
  `)

  // Insert default configuration if not exists
  db.exec(`
    INSERT OR IGNORE INTO exam_period_config (id, num_days, slots_per_day) VALUES (1, 5, 3)
  `)

  db.exec(`
    INSERT OR IGNORE INTO optimization_settings (id) VALUES (1)
  `)

  db.exec(`
    INSERT OR IGNORE INTO constraint_relaxations (id) VALUES (1)
  `)
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized')
  }
  return db
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
