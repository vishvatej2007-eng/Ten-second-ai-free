# TenSeconds AI — Free edition

This Android-friendly PWA prototype uses the public Lightricks LTX-Video Distilled Hugging Face Space for text-to-video generation. It does not use Replicate or another paid video API.

## What works
- Text-to-video prompt form
- 5-second and 8-second clips
- Landscape, vertical, and square aspect ratios
- Video preview and save/open links
- No paid video API key required

## Important limitations
- This version currently supports **text-to-video only**. Image-to-video is not implemented in this free edition.
- The public Hugging Face Space uses shared GPU capacity. It can be slow, rate-limited, paused, or unavailable. This is not unlimited or guaranteed.
- No monthly paid API bill is expected from the code as written, but third-party policies may change.
- Optional `HF_TOKEN` is a free Hugging Face read token, not a paid API key.
- This app needs a Node.js server. A static-only host cannot run the backend. Hosting itself may or may not be free depending on the provider and plan.

## Run
Requires Node.js 20+.
1. Extract ZIP.
2. Run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:3000`.

Optional token: copy `.env.example` to `.env` and set `HF_TOKEN`, then make sure your hosting setup loads environment variables. Never put tokens in `public/app.js`.

## Deploy on Android
Deploy to a Node.js-capable host over HTTPS. Open its URL in Chrome on Android and choose ⋮ → Add to Home screen / Install app. This creates an installable web app shortcut, not a native APK.

## Free model details
Uses the public Gradio queue API for `https://lightricks-ltx-video-distilled.hf.space`, API name `text_to_video`. The public Space can change without notice. Reference implementation: https://github.com/umer-un/prompt-to-video
