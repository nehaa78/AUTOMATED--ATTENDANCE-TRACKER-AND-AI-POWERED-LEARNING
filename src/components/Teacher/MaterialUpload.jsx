import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { api } from '../../services/api';

const MaterialUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'notes',
    subject: '',
    semester: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      await api.post('/materials/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('File uploaded successfully!');
      // Reset form
      setFormData({ title: '', description: '', type: 'notes', subject: '', semester: '' });
      setFile(null);
    } catch (error) {
      alert('Upload failed: ' + (error.response?.data?.error || error.message));
    }
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Upload Study Material
        </h2>
        <p className="text-gray-600">Upload syllabus, notes, timetables, and previous year questions</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Material Type</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="input-field"
              required
            >
              <option value="syllabus">Syllabus</option>
              <option value="notes">Notes</option>
              <option value="timetable">Timetable</option>
              <option value="pyqs">Previous Year Questions</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="input-field"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
                className="input-field"
                required
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">File *</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="input-field"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.png"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: PDF, DOC, PPT, TXT, JPG, PNG (Max 10MB)
            </p>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="btn-primary flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Material'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MaterialUpload;

