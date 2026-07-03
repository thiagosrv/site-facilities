// Script de USO ÚNICO, rodado localmente pelo usuário (não no GitHub Actions),
// para autorizar o app a subir arquivos na sua conta pessoal do Google Drive
// e obter um refresh token de longa duração.
//
// Uso:
//   GDRIVE_CLIENT_ID=xxx GDRIVE_CLIENT_SECRET=yyy node scripts/gdrive-oauth-setup.js
//
// O script sobe um servidor local temporário, imprime uma URL de autorização,
// você abre essa URL no navegador, faz login com sua conta Google e autoriza.
// O Google redireciona de volta para o servidor local com um código, que é
// trocado automaticamente por um refresh token — impresso no terminal ao final.
const http = require('http');

const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}`;
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

async function main() {
  const clientId = process.env.GDRIVE_CLIENT_ID;
  const clientSecret = process.env.GDRIVE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error('Defina GDRIVE_CLIENT_ID e GDRIVE_CLIENT_SECRET antes de rodar este script.');
    process.exit(1);
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
  })}`;

  console.log('\nAbra esta URL no navegador e autorize com sua conta Google:\n');
  console.log(authUrl);
  console.log('\nAguardando autorização...\n');

  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, REDIRECT_URI);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      res.end(error ? 'Falha na autorização. Pode fechar esta aba.' : 'Autorizado! Pode fechar esta aba e voltar ao terminal.');
      server.close();
      if (error) reject(new Error(error));
      else resolve(code);
    });
    server.listen(PORT);
  });

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    }),
  });
  if (!tokenRes.ok) {
    console.error('Falha ao trocar código por tokens:', tokenRes.status, await tokenRes.text());
    process.exit(1);
  }
  const tokens = await tokenRes.json();

  if (!tokens.refresh_token) {
    console.error('Nenhum refresh_token retornado. Revogue o acesso do app em https://myaccount.google.com/permissions e rode este script de novo (o prompt=consent força a emissão de um novo refresh token).');
    process.exit(1);
  }

  console.log('Sucesso! Guarde este refresh token no secret GDRIVE_REFRESH_TOKEN do GitHub:\n');
  console.log(tokens.refresh_token);
  console.log('');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
