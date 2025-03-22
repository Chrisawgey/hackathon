// src/components/UserReports/ReportForm.js
import React, { useState } from 'react';
import './ReportForm.css';

const ReportForm = ({ onSubmit, onClose, currentLocation }) => {
  const [formData, setFormData] = useState({
    type: 'sidewalk_issue',
    description: '',
    severity: 'medium',
    photo: null,
    latitude: currentLocation ? currentLocation[0] : '',
    longitude: currentLocation ? currentLocation[1] : ''
  });

  const [previewImage, setPreviewImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        photo: file
      });

      // Create preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your current location. Please enter coordinates manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here we would normally validate the form
    onSubmit(formData);
  };

  const issueTypes = [
    { value: 'sidewalk_issue', label: 'Sidewalk Issue' },
    { value: 'crosswalk_issue', label: 'Crosswalk Issue' },
    { value: 'lighting_issue', label: 'Lighting Issue' },
    { value: 'accessibility_issue', label: 'Accessibility Issue' },
    { value: 'safety_concern', label: 'Safety Concern' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="report-form-container">
      <div className="report-form-header">
        <h2>Report a Walkability Issue</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-group">
          <label htmlFor="type">Issue Type:</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            {issueTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please describe the issue in detail..."
            rows="4"
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="severity">Severity:</label>
          <div className="severity-options">
            <label className="severity-option">
              <input
                type="radio"
                name="severity"
                value="low"
                checked={formData.severity === 'low'}
                onChange={handleChange}
              />
              <span>Low</span>
            </label>
            <label className="severity-option">
              <input
                type="radio"
                name="severity"
                value="medium"
                checked={formData.severity === 'medium'}
                onChange={handleChange}
              />
              <span>Medium</span>
            </label>
            <label className="severity-option">
              <input
                type="radio"
                name="severity"
                value="high"
                checked={formData.severity === 'high'}
                onChange={handleChange}
              />
              <span>High</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="photo">Photo (Optional):</label>
          <input
            type="file"
            id="photo"
            name="photo"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          {previewImage && (
            <div className="image-preview">
              <img src={previewImage} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-group location-group">
          <label>Location:</label>
          <div className="location-inputs">
            <div className="input-group">
              <label htmlFor="latitude">Latitude:</label>
              <input
                type="text"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g., 40.7128"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="longitude">Longitude:</label>
              <input
                type="text"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g., -74.0060"
                required
              />
            </div>
          </div>
          <button 
            type="button" 
            className="use-location-btn"
            onClick={handleLocationClick}
          >
            Use My Current Location
          </button>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="submit-btn">Submit Report</button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;