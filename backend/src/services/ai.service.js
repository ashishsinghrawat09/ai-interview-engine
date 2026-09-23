const { GoogleGenAI, Type } = require("@google/genai");
const { z } = require("zod");

// ======================================================
// GEMINI CLIENT
// ======================================================

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
    httpOptions: {
        timeout: 60000,
    },
});

// ======================================================
// MODELS
// ======================================================

const PRIMARY_MODEL = "gemini-3.6-flash";
const SECONDARY_MODEL = "gemini-3.5-flash-lite";

// ======================================================
// FINAL VALIDATION SCHEMA
// ======================================================

const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100),

    technicalQuestions: z.array(
        z.object({
            question: z.string().min(1),
            intention: z.string().min(1),
            answer: z.string().min(1),
        })
    ),

    behavioralQuestions: z.array(
        z.object({
            question: z.string().min(1),
            intention: z.string().min(1),
            answer: z.string().min(1),
        })
    ),

    skillsGaps: z.array(
        z.object({
            skill: z.string().min(1),
            severity: z.enum(["low", "medium", "high"]),
            type: z.string().min(1),
        })
    ),

    preparationPlan: z.array(
        z.object({
            day: z.number(),
            focus: z.string().min(1),
            tasks: z.array(z.string().min(1)),
        })
    ),

    title: z.string().min(1),
});

// ======================================================
// GEMINI JSON RESPONSE SCHEMA
// ======================================================

const geminiResponseSchema = {
    type: Type.OBJECT,

    properties: {
        matchScore: {
            type: Type.NUMBER,
        },

        technicalQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,

                properties: {
                    question: {
                        type: Type.STRING,
                    },

                    intention: {
                        type: Type.STRING,
                    },

                    answer: {
                        type: Type.STRING,
                    },
                },

                required: [
                    "question",
                    "intention",
                    "answer",
                ],
            },
        },

        behavioralQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,

                properties: {
                    question: {
                        type: Type.STRING,
                    },

                    intention: {
                        type: Type.STRING,
                    },

                    answer: {
                        type: Type.STRING,
                    },
                },

                required: [
                    "question",
                    "intention",
                    "answer",
                ],
            },
        },

        skillsGaps: {
            type: Type.ARRAY,

            items: {
                type: Type.OBJECT,

                properties: {
                    skill: {
                        type: Type.STRING,
                    },

                    severity: {
                        type: Type.STRING,
                    },

                    type: {
                        type: Type.STRING,
                    },
                },

                required: [
                    "skill",
                    "severity",
                    "type",
                ],
            },
        },

        preparationPlan: {
            type: Type.ARRAY,

            items: {
                type: Type.OBJECT,

                properties: {
                    day: {
                        type: Type.NUMBER,
                    },

                    focus: {
                        type: Type.STRING,
                    },

                    tasks: {
                        type: Type.ARRAY,

                        items: {
                            type: Type.STRING,
                        },
                    },
                },

                required: [
                    "day",
                    "focus",
                    "tasks",
                ],
            },
        },

        title: {
            type: Type.STRING,
        },
    },

    required: [
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillsGaps",
        "preparationPlan",
        "title",
    ],
};

// ======================================================
// HELPERS
// ======================================================

function getValue(object, camelCase, snakeCase) {
    if (!object || typeof object !== "object") {
        return undefined;
    }

    return object[camelCase] ?? object[snakeCase];
}

// ======================================================
// CLEAN JSON
// ======================================================

function cleanJsonText(text) {
    if (!text || typeof text !== "string") {
        return "";
    }

    let cleaned = text.trim();

    cleaned = cleaned.replace(/^```json\s*/i, "");
    cleaned = cleaned.replace(/^```\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/i, "");

    return cleaned.trim();
}

// ======================================================
// NORMALIZE QUESTION
// ======================================================

function normalizeQuestion(item) {
    if (
        item &&
        typeof item === "object" &&
        !Array.isArray(item)
    ) {
        return {
            question: String(
                item.question ||
                    item.Question ||
                    ""
            ).trim(),

            intention: String(
                item.intention ||
                    item.intent ||
                    item.purpose ||
                    ""
            ).trim(),

            answer: String(
                item.answer ||
                    item.modelAnswer ||
                    item.model_answer ||
                    item.explanation ||
                    ""
            ).trim(),
        };
    }

    return {
        question: "",
        intention: "",
        answer: "",
    };
}

