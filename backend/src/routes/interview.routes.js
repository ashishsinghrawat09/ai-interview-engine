const express = require("express");

const {
    generateInterviewReportController,
    getAllInterviewReportsController,
    getInterviewByIdController,
} = require("../controllers/interview.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");

const router = express.Router();

// ======================================================
// GENERATE INTERVIEW REPORT
// ======================================================

router.post(
    "/generate",
    authMiddleware,
    upload.single("resume"),
    generateInterviewReportController
);

// ======================================================
// GET ALL INTERVIEW REPORTS
// ======================================================

router.get(
    "/",
    authMiddleware,
    getAllInterviewReportsController
);

// ======================================================
// GET INTERVIEW REPORT BY ID
// ======================================================

router.get(
    "/report/:interviewId",
    authMiddleware,
    getInterviewByIdController
);

module.exports = router;

