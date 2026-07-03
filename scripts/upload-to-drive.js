// Sobe um arquivo para uma pasta do Google Drive usando uma conta de serviço.
// Não depende de nenhuma lib externa — assina o JWT com o módulo `crypto` nativo
// e fala direto com a API REST do Drive (OAuth2 service account flow).
//
// Variáveis de ambiente esperadas:
//   GDRIVE_SERVICE_ACCOUNT_KEY = conteúdo JSON completo da chave da conta de serviço
//   GDRIVE_FOLDER_ID           = ID da pasta do Drive (compartilhada com o e-mail da conta de serviço)
const crypto = require('crypto');

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function getAccessToken(serviceAccount) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(serviceAccount.private_key).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`Falha ao obter access token do Google: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

async function uploadToDrive({ filePath, fileName, content, mimeType = 'text/plain' }) {
  const keyJson = process.env.GDRIVE_SERVICE_ACCOUNT_KEY;
  const folderId = process.env.GDRIVE_FOLDER_ID;
  if (!keyJson || !folderId) {
    console.log('GDRIVE_SERVICE_ACCOUNT_KEY ou GDRIVE_FOLDER_ID não configurados — pulando upload ao Drive.');
    return null;
  }

  const serviceAccount = JSON.parse(keyJson);
  const accessToken = await getAccessToken(serviceAccount);

  const metadata = { name: fileName, parents: [folderId] };
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
