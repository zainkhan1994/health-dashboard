import { useState, useEffect, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Simple hash function for generating stable IDs
const generateStableId = (record) => {
  const key = `${record.date || ''}|${record.provider || ''}|${record.marker || ''}|${record.value || ''}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString();
};

// Header aliases for flexible CSV parsing
const HEADER_ALIASES = {
  id: ['id', 'uid', 'recordid'],
  marker: ['marker', 'test', 'name', 'testname'],
  provider: ['provider', 'doctor', 'physician'],
  date: ['date', 'sampledate', 'specimendate', 'testdate'],
  value: ['value', 'result', 'testvalue'],
  reference_range: ['reference', 'referencerange', 'refrange', 'range'],
  lab: ['lab', 'laboratory'],
  source_file: ['sourcefile', 'source', 'file']
};

// Normalize header name
const normalizeHeader = (header) => {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Map header to canonical key
const mapHeader = (header) => {
  const normalized = normalizeHeader(header);
  for (const [canonical, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.some(alias => normalizeHeader(alias) === normalized)) {
      return canonical;
    }
  }
  return header.trim().toLowerCase().replace(/\s+/g, '_');
};

// Extract year from date string
const extractYear = (dateStr) => {
  if (!dateStr) return 'Unknown';
  
  // Try parsing as ISO date
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate.getFullYear().toString();
  }
  
  // Fallback to regex for first 4 digits
  const match = dateStr.match(/(\d{4})/);
  return match ? match[1] : 'Unknown';
};

// Extract year-month from date string for time series
const extractYearMonth = (dateStr) => {
  if (!dateStr) return 'Unknown';
  
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    const year = isoDate.getFullYear();
    const month = String(isoDate.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
  
  return 'Unknown';
};

// Aggregate top markers by frequency
const aggregateTopMarkers = (data, topN = 10) => {
  const markerCounts = {};
  data.forEach(record => {
    const marker = record.marker || 'Unknown';
    markerCounts[marker] = (markerCounts[marker] || 0) + 1;
  });
  
  const sorted = Object.entries(markerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN);
  
  return {
    labels: sorted.map(([marker]) => marker),
    counts: sorted.map(([, count]) => count)
  };
};

// Aggregate markers over time (by month)
const aggregateMarkersOverTime = (data) => {
  const monthCounts = {};
  data.forEach(record => {
    const month = extractYearMonth(record.date);
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });
  
  const sorted = Object.entries(monthCounts)
    .filter(([month]) => month !== 'Unknown')
    .sort(([a], [b]) => a.localeCompare(b));
  
  return {
    labels: sorted.map(([month]) => month),
    counts: sorted.map(([, count]) => count)
  };
};

// Aggregate provider distribution
const aggregateProviders = (data) => {
  const providerCounts = {};
  data.forEach(record => {
    const provider = record.provider || 'Unknown';
    providerCounts[provider] = (providerCounts[provider] || 0) + 1;
  });
  
  return {
    labels: Object.keys(providerCounts),
    counts: Object.values(providerCounts)
  };
};

const HealthProfileDashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parseErrors, setParseErrors] = useState([]);

  // Apply filters to data
  const applyFilters = useCallback(() => {
    let filtered = [...data];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        (record.marker || '').toLowerCase().includes(term) ||
        (record.value || '').toLowerCase().includes(term) ||
        (record.provider || '').toLowerCase().includes(term)
      );
    }

    if (selectedProvider !== 'All') {
      filtered = filtered.filter(record => record.provider === selectedProvider);
    }

    if (selectedYear !== 'All') {
      filtered = filtered.filter(record => extractYear(record.date) === selectedYear);
    }

    setFilteredData(filtered);
  }, [data, searchTerm, selectedProvider, selectedYear]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 250);

    return () => clearTimeout(timer);
  }, [applyFilters]);

  // Get unique providers sorted alphabetically
  const providerList = useMemo(() => {
    const providers = new Set(data.map(record => record.provider).filter(Boolean));
    return ['All', ...Array.from(providers).sort()];
  }, [data]);

  // Get unique years sorted numerically descending, with 'Unknown' last
  const yearList = useMemo(() => {
    const years = new Set(data.map(record => extractYear(record.date)));
    const yearArray = Array.from(years);
    const numericYears = yearArray.filter(y => y !== 'Unknown').sort((a, b) => parseInt(b) - parseInt(a));
    const hasUnknown = yearArray.includes('Unknown');
    return ['All', ...numericYears, ...(hasUnknown ? ['Unknown'] : [])];
  }, [data]);

  // Compute chart data
  const topMarkersData = useMemo(() => {
    if (data.length === 0) return null;
    const { labels, counts } = aggregateTopMarkers(data, 10);
    return {
      labels,
      datasets: [{
        label: 'Frequency',
        data: counts,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };
  }, [data]);

  const markersOverTimeData = useMemo(() => {
    if (data.length === 0) return null;
    const { labels, counts } = aggregateMarkersOverTime(data);
    return {
      labels,
      datasets: [{
        label: 'Records per Month',
        data: counts,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true
      }]
    };
  }, [data]);

  const providersData = useMemo(() => {
    if (data.length === 0) return null;
    const { labels, counts } = aggregateProviders(data);
    return {
      labels,
      datasets: [{
        label: 'Records',
        data: counts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    };
  }, [data]);

  // Compute summary statistics
  const summaryStats = useMemo(() => {
    if (data.length === 0) return null;
    
    const uniqueMarkers = new Set(data.map(r => r.marker).filter(Boolean));
    const uniqueProviders = new Set(data.map(r => r.provider).filter(Boolean));
    const dates = data.map(r => r.date).filter(Boolean);
    const latestDate = dates.length > 0 
      ? dates.reduce((latest, current) => {
          const currentDate = new Date(current);
          const latestDate = new Date(latest);
          return currentDate > latestDate ? current : latest;
        })
      : 'N/A';
    
    return {
      totalRecords: data.length,
      uniqueMarkers: uniqueMarkers.size,
      uniqueProviders: uniqueProviders.size,
      latestDate
    };
  }, [data]);

  // Parse CSV with PapaParse
  const parseCSVData = useCallback((csvText, filename = 'uploaded file') => {
    setIsLoading(true);
    setError('');
    setParseErrors([]);

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (header) => mapHeader(header),
      complete: (results) => {
        setIsLoading(false);

        if (results.errors && results.errors.length > 0) {
          setParseErrors(results.errors.slice(0, 5)); // Show first 5 errors
          console.error('Parsing errors:', results.errors);
        }

        if (!results.data || results.data.length === 0) {
          setError('No data found in the CSV file.');
          return;
        }

        // Process and add stable IDs
        const processedData = results.data.map((row) => {
          const id = row.id || generateStableId(row);
          return { ...row, id };
        });

        setData(processedData);
      },
      error: (error) => {
        setIsLoading(false);
        setError(`Failed to parse ${filename}: ${error.message}`);
        console.error('Parse error:', error);
      }
    });
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (warn if > 10MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 10) {
      const proceed = window.confirm(
        `This file is ${fileSizeMB.toFixed(2)} MB. Large files may take a while to process. Continue?`
      );
      if (!proceed) {
        event.target.value = null;
        return;
      }
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      parseCSVData(e.target.result, file.name);
    };

    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
    };

    reader.readAsText(file);
    event.target.value = null; // Reset input
  }, [parseCSVData]);

  // Load demo CSV
  const loadDemoCSV = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/src/data/demo/consolidated_labs_demo.csv');
      if (!response.ok) {
        throw new Error('Failed to load demo CSV');
      }
      const text = await response.text();
      parseCSVData(text, 'demo CSV');
    } catch (err) {
      setError(`Failed to load demo CSV: ${err.message}`);
      setIsLoading(false);
    }
  }, [parseCSVData]);

  // Clear all data
  const clearData = useCallback(() => {
    setData([]);
    setFilteredData([]);
    setSearchTerm('');
    setSelectedProvider('All');
    setSelectedYear('All');
    setError('');
    setParseErrors([]);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '10px' }}>Health Profile Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Upload your health lab CSV file or load demo data to view and filter your health records.
      </p>

      {/* Controls Section */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <label
          htmlFor="csv-upload"
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'inline-block'
          }}
        >
          Upload CSV File
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            aria-label="Upload CSV file"
          />
        </label>

        <button
          onClick={loadDemoCSV}
          style={{
            padding: '10px 20px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          disabled={isLoading}
        >
          Load Demo Data
        </button>

        {data.length > 0 && (
          <button
            onClick={clearData}
            style={{
              padding: '10px 20px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Clear Data
          </button>
        )}

        <span style={{ marginLeft: 'auto', color: '#666' }}>
          {isLoading ? 'Loading...' : `${filteredData.length} of ${data.length} records`}
        </span>
      </div>

      {/* Error Messages */}
      {error && (
        <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '5px', marginBottom: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {parseErrors.length > 0 && (
        <div style={{ padding: '10px', background: '#fff3cd', color: '#856404', borderRadius: '5px', marginBottom: '20px' }}>
          <strong>Parsing Warnings:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            {parseErrors.map((err, idx) => (
              <li key={idx}>
                Row {err.row}: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filters Section */}
      {data.length > 0 && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          background: '#f8f9fa', 
          borderRadius: '5px',
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1 1 300px' }}>
            <label htmlFor="search-input" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Search
            </label>
            <input
              id="search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by marker, value, or provider..."
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
              aria-label="Search health records"
            />
          </div>

          <div style={{ flex: '0 0 200px' }}>
            <label htmlFor="provider-select" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Provider
            </label>
            <select
              id="provider-select"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
              aria-label="Filter by provider"
            >
              {providerList.map(provider => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: '0 0 150px' }}>
            <label htmlFor="year-select" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Year
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
              aria-label="Filter by year"
            >
              {yearList.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Summary Statistics and Visualizations */}
      {data.length > 0 && summaryStats && (
        <>
          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={summaryCardStyle}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Total Records</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{summaryStats.totalRecords}</div>
            </div>
            <div style={summaryCardStyle}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Unique Markers</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{summaryStats.uniqueMarkers}</div>
            </div>
            <div style={summaryCardStyle}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Providers</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>{summaryStats.uniqueProviders}</div>
            </div>
            <div style={summaryCardStyle}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Latest Date</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>{summaryStats.latestDate}</div>
            </div>
          </div>

          {/* Charts Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {/* Top Markers Bar Chart */}
            {topMarkersData && (
              <div style={chartContainerStyle}>
                <h3 style={chartTitleStyle}>Top 10 Markers by Frequency</h3>
                <div style={{ height: '300px', position: 'relative' }}>
                  <Bar
                    data={topMarkersData}
                    options={{
                      indexAxis: 'y',
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => `Count: ${context.parsed.x}`
                          }
                        }
                      },
                      scales: {
                        x: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Count'
                          }
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Marker'
                          }
                        }
                      }
                    }}
                    aria-label="Horizontal bar chart showing top 10 health markers by frequency"
                  />
                </div>
              </div>
            )}

            {/* Markers Over Time Line Chart */}
            {markersOverTimeData && (
              <div style={chartContainerStyle}>
                <h3 style={chartTitleStyle}>Records Over Time</h3>
                <div style={{ height: '300px', position: 'relative' }}>
                  <Line
                    data={markersOverTimeData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: 'top'
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => `Records: ${context.parsed.y}`
                          }
                        }
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Month'
                          }
                        },
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Records'
                          }
                        }
                      }
                    }}
                    aria-label="Line chart showing health records over time by month"
                  />
                </div>
              </div>
            )}

            {/* Providers Distribution Pie Chart */}
            {providersData && (
              <div style={chartContainerStyle}>
                <h3 style={chartTitleStyle}>Provider Distribution</h3>
                <div style={{ height: '300px', position: 'relative' }}>
                  <Pie
                    data={providersData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: 'right'
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const label = context.label || '';
                              const value = context.parsed || 0;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                    aria-label="Pie chart showing distribution of records across providers"
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Data Table */}
      {filteredData.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Marker</th>
                <th style={tableHeaderStyle}>Value</th>
                <th style={tableHeaderStyle}>Reference Range</th>
                <th style={tableHeaderStyle}>Provider</th>
                <th style={tableHeaderStyle}>Lab</th>
                <th style={tableHeaderStyle}>Source</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(record => (
                <tr key={record.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={tableCellStyle}>{record.date || '-'}</td>
                  <td style={tableCellStyle}>{record.marker || '-'}</td>
                  <td style={tableCellStyle}>{record.value || '-'}</td>
                  <td style={tableCellStyle}>{record.reference_range || '-'}</td>
                  <td style={tableCellStyle}>{record.provider || '-'}</td>
                  <td style={tableCellStyle}>{record.lab || '-'}</td>
                  <td style={tableCellStyle}>{record.source_file || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.length === 0 && !isLoading && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: '#f8f9fa',
          borderRadius: '5px',
          color: '#6c757d'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>No data loaded</p>
          <p>Upload a CSV file or load demo data to get started.</p>
        </div>
      )}
    </div>
  );
};

const tableHeaderStyle = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #dee2e6',
  fontWeight: 'bold',
  position: 'sticky',
  top: 0,
  background: '#f8f9fa'
};

const tableCellStyle = {
  padding: '10px 12px',
  textAlign: 'left'
};

const summaryCardStyle = {
  padding: '20px',
  background: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  textAlign: 'center'
};

const chartContainerStyle = {
  padding: '20px',
  background: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const chartTitleStyle = {
  marginTop: 0,
  marginBottom: '15px',
  fontSize: '16px',
  color: '#333',
  fontWeight: '600'
};

export default HealthProfileDashboard;
