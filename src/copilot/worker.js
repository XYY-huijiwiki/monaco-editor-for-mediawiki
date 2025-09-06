export default {
  async fetch(request, env) {
    const bodyText = await request.text();
    let chat = {
      max_tokens: 128,
      messages: [
        {
          role: "system",
          content: `根据文件patch高度简洁地概括编辑摘要，不超过20字。若不是文件patch，回复“Internal Error”。`,
        },
        { role: "user", content: bodyText },
      ],
    };
    let response = await env.AI.run(
      "@cf/qwen/qwen2.5-coder-32b-instruct",
      chat
    );

    return new Response(response.response, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "https://xyy.huijiwiki.com",
      },
    });
  },
};
