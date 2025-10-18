import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { listsAPI } from '../services/api';

const CustomLists = () => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [newListData, setNewListData] = useState({
    name: '',
    description: '',
    color: '#61dca3'
  });
  const [questionInput, setQuestionInput] = useState('');

  useEffect(() => {
    fetchLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await listsAPI.getLists();
      setLists(response.data.lists);
    } catch (error) {
      console.error('Failed to fetch lists:', error);
      showMessage('error', 'Failed to load lists');
    } finally {
      setLoading(false);
    }
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
      setLists([response.data.list, ...lists]);
      setNewListData({ name: '', description: '', color: '#61dca3' });
      setShowCreateForm(false);
      showMessage('success', 'List created successfully!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to create list');
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;

    try {
      await listsAPI.deleteList(listId);
      setLists(lists.filter(l => l._id !== listId));
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
      const response = await listsAPI.getList(listId);
      console.log('Selected list response:', response.data.list);
      console.log('Questions count:', response.data.list.questions.length);
      console.log('Questions:', response.data.list.questions);
      setSelectedList(response.data.list);
      setShowAddQuestionForm(false);
    } catch (error) {
      showMessage('error', 'Failed to load list details');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    
    if (!questionInput.trim()) {
      showMessage('error', 'Please enter a question number or URL');
      return;
    }

    if (submitting) {
      console.log('Already submitting, ignoring duplicate request');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Adding question:', questionInput, 'to list:', selectedList._id);
      const response = await listsAPI.addQuestionToList(selectedList._id, {
        url: questionInput
      });
      console.log('=== ADD QUESTION RESPONSE ===');
      console.log('Response list:', response.data.list);
      console.log('Questions array length:', response.data.list.questions.length);
      console.log('Questions:', response.data.list.questions.map(q => ({ 
        _id: q._id, 
        num: q.questionNumber, 
        title: q.title 
      })));
      console.log('===========================');
      
      setSelectedList(response.data.list);
      
      // Update the lists array to reflect the new question count
      setLists(lists.map(l => 
        l._id === response.data.list._id ? response.data.list : l
      ));
      
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
      
      // Update the lists array to reflect the removed question
      setLists(lists.map(l => 
        l._id === response.data.list._id ? response.data.list : l
      ));
      
      showMessage('success', 'Question removed from list');
    } catch (error) {
      showMessage('error', 'Failed to remove question');
    }
  };

  const handleAddQuestionToToday = async (questionNumber) => {
    try {
      await listsAPI.addQuestionToToday(selectedList._id, { questionNumber });
      showMessage('success', 'Question added to today\'s due!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to add to today');
    }
  };

  const handleAddAllToToday = async () => {
    if (!window.confirm(`Add all ${selectedList.questions.length} questions to today's due?`)) {
      return;
    }

    try {
      const response = await listsAPI.addAllToToday(selectedList._id);
      showMessage('success', response.data.message);
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to add questions');
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'text-[#61dca3] bg-[#61dca3]/10',
      Medium: 'text-yellow-400 bg-yellow-400/10',
      Hard: 'text-red-400 bg-red-400/10'
    };
    return colors[difficulty] || 'text-gray-400 bg-gray-400/10';
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold text-white mb-2">Custom Lists</h1>
          <p className="text-white/60">Create lists of questions and add them to your schedule</p>
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
          {/* Lists Sidebar */}
          <div className="lg:col-span-1 animate-fadeIn delay-100">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">My Lists</h2>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black font-bold px-4 py-2 rounded-xl hover:shadow-lg transition-all"
                >
                  + New
                </button>
              </div>

              {/* Create List Form */}
              {showCreateForm && (
                <form onSubmit={handleCreateList} className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <input
                    type="text"
                    placeholder="List name"
                    value={newListData.name}
                    onChange={(e) => setNewListData({ ...newListData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#61dca3] mb-3"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={newListData.description}
                    onChange={(e) => setNewListData({ ...newListData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#61dca3] mb-3"
                    rows="2"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black font-bold py-2 rounded-xl hover:shadow-lg transition-all"
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

              {/* Lists */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#61dca3]"></div>
                </div>
              ) : lists.length === 0 ? (
                <p className="text-white/50 text-center py-8">No lists yet. Create one to get started!</p>
              ) : (
                <div className="space-y-2">
                  {lists.map((list) => (
                    <div
                      key={list._id}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        selectedList?._id === list._id
                          ? 'bg-gradient-to-r from-[#61dca3]/20 to-[#61b3dc]/20 border border-[#61dca3]/30'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => handleSelectList(list._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{list.name}</h3>
                          {list.description && (
                            <p className="text-sm text-white/60 mt-1">{list.description}</p>
                          )}
                          <p className="text-xs text-white/50 mt-2">
                            {list.questions.length} question{list.questions.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteList(list._id);
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

          {/* List Details */}
          <div className="lg:col-span-2 animate-fadeIn delay-200">
            {selectedList ? (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
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
                      className="bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black font-bold px-6 py-2 rounded-xl hover:shadow-lg transition-all"
                    >
                      Add All to Today
                    </button>
                  )}
                </div>

                {/* Add Question Button */}
                <div className="mb-6">
                  <button
                    onClick={() => setShowAddQuestionForm(!showAddQuestionForm)}
                    className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all font-medium"
                  >
                    + Add Question to List
                  </button>

                  {/* Add Question Form */}
                  {showAddQuestionForm && (
                    <form onSubmit={handleAddQuestion} className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      <input
                        type="text"
                        placeholder="Question number, URL, or slug (e.g., 1, two-sum)"
                        value={questionInput}
                        onChange={(e) => setQuestionInput(e.target.value)}
                        disabled={submitting}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#61dca3] mb-3 disabled:opacity-50"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-1 bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black font-bold py-2 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Adding...' : 'Add'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddQuestionForm(false)}
                          disabled={submitting}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Questions List */}
                {selectedList.questions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-white/50">No questions in this list yet.</p>
                    <p className="text-white/40 text-sm mt-2">Click "Add Question to List" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      console.log('\n=== RENDERING QUESTIONS ===');
                      console.log('Total questions:', selectedList.questions.length);
                      console.log('Questions details:', selectedList.questions.map((q, idx) => ({
                        index: idx,
                        _id: q._id,
                        questionNumber: q.questionNumber,
                        title: q.title,
                        key: q._id || q.questionNumber
                      })));
                      console.log('==========================\n');
                      return null;
                    })()}
                    {selectedList.questions.map((question, index) => (
                      <div
                        key={question._id || question.questionNumber}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-white/50 font-mono text-sm">#{question.questionNumber}</span>
                              <a
                                href={question.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#61dca3] to-[#61b3dc] hover:opacity-80 transition-opacity"
                              >
                                {question.title}
                              </a>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                                {question.difficulty}
                              </span>
                            </div>
                            {question.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {question.tags.slice(0, 5).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white/60"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddQuestionToToday(question.questionNumber)}
                              className="px-4 py-2 bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black font-bold rounded-xl hover:shadow-lg transition-all"
                              title="Add to today's due"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleRemoveQuestion(question.questionNumber)}
                              className="px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
                              title="Remove from list"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
                <p className="text-white/50 text-lg">Select a list to view details</p>
                <p className="text-white/40 text-sm mt-2">or create a new list to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomLists;
