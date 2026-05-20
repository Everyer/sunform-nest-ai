require('dotenv').config();
const apiKey = process.env.AI_AGENT_API_KEY || '';
const url = process.env.AI_AGENT_BASE_URL || '';
const model = process.env.AI_AGENT_MODEL || '';

async function test() {
  console.log('URL:', url);
  console.log('Model:', model);
  console.log('API Key length:', apiKey.length);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{role: 'user', content: 'hello'}],
      stream: false
    })
  });
  console.log('Status:', res.status);
  console.log('Response:', await res.text());
}
test();
