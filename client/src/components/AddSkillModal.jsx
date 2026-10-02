import React, { useState } from 'react';
import { PlusCircle, X, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { addManualSkill } from '../services/api.js';

const COMMON_CATEGORIES = [
  'Programming Languages',
  'Frontend',
  'Backend',
  'Databases',
  'Cloud',
  'DevOps',
  'Data',
  'AI / ML',
  'Tools',
  'Other'
];

export default function AddSkillModal({ isOpen, onClose, sessionId, onSkillAdded }) {
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState('Data');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanSkill = skillName.trim();
    if (!cleanSkill) {
      setError('Please enter a valid skill name.');
      return;
    }

    if (!sessionId) {
      setError('Active candidate session not found. Please verify candidate identity first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addManualSkill({
        sessionId,
        skill: cleanSkill,
        category
      });

      if (onSkillAdded) {
        onSkillAdded(result);
      }

      setSkillName('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add skill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog add-skill-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <PlusCircle size={20} color="var(--accent-secondary)" />
            <h3>Add Claimed Skill</h3>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="modal-description">
          Add an additional technical skill to your candidate profile. The newly added skill will be tracked as 
          <strong> &quot;Added by Candidate&quot;</strong> and can be substantiated with observable evidence without re-uploading your resume.
        </p>

        {error && (
          <div className="modal-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="skill-name-input">Skill Name *</label>
            <input
              id="skill-name-input"
              type="text"
              className="modal-input"
              placeholder="e.g. Power BI, Java, Tableau, Docker, AWS"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category-select">Technical Category</label>
            <select
              id="category-select"
              className="modal-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
            >
              {COMMON_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-modal-primary"
              disabled={isSubmitting || !skillName.trim()}
            >
              {isSubmitting ? (
                <span>Adding Skill...</span>
              ) : (
                <>
                  <PlusCircle size={16} />
                  <span>Add to Claimed Skills</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
