import { useState } from 'react';

const BloodWorkReferenceChart = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPanel, setSelectedPanel] = useState('All');

  // Comprehensive blood work marker to nutrient mapping
  const referenceData = [
    // CBC (Complete Blood Count) Panel
    {
      panel: 'CBC',
      marker: 'RBC (Red Blood Cell Count)',
      low: 'Iron, Vitamin B12, Folate, Vitamin B6, Copper, Vitamin E',
      high: 'Vitamin B12 (excess), Folate (deficiency can cause compensatory rise)',
      clinical: 'Low RBC suggests anemia; check iron, B12, folate. High RBC may indicate polycythemia or dehydration.'
    },
    {
      panel: 'CBC',
      marker: 'Hemoglobin',
      low: 'Iron, Vitamin B12, Folate, Vitamin B6, Copper, Vitamin C, Vitamin E',
      high: 'B12 status, dehydration (not nutrient-related)',
      clinical: 'Low hemoglobin indicates anemia. Iron deficiency is most common; also check B12, folate, B6 for cofactor roles.'
    },
    {
      panel: 'CBC',
      marker: 'Hematocrit',
      low: 'Iron, Vitamin B12, Folate, Vitamin B6, Copper',
      high: 'Dehydration, polycythemia (not typically nutrient-related)',
      clinical: 'Mirrors hemoglobin patterns. Low suggests anemia; investigate iron, B12, folate status.'
    },
    {
      panel: 'CBC',
      marker: 'MCV (Mean Corpuscular Volume)',
      low: 'Iron, Vitamin B6, Copper (microcytic anemia)',
      high: 'Vitamin B12, Folate (macrocytic anemia)',
      clinical: 'Low MCV (small cells) points to iron deficiency. High MCV (large cells) suggests B12 or folate deficiency.'
    },
    {
      panel: 'CBC',
      marker: 'MCH (Mean Corpuscular Hemoglobin)',
      low: 'Iron, Vitamin B6',
      high: 'Vitamin B12, Folate',
      clinical: 'Tracks with MCV. Low MCH with low MCV indicates iron deficiency. High MCH suggests B12/folate deficiency.'
    },
    {
      panel: 'CBC',
      marker: 'MCHC (Mean Corpuscular Hemoglobin Concentration)',
      low: 'Iron, Vitamin B6',
      high: 'Usually non-nutritional; can indicate cell abnormalities',
      clinical: 'Low MCHC suggests hypochromic anemia (iron deficiency). High MCHC is less common.'
    },
    {
      panel: 'CBC',
      marker: 'RDW (Red Cell Distribution Width)',
      low: 'Usually normal; low RDW not typically significant',
      high: 'Iron, Vitamin B12, Folate (mixed deficiencies)',
      clinical: 'High RDW indicates variation in RBC size, suggesting mixed or evolving deficiencies (iron, B12, folate).'
    },
    {
      panel: 'CBC',
      marker: 'WBC (White Blood Cell Count)',
      low: 'Vitamin B12, Folate, Copper, Zinc, Vitamin D',
      high: 'Vitamin D (deficiency may relate to inflammation)',
      clinical: 'Low WBC may relate to B12, folate deficiency. Zinc and copper support immune function.'
    },
    {
      panel: 'CBC',
      marker: 'Platelets',
      low: 'Vitamin B12, Folate, Iron',
      high: 'Iron deficiency (reactive thrombocytosis)',
      clinical: 'Low platelets can occur with B12/folate deficiency. High platelets may be reactive to iron deficiency or inflammation.'
    },

    // CMP (Comprehensive Metabolic Panel)
    {
      panel: 'CMP',
      marker: 'Glucose (Fasting)',
      low: 'Chromium, Magnesium (for glucose regulation)',
      high: 'Chromium, Magnesium, Vitamin D (insulin sensitivity)',
      clinical: 'Low glucose may indicate hypoglycemia. High suggests insulin resistance; chromium, magnesium, vitamin D support glucose metabolism.'
    },
    {
      panel: 'CMP',
      marker: 'Calcium',
      low: 'Vitamin D, Magnesium, Vitamin K2, Calcium',
      high: 'Vitamin D (excess), Magnesium (deficiency can impair regulation), Vitamin K2',
      clinical: 'Low calcium suggests vitamin D or magnesium deficiency. High calcium may indicate excess vitamin D or dysregulated calcium metabolism.'
    },
    {
      panel: 'CMP',
      marker: 'Sodium',
      low: 'Sodium intake, hydration status (not typically nutrient-related)',
      high: 'Hydration, sodium intake',
      clinical: 'Sodium imbalance is primarily fluid/electrolyte related, less about specific nutrients.'
    },
    {
      panel: 'CMP',
      marker: 'Potassium',
      low: 'Potassium, Magnesium',
      high: 'Potassium (excess intake or impaired excretion)',
      clinical: 'Low potassium suggests inadequate intake or losses. Magnesium deficiency can worsen potassium loss.'
    },
    {
      panel: 'CMP',
      marker: 'CO2/Bicarbonate',
      low: 'Potassium, metabolic acidosis factors',
      high: 'Potassium, chloride status',
      clinical: 'CO2 reflects acid-base balance. Low may indicate acidosis; high suggests alkalosis. Less direct nutrient correlation.'
    },
    {
      panel: 'CMP',
      marker: 'Chloride',
      low: 'Sodium, chloride intake',
      high: 'Sodium, hydration status',
      clinical: 'Chloride tracks with sodium. Imbalances relate to electrolyte and acid-base status, not specific vitamins/minerals.'
    },
    {
      panel: 'CMP',
      marker: 'BUN (Blood Urea Nitrogen)',
      low: 'Protein intake (inadequate)',
      high: 'Protein intake (excessive), hydration, Vitamin B6 (protein metabolism)',
      clinical: 'Low BUN may suggest low protein intake. High BUN can indicate dehydration, high protein intake, or kidney stress.'
    },
    {
      panel: 'CMP',
      marker: 'Creatinine',
      low: 'Protein intake, muscle mass',
      high: 'Protein intake, creatine supplementation',
      clinical: 'Creatinine reflects muscle mass and kidney function. Not directly nutrient-correlated except via protein/muscle.'
    },
    {
      panel: 'CMP',
      marker: 'eGFR (Estimated Glomerular Filtration Rate)',
      low: 'Vitamin D, Omega-3 fatty acids (kidney health support)',
      high: 'Normal; high eGFR not typically concerning',
      clinical: 'Low eGFR suggests reduced kidney function. Vitamin D and omega-3s may support kidney health.'
    },
    {
      panel: 'CMP',
      marker: 'Total Protein',
      low: 'Protein intake, Vitamin B6, Zinc',
      high: 'Protein intake',
      clinical: 'Low protein suggests inadequate dietary intake or malabsorption. Zinc and B6 support protein metabolism.'
    },
    {
      panel: 'CMP',
      marker: 'Albumin',
      low: 'Protein intake, Zinc, Vitamin A',
      high: 'Dehydration (not nutrient-related)',
      clinical: 'Low albumin indicates protein deficiency or liver dysfunction. Zinc and vitamin A support protein synthesis.'
    },
    {
      panel: 'CMP',
      marker: 'Globulin',
      low: 'Immune nutrients (Vitamin D, Zinc, Vitamin C)',
      high: 'Inflammation markers, immune response',
      clinical: 'Globulins relate to immune function. Zinc, vitamin D, and C support immune health.'
    },

    // Lipid Panel
    {
      panel: 'Lipids',
      marker: 'Total Cholesterol',
      low: 'Omega-3 fatty acids, CoQ10, Vitamin D',
      high: 'Omega-3 fatty acids, Niacin (B3), Fiber, Plant sterols, Vitamin D',
      clinical: 'Low cholesterol rarely nutrient-related. High cholesterol: omega-3s, niacin, fiber, and vitamin D may help regulate.'
    },
    {
      panel: 'Lipids',
      marker: 'LDL Cholesterol',
      low: 'Usually favorable; ensure adequate omega-3, vitamin D',
      high: 'Omega-3 fatty acids, Niacin (B3), Fiber, Plant sterols, Vitamin E, Vitamin D',
      clinical: 'High LDL is cardiovascular risk. Omega-3s, niacin, fiber, vitamin D, and vitamin E may improve lipid profile.'
    },
    {
      panel: 'Lipids',
      marker: 'HDL Cholesterol',
      low: 'Omega-3 fatty acids, Niacin (B3), Magnesium, Vitamin D',
      high: 'Usually favorable; maintain omega-3 intake',
      clinical: 'Low HDL is cardiovascular risk. Omega-3s, niacin, magnesium, and vitamin D can raise HDL.'
    },
    {
      panel: 'Lipids',
      marker: 'Triglycerides',
      low: 'Usually favorable',
      high: 'Omega-3 fatty acids, Niacin (B3), Magnesium, Chromium, Vitamin D',
      clinical: 'High triglycerides indicate metabolic stress. Omega-3s, niacin, magnesium, chromium, vitamin D support lipid metabolism.'
    },

    // Thyroid Panel
    {
      panel: 'Thyroid',
      marker: 'TSH (Thyroid Stimulating Hormone)',
      low: 'Iodine (excess), Selenium, Zinc, Vitamin D',
      high: 'Iodine, Selenium, Zinc, Vitamin D, Iron, Vitamin A',
      clinical: 'Low TSH may indicate hyperthyroidism. High TSH suggests hypothyroidism; check iodine, selenium, zinc, vitamin D, iron.'
    },
    {
      panel: 'Thyroid',
      marker: 'Free T4',
      low: 'Iodine, Selenium, Zinc, Iron, Vitamin D',
      high: 'Selenium (supports T4 to T3 conversion when imbalanced)',
      clinical: 'Low T4 indicates hypothyroidism. Iodine, selenium, zinc, iron, vitamin D are essential for thyroid hormone production.'
    },
    {
      panel: 'Thyroid',
      marker: 'Free T3',
      low: 'Selenium, Zinc, Iron, Vitamin D, Iodine',
      high: 'Selenium (modulates conversion)',
      clinical: 'Low T3 may indicate poor T4-to-T3 conversion. Selenium, zinc, iron, vitamin D support thyroid function.'
    },
    {
      panel: 'Thyroid',
      marker: 'Reverse T3',
      low: 'Usually favorable',
      high: 'Selenium, Zinc, Iron (support optimal T3 conversion)',
      clinical: 'High reverse T3 may indicate metabolic stress or poor T4 conversion. Selenium, zinc, iron support active T3 production.'
    },

    // Liver Enzymes
    {
      panel: 'Liver',
      marker: 'ALT (Alanine Aminotransferase)',
      low: 'Vitamin B6',
      high: 'Vitamin E, Vitamin C, Milk Thistle (silymarin), Omega-3 fatty acids, Vitamin D',
      clinical: 'Low ALT may indicate B6 deficiency. High ALT suggests liver stress; antioxidants (E, C), omega-3s, vitamin D support liver health.'
    },
    {
      panel: 'Liver',
      marker: 'AST (Aspartate Aminotransferase)',
      low: 'Vitamin B6',
      high: 'Vitamin E, Vitamin C, Omega-3 fatty acids, Vitamin D',
      clinical: 'Low AST may suggest B6 deficiency. High AST indicates liver or muscle damage; antioxidants and omega-3s may help.'
    },
    {
      panel: 'Liver',
      marker: 'ALP (Alkaline Phosphatase)',
      low: 'Zinc, Magnesium, Vitamin B6',
      high: 'Zinc, Vitamin D, Magnesium, Phosphorus',
      clinical: 'Low ALP may indicate zinc, magnesium, or B6 deficiency. High ALP can relate to bone turnover (vitamin D, zinc) or liver issues.'
    },
    {
      panel: 'Liver',
      marker: 'GGT (Gamma-Glutamyl Transferase)',
      low: 'Usually normal',
      high: 'Vitamin E, Vitamin C, Omega-3 fatty acids, Magnesium, Vitamin D',
      clinical: 'High GGT suggests liver stress or bile duct issues. Antioxidants (E, C), omega-3s, magnesium, vitamin D may support liver function.'
    },
    {
      panel: 'Liver',
      marker: 'Bilirubin (Total)',
      low: 'Usually benign; may indicate Gilbert\'s syndrome',
      high: 'Vitamin C, Vitamin E (antioxidant support), Milk Thistle',
      clinical: 'Low bilirubin often normal. High bilirubin may indicate liver dysfunction or hemolysis; antioxidants support liver processing.'
    },

    // Iron Studies
    {
      panel: 'Iron',
      marker: 'Iron (Serum)',
      low: 'Iron, Vitamin C (enhances absorption), Copper, Vitamin B12',
      high: 'Vitamin E, Vitamin C (monitor iron status)',
      clinical: 'Low iron suggests deficiency. Vitamin C enhances absorption; copper and B12 support iron metabolism. High iron rare in deficiency states.'
    },
    {
      panel: 'Iron',
      marker: 'Ferritin',
      low: 'Iron, Vitamin C, Copper, Vitamin A',
      high: 'Vitamin C, Vitamin E (antioxidant support if inflammation-related)',
      clinical: 'Low ferritin indicates depleted iron stores; supplement with iron and vitamin C. High ferritin may indicate inflammation or iron overload.'
    },
    {
      panel: 'Iron',
      marker: 'TIBC (Total Iron Binding Capacity)',
      low: 'Protein intake, inflammation markers',
      high: 'Iron, Vitamin C',
      clinical: 'Low TIBC may indicate chronic disease. High TIBC suggests iron deficiency; body increases binding capacity to capture more iron.'
    },
    {
      panel: 'Iron',
      marker: 'Transferrin Saturation',
      low: 'Iron, Vitamin C, Copper',
      high: 'Monitor for iron overload; vitamin E as antioxidant',
      clinical: 'Low saturation indicates iron deficiency. High saturation may suggest iron overload or hemochromatosis.'
    },

    // Vitamin Markers
    {
      panel: 'Vitamins',
      marker: 'Vitamin D (25-OH)',
      low: 'Vitamin D3, Magnesium (cofactor for activation), Vitamin K2',
      high: 'Vitamin K2 (to direct calcium properly), Magnesium',
      clinical: 'Low vitamin D is very common. Supplement with D3; magnesium and K2 support proper utilization and calcium metabolism.'
    },
    {
      panel: 'Vitamins',
      marker: 'Vitamin B12',
      low: 'Vitamin B12 (methylcobalamin or cyanocobalamin), Folate, B-complex',
      high: 'Usually from supplementation; monitor if excessively high',
      clinical: 'Low B12 causes anemia and neurological issues. Supplement with B12; folate works synergistically. High levels usually benign.'
    },
    {
      panel: 'Vitamins',
      marker: 'Folate (Folic Acid)',
      low: 'Folate (methylfolate preferred), Vitamin B12, B-complex',
      high: 'Usually from supplementation; ensure B12 adequacy',
      clinical: 'Low folate causes macrocytic anemia and neural tube defects. Supplement with folate; B12 required for proper utilization.'
    },
    {
      panel: 'Vitamins',
      marker: 'Vitamin B6 (Pyridoxine)',
      low: 'Vitamin B6, Magnesium, Zinc',
      high: 'Usually from over-supplementation; reduce intake',
      clinical: 'Low B6 affects neurotransmitter synthesis and protein metabolism. Magnesium and zinc support B6 function.'
    },

    // Glucose/Diabetes Markers
    {
      panel: 'Glucose',
      marker: 'HbA1c (Glycated Hemoglobin)',
      low: 'Usually favorable; ensure adequate B vitamins for RBC health',
      high: 'Chromium, Magnesium, Vitamin D, Alpha-lipoic acid, Omega-3 fatty acids',
      clinical: 'Low HbA1c generally good. High indicates poor glucose control; chromium, magnesium, vitamin D, ALA, omega-3s improve insulin sensitivity.'
    },
    {
      panel: 'Glucose',
      marker: 'Insulin (Fasting)',
      low: 'Chromium, Magnesium (for insulin regulation)',
      high: 'Chromium, Magnesium, Vitamin D, Omega-3 fatty acids, Alpha-lipoic acid',
      clinical: 'Low insulin rare. High insulin indicates insulin resistance; chromium, magnesium, vitamin D, omega-3s, ALA support glucose metabolism.'
    },
    {
      panel: 'Glucose',
      marker: 'C-Peptide',
      low: 'Zinc, Chromium (pancreatic support)',
      high: 'Chromium, Magnesium, Vitamin D (insulin sensitivity)',
      clinical: 'C-peptide reflects insulin production. Low suggests pancreatic insufficiency. High indicates insulin resistance.'
    },

    // Inflammation/Immune Markers
    {
      panel: 'Inflammation',
      marker: 'CRP (C-Reactive Protein)',
      low: 'Usually favorable',
      high: 'Omega-3 fatty acids, Vitamin D, Vitamin C, Vitamin E, Curcumin',
      clinical: 'High CRP indicates inflammation. Omega-3s, vitamin D, C, E, and curcumin have anti-inflammatory properties.'
    },
    {
      panel: 'Inflammation',
      marker: 'Homocysteine',
      low: 'Usually favorable',
      high: 'Folate, Vitamin B12, Vitamin B6, Betaine (TMG)',
      clinical: 'High homocysteine is cardiovascular risk. B12, folate, B6, and betaine lower homocysteine by supporting methylation.'
    },

    // Electrolytes & Minerals
    {
      panel: 'Minerals',
      marker: 'Magnesium',
      low: 'Magnesium, Vitamin D (for absorption), Vitamin B6',
      high: 'Usually from over-supplementation; reduce intake',
      clinical: 'Low magnesium is common and affects hundreds of enzyme systems. Vitamin D and B6 support magnesium function.'
    },
    {
      panel: 'Minerals',
      marker: 'Zinc',
      low: 'Zinc, Vitamin A, Vitamin C',
      high: 'Copper (zinc excess depletes copper)',
      clinical: 'Low zinc impairs immune function and wound healing. Vitamin A and C support zinc absorption. High zinc can deplete copper.'
    },
    {
      panel: 'Minerals',
      marker: 'Copper',
      low: 'Copper, Vitamin C, Zinc (balanced ratio)',
      high: 'Zinc (to balance copper), Molybdenum',
      clinical: 'Low copper affects iron metabolism and connective tissue. High copper can indicate zinc deficiency or Wilson\'s disease.'
    },
    {
      panel: 'Minerals',
      marker: 'Selenium',
      low: 'Selenium, Vitamin E (synergistic antioxidant)',
      high: 'Usually from over-supplementation; reduce intake',
      clinical: 'Low selenium impairs thyroid function and antioxidant defense. Vitamin E works synergistically with selenium.'
    }
  ];

  // Get unique panels for filter
  const panels = ['All', ...new Set(referenceData.map(item => item.panel))];

  // Filter data based on search term and selected panel
  const filteredData = referenceData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.marker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.low.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.high.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clinical.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPanel = selectedPanel === 'All' || item.panel === selectedPanel;
    
    return matchesSearch && matchesPanel;
  });

  // Group data by panel
  const groupedData = filteredData.reduce((acc, item) => {
    if (!acc[item.panel]) {
      acc[item.panel] = [];
    }
    acc[item.panel].push(item);
    return acc;
  }, {});

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ color: '#333', marginBottom: '10px' }}>Blood Work Reference Chart</h2>
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
        Correlation and interpretation reference for blood work markers and associated nutrients. 
        This is for educational purposes only and should not be used for medical advice.
      </p>

      {/* Filters */}
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
          <label htmlFor="ref-search" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
            Search Markers or Nutrients
          </label>
          <input
            id="ref-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="e.g., iron, vitamin D, hemoglobin..."
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ flex: '0 0 200px' }}>
          <label htmlFor="panel-select" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
            Panel Filter
          </label>
          <select
            id="panel-select"
            value={selectedPanel}
            onChange={(e) => setSelectedPanel(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
              fontSize: '14px'
            }}
          >
            {panels.map(panel => (
              <option key={panel} value={panel}>{panel}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
        Showing {filteredData.length} of {referenceData.length} markers
      </div>

      {/* Reference Table - Grouped by Panel */}
      <div style={{ overflowX: 'auto' }}>
        {Object.entries(groupedData).map(([panel, items]) => (
          <div key={panel} style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              color: '#007bff', 
              marginBottom: '10px', 
              paddingBottom: '5px', 
              borderBottom: '2px solid #007bff',
              fontSize: '18px'
            }}>
              {panel} Panel
            </h3>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '10px'
            }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ ...tableHeaderStyle, width: '20%' }}>Marker</th>
                  <th style={{ ...tableHeaderStyle, width: '25%' }}>Low → Nutrients</th>
                  <th style={{ ...tableHeaderStyle, width: '25%' }}>High → Nutrients</th>
                  <th style={{ ...tableHeaderStyle, width: '30%' }}>Clinical Context</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ ...tableCellStyle, fontWeight: '600', fontSize: '13px' }}>{item.marker}</td>
                    <td style={{ ...tableCellStyle, fontSize: '13px' }}>
                      <span style={{ color: '#dc3545' }}>↓ </span>{item.low}
                    </td>
                    <td style={{ ...tableCellStyle, fontSize: '13px' }}>
                      <span style={{ color: '#007bff' }}>↑ </span>{item.high}
                    </td>
                    <td style={{ ...tableCellStyle, fontSize: '12px', color: '#555' }}>{item.clinical}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: '#f8f9fa',
          borderRadius: '5px',
          color: '#6c757d'
        }}>
          <p style={{ fontSize: '16px' }}>No markers found matching your search criteria.</p>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '5px',
        fontSize: '13px',
        color: '#856404'
      }}>
        <strong>Disclaimer:</strong> This reference chart provides correlations between blood work markers and nutrients for educational purposes only. 
        It is not medical advice. Always consult with a qualified healthcare provider for interpretation of lab results and before making any 
        supplementation decisions. Individual needs vary based on health status, medications, and other factors.
      </div>
    </div>
  );
};

const tableHeaderStyle = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #dee2e6',
  fontWeight: 'bold',
  fontSize: '14px',
  background: '#f8f9fa'
};

const tableCellStyle = {
  padding: '10px 12px',
  textAlign: 'left',
  verticalAlign: 'top'
};

export default BloodWorkReferenceChart;
