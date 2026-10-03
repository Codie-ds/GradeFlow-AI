// API client — all calls go through here
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function request(method, path, body, isFormData = false) {
  const opts = {
    method,
    headers: isFormData ? {} : { "Content-Type": "application/json" },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  };
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // Assignments
  listAssignments: () => request("GET", "/assignments"),
  getAssignment: (id) => request("GET", `/assignments/${id}`),
  createAssignment: (body) => request("POST", "/assignments", body),
  generateRubric: (id) => request("POST", `/assignments/${id}/rubric/generate`),

  // Submissions
  uploadSubmission: (assignmentId, studentName, file) => {
    const fd = new FormData();
    fd.append("student_name", studentName);
    fd.append("file", file);
    return request("POST", `/assignments/${assignmentId}/submissions`, fd, true);
  },
  getSubmission: (id) => request("GET", `/submissions/${id}`),
  listSubmissions: (assignmentId) =>
    request("GET", `/submissions${assignmentId ? `?assignment_id=${assignmentId}` : ""}`),
};