// ======================================================
// NORMALIZE SKILL GAP
// ======================================================

function normalizeSkillGap(item) {
    if (
        item &&
        typeof item === "object" &&
        !Array.isArray(item)
    ) {
        const severity = String(
            item.severity || "medium"
        ).toLowerCase();

        return {
            skill: String(
                item.skill || ""
            ).trim(),

            severity: [
                "low",
                "medium",
                "high",
            ].includes(severity)
                ? severity
                : "medium",

            type: String(
                item.type || "technical"
            ).trim(),
        };
    }

    return {
        skill: "",
        severity: "medium",
        type: "technical",
    };
}

// ======================================================
// NORMALIZE PREPARATION
// ======================================================

function normalizePreparationItem(item, index) {
    if (
        item &&
        typeof item === "object" &&
        !Array.isArray(item)
    ) {
        const tasks = Array.isArray(item.tasks)
            ? item.tasks
                  .map((task) =>
                      String(task).trim()
                  )
                  .filter(Boolean)
            : [];

        return {
            day:
                Number(item.day) ||
                index + 1,

            focus: String(
                item.focus ||
                    "Interview preparation"
            ).trim(),

            tasks:
                tasks.length > 0
                    ? tasks
                    : [
                          "Practice relevant interview topics",
                      ],
        };
    }

    return {
        day: index + 1,

        focus: "Interview preparation",

        tasks: [
            "Practice relevant interview topics",
        ],
    };
}

// ======================================================
// BUILD FINAL REPORT
// ======================================================

function buildFinalReport(rawReport) {
    const rawTechnicalQuestions =
        getValue(
            rawReport,
            "technicalQuestions",
            "technical_questions"
        );

    const technicalQuestions =
        Array.isArray(
            rawTechnicalQuestions
        )
            ? rawTechnicalQuestions
                  .map(normalizeQuestion)
                  .filter(
                      (item) =>
                          item.question &&
                          item.intention &&
                          item.answer
                  )
                  .slice(0, 5)
            : [];

    const rawBehavioralQuestions =
        getValue(
            rawReport,
            "behavioralQuestions",
            "behavioral_questions"
        );

    const behavioralQuestions =
        Array.isArray(
            rawBehavioralQuestions
        )
            ? rawBehavioralQuestions
                  .map(normalizeQuestion)
                  .filter(
                      (item) =>
                          item.question &&
                          item.intention &&
                          item.answer
                  )
                  .slice(0, 3)
            : [];

    const rawSkillsGaps =
        getValue(
            rawReport,
            "skillsGaps",
            "skill_gaps"
        );

    const skillsGaps =
        Array.isArray(rawSkillsGaps)
            ? rawSkillsGaps
                  .map(normalizeSkillGap)
                  .filter(
                      (item) =>
                          item.skill
                  )
            : [];

    const rawPreparationPlan =
        getValue(
            rawReport,
            "preparationPlan",
            "preparation_plan"
        );

    const preparationPlan =
        Array.isArray(
            rawPreparationPlan
        )
            ? rawPreparationPlan
                  .map(
                      normalizePreparationItem
                  )
                  .slice(0, 7)
            : [];

    let title = String(
        getValue(
            rawReport,
            "title",
            "job_title"
        ) || ""
    ).trim();

    if (!title) {
        title = "Interview Preparation";
    }

    let matchScore = Number(
        getValue(
            rawReport,
            "matchScore",
            "match_score"
        )
    );

    if (Number.isNaN(matchScore)) {
        matchScore = 0;
    }

    matchScore = Math.max(
        0,
        Math.min(100, matchScore)
    );

    return {
        matchScore,
        technicalQuestions,
        behavioralQuestions,
        skillsGaps,
        preparationPlan,
        title,
    };
}

// ======================================================
// VALIDATE REPORT
// ======================================================

function validateReport(report) {
    const finalReport =
        buildFinalReport(report);

    if (
        finalReport
            .technicalQuestions
            .length !== 5
    ) {
        throw new Error(
            `Expected 5 technical questions, received ${finalReport.technicalQuestions.length}`
        );
    }

    if (
        finalReport
            .behavioralQuestions
            .length !== 3
    ) {
        throw new Error(
            `Expected 3 behavioral questions, received ${finalReport.behavioralQuestions.length}`
        );
    }

    if (
        finalReport
            .preparationPlan
            .length !== 7
    ) {
        throw new Error(
            `Expected 7 preparation days, received ${finalReport.preparationPlan.length}`
        );
    }

    return interviewReportSchema.parse(
        finalReport
    );
}

