const axios = require('axios');

/**
 * Fetch problem details from LeetCode GraphQL API
 * @param {string} titleSlug - The URL slug of the problem (e.g., "two-sum")
 * @returns {object} Problem details including title, difficulty, tags
 */
async function fetchLeetCodeProblem(titleSlug) {
  try {
    const graphqlQuery = {
      query: `
        query getQuestionDetail($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionId
            questionFrontendId
            title
            titleSlug
            difficulty
            topicTags {
              name
            }
          }
        }
      `,
      variables: { titleSlug }
    };

    const response = await axios.post('https://leetcode.com/graphql', graphqlQuery, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com'
      }
    });

    if (response.data && response.data.data && response.data.data.question) {
      const question = response.data.data.question;
      return {
        questionId: question.questionFrontendId || question.questionId,
        title: question.title,
        titleSlug: question.titleSlug,
        difficulty: question.difficulty,
        tags: question.topicTags.map(tag => tag.name),
        url: `https://leetcode.com/problems/${question.titleSlug}/`
      };
    } else {
      throw new Error('Question not found');
    }
  } catch (error) {
    console.error('LeetCode API error:', error.message);
    throw new Error('Failed to fetch question from LeetCode');
  }
}

/**
 * Get all problems with pagination to find question by number
 * @param {number} questionNumber - The question number
 * @returns {string} Title slug
 */
async function getQuestionSlugByNumber(questionNumber) {
  try {
    const graphqlQuery = {
      query: `
        query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
          problemsetQuestionList: questionList(
            categorySlug: $categorySlug
            limit: $limit
            skip: $skip
            filters: $filters
          ) {
            questions: data {
              questionFrontendId
              titleSlug
            }
          }
        }
      `,
      variables: {
        categorySlug: "",
        skip: 0,
        limit: 3000,
        filters: {}
      }
    };

    const response = await axios.post('https://leetcode.com/graphql', graphqlQuery, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com'
      }
    });

    if (response.data && response.data.data && response.data.data.problemsetQuestionList) {
      const questions = response.data.data.problemsetQuestionList.questions;
      const question = questions.find(q => q.questionFrontendId === questionNumber.toString());
      
      if (question) {
        return question.titleSlug;
      }
    }
    throw new Error(`Question number ${questionNumber} not found`);
  } catch (error) {
    console.error('Error fetching question by number:', error.message);
    throw new Error(`Failed to find question with number ${questionNumber}`);
  }
}

/**
 * Extract title slug from LeetCode URL
 * @param {string} url - Full LeetCode problem URL
 * @returns {string} Title slug
 */
function extractTitleSlug(url) {
  const match = url.match(/leetcode\.com\/problems\/([^\/]+)/);
  return match ? match[1] : url;
}

/**
 * Process input and return title slug
 * Handles: question number, URL, or title slug
 * @param {string} input - Question number, URL, or title slug
 * @returns {string} Title slug
 */
async function processQuestionInput(input) {
  // Check if input is a number
  if (/^\d+$/.test(input.trim())) {
    const questionNumber = parseInt(input.trim());
    return await getQuestionSlugByNumber(questionNumber);
  }
  
  // Check if input is a URL
  if (input.includes('leetcode.com')) {
    return extractTitleSlug(input);
  }
  
  // Otherwise, assume it's a title slug
  return input.trim();
}

module.exports = {
  fetchLeetCodeProblem,
  extractTitleSlug,
  processQuestionInput,
  getQuestionSlugByNumber
};
