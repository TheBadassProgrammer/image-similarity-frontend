import React, { useState } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

interface SimilarityResponse {
  status: any; // Adjust type based on your backend response structure
}

function App() {
  const [productCode, setProductCode] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [model, setModel] = useState<number>(0); // 0: MobileNet, 1: VGG16, 2: DenseNet121
  const [result, setResult] = useState<SimilarityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productCode || !image) {
      setError('Both product code and image are required.');
      return;
    }

    const formData = new FormData();
    formData.append('product_code', productCode);
    formData.append('target_image', image);
    formData.append('model', model.toString()); // Ensure model is sent as a string

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/check_similarity/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data: SimilarityResponse = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productCode || !image) {
      setError('Both product code and image are required for upload.');
      return;
    }

    const formData = new FormData();
    formData.append('product_code', productCode);
    formData.append('image_file', image);

    try {
      const response = await fetch(`${API_URL}/add_image/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      alert('File uploaded successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while uploading the file.');
    }
  };

  return (
    <div className="App">
      <h1>Image Similarity Checker</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="productCode">Product Code:</label>
          <input
            type="text"
            id="productCode"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Upload X-ray Image:</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="model">Select Model:</label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(Number(e.target.value))}
          >
            <option value={0}>MobileNet</option>
            <option value={1}>VGG16</option>
            <option value={2}>DenseNet121</option>
          </select>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Checking...' : 'Check Similarity'}
        </button>
      </form>

      {/* File Upload Form */}
      <h2>Upload File to Database</h2>
      <form onSubmit={handleFileUpload}>
        <div className="form-group">
          <label htmlFor="uploadProductCode">Product Code:</label>
          <input
            type="text"
            id="uploadProductCode"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="uploadImage">Select File:</label>
          <input
            type="file"
            id="uploadImage"
            accept="image/*"
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
            required
          />
        </div>
        <button type="submit">Upload File</button>
      </form>

      {error && (
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      )}
      {result && (
        <div className="result">
          <h2>Result</h2>
          {result.status && result.status.status && (
            <>
              <p><strong>Status:</strong> {result.status.status}</p>
              {result.status.similarity !== undefined && (
                <p>
                  <strong>Similarity:</strong> {(result.status.similarity * 100).toFixed(2)}%
                </p>
              )}
              {result.status.highest_similarity !== undefined && (
                <p>
                  <strong>Highest Similarity:</strong> {(result.status.highest_similarity * 100).toFixed(2)}%
                </p>
              )}
              {result.status.file_path && (
                <p><strong>File Path:</strong> {result.status.file_path}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
