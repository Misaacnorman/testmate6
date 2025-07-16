import { useState, useEffect } from 'react';
import './Support.css';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: 'general' | 'samples' | 'tests' | 'reports' | 'technical';
}

interface ContactMethod {
  type: 'phone' | 'email' | 'chat' | 'ticket';
  label: string;
  value: string;
  icon: string;
  description: string;
  available: boolean;
}

type TicketCategory = 'general' | 'samples' | 'tests' | 'reports' | 'technical';

const Support = () => {
  const [activeTab, setActiveTab] = useState('help');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: 1,
      question: 'How do I register a new sample?',
      answer: 'Go to the Register Sample section and fill in the client information, project details, and select the tests to be performed.',
      category: 'samples' as TicketCategory
    },
    {
      id: 2,
      question: 'How do I add a new material test?',
      answer: 'Go to Material Tests section and click the "Add Test" button. Fill in the required fields and save.',
      category: 'tests' as TicketCategory
    },
    {
      id: 3,
      question: 'How do I generate reports?',
      answer: 'Navigate to the Reports section and select the type of report you want to generate.',
      category: 'reports' as TicketCategory
    },
    {
      id: 4,
      question: 'How do I manage inventory?',
      answer: 'Use the Inventory section to add, edit, or remove inventory items.',
      category: 'general' as TicketCategory
    },
    {
      id: 5,
      question: 'How do I reset my password?',
      answer: 'Contact your system administrator to reset your password.',
      category: 'technical' as TicketCategory
    }
  ]);
  const [contactMethods, setContactMethods] = useState<ContactMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupportData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with real API calls when backend endpoints are ready
        // const faqsData = await fetch('/api/support/faqs');
        // const contactData = await fetch('/api/support/contact');
        
        // For now, keep empty states
        setFaqs([]);
        setContactMethods([]);
      } catch (error) {
        console.error('Error fetching support data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupportData();
  }, []);

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: TicketCategory) => {
    switch (category) {
      case 'general': return '📋';
      case 'samples': return '📦';
      case 'tests': return '🔬';
      case 'reports': return '📊';
      case 'technical': return '⚙️';
      default: return '❓';
    }
  };

  const getCategoryClass = (category: TicketCategory) => {
    switch (category) {
      case 'general': return 'category-general';
      case 'samples': return 'category-samples';
      case 'tests': return 'category-tests';
      case 'reports': return 'category-reports';
      case 'technical': return 'category-technical';
      default: return 'category-default';
    }
  };

  if (loading) {
    return (
      <div className="support-loading">
        <div className="loading-spinner"></div>
        <p>Loading support information...</p>
      </div>
    );
  }

  return (
    <div className="support">
      <div className="support-header">
        <h1>Support & Help Center</h1>
        <p>Get help, find answers, and contact our support team</p>
      </div>

      <div className="support-container">
        {/* Support Navigation */}
        <div className="support-nav">
          <button
            className={`nav-tab ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            ❓ Help & FAQ
          </button>
          <button
            className={`nav-tab ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            📞 Contact Support
          </button>
          <button
            className={`nav-tab ${activeTab === 'docs' ? 'active' : ''}`}
            onClick={() => setActiveTab('docs')}
          >
            📚 Documentation
          </button>
          <button
            className={`nav-tab ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            🟢 System Status
          </button>
        </div>

        {/* Support Content */}
        <div className="support-content">
          {/* Help & FAQ */}
          {activeTab === 'help' && (
            <div className="help-section">
              <div className="help-header">
                <h2>Frequently Asked Questions</h2>
                <p>Find answers to common questions about using the laboratory management system</p>
              </div>

              {/* Search and Filter */}
              <div className="search-filter-section">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search for questions or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="filter-controls">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Categories</option>
                    <option value="general">General</option>
                    <option value="samples">Samples</option>
                    <option value="tests">Tests</option>
                    <option value="reports">Reports</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
              </div>

              {/* FAQ List */}
              {filteredFAQs.length > 0 ? (
                <div className="faq-list">
                  {filteredFAQs.map(faq => (
                    <div key={faq.id} className="faq-item">
                      <div className="faq-header">
                        <span className={`faq-category ${getCategoryClass(faq.category)}`}>
                          {getCategoryIcon(faq.category)} {faq.category}
                        </span>
                        <h3 className="faq-question">{faq.question}</h3>
                      </div>
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-faqs">
                  <p>No FAQs available at the moment.</p>
                </div>
              )}
            </div>
          )}

          {/* Contact Support */}
          {activeTab === 'contact' && (
            <div className="contact-section">
              <div className="contact-header">
                <h2>Contact Support</h2>
                <p>Get in touch with our support team through various channels</p>
              </div>

              {contactMethods.length > 0 ? (
                <div className="contact-methods">
                  {contactMethods.map((method, index) => (
                    <div key={index} className="contact-method">
                      <div className="contact-icon">{method.icon}</div>
                      <div className="contact-info">
                        <h3>{method.label}</h3>
                        <p className="contact-value">{method.value}</p>
                        <p className="contact-description">{method.description}</p>
                        <span className={`contact-status ${method.available ? 'available' : 'unavailable'}`}>
                          {method.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-contact">
                  <p>Contact information not available at the moment.</p>
                </div>
              )}
            </div>
          )}

          {/* Documentation */}
          {activeTab === 'docs' && (
            <div className="docs-section">
              <div className="docs-header">
                <h2>Documentation</h2>
                <p>Access user guides, manuals, and technical documentation</p>
              </div>
              
              <div className="docs-content">
                <p>Documentation will be available here once the system is fully configured.</p>
              </div>
            </div>
          )}

          {/* System Status */}
          {activeTab === 'status' && (
            <div className="status-section">
              <div className="status-header">
                <h2>System Status</h2>
                <p>Check the current status of laboratory management system services</p>
              </div>
              
              <div className="status-content">
                <p>System status information will be displayed here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support; 