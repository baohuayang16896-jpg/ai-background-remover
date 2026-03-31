export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return new Response('Missing authorization code', { status: 400 });
  }

  try {
    // 交换授权码获取 access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: url.origin + '/auth/callback',
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      const errorMsg = tokens.error_description || tokens.error || 'Failed to get access token';
      throw new Error(`Token error: ${errorMsg} | Response: ${JSON.stringify(tokens)}`);
    }

    // 获取用户信息
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const userData = await userResponse.json();

    // 保存到数据库（如果 DB 可用）
    if (env.DB && env.DB.prepare) {
      try {
        await env.DB.prepare(
          `INSERT INTO users (google_id, email, name, picture) 
           VALUES (?, ?, ?, ?)
           ON CONFLICT(google_id) DO UPDATE SET 
           email=excluded.email, name=excluded.name, 
           picture=excluded.picture, last_login=strftime('%s', 'now')`
        ).bind(userData.id, userData.email, userData.name, userData.picture).run();
      } catch (dbErr) {
        console.error('Database error:', dbErr);
      }
    }

    // 返回 HTML 页面，将用户信息存储到 localStorage 并跳转
    return new Response(`
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body>
<script>
localStorage.setItem('user', JSON.stringify({
  google_id: '${userData.id}',
  name: '${userData.name.replace(/'/g, "\\'")}',
  email: '${userData.email}',
  picture: '${userData.picture}'
}));
window.location.href = '/';
</script>
</body>
</html>
    `, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });

  } catch (err) {
    return new Response(`登录失败: ${err.message}<br><br>调试信息: ${err.stack || '无'}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  }
}
