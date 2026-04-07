const chatWindow = document.getElementById("chatWindow");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const sampleButtons = document.querySelectorAll(".sample-button");
const clearButton = document.getElementById("clearButton");
const typingIndicator = document.getElementById("typingIndicator");
const toggleDetailsBtn = document.getElementById("toggleDetails");
const executionPanel = document.getElementById("executionPanel");
const logsPanel = document.getElementById("logsPanel");
const timelineContainer = document.getElementById("timelineContainer");
const logsOutput = document.getElementById("logsOutput");
const STORAGE_KEY = "travelbuddy_chat_history";

let showingDetails = false;

toggleDetailsBtn.addEventListener("click", () => {
  showingDetails = !showingDetails;
  toggleDetailsBtn.textContent = showingDetails ? "Ẩn" : "Chi tiết";
  executionPanel.classList.toggle("hidden", !showingDetails);
  logsPanel.classList.toggle("hidden", !showingDetails);
});

const renderTimeline = (timeline) => {
  timelineContainer.innerHTML = "";
  if (!timeline || timeline.length === 0) {
    timelineContainer.innerHTML = "<p style='color: var(--accent-soft); font-size: 0.9rem;'>Không có bước nào</p>";
    return;
  }

  timeline.forEach((step) => {
    const stepEl = document.createElement("div");
    stepEl.className = `timeline-step ${step.type}`;
    stepEl.innerHTML = `
      <div class="step-label">Bước ${step.step}: ${step.label}</div>
      <div class="step-detail">${step.details}</div>
    `;
    timelineContainer.appendChild(stepEl);
  });
};


const createMessage = (text, role, timestamp = null) => {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;
  const label = role === "user" ? "Bạn" : "TravelBuddy";
  const timeText = timestamp ? `<div class="meta">${timestamp}</div>` : "";
  wrapper.innerHTML = `
    <span class="label">${label}</span>
    <div>${text.replace(/\n/g, "<br />")}</div>
    ${timeText}
  `;
  return wrapper;
};

const scrollToBottom = () => {
  chatWindow.scrollTop = chatWindow.scrollHeight;
};

const setTyping = (isTyping) => {
  typingIndicator.style.display = isTyping ? "inline-block" : "none";
  sendButton.disabled = isTyping;
};

const saveHistory = (history) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

const loadHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
};

const renderHistory = () => {
  chatWindow.innerHTML = "";
  const history = loadHistory();

  history.forEach((entry) => {
    chatWindow.appendChild(createMessage(entry.text, entry.role, entry.timestamp));
  });

  scrollToBottom();
};

const appendMessage = (text, role, save = true) => {
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  chatWindow.appendChild(createMessage(text, role, timestamp));
  scrollToBottom();

  if (save) {
    const history = loadHistory();
    history.push({ text, role, timestamp });
    saveHistory(history);
  }
};

const clearChat = () => {
  localStorage.removeItem(STORAGE_KEY);
  renderHistory();

  // Gọi API để clear session trên server
  fetch("/api/clear", { method: "POST" })
    .then(() => {
      appendMessage("Bắt đầu cuộc hội thoại mới. Mình có thể giúp gì?", "assistant");
    })
    .catch(() => {
      appendMessage("Bắt đầu cuộc hội thoại mới. Mình có thể giúp gì?", "assistant");
    });
};

const sendChat = async () => {
  const text = messageInput.value.trim();
  if (!text) {
    return;
  }

  appendMessage(text, "user");
  messageInput.value = "";
  messageInput.focus();
  setTyping(true);
  appendMessage("TravelBuddy đang suy nghĩ...", "assistant", false);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await response.json();
    const assistantMessages = chatWindow.querySelectorAll(".message.assistant");
    const placeholder = assistantMessages[assistantMessages.length - 1];

    if (!response.ok) {
      placeholder.innerHTML = `<span class="label">TravelBuddy</span><div>Xin lỗi, đã xảy ra lỗi: ${data.error || response.statusText}</div>`;
      setTyping(false);
      return;
    }

    placeholder.innerHTML = `<span class="label">TravelBuddy</span><div>${data.reply.replace(/\n/g, "<br />")}</div><div class="meta">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>`;

    // Lưu history
    const history = loadHistory();
    history.push({ text: data.reply, role: "assistant", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
    saveHistory(history);

    // Hiển thị timeline và logs nếu có
    if (data.timeline && data.timeline.length > 0) {
      renderTimeline(data.timeline);
      if (!showingDetails) {
        toggleDetailsBtn.click();
      }
    }
    
    if (data.logs) {
      logsOutput.textContent = data.logs;
    }
  } catch (error) {
    const assistantMessages = chatWindow.querySelectorAll(".message.assistant");
    const placeholder = assistantMessages[assistantMessages.length - 1];
    placeholder.innerHTML = `<span class="label">TravelBuddy</span><div>Không thể kết nối đến server. Vui lòng thử lại.</div>`;
  } finally {
    setTyping(false);
  }
};

const resizeTextarea = () => {
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 180)}px`;
};

messageInput.addEventListener("input", resizeTextarea);

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendChat();
  }
});

sendButton.addEventListener("click", sendChat);
clearButton.addEventListener("click", () => {
  clearChat();
  appendMessage("Bắt đầu cuộc hội thoại mới. Mình có thể giúp gì?", "assistant");
});

sampleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    messageInput.value = button.dataset.text;
    resizeTextarea();
    messageInput.focus();
  });
});

window.addEventListener("load", () => {
  renderHistory();
  if (!loadHistory().length) {
    appendMessage("Xin chào! Mình là TravelBuddy. Hãy bắt đầu bằng cách hỏi về hành trình du lịch của bạn.", "assistant");
  }
});
