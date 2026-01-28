import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import './EditableContent.css';

function EditableContent({ pageSlug, section, onUpdate }) {
  const { isAuthenticated } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(section.content);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (content === section.content) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      const response = await api.patch(`/pages/${pageSlug}/sections/${section.id}`, {
        content
      });
      
      toast.success('Content updated successfully');
      setIsEditing(false);
      
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
      setContent(section.content); // Revert
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(section.content);
    setIsEditing(false);
  };

  const renderContent = () => {
    if (section.type === 'heading') {
      return <h2>{section.content}</h2>;
    } else if (section.type === 'paragraph') {
      return <p>{section.content}</p>;
    } else if (section.type === 'list') {
      const items = section.content.split('|');
      return (
        <ul>
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    }
    return <p>{section.content}</p>;
  };

  if (!isAuthenticated) {
    return <div className="content-section">{renderContent()}</div>;
  }

  return (
    <div className={`content-section editable ${isEditing ? 'editing' : ''}`}>
      {!isEditing ? (
        <>
          {renderContent()}
          <button 
            className="edit-btn"
            onClick={() => setIsEditing(true)}
            title="Edit this content"
          >
            ✏️ Edit
          </button>
        </>
      ) : (
        <div className="edit-form">
          {section.type === 'heading' ? (
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="edit-input heading"
              autoFocus
            />
          ) : section.type === 'list' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="edit-textarea"
              rows="10"
              placeholder="Separate items with | (pipe character)"
              autoFocus
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="edit-textarea"
              rows="6"
              autoFocus
            />
          )}
          <div className="edit-actions">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="btn-save"
            >
              {saving ? 'Saving...' : '✓ Save'}
            </button>
            <button 
              onClick={handleCancel}
              disabled={saving}
              className="btn-cancel"
            >
              ✕ Cancel
            </button>
          </div>
          {section.type === 'list' && (
            <small className="help-text">Use | to separate list items</small>
          )}
        </div>
      )}
    </div>
  );
}

export default EditableContent;
