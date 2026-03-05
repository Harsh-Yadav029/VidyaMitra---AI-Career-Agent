const { sendEmail } = require("./mailer");
const { welcomeEmail, scoreReportEmail, interviewResultEmail, jobMatchEmail } = require("./templates");

const sendWelcomeEmail = async (user) => {
  const { subject, html } = welcomeEmail({ name: user.name });
  return sendEmail({ to: user.email, subject, html });
};

const sendScoreReportEmail = async (user, resumeLabel, scores) => {
  const { subject, html } = scoreReportEmail({ name: user.name, resumeLabel, scores });
  return sendEmail({ to: user.email, subject, html });
};

const sendInterviewResultEmail = async (user, sessionData) => {
  const { subject, html } = interviewResultEmail({
    name: user.name,
    targetRole: sessionData.targetRole,
    overallScore: sessionData.overallScore,
    totalQuestions: sessionData.answers?.length || 0,
    answers: sessionData.answers,
  });
  return sendEmail({ to: user.email, subject, html });
};

const sendJobMatchEmail = async (user, targetRole, jobs) => {
  const { subject, html } = jobMatchEmail({ name: user.name, targetRole, jobs });
  return sendEmail({ to: user.email, subject, html });
};

module.exports = { sendWelcomeEmail, sendScoreReportEmail, sendInterviewResultEmail, sendJobMatchEmail };