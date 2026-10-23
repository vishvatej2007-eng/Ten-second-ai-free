const form = document.querySelector("#form"), 
      promptEl = document.querySelector("#prompt"), 
      statusEl = document.querySelector("#status"),
      videoEl = document.querySelector("#video"),
      imageInput = document.querySelector("#imageInput");

function status(msg, type="") {
  if (statusEl) {
    statusEl.textContent = msg;
    statusEl.className = `status ${type}`;
  }
}

// Helper to convert uploaded file to Base64
const fileToBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

form.addEventListener("submit", async e => {
  e.preventDefault();
  const prompt = promptEl.value.trim();
  if (!prompt) return status("Please enter a prompt.", "error");

  status("Processing reference image & generating video...", "loading");

  try {
    let imageBase64 = null;
    if (imageInput && imageInput.files && imageInput.files[0]) {
      imageBase64 = await fileToBase64(imageInput.files[0]);
    }

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-pin": "9876" // Your Render APP_PIN
      },
      body: JSON.stringify({ 
        prompt, 
        image: imageBase64 
      })
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

