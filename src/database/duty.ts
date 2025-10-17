import fs from 'fs/promises';
import path from 'path';

export interface DutyEntry {
  fromDate: Date;
  toDate: Date;
  users: string[];
}

export class DutyDatabase {
  private dbPath: string;
  private data: DutyEntry[];

  constructor(dbPath: string = './data/duty.json') {
    this.dbPath = dbPath;
    this.data = [];
  }

  async init(): Promise<void> {
    try {
      const dir = path.dirname(this.dbPath);
      await fs.mkdir(dir, { recursive: true });
      
      try {
        const content = await fs.readFile(this.dbPath, 'utf-8');
        const parsed = JSON.parse(content);
        this.data = parsed.map((entry: any) => ({
          fromDate: new Date(entry.fromDate),
          toDate: new Date(entry.toDate),
          users: entry.users,
        }));
      } catch {
        // File doesn't exist or is invalid, start with empty data
        await this.save();
      }
    } catch (error) {
      console.error('Error initializing duty database:', error);
    }
  }

  async save(): Promise<void> {
    await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  async addDuty(fromDate: Date, toDate: Date, users: string[]): Promise<void> {
    // Remove any overlapping entries
    this.data = this.data.filter(entry => {
      return entry.toDate < fromDate || entry.fromDate > toDate;
    });
    
    this.data.push({ fromDate, toDate, users });
    this.data.sort((a, b) => a.fromDate.getTime() - b.fromDate.getTime());
    await this.save();
  }

  getCurrentDuty(): string[] | undefined {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of day
    
    const entry = this.data.find(entry => {
      const from = new Date(entry.fromDate);
      const to = new Date(entry.toDate);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      
      return now >= from && now <= to;
    });
    
    return entry?.users;
  }

  getDutyByDate(date: Date): string[] | undefined {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const entry = this.data.find(entry => {
      const from = new Date(entry.fromDate);
      const to = new Date(entry.toDate);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      
      return checkDate >= from && checkDate <= to;
    });
    
    return entry?.users;
  }

  async importFromCSV(csvContent: string): Promise<number> {
    const lines = csvContent.trim().split('\n');
    let imported = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const parts = trimmed.split(',').map(p => p.trim());
      if (parts.length < 3) continue; // Need at least: fromDate, toDate, name1

      const fromDate = this.parseDate(parts[0]);
      const toDate = this.parseDate(parts[1]);
      
      if (!fromDate || !toDate) continue;

      const users = parts.slice(2).filter(u => u.length > 0);
      if (users.length === 0) continue;

      await this.addDuty(fromDate, toDate, users);
      imported++;
    }

    return imported;
  }

  private parseDate(dateStr: string): Date | null {
    // Try parsing different date formats
    // Expected format: DD.MM.YYYY or YYYY-MM-DD
    const ddmmyyyy = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
    const yyyymmdd = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    
    let match = dateStr.match(ddmmyyyy);
    if (match) {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]) - 1; // JS months are 0-indexed
      const year = parseInt(match[3]);
      return new Date(year, month, day);
    }
    
    match = dateStr.match(yyyymmdd);
    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      const day = parseInt(match[3]);
      return new Date(year, month, day);
    }
    
    return null;
  }

  getAllDuties(): DutyEntry[] {
    return [...this.data];
  }

  async clear(): Promise<void> {
    this.data = [];
    await this.save();
  }
}

export const dutyDB = new DutyDatabase();
