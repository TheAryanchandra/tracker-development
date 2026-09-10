const fs = require('fs/promises');
const path = require('path');

const KIE_API_BASE = process.env.KIE_API_BASE_URL || 'https://api.kie.ai';
const KIE_UPLOAD_BASE = process.env.KIE_UPLOAD_BASE_URL || 'https://kieai.redpandaai.co';

const supportedModels = [
  { id: 'gpt-6-astra', label: 'GPT-6 Astra', vision: true, endpoint: '/codex/v1/responses', protocol: 'responses' },
  { id: 'gpt-5-2', label: 'GPT-5.2', vision: true, endpoint: '/gpt-5-2/v1/chat/completions', protocol: 'chat' },
];

function requireApiKey() {
  if (!process.env.KIE_API_KEY) throw new Error('KIE_API_KEY is not configured on the backend');
  return process.env.KIE_API_KEY;
}

async function parseResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok || (body.code && body.code !== 200)) {
    throw new Error(body.msg || body.error?.message || `Kie API HTTP ${response.status}`);
  }
  return body;
}

async function uploadImage(file) {
  const formData = new FormData();
  const buffer = await fs.readFile(file.path);
  formData.append('file', new Blob([buffer], { type: file.mimetype }), path.basename(file.originalname));
  formData.append('uploadPath', 'tracker-ai');
  formData.append('fileName', `${Date.now()}-${path.basename(file.originalname)}`);

  const response = await fetch(`${KIE_UPLOAD_BASE}/api/file-stream-upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${requireApiKey()}` },
    body: formData,
    signal: AbortSignal.timeout(30000),
  });
  const result = await parseResponse(response);
  const imageUrl = result.data?.fileUrl || result.data?.downloadUrl;
  if (!imageUrl) throw new Error('Kie file upload did not return an image URL');
  return imageUrl;
}

function extractText(result) {
  const chatText = result.choices?.[0]?.message?.content;
  if (typeof chatText === 'string') return chatText;
  if (Array.isArray(chatText)) return chatText.filter((part) => part.type === 'text').map((part) => part.text).join('\n');
  const output = result.output || result.data?.output || [];
  return output
    .filter((item) => item.type === 'message')
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === 'output_text')
    .map((item) => item.text)
    .join('\n') || result.output_text || result.data?.output_text || '';
}

async function analyzeImage(file, prompt, options = {}) {
  const imageUrl = await uploadImage(file);
  const modelConfig = supportedModels.find((item) => item.id === options.model)
    || supportedModels.find((item) => item.id === process.env.KIE_MODEL)
    || supportedModels[0];
  const { id: model } = modelConfig;
  const effort = ['low', 'medium', 'high', 'xhigh'].includes(options.reasoningEffort)
    ? options.reasoningEffort
    : 'high';

  const body = modelConfig.protocol === 'chat'
    ? {
      model,
      messages: [{ role: 'user', content: [
        { type: 'text', text: prompt || 'Describe everything important in this image.' },
        { type: 'image_url', image_url: { url: imageUrl } },
      ] }],
      ...(options.webSearch ? { tools: [{ type: 'function', function: { name: 'web_search' } }] } : {}),
      reasoning_effort: effort === 'xhigh' ? 'high' : effort,
    }
    : {
      model,
      input: [{ role: 'user', content: [
        { type: 'input_text', text: prompt || 'Describe everything important in this image.' },
        { type: 'input_image', image_url: imageUrl },
      ] }],
      reasoning: { effort },
      ...(options.webSearch ? { tools: [{ type: 'web_search' }] } : {}),
    };

  const response = await fetch(`${KIE_API_BASE}${modelConfig.endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${requireApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });
  const result = await parseResponse(response);
  const text = extractText(result);
  if (!text) throw new Error('Kie returned an empty vision response');
  return { text, model };
}

module.exports = { analyzeImage, supportedModels };