// ======================================================
// ERROR STATUS
// ======================================================

function getErrorStatus(error) {
    return Number(
        error?.status ||
            error?.code ||
            error?.response?.status ||
            0
    );
}

// ======================================================
// TRANSIENT ERROR?
// ======================================================

function isTransientError(error) {
    const status =
        getErrorStatus(error);

    return [
        408,
        429,
        500,
        502,
        503,
        504,
    ].includes(status);
}

// ======================================================
// GEMINI REQUEST
// ======================================================

async function callGemini({
    model,
    prompt,
    resumeBase64,
    resumeMimeType,
}) {
    console.log(
        "================================="
    );

    console.log(
        "USING GEMINI MODEL:",
        model
    );

    console.log(
        "================================="
    );

    const response =
        await ai.models.generateContent({
            model,

            contents: [
                {
                    role: "user",

                    parts: [
                        {
                            text: prompt,
                        },

                        {
                            inlineData: {
                                mimeType:
                                    resumeMimeType ||
                                    "application/pdf",

                                data: resumeBase64,
                            },
                        },
                    ],
                },
            ],

            config: {
                responseMimeType:
                    "application/json",

                responseSchema:
                    geminiResponseSchema,

                temperature: 0.2,

                maxOutputTokens: 12000,
            },
        });

    return response?.text;
}

// ======================================================
// INTERVIEW PROMPT
// ======================================================

