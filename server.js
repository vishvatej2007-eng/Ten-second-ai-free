import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;
const SPACE = "https://lightricks-ltx-video-distilled.hf.space";
app.use(express.json({ limit: "50mb" }));
// PIN Protection
const APP_PIN = process.env.APP_PIN || "1234";

app.use((req, res, next) => {
  if (req.path === "/" || req.path.startsWith("/public")) return next();
  const userPin = req.headers["x-app-pin"];
  if (userPin !== APP_PIN) {
    return res.status(401).json({ error: "Unauthorized: Invalid PIN" });
  }
  next();
});


function parseResult(raw) {
  const blocks = raw.split("\n\n").filter(Boolean).reverse();
  for (const block of blocks) {
    const event = block.match(/^event:\s*(\S+)/m)?.[1];
    const data = block.match(/^data:\s*(.+)$/m)?.[1];
    if (!event || !data) continue;
    if (event === "error") throw new Error("The free model reported an error. Try again later.");
    if (event === "complete") {
      const payload = JSON.parse(data);
      const video = payload?.[0]?.video?.url;
      if (!video) throw new Error("The free model did not return a video URL.");
      return { videoUrl: video };
    }
  }
  throw new Error("The free model timed out. Try again later.");
}

app.get("/api/status", (_req, res) => {
  res.json({
    mode: "free-shared-model",
    provider: "Hugging Face public LTX-Video Space",
    paidApiKeyRequired: false,
    caveat: "Shared free GPU capacity; queue, rate limits and availability can vary."
  });
});

app.post('/api/generate', async (req, res) => {
  try {
    const prompt = String(req.body.prompt || '').trim();
    const duration = Number(req.body.duration || 5);
    const aspect = String(req.body.aspect || '16:9');
    const image = req.body.image || null; // Captured base64 image

    if (!prompt) return res.status(400).json({ error: "Enter a prompt first." });
    if (!Number.isFinite(duration) || duration < 3 || duration > 8) {
      return res.status(400).json({ error: "This free model supports about 3-8 seconds. Choose 5 or 8 seconds." });
    }

    const [w, h] = aspect === '9:16' ? [512, 704] : aspect === '1:1' ? [576, 576] : [704, 512];
    const headers = { "Content-Type": "application/json" };
    if (process.env.HF_TOKEN) headers.Authorization = `Bearer ${process.env.HF_TOKEN}`;

    // Switch endpoint & payload based on whether an image was provided
    const endpoint = image ? `${SPACE}/gradio_api/call/image_to_video` : `${SPACE}/gradio_api/call/text_to_video`;
    
    const requestData = image ? [
      image, // input image
      prompt,
      "worst quality, blurry, distorted, watermark",
      h,
      w,
      duration,
      0,
      Math.floor(Math.random() * 1000000000),
      true,
      1,
      true
    ] : [
      prompt,
      "worst quality, blurry, distorted, watermark",
      "",
      h,
      w,
      "text-to-video",
      duration,
      0,
      Math.floor(Math.random() * 1000000000),
      true,
      1,
      true
    ];

    const submit = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ data: requestData }),
      signal: AbortSignal.timeout(30000)
    });

    if (!submit.ok) throw new Error(`Free model is busy or unavailable (HTTP ${submit.status}). Try again in a few minutes.`);
    const { event_id } = await submit.json();
    if (!event_id) throw new Error("The free model did not provide a job ID.");

    const result = await fetch(`${endpoint}/${event_id}`, {
      headers,
      signal: AbortSignal.timeout(300000)
    });

    if (!result.ok || !result.body) throw new Error("Lost connection to the free model. Please try again.");
    const raw = await result.text();
    const videoUrl = parseResult(raw);
    res.json({ videoUrl });
  } catch (e) {
    res.status(502).json({ error: e.message || "Free video generation failed. Try again." });
  }
});
