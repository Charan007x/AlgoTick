const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const {
  fetchLeetCodeProblem,
  processQuestionInput,
  getUserSubmissions,
  checkSubmissionOnDate,
  checkSubmissionAfterDate,
  getUserActivitySummary,
} = require("../services/leetcodeService");
const {
  getDashboardStatsCached,
  refreshDashboardStatsCache,
} = require("../services/dashboardStatsService");
const {
  getQuestionsListCache,
  setQuestionsListCache,
  delQuestionsListCache,
  getLeetCodeActivityCache,
  setLeetCodeActivityCache,
} = require("../services/cacheService");

// All routes require authentication
router.use(authMiddleware);

// @route   POST /api/questions
// @desc    Add a new question
// @access  Private
router.post("/", async (req, res) => {
  try {
    const { url, titleSlug, questionNumber, notes } = req.body;

    if (!url && !titleSlug && !questionNumber) {
      return res
        .status(400)
        .json({
          message:
            "Please provide question number, LeetCode URL, or title slug",
        });
    }

    // Process input (question number, URL, or slug) to get title slug
    const input = questionNumber || url || titleSlug;
    const slug = await processQuestionInput(input);

    // Fetch problem details from LeetCode API
    const leetcodeData = await fetchLeetCodeProblem(slug);

    // Check if question already exists for this user (including deleted ones)
    const existingQuestion = await Question.findOne({
      userId: req.user.id,
      questionId: leetcodeData.questionId,
    });

    if (existingQuestion) {
      // If question was deleted, restore it
      if (existingQuestion.isDeleted) {
        existingQuestion.isDeleted = false;
        existingQuestion.isRevised = false;
        existingQuestion.notes = notes || existingQuestion.notes;
        existingQuestion.dateAdded = new Date(); // Update dateAdded for verification

        // Set new reminders
        existingQuestion.setReminders();

        await existingQuestion.save();
        await refreshDashboardStatsCache(req.user.id);
        await delQuestionsListCache(req.user.id);

        return res.status(200).json({
          message: "Question restored successfully",
          question: existingQuestion,
        });
      }

      return res
        .status(400)
        .json({ message: "You have already added this question" });
    }

    // Create new question
    const newQuestion = new Question({
      userId: req.user.id,
      title: leetcodeData.title,
      questionId: leetcodeData.questionId,
      difficulty: leetcodeData.difficulty,
      tags: leetcodeData.tags,
      url: leetcodeData.url,
      notes: notes || "",
    });

    // Set reminder dates
    newQuestion.setReminders();

    await newQuestion.save();
    await refreshDashboardStatsCache(req.user.id);
    await delQuestionsListCache(req.user.id);

    res.status(201).json({
      message: "Question added successfully",
      question: newQuestion,
    });
  } catch (error) {
    console.error("Add question error:", error);
    res.status(500).json({
      message: "Failed to add question",
      error: error.message,
    });
  }
});

// @route   GET /api/questions
// @desc    Get all questions for logged-in user
// @access  Private
router.get("/", async (req, res) => {
  try {
    const { filter, sortBy, revisedTimeFilter } = req.query;

    const cached = await getQuestionsListCache(
      req.user.id,
      filter,
      sortBy,
      revisedTimeFilter,
    );
    if (cached) {
      return res.json(cached);
    }

    let query = { userId: req.user.id, isDeleted: false };

    // Apply filters
    if (filter === "pending") {
      query.isRevised = false;
    } else if (filter === "revised") {
      query.isRevised = true;

      // Apply time filter for revised questions
      if (revisedTimeFilter && revisedTimeFilter !== "all") {
        const now = new Date();
        let startDate;

        if (revisedTimeFilter === "today") {
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
        } else if (revisedTimeFilter === "week") {
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
        } else if (revisedTimeFilter === "month") {
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 1);
        }

        if (startDate) {
          query.revisedDates = { $elemMatch: { $gte: startDate } };
        }
      }
    } else if (filter === "due-today") {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      query.nextReminders = { $elemMatch: { $lte: today } };
      query.isRevised = false;
    } else if (filter === "due-week") {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(23, 59, 59, 999);
      query.nextReminders = { $elemMatch: { $lte: nextWeek } };
      query.isRevised = false;
    } else if (filter === "due-soon") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.nextReminders = { $elemMatch: { $lte: tomorrow } };
      query.isRevised = false;
    } else if (filter === "overdue") {
      const today = new Date();
      query.nextReminders = { $elemMatch: { $lt: today } };
      query.isRevised = false;
    }

    // Sorting
    let sortOption = { dateAdded: -1 }; // Default: newest first
    if (sortBy === "oldest") {
      sortOption = { dateAdded: 1 };
    } else if (sortBy === "difficulty") {
      sortOption = { difficulty: 1 };
    } else if (sortBy === "next-reminder") {
      sortOption = { "nextReminders.0": 1 };
    }

    const questions = await Question.find(query).sort(sortOption);

    const payload = { questions };
    await setQuestionsListCache(
      req.user.id,
      filter,
      sortBy,
      revisedTimeFilter,
      questions,
    );
    res.json(payload);
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({ message: "Failed to retrieve questions" });
  }
});

