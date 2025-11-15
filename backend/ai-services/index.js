/**
 * AI Services Entry Point
 * 
 * This module exports all AI-related services for easy importing
 * throughout the application.
 */

const geminiService = require('./geminiService');
const aiCoachService = require('./aiCoachService');

module.exports = {
  geminiService,
  aiCoachService
};
