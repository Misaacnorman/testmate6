import React, { useState, useEffect } from 'react';
import { getMaterialTests, getMaterialCategories, getMaterialTestsByCategory } from '../api/materialTestsApi';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
// import '../components/CreateInvoiceModal.css'; // Removed: modal styling no longer needed

// Define the material categories that trigger the second log type
const SPECIAL_MATERIALS = ['Cubes', 'Pavers', 'Bricks', 'Blocks', 'Cylinders'];

interface ClientSampleForm {
  clientName: string;
  clientAddress: string;
  clientContact: string;
  billingSame: boolean;
  billedClientName: string;
  billedClientAddress: string;
  billedClientContact: string;
  projectTitle: string;
  sampleStatus: string;
  receivedDate: string;
  receivedBy: string;
  receiptTime: string;
  deliveredBy: string;
  deliveryContact: string;
  modeOfTransmit: string;
}

interface SampleEntry {
  materialCategory: string;
  materialTest: string;
  testId: number | null;
  numberOfTests: number;
}

interface SpecialSampleDetails {
  dimensions: string;
  dateOfCast: string;
  dateOfTest: string;
  class: string;
  areaOfUse: string;
  unitSubdivisions: number; // How to subdivide the units (e.g., 3 units into 3 groups of 1, or 1 group of 3)
  remark: string;
  failureMode: string;
}

interface SetDetails {
  dateOfCast: string;
  dateOfTest: string;
  age: string;
  areaOfUse: string;
  serialNumbers: string[];
  class?: string;
  assignedTests?: string[]; // Array of test names assigned to this set
  // Dimensions for all types
  L?: string;
  W?: string;
  H?: string;
  D?: string; // Diameter for cylinders
  t?: string; // Thickness for pavers
  numPerSqm?: string; // Number per sqm for pavers
  blockType?: 'solid' | 'hollow';
  holes?: Array<{
    no: string;
    aL: string;
    aW: string;
    bNo: string; // Number for hole B
    bL: string;
    bW: string;
    nNo: string;
    nL: string;
    nW: string;
  }>;
}

const initialForm: ClientSampleForm = {
  clientName: '',
  clientAddress: '',
  clientContact: '',
  billingSame: true,
  billedClientName: '',
  billedClientAddress: '',
  billedClientContact: '',
  projectTitle: '',
  sampleStatus: '',
  receivedDate: '',
  receivedBy: '',
  receiptTime: '',
  deliveredBy: '',
  deliveryContact: '',
  modeOfTransmit: 'Email',
};

const initialSample: SampleEntry = {
  materialCategory: '',
  materialTest: '',
  testId: null,
  numberOfTests: 1,
};

const initialSpecialDetails: SpecialSampleDetails = {
  dimensions: '',
  dateOfCast: '',
  dateOfTest: '',
  class: '',
  areaOfUse: '',
  unitSubdivisions: 1,
  remark: '',
  failureMode: '',
};

