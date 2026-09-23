import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import { useNavigate } from "react-router";

import "../style/home.scss";

import { useInterview } from "../hooks/useinterview.js";

const Home = () => {
    const {
        generateReport,
        getReports,
    } = useInterview();

    const navigate = useNavigate();

    const [jobDescription, setJobDescription] =
        useState("");

    const [selfDescription, setSelfDescription] =
        useState("");

    const [resume, setResume] =
        useState(null);

    const [isGenerating, setIsGenerating] =
        useState(false);

    const [recentInterviews, setRecentInterviews] =
        useState([]);

    const [isLoadingReports, setIsLoadingReports] =
        useState(true);

    const resumeInputRef =
        useRef(null);

    // =====================================================
    // FETCH RECENT INTERVIEWS
    // =====================================================

    const loadRecentInterviews = async () => {
        try {
            setIsLoadingReports(true);

            const data = await getReports();

            console.log(
                "RECENT INTERVIEWS RESPONSE:",
                data
            );

            const reports =
                Array.isArray(data)
                    ? data
                    : data?.reports ||
                      data?.data?.reports ||
                      data?.interviews ||
                      data?.data?.interviews ||
                      [];

            const sortedReports = [...reports].sort(
                (a, b) => {
                    const dateA = new Date(
                        a?.createdAt ||
                            a?.generatedAt ||
                            a?.updatedAt ||
                            0
                    );

                    const dateB = new Date(
                        b?.createdAt ||
                            b?.generatedAt ||
                            b?.updatedAt ||
                            0
                    );

                    return dateB - dateA;
                }
            );

            setRecentInterviews(
                sortedReports.slice(0, 6)
            );
        } catch (error) {
            console.error(
                "Failed to load recent interviews:",
                error
            );

            setRecentInterviews([]);
        } finally {
            setIsLoadingReports(false);
        }
    };

    // =====================================================
    // LOAD REPORTS
    // =====================================================

    useEffect(() => {
        loadRecentInterviews();
    }, []);

    // =====================================================
    // RESUME CHANGE
    // =====================================================

    const handleResumeChange = (event) => {
        const file =
            event.target.files?.[0] || null;

        if (!file) {
            setResume(null);
            return;
        }

        // Only PDF allowed
        if (
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            alert("Please upload a PDF resume only.");

            event.target.value = "";
            setResume(null);

            return;
        }

        setResume(file);

        console.log(
            "RESUME SELECTED:",
            file.name
        );
    };

    // =====================================================
    // GENERATE INTERVIEW REPORT
    // =====================================================

    const handleGenerateReport = async () => {
        // ==========================================
        // VALIDATION
        // ==========================================

        if (!jobDescription.trim()) {
            alert(
                "Please enter job description"
            );
            return;
        }

        if (!selfDescription.trim()) {
            alert(
                "Please enter your self description"
            );
            return;
        }

        const resumeFile =
            resumeInputRef.current?.files?.[0];

        if (!resumeFile) {
            alert(
                "Please upload your resume PDF"
            );
            return;
        }

        // ==========================================
        // GENERATE REPORT
        // ==========================================

        try {
            setIsGenerating(true);

            console.log(
                "STARTING INTERVIEW GENERATION..."
            );

            console.log(
                "RESUME:",
                resumeFile.name
            );

            const data =
                await generateReport({
                    jobDescription,
                    selfDescription,
                    resumeFile,
                });

            console.log(
                "GENERATE REPORT RESPONSE:",
                data
            );

            // ==========================================
            // GET REPORT
            // ==========================================

            const report =
                data?.report ||
                data?.data?.report ||
                data;

            const reportId =
                report?._id ||
                report?.id;

            // ==========================================
            // NAVIGATE
            // ==========================================

            if (reportId) {
                navigate(
                    `/interview/${reportId}`,
                    {
                        state: {
                            report,
                            jobDescription,
                            selfDescription,
                        },
                    }
                );

                return;
            }

            console.error(
                "Interview report ID not found:",
                data
            );

            alert(
                "Interview generated, but report ID was not received."
            );
        } catch (error) {
            console.error(
                "Interview Generation Error:",
                error
            );

            console.error(
                "ERROR RESPONSE:",
                error?.response?.data
            );

            alert(
                error?.response?.data?.message ||
                    error?.message ||
                    "Failed to generate interview. Please try again."
            );
        } finally {
            setIsGenerating(false);
        }
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "Recently";
        }

        const date = new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "Recently";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =====================================================
    // GET TITLE
    // =====================================================

    const getInterviewTitle = (report) => {
        return (
            report?.title ||
            report?.jobTitle ||
            report?.job_title ||
            "Software Engineer"
        );
    };

    // =====================================================
    // GET SCORE
    // =====================================================

    const getMatchScore = (report) => {
        const score =
            report?.matchScore ??
            report?.score ??
            report?.match_score;

        if (
            score === undefined ||
            score === null
        ) {
            return "--";
        }

        return `${score}%`;
    };

    // =====================================================
    // OPEN EXISTING REPORT
    // =====================================================

    const handleViewReport = (report) => {
        const reportId =
            report?._id ||
            report?.id;

        if (!reportId) {
            alert(
                "Interview report ID not found."
            );

            return;
        }

        navigate(
            `/interview/${reportId}`,
            {
                state: {
                    report,
                },
            }
        );
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <main className="home">

            {/* Background decoration */}

            <div className="background-glow glow-one"></div>

            <div className="background-glow glow-two"></div>

            {/* ==========================================
                GENERATE INTERVIEW
            ========================================== */}

            <div className="interview-input-group">

                {/* LEFT SIDE */}

                <div className="left">

                    <div className="brand-badge">
                        <span className="status-dot"></span>

                        AI INTERVIEW ENGINE
                    </div>

                    <h1>
                        Turn your resume into
                        <span>
                            interview confidence.
                        </span>
                    </h1>

                    <p className="hero-description">
                        Get personalized technical and
                        behavioral interview preparation
                        powered by AI.
                    </p>

                    <div className="section-label">
                        <span>01</span>
                        JOB DESCRIPTION
                    </div>

                    <textarea
                        name="jobDescription"
                        placeholder="Paste the job description here..."
                        value={jobDescription}
                        onChange={(e) =>
                            setJobDescription(
                                e.target.value
                            )
                        }
                    />

                    <div className="hint">
                        ✦ Add the complete job description
                        for better analysis
                    </div>
                </div>

                {/* RIGHT SIDE */}

                <div className="right">

                    <div className="right-header">

                        <div>

                            <div className="section-label">
                                <span>02</span>
                                CANDIDATE PROFILE
                            </div>

                            <h2>
                                Let's prepare you
                                <span>
                                    properly.
                                </span>
                            </h2>

                        </div>

                        <div className="ai-orb">
                            <div className="orb-core"></div>
                        </div>

                    </div>

                    {/* =====================================
                        RESUME
                    ===================================== */}

                    <div className="input-group">

                        <label
                            className="file-label"
                            htmlFor="resume"
                        >

                            <div className="upload-icon">
                                ↑
                            </div>

                            <div className="upload-content">

                                <strong>
                                    {resume
                                        ? resume.name
                                        : "Upload your resume"}
                                </strong>

                                <small>
                                    PDF files only · AI will
                                    analyze your profile
                                </small>

                            </div>

                            <div className="upload-arrow">
                                →
                            </div>

                        </label>

                        <input
                            ref={resumeInputRef}
                            type="file"
                            name="resume"
                            id="resume"
                            accept=".pdf,application/pdf"
                            onChange={
                                handleResumeChange
                            }
                        />

                        {/* Selected resume info */}

                        {resume && (
                            <div
                                className="resume-selected"
                                style={{
                                    marginTop: "10px",
                                    fontSize: "13px",
                                }}
                            >
                                ✓ Resume selected:
                                {" "}
                                <strong>
                                    {resume.name}
                                </strong>
                            </div>
                        )}

                    </div>

                    {/* =====================================
                        SELF DESCRIPTION
                    ===================================== */}

                    <div className="input-group">

                        <label htmlFor="selfDescription">

                            <span className="label-number">
                                03
                            </span>

                            SELF DESCRIPTION

                        </label>

                        <textarea
                            name="selfDescription"
                            id="selfDescription"
                            placeholder="Tell the AI about yourself, your skills, projects, experience and career goals..."
                            value={selfDescription}
                            onChange={(e) =>
                                setSelfDescription(
                                    e.target.value
                                )
                            }
                        ></textarea>

                    </div>

                    {/* =====================================
                        GENERATE BUTTON
                    ===================================== */}

                    <button
                        type="button"
                        onClick={
                            handleGenerateReport
                        }
                        className="generate-btn"
                        disabled={isGenerating}
                    >

                        <span className="button-glow"></span>

                        <span className="button-content">

                            <span className="sparkle">
                                ✦
                            </span>

                            {isGenerating
                                ? "Generating Interview..."
                                : "Generate My Interview"}

                            <span className="button-arrow">
                                →
                            </span>

                        </span>

                    </button>

                    <div className="secure-note">
                        <span>●</span>

                        Your information is processed
                        securely
                    </div>

                </div>

            </div>

            {/* ==========================================
                RECENT INTERVIEWS
            ========================================== */}

            <section className="recent-interviews">

                <div className="recent-header">

                    <div>

                        <div className="section-label">
                            <span>04</span>
                            YOUR ACTIVITY
                        </div>

                        <h2>
                            Recent Interviews
                        </h2>

                        <p>
                            Your latest AI-generated
                            interview reports.
                        </p>

                    </div>

                    {recentInterviews.length > 0 && (
                        <button
                            className="refresh-btn"
                            type="button"
                            onClick={
                                loadRecentInterviews
                            }
                        >
                            ↻ Refresh
                        </button>
                    )}

                </div>

                {/* LOADING */}

                {isLoadingReports ? (

                    <div className="recent-empty">

                        <div className="recent-loader"></div>

                        <p>
                            Loading your recent
                            interviews...
                        </p>

                    </div>

                ) : recentInterviews.length ===
                  0 ? (

                    /* EMPTY STATE */

                    <div className="recent-empty">

                        <div className="empty-icon">
                            ✦
                        </div>

                        <h3>
                            No interviews yet
                        </h3>

                        <p>
                            Generate your first AI
                            interview and it will
                            appear here.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                window.scrollTo({
                                    top: 0,
                                    behavior:
                                        "smooth",
                                })
                            }
                        >
                            Generate First Interview
                            →
                        </button>

                    </div>

                ) : (

                    /* INTERVIEW CARDS */

                    <div className="recent-grid">

                        {recentInterviews.map(
                            (report, index) => (

                                <article
                                    className="recent-card"
                                    key={
                                        report?._id ||
                                        report?.id ||
                                        index
                                    }
                                >

                                    <div className="recent-card-top">

                                        <div className="recent-card-icon">

                                            {String(
                                                index + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}

                                        </div>

                                        <span className="recent-badge">

                                            {index === 0
                                                ? "LATEST"
                                                : "INTERVIEW"}

                                        </span>

                                    </div>

                                    <h3>
                                        {getInterviewTitle(
                                            report
                                        )}
                                    </h3>

                                    <div className="recent-meta">

                                        <div>

                                            <span>
                                                MATCH
                                            </span>

                                            <strong>
                                                {getMatchScore(
                                                    report
                                                )}
                                            </strong>

                                        </div>

                                        <div>

                                            <span>
                                                GENERATED
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    report?.createdAt ||
                                                    report?.generatedAt ||
                                                    report?.updatedAt
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        className="view-report-btn"
                                        onClick={() =>
                                            handleViewReport(
                                                report
                                            )
                                        }
                                    >

                                        View Report

                                        <span>
                                            →
                                        </span>

                                    </button>

                                </article>

                            )
                        )}

                    </div>

                )}

            </section>

        </main>
    );
};

export default Home;