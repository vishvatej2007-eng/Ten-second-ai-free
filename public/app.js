const form = document.querySelector("#form"), 
      promptEl = document.querySelector("#prompt"), 
      statusEl = document.querySelector("#status"),
      videoEl = document.querySelector("#video");

function status(msg, type="") {
  if (statusEl) {
    statusEl.textContent = msg;
    statusEl.className = `status ${type}`;
  }
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const prompt = promptEl.value.trim();
  if (!prompt) return status("Please enter a prompt.", "error");

  status("Generating video (this may take a moment)...", "loading");

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-pin": "9876" // Replace with your exact Render APP_PIN value
      },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Generation failed.");

    status("Video generated successfully!", "success");
    if (videoEl && data.videoUrl) {
      videoEl.src = data.videoUrl;
      videoEl.parentElement.classList.remove("hidden");
    }
  } catch (err) {
    status(err.message, "error");
  }
});
