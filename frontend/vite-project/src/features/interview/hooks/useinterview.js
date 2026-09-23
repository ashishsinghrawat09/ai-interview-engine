import { useContext } from "react";

import { interviewContext } from "../interview.context";

import {
  generateInterviewReport,
  generateInterviewReportById,
  getAllInterviewReports,
} from "../services/interview.api";

export const useInterview = () => {
  const context = useContext(interviewContext);

  if (!context) {
    throw new Error(
      "useInterview must be used inside InterviewProvider"
    );
  }

  const { interviewReport } = context;

  const generateReport = async (formData) => {
    try {
      const response = await generateInterviewReport(formData);

      console.log("GENERATE INTERVIEW RESPONSE:", response);

      return response;
    } catch (error) {
      console.error("Generate Interview Error:", error);
      throw error;
    }
  };

  const getReports = async () => {
    try {
      const response = await getAllInterviewReports();

      console.log("ALL INTERVIEW REPORTS:", response);

      return response;
    } catch (error) {
      console.error("Get Interview Reports Error:", error);
      throw error;
    }
  };

  const getReportById = async (id) => {
    try {
      const response = await generateInterviewReportById(id);

      console.log("INTERVIEW REPORT BY ID:", response);

      return response;
    } catch (error) {
      console.error("Get Interview By ID Error:", error);
      throw error;
    }
  };

  return {
    interviewReport,
    generateReport,
    getReports,
    getReportById,
  };
};   