const sessionKey = "admin-session";

const readAdminSession = () => {
  try {
    const savedSession = localStorage.getItem(sessionKey);
    return savedSession ? JSON.parse(savedSession) : null;
  } catch {
    return null;
  }
};

const saveAdminSession = (session) => {
  try {
    localStorage.setItem(sessionKey, JSON.stringify(session));
  } catch {
    // Ignore storage issues in the browser.
  }
};

const clearAdminSession = () => {
  try {
    localStorage.removeItem(sessionKey);
  } catch {
    // Ignore storage issues in the browser.
  }
};

export { clearAdminSession, readAdminSession, saveAdminSession };
