'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PosterUpload() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && (selected.type === 'image/jpeg' || selected.type === 'image/png')) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setError('');
    } else {
      setError('Please select a valid JPG or PNG image.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    
    // TODO: Implement backend API integration here
    setTimeout(() => {
      setLoading(false);
      alert('Backend AI Integration Pending: Requires API Key');
    }, 2000);
  };

  return (
    <div style={{ padding: '100px 2rem', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--text-highlight)' }}>🪄 AI Poster Upload</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Upload a photo of an academic event poster. Our AI will automatically extract the details, 
          generate a digital brochure, and draft your event listing!
        </p>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(24px)',
        border: '1px dashed var(--border-hover)',
        borderRadius: 'var(--radius-xl)',
        padding: '40px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-md)',
      }}>
        {previewUrl ? (
          <div>
            <img 
              src={previewUrl} 
              alt="Poster Preview" 
              style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '12px', marginBottom: '24px' }} 
            />
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => { setFile(null); setPreviewUrl(null); }}>
                Change Image
              </button>
              <button className="btn btn-primary" onClick={handleUpload} disabled={loading}>
                {loading ? 'AI is analyzing poster... 🪄' : 'Extract Data & Generate Event →'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📸</div>
            <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Drag & Drop or Select Image</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Supports JPG, JPEG, PNG</p>
            <input 
              type="file" 
              accept="image/jpeg, image/png" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              id="poster-upload-input" 
            />
            <label htmlFor="poster-upload-input" className="btn btn-primary" style={{ cursor: 'pointer' }}>
              Browse Files
            </label>
          </div>
        )}
        
        {error && <p style={{ color: '#ef4444', marginTop: '16px', fontWeight: '500' }}>{error}</p>}
      </div>
    </div>
  );
}
