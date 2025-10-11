import React, { useState } from 'react';
import './ContactForm.css';

// Simple frontend-only contact form that posts to Formspree
const ContactForm = () => {
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    const form = e.target;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/mdkznpbz', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setStatusMessage('Kiitos! Viesti lähetetty.');
        form.reset();
      } else {
        setStatusMessage('Lähetys epäonnistui. Yritä uudelleen.');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setStatusMessage('Lähetys epäonnistui. Yritä uudelleen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form id="my-form" onSubmit={handleSubmit} className="contact-form">
      <label htmlFor="name">Nimi:</label>
      <input type="text" name="name" id="name" required />

      <label htmlFor="email">Sähköposti:</label>
      <input type="email" name="email" id="email" required />

      <label htmlFor="message">Viesti:</label>
      <textarea name="message" id="message" required></textarea>

      <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Lähetetään...' : 'Lähetä'}</button>

      <div id="status" className="form-status">{statusMessage}</div>
    </form>
  );
};

export default ContactForm;