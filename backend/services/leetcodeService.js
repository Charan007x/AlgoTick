const axios = require('axios');
const { LeetCodeProblemCache, LeetCodeUserStatsCache } = require('../models/LeetCodeCache');

/**
 * Fetch problem details from LeetCode API (internal function)
 * @param {string} titleSlug - The URL slug of the problem (e.g., "two-sum")
 * @returns {object} Problem details including title, difficulty, tags
 */
async function fetchLeetCodeProblemFromAPI(titleSlug) {
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
 * Fetch problem details from database first, fallback to API
 * @param {string} titleSlug - The URL slug of the problem (e.g., "two-sum")
 * @returns {object} Problem details including title, difficulty, tags
 */
async function fetchLeetCodeProblem(titleSlug) {
  try {
    // First, check if problem exists in cache
    let cachedProblem = await LeetCodeProblemCache.findOne({ titleSlug });
    
    if (cachedProblem) {
      console.log(`✅ Problem found in cache: ${titleSlug}`);
      return {
        questionId: cachedProblem.questionId,
        title: cachedProblem.title,
        titleSlug: cachedProblem.titleSlug,
        difficulty: cachedProblem.difficulty,
        tags: cachedProblem.tags,
        url: cachedProblem.url
      };
    }

    // If not in cache, fetch from API
    console.log(`⚠️ Problem not in cache, fetching from API: ${titleSlug}`);
    const problemData = await fetchLeetCodeProblemFromAPI(titleSlug);

    // Store in cache for future use
    try {
      await LeetCodeProblemCache.create({
        questionId: problemData.questionId,
        title: problemData.title,
        titleSlug: problemData.titleSlug,
        difficulty: problemData.difficulty,
        tags: problemData.tags,
        url: problemData.url,
        lastFetched: new Date()
      });
      console.log(`💾 Problem cached: ${titleSlug}`);
    } catch (cacheError) {
      // If caching fails (e.g., duplicate), just log and continue
      console.log(`⚠️ Failed to cache problem (may already exist): ${cacheError.message}`);
    }

    return problemData;
  } catch (error) {
    console.error('Error fetching LeetCode problem:', error.message);
    throw error;
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
 * Get user's recent activity summary from LeetCode API (internal function)
 * @param {string} leetcodeUsername - LeetCode username
 * @returns {object} Activity summary
 */
async function getUserActivitySummaryFromAPI(leetcodeUsername) {
  try {
    console.log('Fetching LeetCode stats from API for username:', leetcodeUsername);
    
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
            userCalendar {
              streak
              totalActiveDays
              submissionCalendar
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

    if (response.data && response.data.data && response.data.data.matchedUser) {
      const user = response.data.data.matchedUser;
      const stats = user.submitStats.acSubmissionNum;
      const calendar = user.userCalendar;
      
      // Parse submission calendar (it's a JSON string)
      let submissionCalendar = {};
      if (calendar && calendar.submissionCalendar) {
        try {
          submissionCalendar = JSON.parse(calendar.submissionCalendar);
        } catch (e) {
          console.error('Error parsing submission calendar:', e);
        }
      }
      
      return {
        username: user.username,
        realName: user.profile?.realName || null,
        ranking: user.profile?.ranking || null,
        totalSolved: stats.find(s => s.difficulty === 'All')?.count || 0,
        easySolved: stats.find(s => s.difficulty === 'Easy')?.count || 0,
        mediumSolved: stats.find(s => s.difficulty === 'Medium')?.count || 0,
        hardSolved: stats.find(s => s.difficulty === 'Hard')?.count || 0,
        streak: calendar?.streak || 0,
        totalActiveDays: calendar?.totalActiveDays || 0,
        submissionCalendar: submissionCalendar
      };
    }

    console.log('matchedUser not found in response.');
    throw new Error('User not found on LeetCode');
  } catch (error) {
    console.error('Error fetching user activity from API:', error.message);
    if (error.response) {
      console.error('LeetCode API error response:', error.response.status, error.response.data);
    }
    throw new Error(error.message || 'Failed to fetch user activity from LeetCode');
  }
}

/**
 * Get user's recent activity summary from database first, fallback to API
 * @param {string} leetcodeUsername - LeetCode username
 * @param {string} userId - User's database ID (optional, for better caching)
 * @param {boolean} forceRefresh - Force fetch from API even if cache is valid
 * @returns {object} Activity summary
 */
async function getUserActivitySummary(leetcodeUsername, userId = null, forceRefresh = false) {
  try {
    // Build query - prefer userId lookup if available
    let query = userId 
      ? { userId } 
      : { leetcodeUsername };

    // First, check if stats exist in cache
    let cachedStats = await LeetCodeUserStatsCache.findOne(query);
    
    if (cachedStats && cachedStats.isValid() && !forceRefresh) {
      console.log(`✅ User stats found in cache: ${leetcodeUsername}`);
      return cachedStats.stats;
    }

    // If not in cache or cache is invalid, fetch from API
    console.log(`⚠️ User stats not in cache or expired, fetching from API: ${leetcodeUsername}`);
    const statsData = await getUserActivitySummaryFromAPI(leetcodeUsername);

    // Store/update in cache for future use - use delete and create to ensure complete replacement
    try {
      // Delete old cache if exists to ensure complete replacement
      if (userId) {
        await LeetCodeUserStatsCache.deleteOne({ userId });
      } else {
        await LeetCodeUserStatsCache.deleteOne({ leetcodeUsername });
      }
      
      // Create fresh cache entry
      const cacheData = {
        leetcodeUsername,
        stats: statsData,
        lastFetched: new Date()
      };
      
      if (userId) {
        cacheData.userId = userId;
      }
      
      await LeetCodeUserStatsCache.create(cacheData);
      console.log(`💾 User stats cache REPLACED: ${leetcodeUsername} (${statsData.totalSolved} solved)`);
    } catch (cacheError) {
      // If caching fails, just log and continue
      console.log(`⚠️ Failed to cache user stats: ${cacheError.message}`);
    }

    return statsData;
  } catch (error) {
    console.error('Error fetching user activity summary:', error.message);
    throw error;
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
  getUserActivitySummaryFromAPI // Export for cron job use
};
