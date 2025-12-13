import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BloodWorkReferenceChart from '../components/BloodWorkReferenceChart';

describe('BloodWorkReferenceChart', () => {
  it('should render the reference chart component', () => {
    render(<BloodWorkReferenceChart />);
    
    // Check for main heading
    expect(screen.getByText('Blood Work Reference Chart')).toBeDefined();
  });

  it('should have search functionality', () => {
    render(<BloodWorkReferenceChart />);
    
    // Check for search input
    const searchInput = screen.getByPlaceholderText(/iron, vitamin D, hemoglobin/i);
    expect(searchInput).toBeDefined();
  });

  it('should have panel filter', () => {
    render(<BloodWorkReferenceChart />);
    
    // Check for panel filter dropdown
    const panelSelect = screen.getByLabelText(/Panel Filter/i);
    expect(panelSelect).toBeDefined();
  });

  it('should display disclaimer', () => {
    render(<BloodWorkReferenceChart />);
    
    // Check for disclaimer
    expect(screen.getByText(/Disclaimer:/)).toBeDefined();
  });

  it('should display multiple panel sections', () => {
    render(<BloodWorkReferenceChart />);
    
    // Check for panel headings
    expect(screen.getByText(/CBC Panel/)).toBeDefined();
    expect(screen.getByText(/CMP Panel/)).toBeDefined();
    expect(screen.getByText(/Lipids Panel/)).toBeDefined();
    expect(screen.getByText(/Thyroid Panel/)).toBeDefined();
  });

  it('should display directional indicators', () => {
    const { container } = render(<BloodWorkReferenceChart />);
    
    // Check that arrows are present in the rendered output
    expect(container.innerHTML).toContain('↓');
    expect(container.innerHTML).toContain('↑');
  });
});
