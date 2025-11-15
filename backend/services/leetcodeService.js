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

/**
 * Fetch user's recent submissions for a specific problem
 * @param {string} leetcodeUsername - LeetCode username
 * @param {string} titleSlug - Problem title slug
 * @returns {object} Submission data including status and timestamp
 */
async function getUserSubmissions(leetcodeUsername, titleSlug) {
  try {
    console.log(`Fetching last 20 submissions for user: ${leetcodeUsername}, problem: ${titleSlug}`);
    
    const graphqlQuery = {
      query: `
        query recentAcSubmissions($username: String!, $limit: Int!) {
          recentAcSubmissionList(username: $username, limit: $limit) {
            id
            title
            titleSlug
            timestamp
          }
        }
      `,
      variables: {
        username: leetcodeUsername,
        limit: 20 // Get last 20 accepted submissions
      }
    };

    const response = await axios.post('https://leetcode.com/graphql', graphqlQuery, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com'
      }
    });

    if (response.data && response.data.data && response.data.data.recentAcSubmissionList) {
      const submissions = response.data.data.recentAcSubmissionList;
      
      console.log(`Total recent submissions fetched: ${submissions.length}`);
      
      // Find submissions for the specific problem (case-insensitive)
      const problemSubmissions = submissions.filter(sub => 
        sub.titleSlug.toLowerCase() === titleSlug.toLowerCase()
      );
      
      console.log(`Submissions for problem "${titleSlug}": ${problemSubmissions.length}`);
      
      if (problemSubmissions.length > 0) {
        console.log('Problem submissions:', problemSubmissions.map(sub => ({
          title: sub.title,
          timestamp: new Date(parseInt(sub.timestamp) * 1000).toISOString()
        })));
      }
      
      return {
        hasSubmissions: problemSubmissions.length > 0,
        submissions: problemSubmissions.map(sub => ({
          title: sub.title,
          titleSlug: sub.titleSlug,
          timestamp: new Date(parseInt(sub.timestamp) * 1000).toISOString(),
          submittedAt: new Date(parseInt(sub.timestamp) * 1000)
        }))
      };
    }

    return { hasSubmissions: false, submissions: [] };
  } catch (error) {
    console.error('Error fetching user submissions:', error.message);
    // Don't throw error, just return empty result
    return { hasSubmissions: false, submissions: [], error: error.message };
  }
}

/**
 * Check if user solved a problem on a specific date
 * @param {string} leetcodeUsername - LeetCode username
 * @param {string} titleSlug - Problem title slug
 * @param {Date} targetDate - Date to check (defaults to today)
 * @returns {boolean} Whether the problem was solved on target date
 */
async function checkSubmissionOnDate(leetcodeUsername, titleSlug, targetDate = new Date()) {
  try {
    const submissionData = await getUserSubmissions(leetcodeUsername, titleSlug);
    
    if (!submissionData.hasSubmissions) {
      return false;
    }

    // Check if any submission was on the target date
    const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const hasSubmissionOnDate = submissionData.submissions.some(sub => {
      const submissionDateStr = new Date(sub.submittedAt).toISOString().split('T')[0];
      return submissionDateStr === targetDateStr;
    });

    return hasSubmissionOnDate;
  } catch (error) {
    console.error('Error checking submission on date:', error.message);
    return false;
  }
}

/**
 * Check if user solved a problem AFTER a specific date (e.g., after adding to tracker)
 * @param {string} leetcodeUsername - LeetCode username
 * @param {string} titleSlug - Problem title slug
 * @param {Date} afterDate - Only count submissions after this date
 * @returns {object} Verification result with details
 */
