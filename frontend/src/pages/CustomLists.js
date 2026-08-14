import React, { useState } from 'react';
import { List, Plus, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { listsAPI } from '../services/api';
import { useConfirm } from '../context/ConfirmContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';

const CustomLists = () => {
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const [selectedList, setSelectedList] = useState(null);
  const [listDetailsLoading, setListDetailsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newListData, setNewListData] = useState({
    name: '',
    description: '',
    color: '#61dca3'
  });
  const [questionInput, setQuestionInput] = useState('');

  const { data: lists = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.lists,
    queryFn: async () => {
      const response = await listsAPI.getLists();
      return response.data.lists || [];
    },
  });

  const invalidateListCaches = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.lists });
    queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    queryClient.invalidateQueries({ queryKey: ['questions'] });
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    
    if (!newListData.name.trim()) {
      showMessage('error', 'List name is required');
      return;
    }

    try {
      const response = await listsAPI.createList(newListData);
      invalidateListCaches();
      setNewListData({ name: '', description: '', color: '#61dca3' });
      setShowCreateForm(false);
      setSelectedList(response.data.list);
      showMessage('success', 'List created successfully!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to create list');
    }
  };

  const handleDeleteList = async (listId) => {
    const confirmed = await confirm({
      title: 'Delete List',
      message: 'Are you sure you want to delete this list?',
      confirmText: 'Delete',
      variant: 'danger'
    });
    
    if (!confirmed) return;

    try {
      await listsAPI.deleteList(listId);
      invalidateListCaches();
      if (selectedList?._id === listId) {
        setSelectedList(null);
      }
      showMessage('success', 'List deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete list');
    }
  };

  const handleSelectList = async (listId) => {
    try {
      setListDetailsLoading(true);
      const response = await listsAPI.getList(listId);
      setSelectedList(response.data.list);
      setShowAddQuestionForm(false);
    } catch (error) {
      showMessage('error', 'Failed to load list details');
    } finally {
      setListDetailsLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    
    if (!questionInput.trim()) {
      showMessage('error', 'Please enter a question number or URL');
      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);
      const response = await listsAPI.addQuestionToList(selectedList._id, {
        url: questionInput
      });
      
      setSelectedList(response.data.list);
      invalidateListCaches();
      
      setQuestionInput('');
      setShowAddQuestionForm(false);
      showMessage('success', 'Question added to list!');
    } catch (error) {
      console.error('Add question error:', error);
      showMessage('error', error.response?.data?.message || 'Failed to add question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveQuestion = async (questionNumber) => {
    try {
      const response = await listsAPI.removeQuestionFromList(
        selectedList._id,
        questionNumber
      );
      setSelectedList(response.data.list);
      invalidateListCaches();
      showMessage('success', 'Question removed from list');
    } catch (error) {
      showMessage('error', 'Failed to remove question');
    }
  };

  const handleAddQuestionToToday = async (questionNumber) => {
    try {
      await listsAPI.addQuestionToToday(selectedList._id, { questionNumber });
      invalidateListCaches();
      showMessage('success', 'Question added to today\'s due!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to add to today');
    }
  };

  const handleAddAllToToday = async () => {
    const confirmed = await confirm({
      title: 'Add All Questions',
      message: `Add all ${selectedList.questions.length} questions to today's due?`,
      confirmText: 'Add All',
      variant: 'info'
    });
    
    if (!confirmed) return;

    try {
      const response = await listsAPI.addAllToToday(selectedList._id);
      invalidateListCaches();
      showMessage('success', response.data.message);
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to add questions');
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
      Medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      Hard: 'text-red-400 bg-red-500/20 border-red-500/30'
    };
    return colors[difficulty] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  };

  return (
    <>
      {/* Page Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 tracking-tight">
          My <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Lists</span>
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
              {/* Lists Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-4 sm:p-6 shadow-2xl shadow-teal-500/20 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-white">My Lists</h2>
                      <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        New
                      </button>
                    </div>

                    {showCreateForm && (
                      <form onSubmit={handleCreateList} className="mb-6 p-4 bg-gray-900/40 rounded-xl border border-teal-500/20">
                        <input
                          type="text"
                          placeholder="List name"
                          value={newListData.name}
                          onChange={(e) => setNewListData({ ...newListData, name: e.target.value })}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3"
                        />
                        <textarea
                          placeholder="Description (optional)"
                          value={newListData.description}
                          onChange={(e) => setNewListData({ ...newListData, description: e.target.value })}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3"
                          rows="2"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-2 rounded-xl hover:shadow-lg transition-all"
                          >
                            Create
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCreateForm(false)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-4 bg-gray-900/40 border border-white/10 rounded-xl animate-pulse">
                            <div className="h-5 bg-white/10 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-white/10 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-white/10 rounded w-1/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : lists.length === 0 ? (
                      <div className="text-center py-8">
                        <List className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <p className="text-white/50">No lists yet</p>
                        <p className="text-white/40 text-sm mt-1">Create one to get started!</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {lists.map((list) => (
                          <div
                            key={list._id}
                            className={`p-4 rounded-xl cursor-pointer transition-all ${
                              selectedList?._id === list._id
                                ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border-2 border-teal-500/50 shadow-lg shadow-teal-500/20'
                                : 'bg-gray-900/40 border border-white/10 hover:bg-gray-900/60 hover:border-teal-500/30'
                            }`}
                            onClick={() => handleSelectList(list._id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-white mb-1">{list.name}</h3>
                                {list.description && (
                                  <p className="text-sm text-white/60 mb-2">{list.description}</p>
                                )}
                                <p className="text-xs text-teal-400 font-medium">
                                  {list.questions.length} question{list.questions.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteList(list._id);
                                }}
                                className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
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

              {/* List Details */}
              <div className="lg:col-span-2">
                {listDetailsLoading ? (
                  <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-6 shadow-2xl shadow-teal-500/20">
                    <div className="animate-pulse space-y-4">
                      <div className="h-8 bg-white/10 rounded w-1/3"></div>
                      <div className="h-4 bg-white/10 rounded w-1/2"></div>
                      <div className="h-12 bg-white/10 rounded-xl"></div>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 bg-gray-900/40 border border-white/10 rounded-xl">
                          <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
                          <div className="h-3 bg-white/10 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedList ? (
                  <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-6 shadow-2xl shadow-teal-500/20 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-white">{selectedList.name}</h2>
                          {selectedList.description && (
                            <p className="text-white/60 mt-1">{selectedList.description}</p>
                          )}
                        </div>
                        {selectedList.questions.length > 0 && (
                          <button
                            onClick={handleAddAllToToday}
                            className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-6 py-2 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all flex items-center gap-2"
                          >
                            <Calendar className="w-4 h-4" />
                            Add All
                          </button>
                        )}
                      </div>

                      <div className="mb-6">
                        <button
                          onClick={() => setShowAddQuestionForm(!showAddQuestionForm)}
                          className="w-full py-3 bg-gray-900/40 border border-teal-500/30 rounded-xl text-white hover:bg-gray-900/60 hover:border-teal-500/50 transition-all font-medium flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Add Question
                        </button>

                        {showAddQuestionForm && (
                          <form onSubmit={handleAddQuestion} className="mt-4 p-4 bg-gray-900/60 rounded-xl border border-teal-500/20">
                            <input
                              type="text"
                              placeholder="Question number, URL, or slug (e.g., 1, two-sum)"
                              value={questionInput}
                              onChange={(e) => setQuestionInput(e.target.value)}
                              disabled={submitting}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3 disabled:opacity-50"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-2 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all disabled:opacity-50"
                              >
                                {submitting ? 'Adding...' : 'Add'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowAddQuestionForm(false)}
                                disabled={submitting}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>

                      {selectedList.questions.length === 0 ? (
                        <div className="text-center py-12">
                          <List className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                          <p className="text-white/50 text-lg">No questions yet</p>
                          <p className="text-white/40 text-sm mt-2">Add questions to get started</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                          {selectedList.questions.map((question) => (
                            <div
                              key={question._id || question.questionNumber}
                              className="p-4 bg-gray-900/40 border border-white/10 rounded-xl hover:bg-gray-900/60 hover:border-teal-500/30 transition-all"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                                    <span className="text-teal-400 font-mono text-sm font-semibold">#{question.questionNumber}</span>
                                    <a
                                      href={question.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-semibold text-white hover:text-teal-400 transition-colors flex items-center gap-1"
                                    >
                                      {question.title}
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-lg border ${getDifficultyColor(question.difficulty)}`}>
                                      {question.difficulty}
                                    </span>
                                  </div>
                                  {question.tags && question.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {question.tags.slice(0, 5).map((tag, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs px-2 py-1 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-300"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                      {question.tags.length > 5 && (
                                        <span className="text-xs px-2 py-1 text-gray-400">
                                          +{question.tags.length - 5} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAddQuestionToToday(question.questionNumber)}
                                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all"
                                    title="Add to today"
                                  >
                                    <Calendar className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveQuestion(question.questionNumber)}
                                    className="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-12 shadow-2xl shadow-teal-500/20 text-center">
                    <List className="w-20 h-20 text-gray-500 mx-auto mb-4" />
                    <p className="text-white/50 text-lg">Select a list to view details</p>
                    <p className="text-white/40 text-sm mt-2">or create a new list to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(45, 212, 191, 0.3);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(45, 212, 191, 0.5);
          }
        `}</style>
    </>
  );
};

export default CustomLists;
