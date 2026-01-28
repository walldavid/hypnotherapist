import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EditableContent from '../components/EditableContent';
import './HypnosisHelp.css';

function HypnosisHelp() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    try {
      const response = await api.get('/pages/how-can-hypnosis-help');
      setPage(response.data);
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (updatedPage) => {
    setPage(updatedPage);
  };

  if (loading) {
    return (
      <div className="hypnosis-help-page">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="hypnosis-help-page">
        <div className="container">
          <div className="error-state">
            <h2>Page Not Found</h2>
            <p>The page you're looking for doesn't exist yet.</p>
            <Link to="/" className="btn btn-primary">Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hypnosis-help-page">
      <div className="page-header">
        <div className="container">
          <h1>{page.title}</h1>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          {page.sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <EditableContent
                key={section.id}
                pageSlug="how-can-hypnosis-help"
                section={section}
                onUpdate={handleUpdate}
              />
            ))}

          <div className="cta-section">
            <h2>Ready to Experience the Benefits?</h2>
            <p>Browse our collection of professional hypnotherapy programs and start your journey today.</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              View Programs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HypnosisHelp;
