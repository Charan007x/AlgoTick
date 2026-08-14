import React, { useState } from 'react';
import { Plus, Trash2, Edit2, FileText, Link2, Download, Eye, X } from 'lucide-react';
import { notesAPI } from '../services/api';
import { useConfirm } from '../context/ConfirmContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';

const Notes = () => {
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const [selectedNote, setSelectedNote] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    pdfFile: null
  });

  const { data: notes = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.notes,
    queryFn: async () => {
      const response = await notesAPI.getNotes();
      return response.data.notes || [];
    },
  });

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
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
      setSelectedNote(response.data.note);
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
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
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
    const confirmed = await confirm({
      title: 'Delete Note',
      message: 'Are you sure you want to delete this note?',
      confirmText: 'Delete',
      variant: 'danger'
    });
    
    if (!confirmed) return;

    try {
      await notesAPI.deleteNote(noteId);
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
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
    const confirmed = await confirm({
      title: 'Remove PDF',
      message: 'Are you sure you want to remove the PDF?',
      confirmText: 'Remove',
      variant: 'warning'
    });
    
    if (!confirmed) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', selectedNote.name);
      formDataToSend.append('link', selectedNote.link || '');
      formDataToSend.append('removePdf', 'true');

      const response = await notesAPI.updateNote(selectedNote._id, formDataToSend);
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
      setSelectedNote(response.data.note);
      showMessage('success', 'PDF removed successfully');
    } catch (error) {
      showMessage('error', 'Failed to remove PDF');
    }
  };

  const getPdfUrl = (pdfUrl) => {
    if (!pdfUrl) return null;
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    const fullUrl = `${baseUrl}${pdfUrl}`;
    return fullUrl;
  };

  return (
    <>
      {/* Page Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 tracking-tight">
          My <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Notes</span>
        </h2>
        
        <div className="flex gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Message Display */}
            {message.text && (
              <div
                className={`mb-6 p-4 rounded-xl backdrop-blur-sm border ${
                  message.type === 'success'
                    ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Notes Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-4 sm:p-6 shadow-2xl shadow-teal-500/20 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-white">Notes</h2>
                      <button
                        onClick={() => {
                          setShowCreateForm(true);
                          setFormData({ name: '', link: '', pdfFile: null });
                        }}
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        New
                      </button>
                    </div>

                    {loading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-4 bg-gray-900/40 border border-teal-500/20 rounded-xl animate-pulse">
                            <div className="h-5 bg-white/10 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-white/10 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : notes.length === 0 ? (
                      <p className="text-white/50 text-center py-8">No notes yet. Create one to get started!</p>
                    ) : (
                      <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                        {notes.map(note => (
                          <div
                            key={note._id}
                            onClick={() => handleSelectNote(note)}
                            className={`p-4 rounded-xl cursor-pointer transition-all ${
                              selectedNote?._id === note._id
                                ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-500/40'
                                : 'bg-gray-900/40 border border-teal-500/20 hover:bg-gray-800/60 hover:border-teal-500/30'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-white">{note.name}</h3>
                                <div className="text-sm text-white/60 mt-1 space-y-1">
                                  {note.pdfFileName && (
                                    <div className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      <span>{note.pdfFileName.length > 20 ? note.pdfFileName.substring(0, 20) + '...' : note.pdfFileName}</span>
                                    </div>
                                  )}
                                  {note.link && (
                                    <div className="flex items-center gap-1">
                                      <Link2 className="w-3 h-3" />
                                      <span>Link attached</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNote(note._id);
                                }}
                                className="text-red-400 hover:text-red-300 transition-colors p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Note Details / Create Form */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-4 sm:p-6 shadow-2xl shadow-teal-500/20 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
                  
                  <div className="relative z-10">
                    {showCreateForm ? (
                      /* Create Form */
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Create New Note</h2>
                        <form onSubmit={handleCreateNote} className="space-y-4">
                          <div>
                            <label className="block text-white/80 mb-2 font-medium">Name *</label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent backdrop-blur-sm transition-all"
                              placeholder="Enter note name"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-white/80 mb-2 font-medium">Link (optional)</label>
                            <input
                              type="url"
                              value={formData.link}
                              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent backdrop-blur-sm transition-all"
                              placeholder="https://example.com"
                            />
                          </div>

                          <div>
                            <label className="block text-white/80 mb-2 font-medium">PDF File (optional)</label>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={handleFileChange}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-teal-500 file:to-emerald-500 file:text-white hover:file:shadow-lg file:transition-all"
                            />
                            <p className="text-white/40 text-sm mt-1">Max file size: 10MB</p>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              type="submit"
                              disabled={submitting}
                              className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all disabled:opacity-50"
                            >
                              {submitting ? 'Creating...' : 'Create Note'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowCreateForm(false);
                                setFormData({ name: '', link: '', pdfFile: null });
                              }}
                              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
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
                                <label className="block text-white/80 mb-2 font-medium">Name *</label>
                                <input
                                  type="text"
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent backdrop-blur-sm transition-all"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-white/80 mb-2 font-medium">Link</label>
                                <input
                                  type="url"
                                  value={formData.link}
                                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent backdrop-blur-sm transition-all"
                                  placeholder="https://example.com"
                                />
                              </div>

                              <div>
                                <label className="block text-white/80 mb-2 font-medium">Update PDF File</label>
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={handleFileChange}
                                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-teal-500 file:to-emerald-500 file:text-white hover:file:shadow-lg file:transition-all"
                                />
                                {selectedNote.pdfFileName && (
                                  <p className="text-white/60 text-sm mt-1">
                                    Current: {selectedNote.pdfFileName}
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-3 pt-2">
                                <button
                                  type="submit"
                                  disabled={submitting}
                                  className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all disabled:opacity-50"
                                >
                                  {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
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
                                className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                            </div>

                            <div className="space-y-4">
                              {/* PDF Section */}
                              {selectedNote.pdfUrl ? (
                                <div className="bg-white/5 border border-teal-500/20 rounded-xl p-5">
                                  <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-5 h-5 text-teal-400" />
                                      <h3 className="text-lg font-semibold text-white">PDF Document</h3>
                                    </div>
                                    <button
                                      onClick={handleRemovePdf}
                                      className="text-red-400 hover:text-red-300 text-sm transition-colors flex items-center gap-1"
                                    >
                                      <X className="w-4 h-4" />
                                      Remove
                                    </button>
                                  </div>
                                  <p className="text-white/60 mb-4">{selectedNote.pdfFileName}</p>
                                  <div className="flex gap-3">
                                    <a
                                      href={getPdfUrl(selectedNote.pdfUrl)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all inline-flex items-center gap-2"
                                    >
                                      <Eye className="w-4 h-4" />
                                      View PDF
                                    </a>
                                    <a
                                      href={getPdfUrl(selectedNote.pdfUrl)}
                                      download={selectedNote.pdfFileName}
                                      className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all inline-flex items-center gap-2"
                                    >
                                      <Download className="w-4 h-4" />
                                      Download
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-white/5 border border-teal-500/20 rounded-xl p-5 text-white/50 text-center py-8">
                                  No PDF attached
                                </div>
                              )}

                              {/* Link Section */}
                              {selectedNote.link ? (
                                <div className="bg-white/5 border border-teal-500/20 rounded-xl p-5">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Link2 className="w-5 h-5 text-teal-400" />
                                    <h3 className="text-lg font-semibold text-white">Link</h3>
                                  </div>
                                  <a
                                    href={selectedNote.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-teal-400 hover:text-teal-300 transition-opacity break-all"
                                  >
                                    {selectedNote.link}
                                  </a>
                                </div>
                              ) : (
                                <div className="bg-white/5 border border-teal-500/20 rounded-xl p-5 text-white/50 text-center py-8">
                                  No link attached
                                </div>
                              )}

                              {/* Metadata */}
                              <div className="bg-white/5 border border-teal-500/20 rounded-xl p-4 text-sm text-white/60 space-y-1">
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
                        <FileText className="w-16 h-16 mx-auto mb-4 text-teal-400/50" />
                        <p className="text-xl">Select a note to view details</p>
                        <p className="text-white/40 text-sm mt-2">or create a new note to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
};

export default Notes;
