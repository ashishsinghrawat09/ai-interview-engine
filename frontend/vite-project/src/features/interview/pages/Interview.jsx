import React, { useState } from "react";

import { useLocation } from "react-router";

import "../style/interview.scss";

const Interview = () => {
    const location = useLocation();

    const report = location.state?.report;

    const [activeSection, setActiveSection] =
        useState("technical");

    const [openQuestion, setOpenQuestion] =
        useState(null);

    if (!report) {
        return (
            <main className="interview">
                <div className="interview-error">
                    <h2>Interview data not found</h2>

                    <p>
                        Please generate your interview again
                        from the Home page.
                    </p>
                </div>
            </main>
        );
    }

    // ===============================
    // REPORT DATA
    // ===============================

    const technicalQuestions =
        report.technicalQuestions || [];

    const behavioralQuestions =
        report.behavioralQuestions || [];

    const roadmap =
        report.preparationPlan || [];

    const matchScore =
        report.matchScore ??
        report.score ??
        report.match_score ??
        null;

    const skillGaps =
        report.skillsGaps ||
        report.skillGaps ||
        report.skill_gaps ||
        [];

    // ===============================
    // TOGGLE QUESTION
    // ===============================

    const toggleQuestion = (index) => {
        setOpenQuestion(
            openQuestion === index
                ? null
                : index
        );
    };

    // ===============================
    // RENDER QUESTIONS
    // ===============================

    const renderQuestions = (questions) => {
        if (!questions.length) {
            return (
                <div className="no-data">
                    No questions available.
                </div>
            );
        }

        return (
            <div className="questions-list">
                {questions.map(
                    (question, index) => (
                        <div
                            className={`question-card ${
                                openQuestion === index
                                    ? "open"
                                    : ""
                            }`}
                            key={index}
                            onClick={() =>
                                toggleQuestion(index)
                            }
                        >
                            <div className="question-top">
                                <span className="question-number">
                                    Q
                                    {String(
                                        index + 1
                                    ).padStart(
                                        2,
                                        "0"
                                    )}
                                </span>

                                <span className="question-text">
                                    {typeof question ===
                                    "string"
                                        ? question
                                        : question.question}
                                </span>

                                <span className="question-arrow">
                                    {openQuestion ===
                                    index
                                        ? "⌃"
                                        : "⌄"}
                                </span>
                            </div>

                            {openQuestion ===
                                index && (
                                <div className="question-answer">
                                    {typeof question ===
                                        "object" &&
                                        question.intention && (
                                            <div className="answer-block">
                                                <strong>
                                                    INTENTION
                                                </strong>

                                                <p>
                                                    {
                                                        question.intention
                                                    }
                                                </p>
                                            </div>
                                        )}

                                    {typeof question ===
                                        "object" &&
                                        question.answer && (
                                            <div className="answer-block">
                                                <strong>
                                                    MODEL ANSWER
                                                </strong>

                                                <p>
                                                    {
                                                        question.answer
                                                    }
                                                </p>
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
        );
    };

    // ===============================
    // RENDER ROADMAP
    // ===============================

    const renderRoadmap = () => {
        if (
            !roadmap ||
            roadmap.length === 0
        ) {
            return (
                <div className="no-data">
                    No roadmap available.
                </div>
            );
        }

        return (
            <div className="roadmap-list">
                {roadmap.map(
                    (item, index) => (
                        <div
                            className="roadmap-item"
                            key={index}
                        >
                            <div className="roadmap-dot">
                                {item.day ||
                                    index + 1}
                            </div>

                            <div className="roadmap-content">
                                {typeof item ===
                                "string" ? (
                                    <p>{item}</p>
                                ) : (
                                    <>
                                        <h3>
                                            {item.focus ||
                                                `Day ${
                                                    item.day ||
                                                    index +
                                                        1
                                                }`}
                                        </h3>

                                        {item.tasks &&
                                            Array.isArray(
                                                item.tasks
                                            ) && (
                                                <ul>
                                                    {item.tasks.map(
                                                        (
                                                            task,
                                                            taskIndex
                                                        ) => (
                                                            <li
                                                                key={
                                                                    taskIndex
                                                                }
                                                            >
                                                                {
                                                                    task
                                                                }
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            )}
                                    </>
                                )}
                            </div>
                        </div>
                    )
                )}
            </div>
        );
    };

    // ===============================
    // RETURN
    // ===============================

    return (
        <main className="interview">
            <div className="interview-container">

                {/* LEFT SIDEBAR */}

                <aside className="interview-sidebar">
                    <div className="sidebar-heading">
                        SECTIONS
                    </div>

                    <button
                        className={`sidebar-item ${
                            activeSection ===
                            "technical"
                                ? "active"
                                : ""
                        }`}
                        onClick={() => {
                            setActiveSection(
                                "technical"
                            );

                            setOpenQuestion(null);
                        }}
                    >
                        <span className="sidebar-icon">
                            &lt;/&gt;
                        </span>

                        Technical Questions
                    </button>

                    <button
                        className={`sidebar-item ${
                            activeSection ===
                            "behavioral"
                                ? "active"
                                : ""
                        }`}
                        onClick={() => {
                            setActiveSection(
                                "behavioral"
                            );

                            setOpenQuestion(null);
                        }}
                    >
                        <span className="sidebar-icon">
                            □
                        </span>

                        Behavioral Questions
                    </button>

                    <button
                        className={`sidebar-item ${
                            activeSection ===
                            "roadmap"
                                ? "active"
                                : ""
                        }`}
                        onClick={() => {
                            setActiveSection(
                                "roadmap"
                            );

                            setOpenQuestion(null);
                        }}
                    >
                        <span className="sidebar-icon">
                            ◇
                        </span>

                        Road Map
                    </button>
                </aside>

                {/* CENTER */}

                <section className="interview-main">

                    {activeSection ===
                        "technical" && (
                        <>
                            <div className="content-header">
                                <div>
                                    <h1>
                                        Technical Questions
                                    </h1>

                                    <span className="question-count">
                                        {
                                            technicalQuestions.length
                                        }{" "}
                                        questions
                                    </span>
                                </div>
                            </div>

                            {renderQuestions(
                                technicalQuestions
                            )}
                        </>
                    )}

                    {activeSection ===
                        "behavioral" && (
                        <>
                            <div className="content-header">
                                <div>
                                    <h1>
                                        Behavioral Questions
                                    </h1>

                                    <span className="question-count">
                                        {
                                            behavioralQuestions.length
                                        }{" "}
                                        questions
                                    </span>
                                </div>
                            </div>

                            {renderQuestions(
                                behavioralQuestions
                            )}
                        </>
                    )}

                    {activeSection ===
                        "roadmap" && (
                        <>
                            <div className="content-header">
                                <div>
                                    <h1>
                                        Preparation Road Map
                                    </h1>

                                    <span className="question-count">
                                        Personalized plan
                                    </span>
                                </div>
                            </div>

                            {renderRoadmap()}
                        </>
                    )}
                </section>

                {/* RIGHT SIDEBAR */}

                <aside className="interview-right">

                    <div className="score-section">
                        <h3>
                            MATCH SCORE
                        </h3>

                        <div className="score-circle">
                            <div className="score-value">
                                {matchScore !==
                                null
                                    ? matchScore
                                    : "--"}
                            </div>

                            {matchScore !==
                                null && (
                                <span>%</span>
                            )}
                        </div>

                        <p className="score-text">
                            {matchScore !==
                            null
                                ? "Strong match for this role"
                                : "Analysis completed"}
                        </p>
                    </div>

                    <div className="skill-gap-section">
                        <h3>
                            SKILL GAPS
                        </h3>

                        {skillGaps.length >
                        0 ? (
                            <div className="skill-gap-list">
                                {skillGaps.map(
                                    (
                                        skill,
                                        index
                                    ) => (
                                        <div
                                            className={`skill-gap skill-${
                                                index %
                                                4
                                            }`}
                                            key={
                                                index
                                            }
                                        >
                                            {typeof skill ===
                                            "string"
                                                ? skill
                                                : skill.skill ||
                                                  skill.name ||
                                                  skill.title ||
                                                  "Skill gap"}
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="no-skills">
                                No major skill
                                gaps detected.
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </main>
    );
};

export default Interview;