import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

// ======================================================
// GENERATE INTERVIEW REPORT
// ======================================================

export const generateInterviewReport = async ({
  jobDescription,
  selfDescription,
  resumeFile,
}) => {
  const formData = new FormData();

  formData.append("jobDescription", jobDescription);
  formData.append("selfDescription", selfDescription);

  // Resume upload remains
  if (resumeFile) {
    formData.append("resume", resumeFile);
  }

  const response = await api.post(
    "/api/interview/generate",
    formData
  );

  console.log(
    "INTERVIEW API RESPONSE:",
    response.data
  );

  return response.data;
};

// ======================================================
// GET INTERVIEW REPORT BY ID
// ======================================================

export const generateInterviewReportById = async (
  interviewId
) => {
  const response = await api.get(
    `/api/interview/report/${interviewId}`
  );

  return response.data;
};

// ======================================================
// GET ALL INTERVIEW REPORTS
// ======================================================

export const getAllInterviewReports = async () => {
  const response = await api.get(
    "/api/interview"
  );

  return response.data;
};