const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const apiKey = env['AI_AGENT_API_KEY'];
const url = env['AI_AGENT_BASE_URL'];
const model = env['AI_AGENT_MODEL']; // "MiniMax-M2.5"

async function test() {
  console.log('Direct test with MiniMax:');
  console.log('URL:', url);
  console.log('Model:', model);
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