function buildInterviewPrompt({
    selfDescription,
    jobDescription,
}) {
    return `
You are an expert technical interviewer and career preparation assistant.

You must analyze THREE sources:

SOURCE 1:
The uploaded Resume PDF.

SOURCE 2:
Candidate self description.

SOURCE 3:
Actual job description.

==================================================
IMPORTANT SOURCE RULES
==================================================

The uploaded Resume PDF is the authoritative source for the candidate.

The Resume determines:

- candidate skills
- candidate technologies
- candidate projects
- candidate internships
- candidate work experience
- candidate education
- candidate achievements
- candidate domain/background

The Job Description determines:

- target job title
- target role
- required skills
- preferred skills
- responsibilities
- technologies expected by the employer

The self description provides additional candidate context.

DO NOT assume that the candidate has a technology just because
it appears in the job description.

DO NOT invent:

- companies
- projects
- internships
- technologies
- certifications
- achievements
- experience
- education
- job history

==================================================
MOST IMPORTANT REQUIREMENT
==================================================

The generated interview MUST change when the uploaded resume changes.

Do NOT generate a generic Software Engineer interview.

Do NOT generate a generic Cyber Security interview.

Do NOT use a fixed set of questions.

Questions must be personalized using the ACTUAL uploaded resume.

If the resume belongs to a Cyber Security candidate,
questions should reflect Cyber Security experience where relevant.

If the resume belongs to a Software Engineer,
questions should reflect Software Engineering experience.

If the candidate background and target job are different,
DO NOT force the candidate into the target job.

Instead:

1. Ask questions about the candidate's real experience.
2. Ask questions about skills required by the target job.
3. Ask questions that test transferable knowledge.
4. Identify the actual gap between the candidate and target job.
5. Make the preparation plan address those gaps.

==================================================
CANDIDATE SELF DESCRIPTION
==================================================

${selfDescription}

==================================================
TARGET JOB DESCRIPTION
==================================================

${jobDescription}

==================================================
TARGET JOB IDENTIFICATION
==================================================

Identify the actual target job title from the job description.

Do NOT automatically use:

"Software Engineer"

The title must be based on the actual job description.

==================================================
TECHNICAL QUESTIONS
==================================================

Generate EXACTLY 5 technical questions.

The 5 questions should be a balanced combination of:

- candidate-specific questions
- target-job questions
- transferable-skill questions
- project/experience questions
- important technical gaps

However, NEVER invent candidate experience.

For example:

If the resume says:

Cyber Security
OWASP
Burp Suite
Nmap
Penetration Testing

and the target job says:

Software Engineer
Node.js
REST API
MongoDB

then appropriate questions may connect these areas.

For example:

"How would your OWASP experience help you secure a REST API?"

or:

"How would you implement authentication and authorization in a Node.js API?"

Do NOT simply generate:

"What is React?"

"What is Node.js?"

unless those technologies are genuinely relevant to the candidate/job comparison.

Every technical question MUST have:

{
    "question": "...",
    "intention": "...",
    "answer": "..."
}

==================================================
BEHAVIORAL QUESTIONS
==================================================

Generate EXACTLY 3.

Questions must use the candidate's actual background.

Use:

- projects
- internships
- challenges
- teamwork
- leadership
- problem solving
- learning ability
- role transition

where supported by the resume.

Never invent experience.

Every behavioral question MUST contain:

question
intention
answer

==================================================
SKILL GAPS
==================================================

Compare:

Candidate Resume
+
Self Description

against:

Target Job Description

Identify skills that are:

- missing
- weakly demonstrated
- insufficiently demonstrated
- important for the target role

Do NOT list every technology from the job description.

Focus on meaningful gaps.

Each object MUST be:

{
    "skill": "...",
    "severity": "low|medium|high",
    "type": "technical"
}

==================================================
MATCH SCORE
==================================================

Calculate a realistic score from 0 to 100.

The score must reflect the relationship between:

Candidate actual skills
and
Target job requirements.

Do NOT automatically use 60.

Do NOT automatically use 75.

Do NOT give a high score simply because the target role is common.

==================================================
PREPARATION PLAN
==================================================

Generate EXACTLY 7 days.

The preparation plan must be based on:

1. Target job requirements.
2. Candidate's actual strengths.
3. Candidate's actual skill gaps.
4. Interview questions generated above.

Do NOT use a fixed Java/React/Spring Boot plan.

If the target role is Cyber Security,
the plan should be cybersecurity-focused.

If the target role is Software Engineering,
the plan should be software-engineering-focused.

If the candidate background differs from the target role,
the plan should help bridge that difference.

Each day MUST contain:

{
    "day": 1,
    "focus": "...",
    "tasks": ["...", "..."]
}

Days must be exactly:

1
2
3
4
5
6
7

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

The JSON must contain:

{
    "matchScore": number,

    "technicalQuestions": [
        {
            "question": "...",
            "intention": "...",
            "answer": "..."
        }
    ],

    "behavioralQuestions": [
        {
            "question": "...",
            "intention": "...",
            "answer": "..."
        }
    ],

    "skillsGaps": [
        {
            "skill": "...",
            "severity": "low|medium|high",
            "type": "technical"
        }
    ],

    "preparationPlan": [
        {
            "day": 1,
            "focus": "...",
            "tasks": ["...", "..."]
        }
    ],

    "title": "actual job title"
}

==================================================
FINAL CHECK BEFORE ANSWERING
==================================================

Verify:

- Exactly 5 technical questions.
- Exactly 3 behavioral questions.
- Exactly 7 preparation days.
- Every technical question has question, intention and answer.
- Every behavioral question has question, intention and answer.
- Every skill gap is an object.
- Every preparation day is an object.
- Title comes from the actual job description.
- Questions are based on the uploaded resume.
- No candidate experience has been invented.
- No fixed Software Engineer questions are being used.
- No fixed Cyber Security questions are being used.
- Skill gaps are based on resume vs job description.
- Preparation plan is based on the actual target role.
- Return ONLY JSON.
`;
}

// ======================================================
// SINGLE GEMINI ATTEMPT
// ======================================================

async function runGeminiAttempt({
    model,
    prompt,
    resumeBase64,
    resumeMimeType,
}) {
    const responseText =
        await callGemini({
            model,
            prompt,
            resumeBase64,
            resumeMimeType,
        });

    if (!responseText) {
        throw new Error(
            "Gemini returned an empty response"
        );
    }

    const cleanedText =
        cleanJsonText(responseText);

    let rawReport;

    try {
        rawReport =
            JSON.parse(cleanedText);
    } catch (error) {
        throw new Error(
            `Gemini returned invalid JSON: ${error.message}`
        );
    }

    return validateReport(
        rawReport
    );
}

