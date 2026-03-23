export async function onRequest(context) {
  // 允许跨域请求 (CORS) - 这对于前端直接调用 API 很重要
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // 处理预检请求 (OPTIONS)
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // 只允许 POST 请求
  if (context.request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
      status: 405,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }

  try {
    // 解析前端发送的 JSON 数据
    const requestBody = await context.request.json();
    
    // 目标 Dify API 的地址
    const difyUrl = "http://ai.morecollege.cn/v1/chat-messages";
    
    // 从环境变量中获取安全的 API Key
    const apiKey = context.env.DIFY_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "服务器未配置 API Key" }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }

    // 向真实的 Dify API 发送请求
    const difyRequestBody = {
      "inputs": requestBody.inputs || requestBody,
      "query": requestBody.query || "生成报告",
      "response_mode": requestBody.response_mode || "blocking",
      "user": requestBody.user || "web-user"
    };
    
    const response = await fetch(difyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 在此处携带鉴权头，防止前端泄露
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(difyRequestBody)
    });

    // 将 Dify 返回的结果透传给前端
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
}
