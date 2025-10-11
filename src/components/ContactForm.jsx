import React, { useState } from 'react';
import Button from './Button';
import { contactService } from '../services/api';
import './ContactForm.css';

const ContactForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('');

    try {
      const result = await contactService.submitForm(formData);
      
      if (result.success) {
        setStatus(result.message);
        setFormData({ name: '', email: '', message: '' });
        if (onSubmit) onSubmit(formData);
      } else {
        setStatus('Failed to send message. Please try again.');
      }
    } catch (error) {
      setStatus('Failed to send message. Please try again.');
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name" className="form-label">Name:</label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">Email:</label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="message" className="form-label">Message:</label>
        <textarea
          name="message"
          id="message"
          value={formData.message}
          onChange={handleChange}
          className="form-textarea"
          required
        />
      </div>

      <Button 
        type="submit" 
        variant="primary" 
        loading={isSubmitting}
        className="form-submit-btn"
      >
        {isSubmitting ? 'Sending...' : 'Send'}
      </Button>

      {status && (
        <div className={`form-status ${status.includes('success') ? 'success' : 'error'}`}>
          {status}
        </div>
      )}
    </form>
  );
};

export default ContactForm;