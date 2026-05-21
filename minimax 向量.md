# Embeddings（向量化）

embeddings接口支持用户输入文本数据，使用MiniMax自研的Embedding model得到文本对应的浮点向量。

![img](https://api.minimax.chat/api/files/19d18e52-e691-4b5e-9e32-5a114566e18f.png)

通过embedding技术能够将文本转化为高维向量表示，捕捉词语和句子之间的语义关系，从而实现语义相似度计算、文本分类和信息检索等任务。相对于将文本输入直接给模型回答，可以在此之前通过embedding技术在指定的知识库中检索到有关联的上下文，放到模型的输入中，让模型基于上下文做出更流畅、合理的回答。基于此可以实现如**长记忆检索、知识库检索**等能力。

## 1、使用场景

在如下场景，可以使用embeddings接口：

1. **知识库检索，**用户有特有的知识库（如MiniMax训练数据所不具备的实时性信息或者业务专属信息）文本，并且ChatCompletion接口对于这些特有知识库回复效果不理想时，可以将与输入消息内容比较相关的知识内容注入ChatCompletion接口prompt信息中获得更好的回复效果。
2. **长记忆检索，**即用户输入的prompt信息token数大于接口token上限需要使用embedding进行信息简化时，可以将与输入消息内容比较相关的知识内容抽取出来注入ChatCompletion接口prompt信息中获得更好的回复效果。

embeddings接口在这些场景下主要帮助用户更好的得到与输入消息内容比较相关的知识内容：1.对于用户特有的知识库内容进行向量化；2.对于输入的消息内容进行向量化。

## 2、使用效果

通过效果示例展示使用效果，在效果示例中可以发现，加入相关上下文信息后，模型可以给出更准确的答复。基本请求体如下，{prompt}和{query}替换为后续实际内容。

```
payload = {
    "model": "abab5-chat",
    "prompt": {prompt},
    "role_meta": {
        "user_name": "智能助理",
        "bot_name": "用户"
    },
    "messages": [
        {
            "sender_type": "USER",
            "text": {query}
        }
    ]
}
```

**示例1**

- 不使用embedding关联上下文

```
prompt = '你是MiniMax自主研发的大型语言模型，回答问题简洁有条理。'

query = '23赛季英超冠军是谁？'
{"created":1684819940,"model":"abab5-chat","reply":"我无法确定具体的赛季，因为英超比赛时间跨度比较大。请提供更多信息，以便我为您提供准确的答案。","choices":[{"text":"我无法确定具体的赛季，因为英超比赛时间跨度比较大。请提供更多信息，以便我为您提供准确的答案。","index":0,"logprobes":0,"finish_reason":"stop"}],"usage":{"total_tokens":107},"input_sensitive":false,"output_sensitive":false,"id":"20dfe16cede4cc2e04363dd940243608","base_resp":{"status_code":0,"status_msg":"success"}}
```

- 使用embedding检索填入相关上下文

> 信息来自维基百科

```
prompt = '你是MiniMax自主研发的大型语言模型，回答问题简洁有条理。请根据以下相关内容来回答问题。如果你不知道答案，就说你不知道，不要试图编造答案。
----
相关的文本：
2023 年 5 月 21 日第三十七周赛事，阿森纳作客 0 - 1 不敌诺丁汉森林，在联赛剩余一轮下落后榜首曼城 4 分，使曼城确定提前三轮卫冕英超冠军。不但如此，诺丁汉森林亦提前一轮保级成功，本赛季成为英超史上第四次三支升级马球队全数保级成功的赛季。
----'
query = '23赛季英超冠军是谁？'
{"created":1684819814,"model":"abab5-chat","reply":"曼城在2023赛季英超联赛中提前三轮卫冕冠军。","choices":[{"text":"曼城在2023赛季英超联赛中提前三轮卫冕冠军。","index":0,"logprobes":0,"finish_reason":"stop"}],"usage":{"total_tokens":290},"input_sensitive":false,"output_sensitive":false,"id":"2fe581c0645eec0a12a148dc9912890b","base_resp":{"status_code":0,"status_msg":"success"}}
```

**示例2**

- 不使用embedding关联上下文

```
prompt = '你是MiniMax自主研发的大型语言模型，回答问题简洁有条理。'
query = '调用api，返回1002是什么原因？'
{"created":1684819646,"model":"abab5-chat","reply":"根据您提供的信息，我无法确定具体的问题。但是，如果您正在使用API或SDK，并且得到了1002错误代码，那么这可能表示以下几种情况之一：\n\n1. API或SDK不存在或无法使用。\n2. API或SDK的访问权限或密钥已过期或不正确。\n3. 您的请求超出了API或SDK的最大请求限制。\n4. API或SDK的服务器出现了问题。\n\n建议您查看API或SDK的官方文档或联系API或SDK的开发者以获取更多信息。","choices":[{"text":"根据您提供的信息，我无法确定具体的问题。但是，如果您正在使用API或SDK，并且得到了1002错误代码，那么这可能表示以下几种情况之一：\n\n1. API或SDK不存在或无法使用。\n2. API或SDK的访问权限或密钥已过期或不正确。\n3. 您的请求超出了API或SDK的最大请求限制。\n4. API或SDK的服务器出现了问题。\n\n建议您查看API或SDK的官方文档或联系API或SDK的开发者以获取更多信息。","index":0,"logprobes":0,"finish_reason":"stop"}],"usage":{"total_tokens":259},"input_sensitive":false,"output_sensitive":false,"id":"de1d80cfa1a2867f2da10c0f504a1102","base_resp":{"status_code":0,"status_msg":"success"}}
```

- 使用embedding检索填入相关上下文

> 信息来自minimax api文档

```
prompt = '你是MiniMax自主研发的大型语言模型，回答问题简洁有条理。请根据以下相关内容来回答问题。如果你不知道答案，就说你不知道，不要试图编造答案。
----
状态码(StatusCode)代表服务的返回状态，0为正确返回，所有的非零值均代表一类报错，具体语义见下表:
1000 未知错误；
1001 超时错误；
1002 触发限流策略；
1004 鉴权失败；
1008 账户余额不足；
1013 服务内部错误；
1027 输出内容严重违规；
2013 输入格式信息不正常
----
调用频率限制指的是基于商业策略的考量，对调用的频率进行限制的策略。
目前限制策略主要有以下维度：
基于请求次数的频率限制，按照基准时间不同，分为每秒限制请求次数（RPS）、每分钟限制请求次数（RPM）
基于token数的频率限制，为每分钟限制token总量（TPM）
----'
query = '调用api，返回1002是什么原因？'
{"created":1684814440,"model":"abab5-chat","reply":"当API接口返回1002错误码时，通常是因为在调用API的过程中触发了限流策略。限流策略是一种保护措施，旨在防止请求流量超过服务的处理能力，从而防止系统崩溃或过度负载。\n\n具体来说，当服务端检测到请求流量超过设定的限流阈值时，就会返回1002错误码，告知客户端当前请求已被限制。客户端可以在响应中获取当前的限流策略，根据策略调整请求频率或采取其他措施来避免触发限流。\n\n在实际应用中，限流策略可以根据不同的场景和需求进行配置和调整。例如，在秒杀活动中，为了防止恶意用户使用多个账户刷单，可以对请求频率进行限制，以保证活动的公平性和安全性。","choices":[{"text":"当API接口返回1002错误码时，通常是因为在调用API的过程中触发了限流策略。限流策略是一种保护措施，旨在防止请求流量超过服务的处理能力，从而防止系统崩溃或过度负载。\n\n具体来说，当服务端检测到请求流量超过设定的限流阈值时，就会返回1002错误码，告知客户端当前请求已被限制。客户端可以在响应中获取当前的限流策略，根据策略调整请求频率或采取其他措施来避免触发限流。\n\n在实际应用中，限流策略可以根据不同的场景和需求进行配置和调整。例如，在秒杀活动中，为了防止恶意用户使用多个账户刷单，可以对请求频率进行限制，以保证活动的公平性和安全性。","index":0,"logprobes":0,"finish_reason":"stop"}],"usage":{"total_tokens":717},"input_sensitive":false,"output_sensitive":true,"id":"8d6c510483af02ef79bd805b2db63cab","base_resp":{"status_code":0,"status_msg":"success"}}
```

## 3、接口限制

embeddings接口仅提供文本数据到浮点向量的转换能力，暂不提供向量数据库等基础设施能力。

## 4、解决方案

当用户处于上述使用场景时，我们推荐可以使用如下解决方案，主要包含三个主要部分：

1. 第一部分是构建后续检索用的向量库：

2. 1. 需要选择合适的数据作为向量数据库的来源，比如在客服场景中，可以使用用户文档和历史客服记录作为数据源，生成相应的向量表示。类似的，如果您希望模型能够回答企业内部知识问题，可以将相关文档/文件/以及其他相关文本，转换为向量存储起来。
   2. 用户将选择好的特有知识库基于自己业务逻辑进行分块，然后使用embeddings接口，将分块知识库文本向量化得到分块知识库文本以及对应的浮点向量，并将其存储到用户自己搭建的向量数据库中；

3. 第二部分是根据用户的输入查询相关向量：

4. 1. 当收到输入消息内容需要回复时，首先对输入消息内容使用embeddings接口得到对应的浮点向量；
   2. 用输入消息内容对应的浮点向量与向量数据库中存储的分块知识库浮点向量进行相似度计算，相似度计算推荐使用余弦相似度，取TOPK分块知识库文本内容（不是浮点向量）；
   3. 第三部分是将相关信息输入prompt发起请求得到回复：

5. 将输入消息内容和TOPK分块知识库文本内容一并注入到ChatCompletion接口中得到回复，建议将TOPK分块知识库文本内容放入prompt信息中。

结合embeddings接口使用大语言模型的基本流程如下：

![img](https://api.minimax.chat/api/files/28427a8b-5721-4103-afaf-a3c5c9db3072.png)

##

## 5、接口说明

https://api.minimax.chat/v1/embeddings

### 5.1 模型列表

| **模型** | **详细信息** | **最大token数** |
| -------- | ------------ | --------------- |
| embo-01  |              | 4096            |

### 5.2 接口参数说明

**请求体(request)参数**

| **参数位置** | **参数**                                                                                                                                                                                                                                                                | **语义**       | **是否必填**       | **取值**                                                                                                    | **备注**                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------ | ----------------------------------------------------------------------------------------------------------- | ---------------------------- |
| header       | Authorization                                                                                                                                                                                                                                                           | 给到的 api密钥 | 是                 | string                                                                                                      |                              |
| Content-Type | #                                                                                                                                                                                                                                                                       | 是             | application/json   |                                                                                                             |                              |
| Url params   | GroupId                                                                                                                                                                                                                                                                 | 用户所属的组   | 是                 | 使用发放的值                                                                                                | 该值应拼接在调用api的url末尾 |
| body         | model                                                                                                                                                                                                                                                                   | 请求的模型版本 | 是                 | string                                                                                                      |                              |
| texts        | 期望生成向量的文本                                                                                                                                                                                                                                                      | 是             | []string，字符数组 | 长度上限为4096个token                                                                                       |                              |
| type         | 生成向量后的目标使用场景。使用embeddings时，首先通过db生成目标内容的向量并存储到向量数据库中，之后通过query生成检索文本的向量。注：偏算法的参数，我们采用了query和db分离的算法方案，因此一段文本，如果是要作为被检索文本，应该使用db，如果是作为检索文本，应该使用query | 是             | string             | 二选一db，用于构建向量库，生成向量存储到库中（作为被检索文本）query，用于生成查询用的向量（作为检索文本时） |                              |

**返回(response)参数**

| **参数**              | **语义**                             | **类型**    | **备注**                                                                                       |
| --------------------- | ------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------- |
| vectors               | 向量结果                             | [][]float32 | 一个文本对应一个float32数组，长度为1536                                                        |
| total_tokens          | 消耗的token数量                      | int64       |                                                                                                |
| base_resp             | 如果请求出错，对应的错误状态码和详情 |             |                                                                                                |
| base_resp.status_code | 状态码                               | int64       | 1000，未知错误1001，超时1002，触发限流1004，鉴权失败1013，服务内部错误2013，输入格式信息不正常 |
| base_resp.status_msg  | 错误详情                             | string      |                                                                                                |

### 5.3 接口调用示例

**shell**

```
group_id="请填写您的group_id"
api_key="请填写您的api_key"

curl --location "https://api.minimax.chat/v1/embeddings?GroupId=${group_id}" \
--header "Authorization: Bearer ${api_key}" \
--header "Content-Type: application/json" \
--data '{
    "texts": ["Minimax的文本embedding可用于衡量文本字符串的相关性。", "embedding是浮点数的向量（列表）。两个向量之间的距离衡量它们的相关性。小距离表示高相关性，大距离表示低相关性。"],
    "model": "embo-01",
    "type": "db"
}'
```

**python**

```
import requests
import json

group_id = "请填写您的group_id"
api_key = "请填写您的api_key"

url = f"https://api.minimax.chat/v1/embeddings?GroupId={group_id}"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

data = {
    "texts": [
        "Minimax的文本embedding可用于衡量文本字符串的相关性。",
        "embedding是浮点数的向量（列表）。两个向量之间的距离衡量它们的相关性。小距离表示高相关性，大距离表示低相关性。"
    ],
    "model": "embo-01",
    "type": "db"
}

response = requests.post(url, headers=headers, data=json.dumps(data))

print(response.text)
```

## 6、解决方案代码示例

以下是针对上述解决方案的python代码示例，该示例提供了“从文本中提取embedding向量”、“计算两个embedding向量相似度”代码参考、以及使用embeddings知识库信息进行ChatCompletion接口访问和不使用的效果对比，可以让您在自己的业务场景中更快更方便的将embeddings接口使用起来。

```
import numpy as np
import requests
import json

group_id = "请填入您的groupid"
api_key = "请填入您的api_key"

# 从文本中提取embedding
def get_embedding(text, emb_type):
    url = f"https://api.minimax.chat/v1/embeddings?GroupId={group_id}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    data = {
        "texts": [
            text
        ],
        "model": "embo-01",
        "type": emb_type
    }

    response = requests.post(url, headers=headers, data=json.dumps(data))
    res = json.loads(response.text)['vectors'][0]
    return res

# 计算两个embedding的相似度
def embedding_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

class Memory():
    def __init__(self, emb_func=get_embedding, sim_func=embedding_similarity):
        self.data = []
        self.emb_func = emb_func
        self.sim_func = sim_func
    #将分块text以及分块text形成的向量形成一个字典做关联存放在内存中，注意：当在实际应用时，应将数据存放到向量数据库中
    def save_memory(self, text):
        embedding = self.emb_func(text, emb_type='db')

        self.data.append({
            "text": text,
            "emb": embedding
        })
    #根据query找出topk的分块text出来
    def retrive(self, query, topk=2):
        query_emb = self.emb_func(query, emb_type='query')
        memory = sorted(self.data, key=lambda x: self.sim_func(x['emb'], query_emb), reverse=True)[:topk]
        texts = [m['text'] for m in memory]
        texts = [''] + texts + ['']
        return '\n----\n'.join(texts)

#不使用embedding进行chatcompletion接口访问
def simple_chat(query):
    url = f"https://api.minimax.chat/v1/text/chatcompletion?GroupId={group_id}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "abab5-chat",
        "prompt": "你是MiniMax自主研发的大型语言模型，回答问题简洁有条理。",
        "role_meta": {
            "user_name": "用户",
            "bot_name": "智能助理"
        },
        "messages": [
            {
                "sender_type": "USER",
                "text": query
            }
        ]
    }

    response = requests.post(url, headers=headers, json=payload)
    return response.text

#使用embedding进行chatcompletion接口访问
def embedding_chat(query):
    # 构建向量库
    texts = [
        'Minimax的文本embedding可用于将离散的符号（例如单词、字符或词组）映射到低维向量空间中的实数向量。这些向量的空间位置被设计为与它们语义上的关联度相关，从而可以通过进行向量的计算来比较自然语言的相似度，用于衡量文本字符串的相关性（两个向量之间的距离衡量它们的相关性，小距离表示高相关性，大距离表示低相关性）。',

        '由于目前模型上下文长度会锁定在特定长度（当前是4096token），因此在使用全量信息进行提问的场景下，局限性会很大。而基于embedding技术，我们可以获得两段文本之间的相似度/关联性，基于此可以实现如长记忆检索、知识库检索等能力。',

        '接口支持基于自然语言交互生成回复的能力。接口本身为无状态接口，即单次调用时，模型所接收到的信息量仅为接口传入内容，不涉及业务逻辑，同时模型也不存储您传入的数据。如果输入内容或输出内容严重违规，接口会返回内容违规错误信息，回复内容为空。',

        '针对abab5，我们为您设定了默认智能助理背景，该设定已完成绝大多数生产力场景能力调试，建议无特殊使用目的的使用者直接使用该背景设定。如果您希望直接使用默认设定，请在调用接口时不传入prompt和role_meta。',

        '基于MiniMax端到端自研多模态大语言模型，我们为企业用户或企业开发者提供功能丰富的API，适用于大多数文本处理的场景，以自然语言交互的形式帮助企业用户或企业开发者提高文本相关的生产效率，例如不同行业的文本续写、文案生成、文本扩写、文本改写、内容摘要、代码生成、知识检索等。',

        '同时我们的新一代语音合成引擎是一项创新性的技术，它依托于新一代AI大模型能力，能够理解人类语言中的复杂含义，如情感，语气，甚至笑声，从而从文本中预测出情绪、语调等信息，生成接近于人类的超自然、高保真、个性化的语音。同时，依托大语言模型架构，模型能在几GB的参数中学习到数千个声音的音色特征，从而能够在不到30秒的音频中实现音色克隆，生成与提供的音频音色特征高度相似的语音。我们的语音合成引擎能够广泛应用于电子书、游戏、客服、政府等各种场景，为用户提供更加智能、高效的语音服务。',

        '在大语言模型中，token是指自然语言文本中的最小粒度单位，也就是一个最小的单词或符号。通常情况下，自然语言文本是由一个一个的token组成的，每个token都具备自己的词性、词义等属性。',

        '在训练大语言模型时，会使用一种称为“词向量”的技术，将每个token表示成一个向量形式，这个向量可以包含很多有用的语义信息，比如单词的词性、上下文等。模型通过这些向量来学习和理解自然语言文本，并能够完成各种任务。',

        '在大语言模型处理任务的过程中，输入的文本会被转译为token输入到模型中，而输出则是从token转译到文本。输入token与输出token的长度直接影响了大语言模型所消耗的算力，所以业界通常采用基于token数量的计费模式。',

        '调用频率限制指的是基于商业策略的考量，对调用的频率进行限制的策略。',

        '目前限制策略主要有以下维度：基于请求次数的频率限制，按照基准时间不同，分为每秒限制请求次数（RPS）、每分钟限制请求次数（RPM）基于token数的频率限制，为每分钟限制token总量（TPM）',

        'minimax收费模式以每1000个token（包含输入+输出）为基础计价单位，1000个token约对应750个汉字文本（包括标点），以下是不同接口和模型及其对应价格:ChatCompletion-abab5：0.015元/千token；ChatCompletion pro-abab5.5:0.015元/千token；web search：0.03元/次调用'
    ]
    mem = Memory()
    for text in texts:
        mem.save_memory(text)

    # 构建回复
    context = mem.retrive(query)
    prompt = f"""使用根据以下内容来回答问题。 如果你不知道答案，就说你不知道，不要试图编造答案。
{context}
"""

    print(prompt)
    url = f"https://api.minimax.chat/v1/text/chatcompletion?GroupId={group_id}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "abab5-chat",
        "prompt": prompt,
        "role_meta": {
            "user_name": "用户",
            "bot_name": "智能助理"
        },
        "messages": [
            {
                "sender_type": "USER",
                "text": query
            }
        ]
    }

    response = requests.post(url, headers=headers, json=payload)
    return response.text

if __name__ == '__main__':
    query = 'ChatCompletion-abab5模型怎么计费？'
    #不使用embedding进行chatcompletion接口访问并输出回复
    print("------------------simple sample-----------------------")
    res = simple_chat(query)
    print("simple_chat result:\n", res)

    #使用embedding进行chatcompletion接口访问并输出回复
    print("------------------embedding sample-----------------------")
    emb_res = embedding_chat(query)
    print("embedding_chat result:\n", emb_res)
```