async function checkSubmissionAfterDate(leetcodeUsername, titleSlug, afterDate) {
  try {
    console.log(`\n=== Checking Submission After Date ===`);
    console.log(`Username: ${leetcodeUsername}`);
    console.log(`Problem: ${titleSlug}`);
    console.log(`After Date: ${afterDate.toISOString()}`);
    
    const submissionData = await getUserSubmissions(leetcodeUsername, titleSlug);
    
    if (!submissionData.hasSubmissions) {
      console.log('❌ No accepted submissions found for this problem');
      return {
        verified: false,
        reason: 'No accepted submissions found for this problem',
        submissions: []
      };
    }

    // Verify titleSlug matches exactly (case-insensitive)
    const matchingSubmissions = submissionData.submissions.filter(sub => 
      sub.titleSlug.toLowerCase() === titleSlug.toLowerCase()
    );

    if (matchingSubmissions.length === 0) {
      console.log('❌ Problem title slug does not match');
      return {
        verified: false,
        reason: 'Problem title slug does not match',
        submissions: []
      };
    }

    console.log(`Found ${matchingSubmissions.length} matching submission(s) for this problem`);

    // Filter submissions that were made AFTER the question was added
    const validSubmissions = matchingSubmissions.filter(sub => {
      const submissionDate = new Date(sub.submittedAt);
      const isAfter = submissionDate >= afterDate;
      console.log(`  - Submission at ${submissionDate.toISOString()} ${isAfter ? '✅ (AFTER)' : '❌ (BEFORE)'} ${afterDate.toISOString()}`);
      return isAfter;
    });

    if (validSubmissions.length === 0) {
      const latestSubmission = matchingSubmissions[0];
      console.log(`❌ No submissions found after ${afterDate.toISOString().split('T')[0]}`);
      console.log(`Latest submission was at: ${latestSubmission.submittedAt.toISOString()}`);
      
      return {
        verified: false,
        reason: `No submissions found after ${afterDate.toISOString().split('T')[0]}. Latest submission was on ${new Date(latestSubmission.submittedAt).toISOString().split('T')[0]}`,
        submissions: matchingSubmissions.map(sub => ({
          ...sub,
          submittedAt: sub.submittedAt
        })),
        latestSubmission: latestSubmission.submittedAt
      };
    }

    // Sort by timestamp to get the latest submission
    validSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    console.log(`✅ VERIFIED: Found ${validSubmissions.length} valid submission(s) after adding to tracker`);
    console.log(`Latest valid submission: ${validSubmissions[0].submittedAt.toISOString()}`);

    return {
      verified: true,
      reason: 'Valid submission found after adding to tracker',
      submissions: validSubmissions,
      latestSubmission: validSubmissions[0].submittedAt,
      totalSubmissionsAfterDate: validSubmissions.length
    };

  } catch (error) {
    console.error('Error checking submission after date:', error.message);
    return {
      verified: false,
      reason: 'Error checking submissions: ' + error.message,
      submissions: []
    };
  }
}

/**
 * Get user's recent activity summary
 * @param {string} leetcodeUsername - LeetCode username
 * @returns {object} Activity summary
 */
