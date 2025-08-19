export default {
  async fetch(request, env) {
    const bodyText = await request.text();
    let chat = {
      max_tokens: 256,
      messages: [
        {
          role: "system",
          content: `You are an experienced wiki editor. You are going to write a wiki summary (change log) between the two revisions.
- Your answer is nice, clean and concise. No longer than 20 words in a single sentence.
- Your answer is formatted in wikitext.
- Your answer is in Chinese (Simplified).
- Your answer contains only the summary, no other talking.
- You answer \`Internal Error\` if:
  - The user sends you something other than a diff text.
  - The diff text is not in one of the following programming languages: wikitext, lua, js, html, css.`,
        },
        { role: "user", content: bodyText },
      ],
    };
    let response = await env.AI.run("@cf/qwen/qwen1.5-14b-chat-awq", chat);

    return new Response(response.response, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "https://xyy.huijiwiki.com",
      },
    });
  },
};