const RegisterSample = () => {
  const [form, setForm] = useState<ClientSampleForm>(initialForm);
  const [step, setStep] = useState(1);
  const [materialTests, setMaterialTests] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [currentSample, setCurrentSample] = useState<SampleEntry>(initialSample);
  const [samples, setSamples] = useState<SampleEntry[]>([]);
  const [specialDetails, setSpecialDetails] = useState<SpecialSampleDetails>(initialSpecialDetails);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showSpecialStep, setShowSpecialStep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Add new state for the multi-step modal
  const [modalStep, setModalStep] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [materialCategories, setMaterialCategories] = useState<string[]>([]);
  const [categoryTests, setCategoryTests] = useState<Record<string, any[]>>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryDetails, setCategoryDetails] = useState<Record<string, { note: string; quantity: number; selectedTests: string[]; testQuantities: Record<string, number>; }>>({});
  const [concreteExtra, setConcreteExtra] = useState<{ [cat: string]: SetDetails[] }>({});
  const [reviewData, setReviewData] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Add at the top-level of the component:
  const [expandedCategories, setExpandedCategories] = useState<{ [cat: string]: boolean }>({});
  const [testsExpandedCategories, setTestsExpandedCategories] = useState<{ [cat: string]: boolean }>({});
  const [step3RenderError, setStep3RenderError] = useState<string>("");

  // At the top-level of the component, add:
  const CONCRETE_CATEGORIES = ['CONCRETE', 'PAVERS', 'CYLINDERS', 'BLOCKS', 'BRICKS'];
  const isConcrete = (cat: string) => CONCRETE_CATEGORIES.includes(cat.trim().toUpperCase());
  const needsConcreteStep = selectedCategories.some(isConcrete);

  // Add a serial number state at the top of the component
  const [serialCounter, setSerialCounter] = useState(1);
  const getSerialNumber = () => String(serialCounter).padStart(5, '0');

  // Add state for PDF error
  const [pdfError, setPdfError] = useState<string>("");

  // Fetch all material tests on modal open
  useEffect(() => {
    if (modalOpen) {
      getMaterialTests().then((data: any[]) => {
        setMaterialTests(data);
        // Derive unique categories from tests
        const cats = Array.from(new Set(data.map((t: any) => t.category))).filter(Boolean) as string[];
        setCategories(cats);
      });
    }
  }, [modalOpen]);

  // Filter tests for the selected category
  useEffect(() => {
    if (currentSample.materialCategory) {
      setTests(materialTests.filter((t: any) => t.category === currentSample.materialCategory));
    } else {
      setTests([]);
    }
  }, [currentSample.materialCategory, materialTests]);

  // Check if any sample requires special handling
  useEffect(() => {
    const hasSpecialMaterial = samples.some(sample => 
      SPECIAL_MATERIALS.includes(sample.materialCategory)
    );
    setShowSpecialStep(hasSpecialMaterial);
  }, [samples]);

  // Fetch categories and tests on modal open
  useEffect(() => {
    if (modalOpen) {
      setLoading(true);
      getMaterialCategories().then(async (cats: string[]) => {
        setMaterialCategories(cats);
        const testsByCat: Record<string, any[]> = {};
        for (const cat of cats) {
          testsByCat[cat] = await getMaterialTestsByCategory(cat);
        }
        setCategoryTests(testsByCat);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [modalOpen]);

  const autoFill = () => {
    const now = new Date();
    const today = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
    const time = now.toTimeString().split(' ')[0].slice(0,5); // HH:MM
    
    // Get current user from localStorage
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const userName = currentUser ? currentUser.name : 'Unknown User';
    
    setForm(f => ({
      ...f,
      receivedDate: today,
      receiptTime: time,
      receivedBy: userName,
    }));
    setSpecialDetails(s => ({
      ...s,
      dateOfTest: today,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setForm({ ...form, [name]: e.target.checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSampleChange = (e: React.ChangeEvent<HTMLSelectElement|HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentSample(s => ({ ...s, [name]: name === 'numberOfTests' ? Number(value) : value }));
    if (name === 'materialCategory') {
      setCurrentSample(s => ({ ...s, materialTest: '', testId: null }));
    }
    if (name === 'materialTest') {
      const test = tests.find((t: any) => t.name === value);
      setCurrentSample(s => ({ ...s, testId: test ? test.id : null }));
    }
  };

  const handleSpecialDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setSpecialDetails(s => ({ ...s, [name]: Number(value) }));
    } else {
      setSpecialDetails(s => ({ ...s, [name]: value }));
    }
  };

  const handleAddSample = () => {
    if (!currentSample.materialCategory || !currentSample.materialTest || !currentSample.testId) return;
    setSamples([...samples, currentSample]);
    setCurrentSample(initialSample);
  };

  const handleRemoveSample = (idx: number) => {
    setSamples(samples.filter((_, i) => i !== idx));
  };

  const generateReceiptNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SR-${year}-${month}${day}-${random}`;
  };

  const generateProjectNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PRJ-${year}-${random}`;
  };

  const handleSubmitAll = async () => {
    setSubmitting(true);
    setError('');

    try {
      // Build the tests array from samples
      const tests = samples.map(sample => ({ materialTest: sample.materialTest }));

      // Build the payload for /api/samples/receive
      const payload = {
            clientName: form.clientName,
        clientAddress: form.clientAddress,
        clientContact: form.clientContact,
        projectTitle: form.projectTitle,
        sampleStatus: form.sampleStatus,
        receivedDate: form.receivedDate,
        receivedBy: form.receivedBy,
        receiptTime: form.receiptTime,
        deliveredBy: form.deliveredBy,
        deliveryContact: form.deliveryContact,
        modeOfTransmit: form.modeOfTransmit,
        tests,
      };

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // POST to /api/samples/receive
      const response = await fetch('http://localhost:4000/api/samples/receive', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
        credentials: 'include', // if using cookies/JWT
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register sample.');
      }

      setSuccess(true);
      setSamples([]);
      setForm(initialForm);
      setCurrentSample(initialSample);
      setSpecialDetails(initialSpecialDetails);
      setStep(1);
    } catch (error: any) {
      console.error('Error submitting sample registration:', error);
      setError(error.message || 'Failed to register sample. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpen = () => {
    setModalOpen(true);
    setStep(1);
    setForm(initialForm);
    setSamples([]);
    setCurrentSample(initialSample);
    setSpecialDetails(initialSpecialDetails);
    setSuccess(false);
    setError('');
    autoFill();
  };

  const getNextStep = () => {
    if (step === 3 && showSpecialStep) {
      return 4; // Go to special details step
    }
    return step + 1;
  };

  const getPreviousStep = () => {
    if (step === 4) {
      return 3; // Go back to review step
    }
    return step - 1;
  };

  // Modal open/close handlers
  const openModal = () => {
    setModalOpen(true);
    setModalStep(1);
    autoFill();
  };
  const closeModal = () => { setModalOpen(false); setPdfUrl(""); setReviewData(""); setSelectedCategories([]); setCategoryDetails({}); setConcreteExtra({}); setError(""); };

  // Step navigation
  const nextStep = () => setModalStep(s => s + 1);
  const prevStep = () => setModalStep(s => s - 1);

  // Handlers for category selection, details, tests, etc.
  // ... (implement handlers for checkboxes, text areas, counters, collapsibles, etc.)

  // Helper: wrap text to fit a given width using pdf-lib font
  function wrapText(text: string, font: any, fontSize: number, maxWidth: number) {
    if (!text) return [''];
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    for (let word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  // PDF generation handler (using pdf-lib)
  const handleGeneratePdf = async () => {
    setPdfError("");
    try {
      // Validation: ensure all required data is present
      if (!selectedCategories.length) throw new Error("No categories selected.");
      for (const cat of selectedCategories) {
        if (!categoryDetails[cat]) throw new Error(`Missing details for category: ${cat}`);
        if (!categoryTests[cat]) throw new Error(`Missing tests for category: ${cat}`);
        if (isConcrete(cat) && !concreteExtra[cat]) throw new Error(`Missing concrete details for: ${cat}`);
      }
      setSerialCounter(prev => prev + 1);
      const serialNumber = getSerialNumber();
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([800, 1100]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      let y = 1050;
      const left = 50;

      // Serial number at upper left
      page.drawText(`Serial: ${serialNumber}`, { x: left, y, size: 14, font, color: rgb(0, 0, 0) });
      y -= 30;

      // Title
      page.drawText('Sample Receipt', { x: left, y, size: 24, font, color: rgb(0, 0, 0.6) });
      y -= 40;

      // Summary fields
      page.drawText(`Client Name: ${form.clientName}`, { x: left, y, size: 12, font, color: rgb(0, 0, 0) }); y -= 18;
      page.drawText(`Project Title: ${form.projectTitle}`, { x: left, y, size: 12, font, color: rgb(0, 0, 0) }); y -= 18;
      page.drawText(`Date of Receipt: ${form.receivedDate}`, { x: left, y, size: 12, font, color: rgb(0, 0, 0) }); y -= 18;
      page.drawText(`Time of Receipt: ${form.receiptTime}`, { x: left, y, size: 12, font, color: rgb(0, 0, 0) }); y -= 18;
      page.drawText(`Received By: ${form.receivedBy}`, { x: left, y, size: 12, font, color: rgb(0, 0, 0) }); y -= 18;
      page.drawText(`Delivered By: ${form.deliveredBy}`, { x: left, y, size: 12, font, color: rgb(0, 0, 0) }); y -= 18;
      y -= 10;

      // Table column widths
      const colWidths = [110, 180, 180, 140, 200];
      const colStarts = [left, left+colWidths[0], left+colWidths[0]+colWidths[1], left+colWidths[0]+colWidths[1]+colWidths[2], left+colWidths[0]+colWidths[1]+colWidths[2]+colWidths[3]];

      // Table header
      page.drawRectangle({ x: left, y: y-20, width: colWidths.reduce((a,b)=>a+b,0), height: 24, color: rgb(0.95,0.95,0.95), borderColor: rgb(0.8,0.8,0.8), borderWidth: 1 });
      const headers = ['Date of Receipt', 'Material Category (Units)', 'Material Tests (Units)', 'Test Method(s)', 'Concrete Details'];
      headers.forEach((header, i) => {
        page.drawText(header, { x: colStarts[i]+8, y: y-6, size: 12, font, color: rgb(0,0,0) }); // Force black text
      });
      y -= 28;

      // Table rows
      for (const cat of selectedCategories) {
        const details = categoryDetails[cat];
        const tests = (categoryTests[cat] || []).filter(t => details.selectedTests.includes(t.name));
        const isConc = isConcrete(cat);
        const extra = concreteExtra[cat];
        // Prepare cell values (multi-line)
        const cellVals = [
          form.receivedDate,
          `${cat} (${details.quantity})`,
          details.selectedTests.map(test => `${test} (${details.testQuantities[test]})`).join('\n'),
          tests.map(t => t.method || '-').join('\n'),
          isConc && Array.isArray(extra)
            ? extra.map((set, i) => `Set ${i+1}:\n  Casting: ${set.dateOfCast}\n  Testing: ${set.dateOfTest}\n  Age: ${set.age}\n  Area: ${set.areaOfUse}\n  Serials: ${(set.serialNumbers && set.serialNumbers.join(', ')) || ''}`).join('\n\n')
            : ''
        ];
        // For each cell, split on '\n', then wrap each line
        const wrapped = cellVals.map((val, i) => {
          return val.split('\n').flatMap(line => wrapText(line, font, 11, colWidths[i]-16));
        });
        // Row height: max lines * line height + padding
        const maxLines = Math.max(...wrapped.map(lines => lines.length));
        const rowHeight = maxLines * 14 + 8;
        // Row background
        page.drawRectangle({ x: left, y: y-rowHeight+4, width: colWidths.reduce((a,b)=>a+b,0), height: rowHeight, color: rgb(1,1,1), borderColor: rgb(0.8,0.8,0.8), borderWidth: 1 });
        // Draw each cell's lines
        for (let i = 0; i < wrapped.length; ++i) {
          for (let l = 0; l < wrapped[i].length; ++l) {
            page.drawText(wrapped[i][l], { x: colStarts[i]+8, y: y-6-l*14, size: 11, font, color: rgb(0,0,0) }); // Force black text
          }
        }
        y -= rowHeight;
        if (y < 100) { y = 1050; pdfDoc.addPage([800, 1100]); }
      }
      y -= 10;

      // Notes section
      page.drawText('Notes:', { x: left, y, size: 12, font, color: rgb(0,0,0.5) }); y -= 16;
      for (const cat of selectedCategories) {
        const note = categoryDetails[cat]?.note;
        if (note) {
          page.drawText(`${cat}: ${note}`, { x: left+20, y, size: 11, font });
          y -= 14;
        }
      }
      y -= 10;

      // Finalize
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err: any) {
      console.error("PDF generation error:", err);
      setPdfError(err.message || String(err));
    }
  };

  const createSpecialUnits = (serials: string[]): { serialNumber: string; weight?: number; load?: number }[] =>
    serials.map(sn => ({ serialNumber: sn }));

  const handleFinish = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      // Validation: ensure all required data is present
      if (!selectedCategories.length) throw new Error("No categories selected.");
      for (const cat of selectedCategories) {
        if (!categoryDetails[cat]) throw new Error(`Missing details for category: ${cat}`);
        if (!categoryDetails[cat].selectedTests || !categoryDetails[cat].selectedTests.length) throw new Error(`No tests selected for category: ${cat}`);
        if (isConcrete(cat) && (!concreteExtra[cat] || !concreteExtra[cat].length)) throw new Error(`Missing concrete details for: ${cat}`);
      }
      
      // Build the tests array from selected categories
      const tests = [];
      for (const cat of selectedCategories) {
          const details = categoryDetails[cat];
        for (const testName of details.selectedTests) {
          tests.push({ materialTest: testName });
          }
        }

      // Build the sets array for concrete-like categories (per-set details)
      let sets = [];
      for (const cat of selectedCategories) {
        if (isConcrete(cat) && Array.isArray(concreteExtra[cat])) {
          // Each set in concreteExtra[cat] is a set for this category
          concreteExtra[cat].forEach((set, setIdx) => {
            sets.push({
              materialCategory: cat,
              setIndex: setIdx,
              class: set.class || '',
              dimensions: {
                L: set.L || '',
                W: set.W || '',
                H: set.H || '',
                t: set.t || '',
                numPerSqm: set.numPerSqm || '',
              },
              blockType: set.blockType || '',
              holes: set.holes || [],
              dateOfCast: set.dateOfCast || '',
              dateOfTest: set.dateOfTest || '',
              age: set.age || '',
              areaOfUse: set.areaOfUse || '',
              serialNumbers: set.serialNumbers || [],
            });
          });
        }
      }

      // Build the payload for /api/samples/receive
      const payload = {
        clientName: form.clientName,
        clientAddress: form.clientAddress,
        clientContact: form.clientContact,
        projectTitle: form.projectTitle,
        sampleStatus: form.sampleStatus,
        receivedDate: form.receivedDate,
        receivedBy: form.receivedBy,
        receiptTime: form.receiptTime,
        deliveredBy: form.deliveredBy,
        deliveryContact: form.deliveryContact,
        modeOfTransmit: form.modeOfTransmit,
        tests,
        // Add sets array for concrete-like categories
        sets: selectedCategories.filter(isConcrete).flatMap(cat => {
          const sets = concreteExtra[cat] || [];
          return sets.map(set => ({
            category: cat,
            class: set.class || '',
            // Dimensions logic for each material type
            L: set.L || '',
            W: set.W || '',
            H: set.H || '',
            D: set.D || '', // Diameter for cylinders
            t: set.t || '',
            numPerSqm: set.numPerSqm || '',
            blockType: set.blockType || '',
            holes: set.holes || [],
            dateOfCast: set.dateOfCast || '',
            dateOfTest: set.dateOfTest || '',
            age: set.age || '',
            areaOfUse: set.areaOfUse || '',
            serialNumbers: set.serialNumbers || [],
            assignedTests: set.assignedTests || [],
          }));
        }),
      };

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // POST to /api/samples/receive
      const response = await fetch('http://localhost:4000/api/samples/receive', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create sample');
        }

      setSuccessMsg("Sample receipt created successfully!");
      setTimeout(() => {
        setModalOpen(false);
        setPdfUrl("");
        setReviewData("");
        setSelectedCategories([]);
        setCategoryDetails({});
        setConcreteExtra({});
        setError("");
        setSuccessMsg("");
        setSubmitting(false);
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || String(err));
      setSubmitting(false);
      console.error("Finish error:", err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <button
        className="btn-primary"
        style={{
          fontSize: '2rem',
          borderRadius: '2rem',
          padding: '2rem 4rem',
          fontWeight: 700,
          margin: 'auto',
          animation: modalOpen ? undefined : 'bounce 1.2s',
        }}
        onClick={openModal}
        title="Receive Sample"
        onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        Receive Sample
      </button>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          20% { transform: translateY(-20px); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-20px); }
          80% { transform: translateY(-5px); }
        }
      `}</style>
      
      {modalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content create-invoice-modal" style={{ resize: 'both', overflow: 'hidden', minWidth: 600, minHeight: 400, maxWidth: 1600, maxHeight: '100vh', width: 900, height: 700, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div className="modal-header" style={{ flex: '0 0 auto' }}>
                  <h2>Register Sample</h2>
              <button onClick={closeModal} className="close-button">×</button>
                </div>
            <div className="modal-body" style={{ flex: '1 1 0', minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
              {(() => {
                try {
                  return (
                    <>
                      {/* Step 1: Client Details */}
                      {modalStep === 1 && (
                  <>
                    <div className="form-sections">
                      <div className="form-section">
                        <h3 className="section-title"><span className="section-icon">👤</span>Client Information</h3>
                        <div className="form-grid">
                          <div className="form-group">
                            <label className="form-label">Client Name <span className="required">*</span></label>
                            <input name="clientName" value={form.clientName} onChange={handleChange} className="form-input" required />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Client Address</label>
                            <input name="clientAddress" value={form.clientAddress} onChange={handleChange} className="form-input" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Client Contact</label>
                            <input name="clientContact" value={form.clientContact} onChange={handleChange} className="form-input" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">
                              <input type="checkbox" name="billingSame" checked={form.billingSame} onChange={handleChange} />
                              Billing same as client
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {!form.billingSame && (
                        <>
                          <div className="form-section">
                            <h3 className="section-title"><span className="section-icon">💰</span>Billing Information</h3>
                            <div className="form-grid">
                              <div className="form-group">
                                <label className="form-label">Billed Client Name</label>
                                <input name="billedClientName" value={form.billedClientName} onChange={handleChange} className="form-input" />
                              </div>
                              <div className="form-group">
                                <label className="form-label">Billed Client Address</label>
                                <input name="billedClientAddress" value={form.billedClientAddress} onChange={handleChange} className="form-input" />
                              </div>
                              <div className="form-group">
                                <label className="form-label">Billed Client Contact</label>
                                <input name="billedClientContact" value={form.billedClientContact} onChange={handleChange} className="form-input" />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      <div className="form-section">
                        <h3 className="section-title"><span className="section-icon">📋</span>Project & Sample Details</h3>
                        <div className="form-grid">
                          <div className="form-group">
                            <label className="form-label">Project Title <span className="required">*</span></label>
                            <input name="projectTitle" value={form.projectTitle} onChange={handleChange} className="form-input" required />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Status of the Sample <span className="required">*</span></label>
                            <input name="sampleStatus" value={form.sampleStatus} onChange={handleChange} className="form-input" required />
                          </div>
                        </div>
                      </div>
                      
                      <div className="form-section">
                        <h3 className="section-title"><span className="section-icon">📅</span>Receipt Information</h3>
                        <div className="form-grid">
                          <div className="form-group">
                            <label className="form-label">Date of Receipt <span className="required">*</span></label>
                            <input name="receivedDate" type="date" value={form.receivedDate} onChange={handleChange} className="form-input" required />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Time of Receipt <span className="required">*</span></label>
                            <input name="receiptTime" type="time" value={form.receiptTime} onChange={handleChange} className="form-input" required />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Received By <span className="required">*</span></label>
                            <input name="receivedBy" value={form.receivedBy} onChange={handleChange} className="form-input" required />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Delivered By</label>
                            <input name="deliveredBy" value={form.deliveredBy} onChange={handleChange} className="form-input" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Contact of Delivery Person</label>
                            <input name="deliveryContact" value={form.deliveryContact} onChange={handleChange} className="form-input" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Mode of Results Transmittal</label>
                            <select name="modeOfTransmit" value={form.modeOfTransmit} onChange={handleChange} className="form-input">
                              <option value="Email">Email</option>
                              <option value="WhatsApp">WhatsApp</option>
                              <option value="Hardcopy">Hardcopy</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                            <button type="button" className="btn-save" onClick={() => setModalStep(2)}>Next</button>
                    </div>
                  </>
                )}
                
                      {/* Step 2: Material Category Selection */}
                      {modalStep === 2 && (
                  <>
                    <div className="form-sections">
                      <div className="form-section">
                              <h3 className="section-title"><span className="section-icon">🔬</span>Select Material Categories</h3>
                              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                                {materialCategories.map(cat => (
                                  <label key={cat} className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <input
                                      type="checkbox"
                                      checked={selectedCategories.includes(cat)}
                                      onChange={e => {
                                        if (e.target.checked) {
                                          setSelectedCategories(prev => [...prev, cat]);
                                          setCategoryDetails(prev => ({
                                            ...prev,
                                            [cat]: prev[cat] || { note: '', quantity: 1, selectedTests: [], testQuantities: {} }
                                          }));
                                        } else {
                                          setSelectedCategories(prev => prev.filter(c => c !== cat));
                                          setCategoryDetails(prev => {
                                            const copy = { ...prev };
                                            delete copy[cat];
                                            return copy;
                                          });
                                        }
                                      }}
                                    />
                                    {cat}
                                  </label>
                              ))}
                            </div>
                      </div>
                    </div>
                    <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                            <button
                              type="button"
                              className="btn-save"
                              onClick={() => setModalStep(3)}
                              disabled={selectedCategories.length === 0}
                            >
                              Next
                            </button>
                    </div>
                  </>
                )}
                
                      {/* Step 3: Category Details */}
                      {modalStep === 3 && (
                  <>
                          {step3RenderError && (
                            <div style={{ color: 'red', marginBottom: 16 }}>Error in Step 3: {step3RenderError}</div>
                          )}
                    <div className="form-sections">
                            {(() => {
                              try {
                                if (!selectedCategories.length) return <div>No categories selected.</div>;
                                return selectedCategories.map(cat => {
                                  const details = categoryDetails[cat];
                                  const tests = categoryTests[cat];
                                  if (!details) return <div key={cat} style={{ color: 'red' }}>No details for {cat}.</div>;
                                  if (!tests) return <div key={cat} style={{ color: 'red' }}>No tests for {cat}.</div>;
                                  return (
                                    <div className="form-section" key={cat} style={{ marginBottom: 32, border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <h3 className="section-title">{cat}</h3>
                                        <button type="button" className="btn-secondary" onClick={() => setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }))}>{expandedCategories[cat] ? 'Collapse' : 'Expand'} Note</button>
                                      </div>
                                      {expandedCategories[cat] && (
                                        <textarea
                                          className="form-input"
                                          placeholder="Optional notes for this material category"
                                          value={details.note}
                                          onChange={e => setCategoryDetails(prev => ({ ...prev, [cat]: { ...details, note: e.target.value } }))}
                                          style={{ width: '100%', minHeight: 60, marginBottom: 12 }}
                                        />
                                      )}
                                      <div className="form-group" style={{ marginTop: 12 }}>
                                        <label className="form-label">Unit Quantity</label>
                                        <input
                                          type="text"
                                          inputMode="numeric"
                                          pattern="[0-9]*"
                                          value={details.quantity || ''}
                                          onChange={e => {
                                            const qty = Math.max(1, Number(e.target.value));
                                            setCategoryDetails(prev => ({ ...prev, [cat]: { ...details, quantity: qty } }));
                                          }}
                                          className="form-input"
                                          style={{ width: 120 }}
                                        />
                                      </div>
                                      <div className="form-group" style={{ marginTop: 12 }}>
                                        <button type="button" className="btn-secondary" onClick={() => setTestsExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }))}>
                                          {testsExpandedCategories[cat] ? 'Hide' : 'Show'} Material Tests
                                        </button>
                                        {testsExpandedCategories[cat] && (
                                          <div style={{ marginTop: 12, border: '1px solid #e7e7eb', borderRadius: 8, padding: 12 }}>
                                            {tests.map(test => (
                                              <div key={test.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                                <input
                                                  type="checkbox"
                                                  checked={details.selectedTests.includes(test.name)}
                                                  onChange={e => {
                                                    let newSelected = details.selectedTests;
                                                    let newTestQuantities = { ...details.testQuantities };
                                                    if (e.target.checked) {
                                                      newSelected = [...newSelected, test.name];
                                                      newTestQuantities[test.name] = details.quantity;
                                                    } else {
                                                      newSelected = newSelected.filter(t => t !== test.name);
                                                      delete newTestQuantities[test.name];
                                                    }
                                                    setCategoryDetails(prev => ({ ...prev, [cat]: { ...details, selectedTests: newSelected, testQuantities: newTestQuantities } }));
                                                  }}
                                                  style={{ marginRight: 8 }}
                                                />
                                                {test.name}
                                                {details.selectedTests.includes(test.name) && (
                                                  <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={details.testQuantities[test.name] || details.quantity || ''}
                                                    onChange={e => {
                                                      const val = Math.max(1, Number(e.target.value));
                                                      setCategoryDetails(prev => ({
                                                        ...prev,
                                                        [cat]: {
                                                          ...details,
                                                          testQuantities: { ...details.testQuantities, [test.name]: val }
                                                        }
                                                      }));
                                                    }}
                                                    className="form-input"
                                                    style={{ width: 80, marginLeft: 12 }}
                                                  />
                                  )}
                                              </div>
                              ))}
                          </div>
                                        )}
                        </div>
                      </div>
                                  );
                                });
                              } catch (err: any) {
                                setStep3RenderError(err.message || String(err));
                                return <div style={{ color: 'red' }}>Error rendering Step 3: {err.message || String(err)}</div>;
                              }
                            })()}
                    </div>
                    <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => setModalStep(2)}>Back</button>
                            <button
                              type="button"
                              className="btn-save"
                              onClick={() => {
                                if (needsConcreteStep) {
                                  setModalStep(4);
                                } else {
                                  setModalStep(5);
                                }
                              }}
                              disabled={selectedCategories.length === 0}
                            >
                              Next
                        </button>
                    </div>
                  </>
                )}

                      {/* Step 4: Concrete Extra Step */}
                      {modalStep === 4 && needsConcreteStep && selectedCategories.some(isConcrete) && (
                  <>
                    <div className="form-sections">
                            {selectedCategories.filter(isConcrete).map(cat => {
                              const details = categoryDetails[cat] || { note: '', quantity: 1, selectedTests: [], testQuantities: {} };
                              const totalQty = details.quantity;
                              // Default to 1 set if not set
                              let sets: SetDetails[] = concreteExtra[cat] || [
                                { dateOfCast: '', dateOfTest: form.receivedDate || '', age: '', areaOfUse: '', serialNumbers: Array.from({ length: totalQty }, (_, i) => (i + 1).toString()), assignedTests: [] }
                              ];
                              let numSets = sets.length;
                              // Distribution state: array of unit counts per set (editable)
                              let distribution = sets.map(s => s.serialNumbers.length);
                              // Handler for changing number of sets
                              const handleNumSetsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                let newNumSets = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 1;
                                newNumSets = Math.max(1, newNumSets);
                                // Distribute totalQty as evenly as possible
                                const base = Math.floor(totalQty / newNumSets);
                                const remainder = totalQty % newNumSets;
                                const newDistribution = Array.from({ length: newNumSets }, (_, i) => base + (i < remainder ? 1 : 0));
                                const newSets: SetDetails[] = Array.from({ length: newNumSets }, (_, i) => {
                                  const prev = sets[i] || {};
                                  const serialCount = newDistribution[i];
                                  return {
                                    dateOfCast: prev.dateOfCast || '',
                                    dateOfTest: prev.dateOfTest || form.receivedDate || '',
                                    age: prev.age || '',
                                    areaOfUse: prev.areaOfUse || '',
                                    serialNumbers: Array.from({ length: serialCount }, (_, j) => prev.serialNumbers && prev.serialNumbers[j] ? prev.serialNumbers[j] : (j + 1).toString()),
                                    assignedTests: prev.assignedTests || [],
                                  };
                                });
                                setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                              };
                              // Handler for changing distribution (fully editable)
                              const handleDistributionChange = (idx: number, value: string) => {
                                let val = parseInt(value.replace(/[^0-9]/g, '')) || 1;
                                val = Math.max(1, val);
                                const newSets: SetDetails[] = sets.map((s, i) =>
                                  i === idx
                                    ? { ...s, serialNumbers: Array.from({ length: val }, (_, j) => s.serialNumbers && s.serialNumbers[j] ? s.serialNumbers[j] : (j + 1).toString()) }
                                    : s
                                );
                                // Update the distribution in state
                                setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                              };
                              // Validation: sum of distribution must match totalQty
                              const sumValid = sets.map(s => s.serialNumbers.length).reduce((a, b) => a + b, 0) === totalQty;
                              return (
                                <div className="form-section" key={cat} style={{ marginBottom: 32, border: '1px solid #e7e7eb', borderRadius: 8, padding: 16 }}>
                                  <h3 className="section-title">{cat} - Concrete Details</h3>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div className="form-group">
                                      <label className="form-label">Number of Sets</label>
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={numSets}
                                        onChange={handleNumSetsChange}
                                        className="form-input"
                                        style={{ width: 120 }}
                                      />
                          </div>
                          <div className="form-group">
                                      <label className="form-label">Sets Distribution</label>
                                      <div style={{ display: 'flex', gap: 8 }}>
                                        {sets.map((set, idx) => (
                                          <input
                                            key={idx}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={set.serialNumbers.length}
                                            onChange={e => handleDistributionChange(idx, e.target.value)}
                                            className="form-input"
                                            style={{ width: 60 }}
                                          />
                                        ))}
                          </div>
                                      {!sumValid && <div style={{ color: '#dc2626', marginTop: 4 }}>Sum must equal {totalQty}</div>}
                                    </div>
                                  </div>
                                  {sets.map((set, idx) => {
                                    // Compute age if both dates are present
                                    let computedAge = '';
                                    if (set.dateOfCast && set.dateOfTest) {
                                      const cast = new Date(set.dateOfCast);
                                      const test = new Date(set.dateOfTest);
                                      computedAge = String(Math.max(0, Math.round((test.getTime() - cast.getTime()) / (1000 * 60 * 60 * 24))));
                                    }
                                    return (
                                      <div key={idx} style={{ border: '1px solid #e7e7eb', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <div className="form-group">
                                            <label className="form-label">Date of Cast</label>
                                            <input
                                              type="date"
                                              value={set.dateOfCast || ''}
                                              onChange={e => {
                                                const newSets = sets.map((s, i) => i === idx ? { ...s, dateOfCast: e.target.value } : s);
                                                setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                              }}
                                              className="form-input"
                                            />
                          </div>
                          <div className="form-group">
                                            <label className="form-label">Date of Test</label>
                                            <input
                                              type="date"
                                              value={set.dateOfTest || ''}
                                              onChange={e => {
                                                const newDate = e.target.value;
                                                // Update age as well
                                                let newAge = '';
                                                if (set.dateOfCast && newDate) {
                                                  const cast = new Date(set.dateOfCast);
                                                  const test = new Date(newDate);
                                                  newAge = String(Math.max(0, Math.round((test.getTime() - cast.getTime()) / (1000 * 60 * 60 * 24))));
                                                }
                                                const newSets = sets.map((s, i) => i === idx ? { ...s, dateOfTest: newDate, age: newAge } : s);
                                                setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                              }}
                                              className="form-input"
                                            />
                          </div>
                          <div className="form-group">
                                            <label className="form-label">Age (days)</label>
                                            <input
                                              type="text"
                                              inputMode="numeric"
                                              pattern="[0-9]*"
                                              value={set.age || computedAge}
                                              onChange={e => {
                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                // If user edits age, update dateOfTest accordingly
                                                let newDateOfTest = set.dateOfTest;
                                                if (set.dateOfCast && val) {
                                                  const cast = new Date(set.dateOfCast);
                                                  cast.setDate(cast.getDate() + Number(val));
                                                  newDateOfTest = cast.toISOString().split('T')[0];
                                                }
                                                const newSets = sets.map((s, i) => i === idx ? { ...s, age: val, dateOfTest: newDateOfTest } : s);
                                                setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                              }}
                                              className="form-input"
                                            />
                          </div>
                                                    <div className="form-group">
                            <label className="form-label">Class</label>
                            <input
                              type="text"
                              value={set.class || ''}
                              onChange={e => {
                                const newSets = sets.map((s, i) => i === idx ? { ...s, class: e.target.value } : s);
                                setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                              }}
                              className="form-input"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Area of Use</label>
                            <input
                              type="text"
                              value={set.areaOfUse}
                              onChange={e => {
                                const newSets = sets.map((s, i) => i === idx ? { ...s, areaOfUse: e.target.value } : s);
                                setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                              }}
                              className="form-input"
                            />
                          </div>
                          </div>
                                        {/* Dimensions Section */}
                                        <div className="form-group" style={{ marginTop: 16 }}>
                                          <label className="form-label">Dimensions</label>
                                          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                            {/* Cubes/Bricks: L × W × H */}
                                            {(cat === 'CONCRETE' || cat === 'BRICKS') && (
                                              <>
                                                <div className="form-group">
                                                  <label className="form-label">Length (L)</label>
                                                  <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={set.L || ''}
                                                    onChange={e => {
                                                      const newSets = sets.map((s, i) => i === idx ? { ...s, L: e.target.value } : s);
                                                      setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                    }}
                                                    className="form-input"
                                                    style={{ width: 80 }}
                                                    placeholder="mm"
                                                  />
                                                </div>
                                                <div className="form-group">
                                                  <label className="form-label">Width (W)</label>
                                                  <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={set.W || ''}
                                                    onChange={e => {
                                                      const newSets = sets.map((s, i) => i === idx ? { ...s, W: e.target.value } : s);
                                                      setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                    }}
                                                    className="form-input"
                                                    style={{ width: 80 }}
                                                    placeholder="mm"
                                                  />
                                                </div>
                                                <div className="form-group">
                                                  <label className="form-label">Height (H)</label>
                                                  <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={set.H || ''}
                                                    onChange={e => {
                                                      const newSets = sets.map((s, i) => i === idx ? { ...s, H: e.target.value } : s);
                                                      setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                    }}
                                                    className="form-input"
                                                    style={{ width: 80 }}
                                                    placeholder="mm"
                                                  />
                                                </div>
                                              </>
                                            )}
                                            
                                            {/* Cylinders: Height & Diameter */}
                                            {cat === 'CYLINDERS' && (
                                              <>
                                                <div className="form-group">
                                                  <label className="form-label">Height (H)</label>
                                                  <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={set.H || ''}
                                                    onChange={e => {
                                                      const newSets = sets.map((s, i) => i === idx ? { ...s, H: e.target.value } : s);
                                                      setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                    }}
                                                    className="form-input"
                                                    style={{ width: 80 }}
                                                    placeholder="mm"
                                                  />
                                                </div>
                                                <div className="form-group">
                                                  <label className="form-label">Diameter (D)</label>
                                                  <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={set.D || ''}
                                                    onChange={e => {
                                                      const newSets = sets.map((s, i) => i === idx ? { ...s, D: e.target.value } : s);
                                                      setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                    }}
                                                    className="form-input"
                                                    style={{ width: 80 }}
                                                    placeholder="mm"
                                                  />
                                                </div>
                                              </>
                                            )}
                                            
                                            {/* Pavers: Thickness (t) & Number /m² */}
                                            {cat === 'PAVERS' && (
                                              <>
                                                <div className="form-group">
                                                  <label className="form-label">Thickness (t)</label>
                                                  <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={set.t || ''}
                                                    onChange={e => {
                                                      const newSets = sets.map((s, i) => i === idx ? { ...s, t: e.target.value } : s);
                                                      setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                    }}
                                                    className="form-input"
                                                    style={{ width: 80 }}
                                                    placeholder="mm"
                                                  />
                                                </div>
                                                <div className="form-group">
                                                  <label className="form-label">Number /m²</label>
                                                  <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={set.numPerSqm || ''}
                                                    onChange={e => {
                                                      const newSets = sets.map((s, i) => i === idx ? { ...s, numPerSqm: e.target.value } : s);
                                                      setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                    }}
                                                    className="form-input"
                                                    style={{ width: 80 }}
                                                    placeholder="units"
                                                  />
                                                </div>
                                              </>
                                            )}
                                            
                                            {/* Blocks: Solid or Hollow */}
                                            {cat === 'BLOCKS' && (
                                              <>
                                                <div className="form-group">
                                                  <label className="form-label">Block Type</label>
                                                  <select
                                                    value={set.blockType || 'solid'}
                                                    onChange={e => {
                                                      const newSets = sets.map((s, i) => i === idx ? { 
                                                        ...s, 
                                                        blockType: e.target.value as 'solid' | 'hollow',
                                                        holes: e.target.value === 'hollow' ? [{ no: '', aL: '', aW: '', bNo: '', bL: '', bW: '', nNo: '', nL: '', nW: '' }] : []
                                                      } : s);
                                                      setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                    }}
                                                    className="form-input"
                                                    style={{ width: 120 }}
                                                  >
                                                    <option value="solid">Solid</option>
                                                    <option value="hollow">Hollow</option>
                                                  </select>
                                                </div>
                                                <div className="form-group">
                                                  <label className="form-label">Length (L)</label>
                                                  <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={set.L || ''}
                                                    onChange={e => {
                                                      const newSets = sets.map((s, i) => i === idx ? { ...s, L: e.target.value } : s);
                                                      setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                    }}
                                                    className="form-input"
                                                    style={{ width: 80 }}
                                                    placeholder="mm"
                                                  />
                                                </div>
                                                <div className="form-group">
                                                  <label className="form-label">Width (W)</label>
                                                  <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={set.W || ''}
                                                    onChange={e => {
                                                      const newSets = sets.map((s, i) => i === idx ? { ...s, W: e.target.value } : s);
                                                      setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                    }}
                                                    className="form-input"
                                                    style={{ width: 80 }}
                                                    placeholder="mm"
                                                  />
                                                </div>
                                                <div className="form-group">
                                                  <label className="form-label">Height (H)</label>
                                                  <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={set.H || ''}
                                                    onChange={e => {
                                                      const newSets = sets.map((s, i) => i === idx ? { ...s, H: e.target.value } : s);
                                                      setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                    }}
                                                    className="form-input"
                                                    style={{ width: 80 }}
                                                    placeholder="mm"
                                                  />
                                                </div>
                                              </>
                                            )}
                                          </div>
                                          
                                          {/* Hollow Block Holes/Notches */}
                                          {cat === 'BLOCKS' && set.blockType === 'hollow' && (
                                            <div style={{ marginTop: 12 }}>
                                              <label className="form-label">Holes & Notches</label>
                                              <div style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: 8 }}>
                                                {(set.holes || []).map((hole: any, holeIdx: number) => (
                                                  <div key={holeIdx} style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                                                    <input
                                                      type="text"
                                                      placeholder="No."
                                                      value={hole.no || ''}
                                                      onChange={e => {
                                                        const newHoles = [...(set.holes || [])];
                                                        newHoles[holeIdx] = { ...newHoles[holeIdx], no: e.target.value };
                                                        const newSets = sets.map((s, i) => i === idx ? { ...s, holes: newHoles } : s);
                                                        setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                      }}
                                                      className="form-input"
                                                      style={{ width: 60 }}
                                                    />
                                                    <input
                                                      type="text"
                                                      placeholder="Hole a L"
                                                      value={hole.aL || ''}
                                                      onChange={e => {
                                                        const newHoles = [...(set.holes || [])];
                                                        newHoles[holeIdx] = { ...newHoles[holeIdx], aL: e.target.value };
                                                        const newSets = sets.map((s, i) => i === idx ? { ...s, holes: newHoles } : s);
                                                        setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                      }}
                                                      className="form-input"
                                                      style={{ width: 80 }}
                                                    />
                                                    <input
                                                      type="text"
                                                      placeholder="Hole a W"
                                                      value={hole.aW || ''}
                                                      onChange={e => {
                                                        const newHoles = [...(set.holes || [])];
                                                        newHoles[holeIdx] = { ...newHoles[holeIdx], aW: e.target.value };
                                                        const newSets = sets.map((s, i) => i === idx ? { ...s, holes: newHoles } : s);
                                                        setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                      }}
                                                      className="form-input"
                                                      style={{ width: 80 }}
                                                    />
                                                    <input
                                                      type="text"
                                                      placeholder="Hole b L"
                                                      value={hole.bL || ''}
                                                      onChange={e => {
                                                        const newHoles = [...(set.holes || [])];
                                                        newHoles[holeIdx] = { ...newHoles[holeIdx], bL: e.target.value };
                                                        const newSets = sets.map((s, i) => i === idx ? { ...s, holes: newHoles } : s);
                                                        setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                      }}
                                                      className="form-input"
                                                      style={{ width: 80 }}
                                                    />
                                                    <input
                                                      type="text"
                                                      placeholder="Hole b W"
                                                      value={hole.bW || ''}
                                                      onChange={e => {
                                                        const newHoles = [...(set.holes || [])];
                                                        newHoles[holeIdx] = { ...newHoles[holeIdx], bW: e.target.value };
                                                        const newSets = sets.map((s, i) => i === idx ? { ...s, holes: newHoles } : s);
                                                        setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                      }}
                                                      className="form-input"
                                                      style={{ width: 80 }}
                                                    />
                                                    <input
                                                      type="text"
                                                      placeholder="Notch No."
                                                      value={hole.nNo || ''}
                                                      onChange={e => {
                                                        const newHoles = [...(set.holes || [])];
                                                        newHoles[holeIdx] = { ...newHoles[holeIdx], nNo: e.target.value };
                                                        const newSets = sets.map((s, i) => i === idx ? { ...s, holes: newHoles } : s);
                                                        setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                      }}
                                                      className="form-input"
                                                      style={{ width: 80 }}
                                                    />
                                                    <input
                                                      type="text"
                                                      placeholder="Notch L"
                                                      value={hole.nL || ''}
                                                      onChange={e => {
                                                        const newHoles = [...(set.holes || [])];
                                                        newHoles[holeIdx] = { ...newHoles[holeIdx], nL: e.target.value };
                                                        const newSets = sets.map((s, i) => i === idx ? { ...s, holes: newHoles } : s);
                                                        setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                      }}
                                                      className="form-input"
                                                      style={{ width: 80 }}
                                                    />
                                                    <input
                                                      type="text"
                                                      placeholder="Notch W"
                                                      value={hole.nW || ''}
                                                      onChange={e => {
                                                        const newHoles = [...(set.holes || [])];
                                                        newHoles[holeIdx] = { ...newHoles[holeIdx], nW: e.target.value };
                                                        const newSets = sets.map((s, i) => i === idx ? { ...s, holes: newHoles } : s);
                                                        setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                      }}
                                                      className="form-input"
                                                      style={{ width: 80 }}
                                                    />
                                                    <input
                                                      type="text"
                                                      placeholder="Hole b No."
                                                      value={hole.bNo || ''}
                                                      onChange={e => {
                                                        const newHoles = [...(set.holes || [])];
                                                        newHoles[holeIdx] = { ...newHoles[holeIdx], bNo: e.target.value };
                                                        const newSets = sets.map((s, i) => i === idx ? { ...s, holes: newHoles } : s);
                                                        setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                      }}
                                                      className="form-input"
                                                      style={{ width: 80 }}
                                                    />
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const newHoles = (set.holes || []).filter((_: any, i: number) => i !== holeIdx);
                                                        const newSets = sets.map((s, i) => i === idx ? { ...s, holes: newHoles } : s);
                                                        setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                      }}
                                                      style={{ 
                                                        background: '#dc2626', 
                                                        color: 'white', 
                                                        border: 'none', 
                                                        borderRadius: 4, 
                                                        padding: '4px 8px',
                                                        cursor: 'pointer'
                                                      }}
                                                    >
                                                      ×
                                                    </button>
                                                  </div>
                                                ))}
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const newHoles = [...(set.holes || []), { no: '', aL: '', aW: '', bNo: '', bL: '', bW: '', nNo: '', nL: '', nW: '' }];
                                                    const newSets = sets.map((s, i) => i === idx ? { ...s, holes: newHoles } : s);
                                                    setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                  }}
                                                  style={{ 
                                                    background: '#2563eb', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    borderRadius: 4, 
                                                    padding: '4px 8px',
                                                    cursor: 'pointer'
                                                  }}
                                                >
                                                  + Add Hole/Notch
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <div className="form-group" style={{ marginTop: 8 }}>
                                          <label className="form-label">Serial Numbers</label>
                                          <div style={{ display: 'flex', gap: 8 }}>
                                            {set.serialNumbers && set.serialNumbers.map((sn, snIdx) => (
                                              <input
                                                key={snIdx}
                                                type="text"
                                                value={sn}
                                                onChange={e => {
                                                  const newSerials = set.serialNumbers.map((s, i) => i === snIdx ? e.target.value : s);
                                                  const newSets = sets.map((s, i) => i === idx ? { ...s, serialNumbers: newSerials } : s);
                                                  setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                }}
                                                className="form-input"
                                                style={{ width: 60 }}
                                              />
                                            ))}
                          </div>
                        </div>
                                        
                                        {/* Test Assignment Section - Only show when Water Absorption + other tests are selected */}
                                        {(() => {
                                          const hasWaterAbsorption = details.selectedTests.some((test: string) => 
                                            test.toLowerCase().includes('water absorption')
                                          );
                                          const hasOtherTests = details.selectedTests.some((test: string) => 
                                            !test.toLowerCase().includes('water absorption')
                                          );
                                          const needsAssignment = hasWaterAbsorption && hasOtherTests;
                                          
                                          if (!needsAssignment) return null;
                                          
                                          return (
                                            <div className="form-group" style={{ marginTop: 16 }}>
                                              <label className="form-label">Test Assignment for This Set</label>
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                  <input
                                                    type="checkbox"
                                                    checked={set.assignedTests?.some(test => test.toLowerCase().includes('water absorption')) || false}
                                                    onChange={e => {
                                                      const waterAbsorptionTest = details.selectedTests.find(test => 
                                                        test.toLowerCase().includes('water absorption')
                                                      );
                                                      const currentAssigned = set.assignedTests || [];
                                                      let newAssigned;
                                                      
                                                      if (e.target.checked) {
                                                        // Assign to Water Absorption
                                                        newAssigned = waterAbsorptionTest ? [waterAbsorptionTest] : [];
                                                      } else {
                                                        // Assign to default log (no water absorption tests)
                                                        newAssigned = currentAssigned.filter(test => 
                                                          !test.toLowerCase().includes('water absorption')
                                                        );
                                                      }
                                                      
                                                      const newSets = sets.map((s, i) => i === idx ? { ...s, assignedTests: newAssigned } : s);
                                                      setConcreteExtra(prev => ({ ...prev, [cat]: newSets }));
                                                    }}
                                                    style={{ margin: 0 }}
                                                  />
                                                  <span>Water Absorption Test</span>
                                                </label>
                                                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                                  ☐ = Default log ({cat.toLowerCase()} log)
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })()}
                                        {/* Validation messages */}
                                        {set.dateOfCast && set.dateOfTest && new Date(set.dateOfCast) >= new Date(form.receivedDate) && (
                                          <div style={{ color: '#dc2626', marginTop: 4 }}>Date of cast must be before date of receipt.</div>
                                        )}
                                        {set.dateOfCast && set.dateOfTest && new Date(set.dateOfTest) < new Date(set.dateOfCast) && (
                                          <div style={{ color: '#dc2626', marginTop: 4 }}>Date of test must be after or equal to date of cast.</div>
                                        )}
                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                    </div>
                    <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => setModalStep(3)}>Back</button>
                            <button
                              type="button"
                              className="btn-save"
                              onClick={() => setModalStep(5)}
                              disabled={!selectedCategories.filter(isConcrete).every(cat => {
                                const sets = concreteExtra[cat] || [];
                                return sets.length > 0 && sets.every(set => {
                                  if (!set.dateOfCast || !set.dateOfTest || !set.areaOfUse) return false;
                                  const cast = new Date(set.dateOfCast);
                                  const test = new Date(set.dateOfTest);
                                  const receipt = new Date(form.receivedDate);
                                  if (isNaN(cast.getTime()) || isNaN(test.getTime()) || isNaN(receipt.getTime())) return false;
                                  if (cast >= receipt) return false;
                                  if (test < cast) return false;
                                  if (!set.serialNumbers || set.serialNumbers.length === 0) return false;
                                  return true;
                                });
                              })}
                            >
                              Next
                      </button>
                    </div>
                  </>
                )}
                      
                      {/* Step 4: Concrete Extra Step (fallback) */}
                      {modalStep === 4 && needsConcreteStep && !selectedCategories.some(isConcrete) && (
                        <div style={{ padding: 32, textAlign: 'center' }}>No concrete categories selected. Skipping to review...</div>
                      )}
                      
                      {/* Step 5: Review & PDF Preview */}
                      {modalStep === 5 && (
                        <>
                          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Serial: {getSerialNumber()}</div>
                          <div className="form-sections">
                            <div className="form-section">
                              <h3 className="section-title">Review Sample Receipt</h3>
                              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
                                <thead>
                                  <tr style={{ background: '#f3f4f6' }}>
                                    <th style={{ border: '1px solid #e5e7eb', padding: 8 }}>Date of Receipt</th>
                                    <th style={{ border: '1px solid #e5e7eb', padding: 8 }}>Material Category (Units)</th>
                                    <th style={{ border: '1px solid #e5e7eb', padding: 8 }}>Material Tests (Units)</th>
                                    <th style={{ border: '1px solid #e5e7eb', padding: 8 }}>Test Method(s)</th>
                                    <th style={{ border: '1px solid #e5e7eb', padding: 8 }}>Concrete Details</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedCategories.map(cat => {
                                    const details = categoryDetails[cat];
                                    const tests = (categoryTests[cat] || []).filter(t => details.selectedTests.includes(t.name));
                                    const isConc = isConcrete(cat);
                                    const extra = concreteExtra[cat];
                                    return (
                                      <tr key={cat}>
                                        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{form.receivedDate}</td>
                                        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{cat} ({details.quantity})</td>
                                        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>
                                          {details.selectedTests.map(test => (
                                            <div key={test}>{test} ({details.testQuantities[test]})</div>
                                          ))}
                                        </td>
                                        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>
                                          {tests.map(t => (
                                            <div key={t.id}>{t.method || '-'}</div>
                                          ))}
                                        </td>
                                        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>
                                          {isConc && Array.isArray(extra) && (
                                            <div>
                                              {extra.map((set, i) => (
                                                <div key={i} style={{ marginBottom: 8 }}>
                                                  <div><strong>Set {i + 1}:</strong></div>
                                                  <div>Class: {set.class || '-'}</div>
                                                  {/* Dimensions display logic */}
                                                  {(() => {
                                                    if (set.L && set.W && set.H) {
                                                      return <div>Dimensions: {set.L} × {set.W} × {set.H} mm</div>;
                                                    } else if (set.H && set.D) {
                                                      return <div>Dimensions: Height {set.H} mm, Diameter {set.D} mm</div>;
                                                    } else if (set.t || set.numPerSqm) {
                                                      return <div>Thickness: {set.t || '-'} mm, Number/m²: {set.numPerSqm || '-'}</div>;
                                                    } else if (set.blockType) {
                                                      return <div>Block Type: {set.blockType.charAt(0).toUpperCase() + set.blockType.slice(1)}</div>;
                                                    }
                                                    return null;
                                                  })()}
                                                  {/* Hollow block holes display */}
                                                  {set.blockType === 'hollow' && Array.isArray(set.holes) && set.holes.length > 0 && (
                                                    <div style={{ marginTop: 4 }}>
                                                      <strong>Holes/Notches:</strong>
                                                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                                        <thead>
                                                          <tr style={{ background: '#f3f4f6' }}>
                                                            <th>No.</th>
                                                            <th>Hole a L</th>
                                                            <th>Hole a W</th>
                                                            <th>Hole b No.</th>
                                                            <th>Hole b L</th>
                                                            <th>Hole b W</th>
                                                            <th>Notch No.</th>
                                                            <th>Notch L</th>
                                                            <th>Notch W</th>
                                                          </tr>
                                                        </thead>
                                                        <tbody>
                                                          {set.holes.map((hole, hIdx) => (
                                                            <tr key={hIdx}>
                                                              <td>{hole.no}</td>
                                                              <td>{hole.aL}</td>
                                                              <td>{hole.aW}</td>
                                                              <td>{hole.bNo}</td>
                                                              <td>{hole.bL}</td>
                                                              <td>{hole.bW}</td>
                                                              <td>{hole.nNo}</td>
                                                              <td>{hole.nL}</td>
                                                              <td>{hole.nW}</td>
                                                            </tr>
                                                          ))}
                                                        </tbody>
                                                      </table>
                                                    </div>
                                                  )}
                                                  <div>Casting: {set.dateOfCast}</div>
                                                  <div>Testing: {set.dateOfTest}</div>
                                                  <div>Age: {set.age}</div>
                                                  <div>Area of Use: {set.areaOfUse}</div>
                                                  <div>Serials: {set.serialNumbers && set.serialNumbers.join(', ')}</div>
                                                </div>
                                              ))}
        </div>
      )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                              <div style={{ marginBottom: 16 }}>
                                <strong>Notes:</strong>
                                <ul>
                                  {selectedCategories.map(cat => {
                                    const note = categoryDetails[cat]?.note;
                                    return note ? <li key={cat}><strong>{cat}:</strong> {note}</li> : null;
                                  })}
                                </ul>
                              </div>
                              <div style={{ marginBottom: 16 }}>
                                <strong>Delivered From:</strong> {form.clientName} <br />
                                <strong>Time:</strong> {form.receiptTime} <br />
                                <strong>Date:</strong> {form.receivedDate} <br />
                                <strong>Delivered By:</strong> {form.deliveredBy}
                              </div>
                              <button className="btn-primary" type="button" onClick={handleGeneratePdf} style={{ marginBottom: 16 }}>Preview PDF</button>
                              {pdfUrl && (
                                <>
                                  <iframe src={pdfUrl} style={{ width: '100%', height: 500, border: '1px solid #e5e7eb', marginBottom: 12 }} title="Sample Receipt PDF" />
                                  <div style={{ display: 'flex', gap: 12 }}>
                                    <a href={pdfUrl} download="sample-receipt.pdf" className="btn-primary">Download PDF</a>
                                    <button className="btn-secondary" type="button" onClick={() => { const win = window.open(pdfUrl, '_blank'); if (win) win.print(); }}>Print</button>
                                  </div>
                                </>
                              )}
                              {pdfError && (
                                <div style={{ color: 'red', marginBottom: 12 }}>PDF Error: {pdfError}</div>
                              )}
                            </div>
                          </div>
                          <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => setModalStep(needsConcreteStep ? 4 : 3)}>Back</button>
                            <button type="button" className="btn-save" onClick={handleFinish} disabled={submitting}>Finish</button>
                          </div>
                          {submitError && (
                            <div style={{ color: 'red', marginBottom: 12 }}>Submit Error: {submitError}</div>
                          )}
                        </>
                      )}
                      {(modalStep < 1 || modalStep > 5) && (
                        <div style={{ padding: 32, textAlign: 'center' }}>Something went wrong. Please close and try again.</div>
                      )}
                    </>
                  );
                } catch (err: any) {
                  return <div style={{ color: 'red', marginBottom: 16 }}>Global Modal Error: {err.message || String(err)}</div>;
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterSample;