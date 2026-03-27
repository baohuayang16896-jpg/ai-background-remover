/**
 * Cloudflare Worker - Image Background Remover
 * Uses Remove.bg API, no storage required
 */

// HTML 页面
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Background Remover - Free Online Tool</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem;
    }
    .container {
      width: 100%;
      max-width: 800px;
    }
    h1 {
      text-align: center;
      color: white;
      font-size: 2.2rem;
      margin-bottom: 0.5rem;
      font-weight: 800;
    }
    .subtitle {
      text-align: center;
      color: rgba(255,255,255,0.85);
      margin-bottom: 2rem;
      font-size: 1.05rem;
    }
    .card {
      background: white;
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .drop-zone {
      border: 2.5px dashed #c0c8ff;
      border-radius: 16px;
      padding: 3rem 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      background: #f7f8ff;
      margin-bottom: 1.5rem;
    }
    .drop-zone:hover, .drop-zone.drag-over {
      border-color: #667eea;
      background: #eff1ff;
    }
    .drop-zone .icon { font-size: 3.5rem; margin-bottom: 1rem; }
    .drop-zone h3 { color: #333; margin-bottom: 0.5rem; font-size: 1.2rem; }
    .drop-zone p { color: #888; font-size: 0.9rem; }
    .drop-zone input { display: none; }

    .btn {
      width: 100%;
      padding: 1rem;
      border: none;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .btn-download {
      background: linear-gradient(135deg, #43e97b, #38f9d7);
      color: white;
      margin-top: 1rem;
      text-decoration: none;
      display: block;
      text-align: center;
    }
    .btn-download:hover { opacity: 0.9; transform: translateY(-1px); }

    .preview-section {
      display: none;
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    .preview-section.visible { display: grid; grid-template-columns: 1fr 1fr; }
    .preview-box { text-align: center; }
    .preview-box h4 { margin-bottom: 0.8rem; color: #555; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
    .preview-box img {
      width: 100%;
      border-radius: 12px;
      border: 1px solid #eee;
      max-height: 300px;
      object-fit: contain;
      background: repeating-conic-gradient(#e0e0e0 0% 25%, white 0% 50%) 0 0 / 20px 20px;
    }

    .status {
      text-align: center;
      padding: 1rem;
      border-radius: 10px;
      margin-top: 1rem;
      font-weight: 600;
      display: none;
    }
    .status.loading { background: #fff3cd; color: #856404; display: block; }
    .status.error { background: #f8d7da; color: #721c24; display: block; }
    .status.success { background: #d4edda; color: #155724; display: block; }

    .spinner {
      display: inline-block;
      width: 16px; height: 16px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      vertical-align: middle;
      margin-right: 6px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 2rem;
    }
    .feature {
      text-align: center;
      padding: 1rem;
      background: #f7f8ff;
      border-radius: 12px;
    }
    .feature .icon { font-size: 2rem; margin-bottom: 0.5rem; }
    .feature p { font-size: 0.82rem; color: #666; margin-top: 0.3rem; }
    .feature h4 { font-size: 0.9rem; color: #333; }

    @media (max-width: 600px) {
      .preview-section.visible { grid-template-columns: 1fr; }
      .features { grid-template-columns: 1fr; }
      h1 { font-size: 1.6rem; }
    }

    .selected-info {
      background: #f0f4ff;
      border-radius: 10px;
      padding: 0.8rem 1rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: #445;
      display: none;
    }
    .selected-info.visible { display: flex; align-items: center; gap: 0.5rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎨 AI Background Remover</h1>
    <p class="subtitle">Remove image backgrounds instantly — free, fast, no signup required</p>

    <div class="card">
      <div class="drop-zone" id="dropZone">
        <div class="icon">🖼️</div>
        <h3>Drag & drop your image here</h3>
        <p>or click to select a file</p>
        <p style="margin-top:0.5rem; font-size:0.8rem;">Supports JPG, PNG, WebP — up to 10MB</p>
        <input type="file" id="fileInput" accept="image/jpeg,image/png,image/webp">
      </div>

      <div class="selected-info" id="selectedInfo">
        📁 <span id="fileName"></span>
      </div>

      <button class="btn btn-primary" id="removeBtn" disabled onclick="removeBg()">
        ✨ Remove Background
      </button>

      <div class="status" id="status"></div>

      <div class="preview-section" id="previewSection">
        <div class="preview-box">
          <h4>Original</h4>
          <img id="originalImg" src="" alt="Original">
        </div>
        <div class="preview-box">
          <h4>Background Removed</h4>
          <img id="resultImg" src="" alt="Result">
        </div>
      </div>

      <a class="btn btn-download" id="downloadBtn" style="display:none" download="background-removed.png">
        ⬇️ Download PNG
      </a>

      <div class="features">
        <div class="feature">
          <div class="icon">⚡</div>
          <h4>Instant</h4>
          <p>Process in seconds with AI</p>
        </div>
        <div class="feature">
          <div class="icon">🔒</div>
          <h4>Private</h4>
          <p>Images not stored anywhere</p>
        </div>
        <div class="feature">
          <div class="icon">🆓</div>
          <h4>Free</h4>
          <p>No signup or credit card</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const removeBtn = document.getElementById('removeBtn');
    const status = document.getElementById('status');
    const previewSection = document.getElementById('previewSection');
    const originalImg = document.getElementById('originalImg');
    const resultImg = document.getElementById('resultImg');
    const downloadBtn = document.getElementById('downloadBtn');
    const selectedInfo = document.getElementById('selectedInfo');
    const fileName = document.getElementById('fileName');

    let selectedFile = null;

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) setFile(file);
    });

    fileInput.addEventListener('change', e => {
      if (e.target.files[0]) setFile(e.target.files[0]);
    });

    function setFile(file) {
      if (!file.type.startsWith('image/')) {
        showStatus('Please select a valid image file.', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showStatus('File size must be under 10MB.', 'error');
        return;
      }
      selectedFile = file;
      fileName.textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
      selectedInfo.classList.add('visible');
      removeBtn.disabled = false;
      downloadBtn.style.display = 'none';
      previewSection.classList.remove('visible');
      status.style.display = 'none';

      // Show original preview
      const reader = new FileReader();
      reader.onload = e => { originalImg.src = e.target.result; };
      reader.readAsDataURL(file);
    }

    function showStatus(msg, type) {
      status.innerHTML = type === 'loading'
        ? '<span class="spinner"></span>' + msg
        : msg;
      status.className = 'status ' + type;
    }

    async function removeBg() {
      if (!selectedFile) return;
      removeBtn.disabled = true;
      showStatus('Removing background... please wait', 'loading');
      downloadBtn.style.display = 'none';

      try {
        const formData = new FormData();
        formData.append('image_file', selectedFile);

        const response = await fetch('/api/remove-bg', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to remove background');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        resultImg.src = url;
        previewSection.classList.add('visible');

        downloadBtn.href = url;
        downloadBtn.style.display = 'block';

        showStatus('✅ Background removed successfully!', 'success');
      } catch (err) {
        showStatus('❌ ' + err.message, 'error');
      } finally {
        removeBtn.disabled = false;
      }
    }
  </script>
</body>
</html>`;

// CORS headers
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    // Serve homepage
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(HTML, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8', ...CORS },
      });
    }

    // API: Remove background
    if (url.pathname === '/api/remove-bg' && request.method === 'POST') {
      return handleRemoveBg(request, env);
    }

    return new Response('Not Found', { status: 404 });
  },
};

async function handleRemoveBg(request, env) {
  const apiKey = env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  const imageFile = formData.get('image_file');
  if (!imageFile) {
    return new Response(JSON.stringify({ error: 'No image file provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  // Forward to Remove.bg API
  const bgFormData = new FormData();
  bgFormData.append('image_file', imageFile);
  bgFormData.append('size', 'auto');

  const bgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey },
    body: bgFormData,
  });

  if (!bgResponse.ok) {
    const errText = await bgResponse.text();
    let errMsg = 'Remove.bg API error';
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson.errors?.[0]?.title || errMsg;
    } catch {}
    return new Response(JSON.stringify({ error: errMsg }), {
      status: bgResponse.status,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  // Stream the PNG result back directly (no storage)
  const resultBuffer = await bgResponse.arrayBuffer();
  return new Response(resultBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline; filename="background-removed.png"',
      ...CORS,
    },
  });
}
