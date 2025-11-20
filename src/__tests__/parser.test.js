import { describe, it, expect } from 'vitest';
import Papa from 'papaparse';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('CSV Parser', () => {
  it('should parse demo CSV correctly', async () => {
    // Read the demo CSV file
    const csvPath = join(process.cwd(), 'src/data/demo/consolidated_labs_demo.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');

    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            // Assert we have data
            expect(results.data).toBeDefined();
            expect(results.data.length).toBeGreaterThan(0);
            expect(results.data.length).toBe(45);

            // Check first record structure
            const firstRecord = results.data[0];
            expect(firstRecord).toHaveProperty('id');
            expect(firstRecord).toHaveProperty('date');
            expect(firstRecord).toHaveProperty('marker');
            expect(firstRecord).toHaveProperty('value');
            expect(firstRecord).toHaveProperty('reference_range');
            expect(firstRecord).toHaveProperty('provider');

            // Check specific values from first record
            expect(firstRecord.id).toBe('1');
            expect(firstRecord.marker).toBe('WBC');
            expect(firstRecord.date).toBe('2024-07-15');
            expect(firstRecord.provider).toBe('Dr. Smith');

            // Test that years can be extracted correctly
            const years = new Set();
            results.data.forEach(record => {
              if (record.date) {
                const yearMatch = record.date.match(/(\d{4})/);
                if (yearMatch) {
                  years.add(yearMatch[1]);
                }
              }
            });
            expect(years.has('2024')).toBe(true);
            expect(years.has('2025')).toBe(true);

            // Test records with special characters (quoted commas, escaped quotes)
            const specialRecord = results.data.find(r => r.marker && r.marker.includes('comma'));
            expect(specialRecord).toBeDefined();
            expect(specialRecord.marker).toBe('Test with, comma');

            const quotedRecord = results.data.find(r => r.marker && r.marker.includes('quoted'));
            expect(quotedRecord).toBeDefined();
            expect(quotedRecord.marker).toBe('Vitamin B12, quoted "test"');

            resolve();
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  });

  it('should handle header aliases', () => {
    const csvWithAliases = `Test,Result,Doctor,SampleDate
CBC,Normal,Dr. Smith,2024-01-15
Glucose,95,Dr. Jones,2024-02-20`;

    return new Promise((resolve, reject) => {
      Papa.parse(csvWithAliases, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            expect(results.data).toBeDefined();
            expect(results.data.length).toBe(2);
            
            // Headers should be preserved as-is by default
            const firstRecord = results.data[0];
            expect(firstRecord).toHaveProperty('Test');
            expect(firstRecord).toHaveProperty('Result');
            expect(firstRecord).toHaveProperty('Doctor');
            expect(firstRecord).toHaveProperty('SampleDate');

            resolve();
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  });
});