// @route   GET /api/questions/stats/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get("/stats/dashboard", async (req, res) => {
  try {
    const userId = req.user.id;
    const { revisedTimeFilter } = req.query;
    const payload = await getDashboardStatsCached(userId, revisedTimeFilter);
    res.json(payload);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve dashboard statistics" });
  }
});

// @route   GET /api/questions/leetcode-activity
// @desc    Get user's LeetCode activity summary
// @access  Private
router.get("/leetcode-activity", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.leetcodeUsername) {
      return res.status(400).json({
        message: "Please set your LeetCode username first",
        needsUsername: true,
      });
    }

    // Check if force refresh is requested
    const forceRefresh = req.query.refresh === "true";

    if (!forceRefresh) {
      const cached = await getLeetCodeActivityCache(req.user.id);
      if (cached) {
        return res.json(cached);
      }
    }

    console.log(
      "Fetching LeetCode activity for user:",
      user.leetcodeUsername,
      "Force refresh:",
      forceRefresh,
    );
    const activity = await getUserActivitySummary(
      user.leetcodeUsername,
      req.user.id,
      forceRefresh,
    );

    const payload = {
      leetcodeUsername: user.leetcodeUsername,
      activity,
      cached: !forceRefresh,
    };
    await setLeetCodeActivityCache(req.user.id, payload);
    res.json(payload);
  } catch (error) {
    console.error("LeetCode activity error:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: error.message || "Failed to fetch LeetCode activity",
      error: error.message,
    });
  }
});

// @route   GET /api/questions/:id
// @desc    Get single question by ID
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ question });
  } catch (error) {
    console.error("Get question error:", error);
    res.status(500).json({ message: "Failed to retrieve question" });
  }
});

// @route   PUT /api/questions/:id/revise
// @desc    Mark question as revised (with verification)
// @access  Private
router.put("/:id/revise", async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Get user's LeetCode username
    const user = await User.findById(req.user.id);

    if (!user.leetcodeUsername) {
      return res.status(400).json({
        message: "Please set your LeetCode username in Settings first",
        needsUsername: true,
      });
    }

    // Extract title slug from URL
    const titleSlug = question.url.match(/problems\/([^\/]+)/)?.[1];

    if (!titleSlug) {
      return res.status(400).json({ message: "Invalid question URL" });
    }

    // VERIFY: Check if submission was made AFTER adding the question
    const verificationResult = await checkSubmissionAfterDate(
      user.leetcodeUsername,
      titleSlug,
      question.dateAdded,
    );

    if (!verificationResult.verified) {
      return res.status(400).json({
        message: "Verification failed: " + verificationResult.reason,
        verified: false,
        reason: verificationResult.reason,
        submissions: verificationResult.submissions,
      });
    }

    // If verified, mark as revised
    question.markRevised();
    await question.save();
    await refreshDashboardStatsCache(req.user.id);
    await delQuestionsListCache(req.user.id);

    console.log(`✅ Verified and marked as revised: "${question.title}"`);

    res.json({
      message: "Question verified and marked as revised",
      verified: true,
      question,
    });
  } catch (error) {
    console.error("Revise question error:", error);
    res.status(500).json({ message: "Failed to mark question as revised" });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update question notes
// @access  Private
router.put("/:id", async (req, res) => {
  try {
    const { notes } = req.body;

    const question = await Question.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { notes },
      { new: true },
    );

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({ message: "Failed to update question" });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Soft delete a question (keeps data for future re-adding)
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const question = await Question.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        isDeleted: true,
      },
      { new: true },
    );

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    await refreshDashboardStatsCache(req.user.id);
    await delQuestionsListCache(req.user.id);
    res.json({ message: "Question removed successfully" });
  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).json({ message: "Failed to remove question" });
  }
});

