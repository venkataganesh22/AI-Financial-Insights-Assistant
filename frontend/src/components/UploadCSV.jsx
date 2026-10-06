import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export default function UploadCSV({ token, apiUrl, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file first.');
      return;
    }

    setUploading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Upload failed');
      }

      setMessage(`Success! Processed ${data.total_transactions} transactions.`);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setError(err.message || 'Failed to upload CSV file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      <div className="upload-modal">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UploadCloud size={28} color="#3B82F6" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Upload Transactions CSV</h2>
          <p style={{ fontSize: '0.85rem', color: '#A1A1A1', maxWidth: '400px' }}>
            Upload your monthly bank or UPI statement CSV to run KMeans spending clustering and ML overspending analysis.
          </p>
        </div>

        <div className="dropzone" onClick={() => document.getElementById('csv-file-input').click()}>
          <input
            id="csv-file-input"
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <FileText size={32} color={file ? '#10B981' : '#666'} />
          {file ? (
            <div>
              <span style={{ fontWeight: 600, color: '#FFF' }}>{file.name}</span>
              <div style={{ fontSize: '0.75rem', color: '#A1A1A1' }}>{(file.size / 1024).toFixed(1)} KB</div>
            </div>
          ) : (
            <div>
              <span style={{ color: '#FFF', fontWeight: 500 }}>Click to select CSV file</span>
              <div style={{ fontSize: '0.75rem', color: '#A1A1A1', marginTop: '4px' }}>
                Supported columns: date, description, category, amount, type
              </div>
            </div>
          )}
        </div>

        {message && (
          <div style={{
            backgroundColor: '#064E3B',
            border: '1px solid #059669',
            color: '#A7F3D0',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#7F1D1D',
            border: '1px solid #DC2626',
            color: '#FECACA',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <button 
          className="upload-btn" 
          onClick={handleUpload} 
          disabled={!file || uploading}
          style={{ opacity: (!file || uploading) ? 0.5 : 1 }}
        >
          {uploading ? 'Processing & Training ML...' : 'Analyze CSV Transactions'}
        </button>

        <div style={{
          backgroundColor: '#141414',
          border: '1px solid #2A2A2A',
          borderRadius: '10px',
          padding: '14px',
          fontSize: '0.78rem',
          color: '#A1A1A1',
          textAlign: 'left'
        }}>
          <strong style={{ color: '#FFF' }}>Sample Indian Transaction CSV Format:</strong>
          <pre style={{
            marginTop: '8px',
            fontFamily: 'monospace',
            backgroundColor: '#0B0B0B',
            padding: '8px',
            borderRadius: '6px',
            color: '#10B981',
            fontSize: '0.75rem',
            overflowX: 'auto'
          }}>
{`date,description,category,amount,type
2026-01-01,Salary from Tech Corp,Salary,75000,income
2026-01-02,House Rent Payment,Rent,15000,expense
2026-01-04,Swiggy Lunch,Food,450,expense`}
          </pre>
        </div>
      </div>
    </div>
  );
}
