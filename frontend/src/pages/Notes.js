import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { notesAPI } from '../services/api';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    pdfFile: null
  });

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getNotes();
      setNotes(response.data.notes);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      showMessage('error', 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, pdfFile: file });
    } else if (file) {
      showMessage('error', 'Only PDF files are allowed');
      e.target.value = '';
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showMessage('error', 'Note name is required');
      return;
    }

    try {
      setSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.link) formDataToSend.append('link', formData.link);
      if (formData.pdfFile) formDataToSend.append('pdf', formData.pdfFile);

      const response = await notesAPI.createNote(formDataToSend);
      setNotes([response.data.note, ...notes]);
      setFormData({ name: '', link: '', pdfFile: null });
      setShowCreateForm(false);
      showMessage('success', 'Note created successfully!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to create note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showMessage('error', 'Note name is required');
      return;
    }

    try {
      setSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('link', formData.link || '');
      if (formData.pdfFile) formDataToSend.append('pdf', formData.pdfFile);

      const response = await notesAPI.updateNote(selectedNote._id, formDataToSend);
      setNotes(notes.map(n => n._id === selectedNote._id ? response.data.note : n));
      setSelectedNote(response.data.note);
      setEditMode(false);
      showMessage('success', 'Note updated successfully!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to update note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesAPI.deleteNote(noteId);
      setNotes(notes.filter(n => n._id !== noteId));
      if (selectedNote?._id === noteId) {
        setSelectedNote(null);
      }
      showMessage('success', 'Note deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete note');
    }
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setFormData({
      name: note.name,
      link: note.link || '',
      pdfFile: null
    });
    setEditMode(false);
  };

  const handleEditClick = () => {
    setEditMode(true);
    setFormData({
      name: selectedNote.name,
      link: selectedNote.link || '',
      pdfFile: null
    });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setFormData({
      name: selectedNote.name,
      link: selectedNote.link || '',
      pdfFile: null
    });
  };

  const handleRemovePdf = async () => {
    if (!window.confirm('Are you sure you want to remove the PDF?')) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', selectedNote.name);
      formDataToSend.append('link', selectedNote.link || '');
      formDataToSend.append('removePdf', 'true');

      const response = await notesAPI.updateNote(selectedNote._id, formDataToSend);
      setNotes(notes.map(n => n._id === selectedNote._id ? response.data.note : n));
      setSelectedNote(response.data.note);
      showMessage('success', 'PDF removed successfully');
    } catch (error) {
      showMessage('error', 'Failed to remove PDF');
    }
  };

  const getPdfUrl = (pdfUrl) => {
    if (!pdfUrl) return null;
    // Get base server URL without /api suffix
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    const fullUrl = `${baseUrl}${pdfUrl}`;
    return fullUrl;
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold text-white mb-2">My Notes</h1>
          <p className="text-white/60">Upload and organize your study materials</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl backdrop-blur-sm animate-slideIn ${
              message.type === 'success'
                ? 'bg-[#61dca3]/10 text-[#61dca3] border border-[#61dca3]/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes Sidebar */}
          <div className="lg:col-span-1 animate-fadeIn delay-100">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Notes</h2>
                <button
                  onClick={() => {
                    setShowCreateForm(true);
                    setFormData({ name: '', link: '', pdfFile: null });
                  }}
                  className="bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black font-bold px-4 py-2 rounded-xl hover:shadow-lg transition-all"
                >
                  + New
                </button>
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl animate-pulse">
                      <div className="h-5 bg-white/10 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-white/10 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : notes.length === 0 ? (
                <p className="text-white/50 text-center py-8">No notes yet. Create one to get started!</p>
              ) : (
                <div className="space-y-2">
                  {notes.map(note => (
                    <div
                      key={note._id}
                      onClick={() => handleSelectNote(note)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        selectedNote?._id === note._id
                          ? 'bg-gradient-to-r from-[#61dca3]/20 to-[#61b3dc]/20 border border-[#61dca3]/30'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{note.name}</h3>
                          <div className="text-sm text-white/60 mt-1">
                            {note.pdfFileName && (
                              <div className="flex items-center gap-1">
                                📄 {note.pdfFileName.length > 20 ? note.pdfFileName.substring(0, 20) + '...' : note.pdfFileName}
                              </div>
                            )}
                            {note.link && (
                              <div className="flex items-center gap-1 mt-1">
                                🔗 Link attached
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note._id);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Note Details / Create Form */}
          <div className="lg:col-span-2 animate-fadeIn delay-200">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              {showCreateForm ? (
                /* Create Form */
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Create New Note</h2>
                  <form onSubmit={handleCreateNote} className="space-y-4">
                    <div>
                      <label className="block text-white/80 mb-2">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#61dca3]"
                        placeholder="Enter note name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">Link (optional)</label>
                      <input
                        type="url"
                        value={formData.link}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#61dca3]"
                        placeholder="https://example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">PDF File (optional)</label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#61dca3] file:to-[#61b3dc] file:text-black hover:file:shadow-lg file:transition-all"
                      />
                      <p className="text-white/40 text-sm mt-1">Max file size: 10MB</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black font-bold px-6 py-2 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {submitting ? 'Creating...' : 'Create Note'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setFormData({ name: '', link: '', pdfFile: null });
                        }}
                        className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : selectedNote ? (
                /* Note Details / Edit Form */
                <div>
                  {editMode ? (
                    /* Edit Mode */
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-6">Edit Note</h2>
                      <form onSubmit={handleUpdateNote} className="space-y-4">
                        <div>
                          <label className="block text-white/80 mb-2">Name *</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#61dca3]"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-white/80 mb-2">Link</label>
                          <input
                            type="url"
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#61dca3]"
                            placeholder="https://example.com"
                          />
                        </div>

                        <div>
                          <label className="block text-white/80 mb-2">Update PDF File</label>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#61dca3] file:to-[#61b3dc] file:text-black hover:file:shadow-lg file:transition-all"
                          />
                          {selectedNote.pdfFileName && (
                            <p className="text-white/60 text-sm mt-1">
                              Current: {selectedNote.pdfFileName}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black font-bold px-6 py-2 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {submitting ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    /* View Mode */
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <h2 className="text-2xl font-bold text-white">{selectedNote.name}</h2>
                        <button
                          onClick={handleEditClick}
                          className="bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black font-bold px-4 py-2 rounded-xl hover:shadow-lg transition-all"
                        >
                          ✏️ Edit
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* PDF Section */}
                        {selectedNote.pdfUrl ? (
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h3 className="text-lg font-semibold text-white">📄 PDF Document</h3>
                              <button
                                onClick={handleRemovePdf}
                                className="text-red-400 hover:text-red-300 text-sm transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                            <p className="text-white/60 mb-3">{selectedNote.pdfFileName}</p>
                            <div className="flex gap-3">
                              <a
                                href={getPdfUrl(selectedNote.pdfUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black font-bold px-4 py-2 rounded-xl hover:shadow-lg transition-all inline-block"
                              >
                                📖 View PDF
                              </a>
                              <a
                                href={getPdfUrl(selectedNote.pdfUrl)}
                                download={selectedNote.pdfFileName}
                                className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all inline-block"
                              >
                                ⬇️ Download
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-white/50 text-center py-8">
                            No PDF attached
                          </div>
                        )}

                        {/* Link Section */}
                        {selectedNote.link ? (
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <h3 className="text-lg font-semibold text-white mb-3">🔗 Link</h3>
                            <a
                              href={selectedNote.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-transparent bg-clip-text bg-gradient-to-r from-[#61dca3] to-[#61b3dc] hover:opacity-80 transition-opacity break-all"
                            >
                              {selectedNote.link}
                            </a>
                          </div>
                        ) : (
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-white/50 text-center py-8">
                            No link attached
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/60">
                          <div>Created: {new Date(selectedNote.createdAt).toLocaleDateString()}</div>
                          <div>Updated: {new Date(selectedNote.updatedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* No Selection */
                <div className="text-center text-white/50 py-16">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-xl">Select a note to view details</p>
                  <p className="text-white/40 text-sm mt-2">or create a new note to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