// @route   POST /api/questions/:id/verify-submission
// @desc    Verify if user completed the problem on LeetCode AFTER adding it to tracker
// @access  Private
router.post("/:id/verify-submission", async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Get user's LeetCode username
    const user = await User.findById(req.user.id);

    if (!user.leetcodeUsername) {
      return res.status(400).json({
        message: "Please set your LeetCode username first",
        needsUsername: true,
      });
    }

    // Extract title slug from URL
    const titleSlug = question.url.match(/problems\/([^\/]+)/)?.[1];

    if (!titleSlug) {
      return res.status(400).json({ message: "Invalid question URL" });
    }

    // CRITICAL: Check submissions made AFTER the question was added to tracker
    const verificationResult = await checkSubmissionAfterDate(
      user.leetcodeUsername,
      titleSlug,
      question.dateAdded, // Only count submissions after this date
    );

    // UPDATE: If verified, mark the question as revised
    if (verificationResult.verified && !question.isRevised) {
      question.markRevised();
      await question.save();
      await refreshDashboardStatsCache(req.user.id);
      console.log(`✅ Question "${question.title}" marked as revised`);
    }

    res.json({
      verified: verificationResult.verified,
      reason: verificationResult.reason,
      question: {
        id: question._id,
        title: question.title,
        titleSlug: titleSlug,
        addedOn: question.dateAdded,
        isRevised: question.isRevised,
      },
      submissions: verificationResult.submissions,
      latestSubmission: verificationResult.latestSubmission,
      totalValidSubmissions: verificationResult.totalSubmissionsAfterDate || 0,
    });
  } catch (error) {
    console.error("Verify submission error:", error);
    res.status(500).json({ message: "Failed to verify submission" });
  }
});

// @route   POST /api/questions/bulk-verify
// @desc    Verify submissions for all pending questions (only after they were added)
// @access  Private
router.post("/bulk-verify", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.leetcodeUsername) {
      return res.status(400).json({
        message: "Please set your LeetCode username first",
        needsUsername: true,
      });
    }

    // Get all pending questions
    const pendingQuestions = await Question.find({
      userId: req.user.id,
      isRevised: false,
    });

    const verificationResults = [];
    let updatedCount = 0;

    for (const question of pendingQuestions) {
      const titleSlug = question.url.match(/problems\/([^\/]+)/)?.[1];

      if (titleSlug) {
        // CRITICAL: Only check submissions made AFTER the question was added
        const result = await checkSubmissionAfterDate(
          user.leetcodeUsername,
          titleSlug,
          question.dateAdded, // Only count submissions after adding to tracker
        );

        // UPDATE: If verified, mark the question as revised
        if (result.verified) {
          question.markRevised();
          await question.save();
          updatedCount++;
          console.log(
            `✅ Bulk verify: Question "${question.title}" marked as revised`,
          );
        }

        verificationResults.push({
          questionId: question._id,
          title: question.title,
          verified: result.verified,
          reason: result.reason,
          addedOn: question.dateAdded,
          latestSubmission: result.latestSubmission,
          totalValidSubmissions: result.totalSubmissionsAfterDate || 0,
          updated: result.verified,
        });
      }
    }

    const verifiedCount = verificationResults.filter((r) => r.verified).length;

    if (updatedCount > 0) {
      await refreshDashboardStatsCache(req.user.id);
    }

    res.json({
      total: pendingQuestions.length,
      verified: verifiedCount,
      notVerified: pendingQuestions.length - verifiedCount,
      updated: updatedCount,
      results: verificationResults,
    });
  } catch (error) {
    console.error("Bulk verify error:", error);
    res.status(500).json({ message: "Failed to verify submissions" });
  }
});

module.exports = router;