async function getUserActivitySummary(leetcodeUsername) {
  try {
    console.log('Fetching LeetCode stats for username:', leetcodeUsername);
    
    const graphqlQuery = {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            submitStats {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
            }
            profile {
              realName
              ranking
            }
          }
        }
      `,
      variables: { username: leetcodeUsername }
    };

    const response = await axios.post('https://leetcode.com/graphql', graphqlQuery, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com'
      }
    });

    console.log('LeetCode API response status:', response.status);
    console.log('LeetCode API response data:', JSON.stringify(response.data, null, 2));

    if (response.data && response.data.data && response.data.data.matchedUser) {
      const user = response.data.data.matchedUser;
      const stats = user.submitStats.acSubmissionNum;
      
      return {
        username: user.username,
        realName: user.profile?.realName || null,
        ranking: user.profile?.ranking || null,
        totalSolved: stats.find(s => s.difficulty === 'All')?.count || 0,
        easySolved: stats.find(s => s.difficulty === 'Easy')?.count || 0,
        mediumSolved: stats.find(s => s.difficulty === 'Medium')?.count || 0,
        hardSolved: stats.find(s => s.difficulty === 'Hard')?.count || 0
      };
    }

    console.log('matchedUser not found in response. Full response:', JSON.stringify(response.data));
    throw new Error('User not found on LeetCode');
  } catch (error) {
    console.error('Error fetching user activity:', error.message);
    if (error.response) {
      console.error('LeetCode API error response:', error.response.status, error.response.data);
    }
    throw new Error(error.message || 'Failed to fetch user activity from LeetCode');
  }
}

module.exports = {
  fetchLeetCodeProblem,
  extractTitleSlug,
  processQuestionInput,
  getQuestionSlugByNumber,
  getUserSubmissions,
  checkSubmissionOnDate,
  checkSubmissionAfterDate,
  getUserActivitySummary,
  fetchRecentSubmissions,
  saveLeetCodeSubmissions,
  getLeetCodeSubmissions,
  buildProfileFromLeetCodeSubmissions
};

/**
 * Fetch recent accepted submissions from LeetCode GraphQL API
 * @param {string} leetcodeUsername - LeetCode username
 * @param {number} limit - Number of submissions to fetch (default: 20)
 * @returns {Promise<Array>} Array of recent submissions
 */
async function fetchRecentSubmissions(leetcodeUsername, limit = 20) {
  try {
    console.log(`🔍 [LeetCode API] Fetching recent submissions for: ${leetcodeUsername}`);
    
    const query = `
      query recentAcSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          id
          title
          titleSlug
          timestamp
        }
      }
    `;
    
    const response = await axios.post('https://leetcode.com/graphql', {
      query: query,
      variables: {
        username: leetcodeUsername,
        limit: limit
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com'
      }
    });
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from LeetCode API');
    }
    
    const submissions = response.data.data.recentAcSubmissionList || [];
    
    console.log(`✅ [LeetCode API] Fetched ${submissions.length} submissions`);
    
    // Fetch detailed info for each submission
    const detailedSubmissions = await Promise.all(
      submissions.slice(0, limit).map(async (submission) => {
        try {
          const problemData = await fetchLeetCodeProblem(submission.titleSlug);
          return {
            title: submission.title,
            titleSlug: submission.titleSlug,
            timestamp: new Date(parseInt(submission.timestamp) * 1000),
            statusDisplay: 'Accepted',
            difficulty: problemData.difficulty,
            questionId: problemData.questionId,
            topics: problemData.tags || [],
          };
        } catch (error) {
          console.error(`⚠️ Failed to fetch details for ${submission.titleSlug}:`, error.message);
          return {
            title: submission.title,
            titleSlug: submission.titleSlug,
            timestamp: new Date(parseInt(submission.timestamp) * 1000),
            statusDisplay: 'Accepted',
            difficulty: 'Unknown',
            topics: []
          };
        }
      })
    );
    
    return detailedSubmissions;
    
  } catch (error) {
    console.error('❌ [LeetCode API] Error fetching submissions:', error.message);
    throw error;
  }
}

/**
 * Save LeetCode submissions to database
 * @param {string} userId - User ID
 * @param {string} leetcodeUsername - LeetCode username
 * @returns {Promise<Object>} Saved submissions document
 */
async function saveLeetCodeSubmissions(userId, leetcodeUsername) {
  try {
    const LeetCodeSubmission = require('../models/LeetCodeSubmission');
    
    console.log(`💾 [LeetCode Sync] Saving submissions for user: ${userId}`);
    
    const submissions = await fetchRecentSubmissions(leetcodeUsername, 20);
    
    // Update or create submission document
    const submissionDoc = await LeetCodeSubmission.findOneAndUpdate(
      { userId },
      {
        userId,
        submissions,
        lastFetched: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log(`✅ [LeetCode Sync] Saved ${submissions.length} submissions to database`);
    
    return submissionDoc;
    
  } catch (error) {
    console.error('❌ [LeetCode Sync] Error saving submissions:', error.message);
    throw error;
  }
}

/**
 * Get LeetCode submissions from database (with cache)
 * Fetches fresh data if cache is older than 24 hours
 * @param {string} userId - User ID
 * @param {string} leetcodeUsername - LeetCode username
 * @returns {Promise<Array>} Array of submissions
 */
async function getLeetCodeSubmissions(userId, leetcodeUsername) {
  try {
    const LeetCodeSubmission = require('../models/LeetCodeSubmission');
    
    const submissionDoc = await LeetCodeSubmission.findOne({ userId });
    
    // Check if we need to refresh (older than 24 hours or doesn't exist)
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    if (!submissionDoc || submissionDoc.lastFetched < twentyFourHoursAgo) {
      console.log('🔄 [LeetCode Sync] Cache expired or missing, fetching fresh data...');
      const freshDoc = await saveLeetCodeSubmissions(userId, leetcodeUsername);
      return freshDoc.submissions;
    }
    
    console.log(`✅ [LeetCode Sync] Using cached submissions (last fetched: ${submissionDoc.lastFetched})`);
    return submissionDoc.submissions;
    
  } catch (error) {
    console.error('❌ [LeetCode Sync] Error getting submissions:', error.message);
    return [];
  }
}

/**
 * Build profile data from LeetCode submissions (fallback when AlgoTick data is insufficient)
 * @param {Array} submissions - LeetCode submissions
 * @returns {Object} Profile data for AI insights
 */
function buildProfileFromLeetCodeSubmissions(submissions) {
  console.log('🔄 [LeetCode Fallback] Building profile from LeetCode submissions');
  
  if (!submissions || submissions.length === 0) {
    return null;
  }
  
  // Calculate topic breakdown
  const topicStats = {};
  submissions.forEach(sub => {
    if (sub.topics && sub.topics.length > 0) {
      sub.topics.forEach(topic => {
        if (!topicStats[topic]) {
          topicStats[topic] = { count: 0, difficulty: {} };
        }
        topicStats[topic].count += 1;
        topicStats[topic].difficulty[sub.difficulty] = 
          (topicStats[topic].difficulty[sub.difficulty] || 0) + 1;
      });
    }
  });
  
  // Sort topics by frequency
  const sortedTopics = Object.entries(topicStats)
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([topic, stats]) => ({ topic, ...stats }));
  
  // Identify strong topics (top 3 by frequency)
  const strongTopics = sortedTopics.slice(0, 3).map(t => t.topic);
  
  // Identify weak topics (least practiced but present)
  const weakTopics = sortedTopics.slice(-3).map(t => t.topic).reverse();
  
  // Calculate difficulty distribution
  const difficultyCount = { Easy: 0, Medium: 0, Hard: 0 };
  submissions.forEach(sub => {
    if (difficultyCount.hasOwnProperty(sub.difficulty)) {
      difficultyCount[sub.difficulty] += 1;
    }
  });
  
  // Calculate activity metrics
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentSubmissions = submissions.filter(sub => 
    new Date(sub.timestamp) >= sevenDaysAgo
  );
  
  return {
    totalSolved: submissions.length,
    recentActivity: recentSubmissions.length,
    streak: recentSubmissions.length > 0 ? 1 : 0, // Simplified streak
    strongTopics,
    weakTopics,
    topicBreakdown: topicStats,
    difficultyDistribution: difficultyCount,
    dataSource: 'leetcode', // Flag to indicate data source
    revisionRate: 0, // No revision data from LeetCode
    overdueQuestions: 0,
    topicAccuracy: sortedTopics.map(t => ({
      topic: t.topic,
      solved: t.count,
      revised: 0,
      accuracy: 0,
      lastWeekCount: t.count
    }))
  };
}
