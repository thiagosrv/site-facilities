// Sobe um arquivo para uma pasta do Google Drive autenticando EM NOME DO USUÁRIO
// (OAuth2 com refresh token), não como conta de serviço — contas de serviço não
// têm cota própria de armazenamento em contas pessoais (@gmail.com), só em
// Drives Compartilhados do Google Workspace. Ver scripts/gdrive-oauth-setup.js
// para o passo único de autorização que gera o refresh token.
//
// Variáveis de ambiente esperadas:
//   GDRIVE_CLIENT_ID     = client ID OAuth (tipo Desktop app)
//   GDRIVE_CLIENT_SECRET = client secret OAuth
//   GDRIVE_REFRESH_TOKEN = refresh token gerado por scripts/gdrive-oauth-setup.js
//   GDRIVE_FOLDER_ID     = ID da pasta do Drive de destino

async function getAccessToken() {
  const { GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET, GDRIVE_REFRESH_TOKEN } = process.env;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GDRIVE_CLIENT_ID,
      client_secret: GDRIVE_CLIENT_SECRET,
      refresh_token: GDRIVE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`Falha ao renovar access token do Google: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

async function uploadToDrive({ fileName, content, mimeType = 'text/plain', driveMimeType }) {
  const { GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET, GDRIVE_REFRESH_TOKEN, GDRIVE_FOLDER_ID } = process.env;
  if (!GDRIVE_CLIENT_ID || !GDRIVE_CLIENT_SECRET || !GDRIVE_REFRESH_TOKEN || !GDRIVE_FOLDER_ID) {
    console.log('Credenciais do Google Drive não configuradas — pulando upload ao Drive.');
    return null;
  }

  const accessToken = await getAccessToken();

  // Se driveMimeType for informado (ex.: application/vnd.google-apps.document), o Drive
  // converte o conteúdo enviado (HTML) num Google Doc nativo, com H1/H2 estilizados de
  // verdade em vez de um .txt puro (que o visualizador do Drive exibe com contorno/monoespaçado).
  const metadata = { name: fileName, parents: [GDRIVE_FOLDER_ID], ...(driveMimeType ? { mimeType: driveMimeType } : {}) };
  const boundary = 'psprotecao-drive-upload-boundary';
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n` +
    `${content}\r\n` +
    `--${boundary}--`;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  if (!res.ok) throw new Error(`Falha ao subir arquivo no Drive: ${res.status} ${await res.text()}`);
  const data = await res.json();
  console.log(`Arquivo enviado ao Google Drive: ${fileName} (${data.webViewLink || data.id})`);
  return data;
}

module.exports = { uploadToDrive };
