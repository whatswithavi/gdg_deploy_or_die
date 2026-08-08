const codeInput = document.getElementById("code-input");
const reviewBtn = document.getElementById("review-btn");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");

reviewBtn.addEventListener("click", async () => {
  const code = codeInput.value;
  resultsEl.innerHTML = "";

  if (!code.trim()) {
    statusEl.textContent = "Paste some code first.";
    return;
  }

  statusEl.textContent = "Reviewing...";
  reviewBtn.disabled = true;

  try {
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();

    if (!res.ok) {
      statusEl.textContent = `Error: ${data.error || "review failed"}`;
      return;
    }

    if (!data.issues || data.issues.length === 0) {
      statusEl.textContent = "No issues found.";
      return;
    }

    statusEl.textContent = `${data.issues.length} issue(s) found.`;
    renderIssues(data.issues);
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
  } finally {
    reviewBtn.disabled = false;
  }
});

function renderIssues(issues) {
  for (const issue of issues) {
    const li = document.createElement("li");
    li.dataset.severity = issue.severity;
    li.innerHTML = `
      <span class="badge">${escapeHtml(issue.severity)} · ${escapeHtml(issue.category)}</span>
      ${issue.line != null ? `<span>line ${escapeHtml(String(issue.line))}</span>` : ""}
      <div>${escapeHtml(issue.description)}</div>
      <div class="suggestion">Suggestion: ${escapeHtml(issue.suggestion)}</div>
    `;
    resultsEl.appendChild(li);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
