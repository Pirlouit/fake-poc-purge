const API_URL = "https://58z52.mocklab.io/";

export function logToDashboard(text: string, ...args: any[]) {
  fetch(`${API_URL}${text}`);
}
