const { generateInterviewReport } = require("../services/ai.service");

const InterviewReportModel = require("../models/interviewReport.model");

// ======================================================
// GENERATE INTERVIEW REPORT
// ======================================================

const generateInterviewReportController = async (req, res) => {
    try {
        console.log("INTERVIEW CONTROLLER HIT");

        // ==================================================
        // REQUEST DATA
        // ==================================================

        const {
            selfDescription,
            jobDescription,
        } = req.body || {};

        const resume = req.file;

        console.log("JOB DESCRIPTION RECEIVED:");
        console.log(jobDescription);

        console.log("SELF DESCRIPTION RECEIVED:");
        console.log(selfDescription);

        console.log("RESUME RECEIVED:");
        console.log(
            resume
                ? resume.originalname
                : "NO RESUME"
        );

        // ==================================================
        // VALIDATION
        // ==================================================

        if (!resume) {
            return res.status(400).json({
                success: false,
                message: "Resume PDF is required",
            });
        }

        if (
            !selfDescription ||
            !selfDescription.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Self description is required",
            });
        }

        if (
            !jobDescription ||
            !jobDescription.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Job description is required",
            });
        }

        // ==================================================
        // GENERATE AI REPORT
        // ==================================================

        const report =
            await generateInterviewReport({
                resume,
                selfDescription,
                jobDescription,
            });

        console.log("RAW AI REPORT:");

        console.log(
            JSON.stringify(
                report,
                null,
                2
            )
        );

        // ==================================================
        // SAFETY NORMALIZATION
        // ==================================================

        const normalizedReport = {
            jobDescription:
                jobDescription.trim(),

            selfDescription:
                selfDescription.trim(),

            title:
                report?.title ||
                "Software Engineer",

            matchScore:
                typeof report?.matchScore ===
                "number"
                    ? report.matchScore
                    : 0,

            technicalQuestions:
                Array.isArray(
                    report?.technicalQuestions
                )
                    ? report.technicalQuestions.map(
                          (item) => ({
                              question:
                                  item?.question ||
                                  "",

                              intention:
                                  item?.intention ||
                                  "",

                              answer:
                                  item?.answer ||
                                  "",
                          })
                      )
                    : [],

            behavioralQuestions:
                Array.isArray(
                    report?.behavioralQuestions
                )
                    ? report.behavioralQuestions.map(
                          (item) => ({
                              question:
                                  item?.question ||
                                  "",

                              intention:
                                  item?.intention ||
                                  "",

                              answer:
                                  item?.answer ||
                                  "",
                          })
                      )
                    : [],

            skillsGaps:
                Array.isArray(
                    report?.skillsGaps
                )
                    ? report.skillsGaps.map(
                          (item) => ({
                              skill:
                                  item?.skill ||
                                  "",

                              severity:
                                  item?.severity ||
                                  "medium",

                              type:
                                  item?.type ||
                                  "technical",
                          })
                      )
                    : [],

            preparationPlan:
                Array.isArray(
                    report?.preparationPlan
                )
                    ? report.preparationPlan.map(
                          (item, index) => ({
                              day:
                                  Number(
                                      item?.day
                                  ) ||
                                  index + 1,

                              focus:
                                  item?.focus ||
                                  "",

                              tasks:
                                  Array.isArray(
                                      item?.tasks
                                  )
                                      ? item.tasks.map(
                                            (task) =>
                                                String(
                                                    task
                                                )
                                      )
                                      : [],
                          })
                      )
                    : [],
        };

        console.log(
            "NORMALIZED REPORT:"
        );

        console.log(
            JSON.stringify(
                normalizedReport,
                null,
                2
            )
        );

        // ==================================================
        // FINAL DATA VALIDATION
        // ==================================================

        if (
            normalizedReport
                .technicalQuestions
                .length !== 5
        ) {
            throw new Error(
                `Expected 5 technical questions, received ${normalizedReport.technicalQuestions.length}`
            );
        }

        if (
            normalizedReport
                .behavioralQuestions
                .length !== 3
        ) {
            throw new Error(
                `Expected 3 behavioral questions, received ${normalizedReport.behavioralQuestions.length}`
            );
        }

        if (
            normalizedReport
                .preparationPlan
                .length !== 7
        ) {
            throw new Error(
                `Expected 7 preparation days, received ${normalizedReport.preparationPlan.length}`
            );
        }

        // ==================================================
        // SAVE TO MONGODB
        // ==================================================

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message:
                    "Unauthorized user",
            });
        }

        const savedReport =
            await InterviewReportModel.create({
                ...normalizedReport,
                user: req.user.id,
            });

        console.log(
            "REPORT SAVED IN MONGODB:"
        );

        console.log(savedReport);

        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({
            success: true,

            message:
                "Interview report generated and saved successfully",

            report: savedReport,
        });
    } catch (error) {
        console.error(
            "Generate Interview Report Error:"
        );

        console.error(error);

        return res.status(500).json({
            success: false,

            message:
                error?.message ||
                "Failed to generate interview report",
        });
    }
};

// ======================================================
// GET ALL INTERVIEW REPORTS
// ======================================================

const getAllInterviewReportsController = async (
    req,
    res
) => {
    try {
        console.log(
            "GET ALL INTERVIEW REPORTS CONTROLLER HIT"
        );

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message:
                    "Unauthorized user",
            });
        }

        const reports =
            await InterviewReportModel.find({
                user: req.user.id,
            })
                .sort({
                    createdAt: -1,
                })
                .limit(6);

        return res.status(200).json({
            success: true,
            reports,
        });
    } catch (error) {
        console.error(
            "Get All Interview Reports Error:"
        );

        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch interview reports",
        });
    }
};

// ======================================================
// GET INTERVIEW REPORT BY ID
// ======================================================

const getInterviewByIdController = async (
    req,
    res
) => {
    try {
        const {
            interviewId,
        } = req.params;

        console.log(
            "GET INTERVIEW BY ID:",
            interviewId
        );

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message:
                    "Unauthorized user",
            });
        }

        const interviewReport =
            await InterviewReportModel.findOne({
                _id: interviewId,
                user: req.user.id,
            });

        if (!interviewReport) {
            return res.status(404).json({
                success: false,
                message:
                    "Interview report not found.",
            });
        }

        return res.status(200).json({
            success: true,

            message:
                "Interview report fetched successfully.",

            report: interviewReport,
        });
    } catch (error) {
        console.error(
            "Get Interview By ID Error:"
        );

        console.error(error);

        return res.status(500).json({
            success: false,

            message:
                error?.message ||
                "Failed to fetch interview report",
        });
    }
};

// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {
    generateInterviewReportController,
    getAllInterviewReportsController,
    getInterviewByIdController,
};
