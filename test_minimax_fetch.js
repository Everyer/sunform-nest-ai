const apiKey = 'sk-api-f1iqpoIl9caOwotHgrpoge_F2XgdrApOo7bEDBOCt-ITV_DsuGEEYI0U9KBJqiYyCq-BEdOQ4nW7-e6xy4Ycq10u8RcwIVNW2hOH_wM7_FgdFzQerPwp0EM';
const url = 'https://api.minimaxi.com/v1/embeddings';

async function testEmbedding() {
  console.log('正在使用原生 fetch 请求 MiniMax 向量模型接口...');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'embo-01',
        texts: ["测试向量化文本内容 hello world"],
        type: 'db'
      })
    });

    console.log('HTTP 状态码:', response.status);
    const data = await response.json();
    console.log('接口返回内容:', JSON.stringify(data, null, 2));

    if (data.vectors && data.vectors[0]) {
      console.log('✅ 测试成功！成功获取向量，维度为:', data.vectors[0].length);
    } else {
      console.log('❌ 测试失败，未找到 vectors 字段');
    }
  } catch (error) {
    console.error('❌ 请求发生异常:', error.message);
  }
}

testEmbedding();