// ======================================================
// GENERATE INTERVIEW REPORT
// ======================================================

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription,
}) {
    // ==================================================
    // VALIDATION
    // ==================================================

    if (!resume) {
        throw new Error(
            "Resume PDF is required"
        );
    }

    if (
        !selfDescription ||
        !selfDescription.trim()
    ) {
        throw new Error(
            "Self description is required"
        );
    }

    if (
        !jobDescription ||
        !jobDescription.trim()
    ) {
        throw new Error(
            "Job description is required"
        );
    }

    if (
        !process.env.GOOGLE_GENAI_API_KEY
    ) {
        throw new Error(
            "GOOGLE_GENAI_API_KEY is missing"
        );
    }

    // ==================================================
    // RESUME BUFFER
    // ==================================================

    if (!resume.buffer) {
        throw new Error(
            "Resume file buffer is missing"
        );
    }

    const resumeBase64 =
        resume.buffer.toString("base64");

    const resumeMimeType =
        resume.mimetype ||
        "application/pdf";

    console.log(
        "================================="
    );

    console.log(
        "AI SERVICE: GENERATING INTERVIEW"
    );

    console.log(
        "================================="
    );

    console.log(
        "RESUME:",
        resume.originalname ||
            "resume.pdf"
    );

    console.log(
        "MIME TYPE:",
        resumeMimeType
    );

    console.log(
        "RESUME BASE64 CREATED"
    );

    // ==================================================
    // PROMPT
    // ==================================================

    const prompt =
        buildInterviewPrompt({
            selfDescription,
            jobDescription,
        });

    // ==================================================
    // ATTEMPT 1
    // PRIMARY MODEL
    // ==================================================

    let lastError = null;

    try {
        console.log(
            "================================="
        );

        console.log(
            "GEMINI ATTEMPT 1"
        );

        console.log(
            "MODEL:",
            PRIMARY_MODEL
        );

        console.log(
            "================================="
        );

        const report =
            await runGeminiAttempt({
                model: PRIMARY_MODEL,
                prompt,
                resumeBase64,
                resumeMimeType,
            });

        console.log(
            "================================="
        );

        console.log(
            "GEMINI PRIMARY SUCCESS"
        );

        console.log(
            "================================="
        );

        return report;
    } catch (error) {
        lastError = error;

        const status =
            getErrorStatus(error);

        console.error(
            "GEMINI ATTEMPT 1 FAILED"
        );

        console.error(
            "MESSAGE:",
            error?.message ||
                error
        );

        console.error(
            "STATUS:",
            status || "UNKNOWN"
        );

        // ==================================================
        // NON-TRANSIENT 404
        // ==================================================

        if (status === 404) {
            console.error(
                "PRIMARY MODEL NOT AVAILABLE."
            );

            console.log(
                "Trying secondary model..."
            );
        }

        // ==================================================
        // TRANSIENT ERROR
        // ==================================================

        if (isTransientError(error)) {
            console.log(
                "TRANSIENT GEMINI ERROR."
            );

            console.log(
                "Waiting 1500ms before secondary attempt..."
            );

            await new Promise(
                (resolve) =>
                    setTimeout(
                        resolve,
                        1500
                    )
            );
        }
    }

    // ==================================================
    // ATTEMPT 2
    // SECONDARY MODEL
    // ==================================================

    try {
        console.log(
            "================================="
        );

        console.log(
            "GEMINI ATTEMPT 2"
        );

        console.log(
            "MODEL:",
            SECONDARY_MODEL
        );

        console.log(
            "================================="
        );

        const report =
            await runGeminiAttempt({
                model:
                    SECONDARY_MODEL,

                prompt,

                resumeBase64,

                resumeMimeType,
            });

        console.log(
            "================================="
        );

        console.log(
            "GEMINI SECONDARY SUCCESS"
        );

        console.log(
            "================================="
        );

        return report;
    } catch (error) {
        lastError = error;

        console.error(
            "GEMINI ATTEMPT 2 FAILED"
        );

        console.error(
            "MESSAGE:",
            error?.message ||
                error
        );

        console.error(
            "STATUS:",
            getErrorStatus(error) ||
                "UNKNOWN"
        );
    }

    // ==================================================
    // IMPORTANT
    // ==================================================
    //
    // DO NOT RETURN A FAKE SOFTWARE ENGINEER REPORT.
    //
    // The old code did this:
    //
    // Gemini failed
    //      ↓
    // hardcoded SWE fallback
    //
    // That caused Cyber Security resumes to receive
    // Software Engineer questions.
    //
    // Instead, throw the real AI error.
    //
    // ==================================================

    const status =
        getErrorStatus(lastError);

    const finalError =
        new Error(
            "Interview generation failed because both Gemini attempts failed."
        );

    finalError.status =
        status || 503;

    finalError.cause =
        lastError;

    throw finalError;
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    generateInterviewReport,
};