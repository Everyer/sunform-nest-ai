const apiKey = process.env.AI_AGENT_API_KEY || '';
const url = 'https://api.minimaxi.com/v1/chat/completions';
const model = 'MiniMax-M2.5'; // Wait, let's try abab5.5-chat or MiniMax-Text-01 too

async function test() {
  console.log('Testing model:', model);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{role: 'user', content: 'hello'}]
    })
  });
  console.log('Status:', res.status);
  console.log('Response:', await res.text());
}
test();
