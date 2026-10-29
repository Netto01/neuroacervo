import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET } from '@/lib/r2';

export const FALLBACK_ZIP_URL = 'https://pub-46b7a58b503e44bdb8e86a63a0cf51ba.r2.dev/presente.zip';
export const DEFAULT_WHATSAPP_GRUPO_URL = 'https://chat.whatsapp.com/IJnaVmDO5R95PFNcJdduRG?s=cl&p=i&mlu=4&ilr=4&iam=2';

/**
 * Gera URL de download para o arquivo zip do presente (URL assinada do Cloudflare R2 válida por 7 dias ou fallback público)
 */
export async function generateDownloadUrl(): Promise<string> {
  const zipFileName = process.env.PRESENTE_ZIP_KEY || 'presente.zip';

  if (process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
    try {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: zipFileName,
      });
      const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
      return signedUrl;
    } catch (err) {
      console.warn('[Presente] Não foi possível gerar URL assinada no R2, usando fallback:', err);
    }
  }

  return FALLBACK_ZIP_URL;
}

/**
 * Template da página de obrigado / download do presente
 */
export function buildPresenteObrigadoHtml({
  downloadUrl,
  whatsappGrupoUrl,
}: {
  downloadUrl: string;
  whatsappGrupoUrl: string;
}): string {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Seu presente · NeuroAcervo</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&family=Playfair+Display:ital,wght@1,500&display=swap">
<style>
/* NeuroAcervo · Página de obrigado do presente */
:root{--bg:#efe7d2;--surface:#f7f1de;--ink:#15140f;--mute:#5a5448;--accent:#2f6b31;--accent2:#488b49;--pop:#dafeaa;--wa:#1f8f4e;--line:rgba(21,20,15,.12)}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:inherit}
.wrap{max-width:760px;margin:0 auto;padding:28px 20px 56px}
.brand{display:inline-flex;align-items:center;gap:9px;font-family:'Inter Tight',sans-serif;font-weight:800;font-size:18px;letter-spacing:-.02em;text-decoration:none}
.brand svg{width:16px;height:21px}
.mono{font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:500;letter-spacing:.16em;text-transform:uppercase}

/* Download */
.ok{margin-top:34px;display:flex;align-items:flex-start;gap:18px}
.ok i{flex:none;width:52px;height:52px;border-radius:15px;background:var(--pop);display:grid;place-items:center;transform:rotate(-4deg)}
.ok i svg{width:26px;height:26px;stroke:var(--accent);stroke-width:3;fill:none;stroke-linecap:round;stroke-linejoin:round}
.kick{margin:0;font-size:11.5px;color:var(--accent)}
h1{margin:8px 0 0;font-family:'Inter Tight',sans-serif;font-weight:800;font-size:clamp(32px,6vw,46px);line-height:1;letter-spacing:-.045em}
h1 em,h2 em{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:500;letter-spacing:-.01em;color:var(--accent)}
.sub{margin:12px 0 0;font-size:16px;line-height:1.55;color:var(--mute)}
.sub a{color:var(--ink);font-weight:600}

/* Cartão WhatsApp */
.wa{position:relative;margin-top:36px;background:var(--accent);color:#fff;border-radius:22px;padding:30px 30px 28px;overflow:hidden;box-shadow:0 6px 0 rgba(21,20,15,.12),0 24px 44px rgba(21,20,15,.18)}
.wa .tape{position:absolute;top:-10px;left:44px;width:110px;height:30px;background:var(--pop);opacity:.9;transform:rotate(-4deg)}
.wa .kick{color:var(--pop)}
.wa h2{margin:10px 0 0;font-family:'Inter Tight',sans-serif;font-weight:800;font-size:clamp(26px,4.6vw,34px);line-height:1.02;letter-spacing:-.04em}
.wa h2 em{color:var(--pop)}
.wa p{margin:12px 0 0;font-size:15.5px;line-height:1.55;opacity:.92;max-width:520px}
.perks{list-style:none;margin:18px 0 0;padding:0;display:grid;gap:9px}
.perks li{display:flex;align-items:center;gap:11px;font-size:15px;font-weight:500}
.perks li span{flex:none;width:24px;height:24px;border-radius:7px;background:rgba(255,255,255,.16);display:grid;place-items:center}
.perks svg{width:14px;height:14px;stroke:var(--pop);stroke-width:3;fill:none;stroke-linecap:round;stroke-linejoin:round}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:11px;height:56px;padding:0 26px;border-radius:14px;font-family:'Inter Tight',sans-serif;font-weight:800;font-size:17px;letter-spacing:-.02em;text-decoration:none;transition:transform .12s, box-shadow .12s}
.btn-wa{margin-top:24px;background:var(--pop);color:var(--ink);box-shadow:0 5px 0 rgba(0,0,0,.35)}
.btn-wa:hover{transform:translateY(-2px);box-shadow:0 7px 0 rgba(0,0,0,.35)}
.btn-wa:active{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.35)}
.btn svg{width:22px;height:22px}
.btn:focus-visible{outline:3px solid var(--ink);outline-offset:3px}
.note{margin-top:12px;font-size:12.5px;opacity:.75}

/* Cartão Instagram */
.ig{margin-top:18px;background:var(--surface);border:1px solid var(--line);border-radius:22px;padding:24px 26px;display:flex;align-items:center;gap:20px;flex-wrap:wrap}
.ig .av{flex:none;width:58px;height:58px;border-radius:50%;padding:3px;background:conic-gradient(from 200deg,#f9ce34,#ee2a7b,#6228d7,#f9ce34)}
.ig .av div{width:100%;height:100%;border-radius:50%;background:var(--ink);color:var(--pop);display:grid;place-items:center;border:3px solid var(--surface)}
.ig .av svg{width:18px;height:23px}
.ig .txt{flex:1;min-width:220px}
.ig b{display:block;font-family:'Inter Tight',sans-serif;font-weight:800;font-size:19px;letter-spacing:-.025em}
.ig span{display:block;margin-top:3px;font-size:14.5px;line-height:1.45;color:var(--mute)}
.btn-ig{height:48px;padding:0 20px;font-size:15.5px;background:var(--ink);color:var(--pop);box-shadow:0 4px 0 #000}
.btn-ig:hover{transform:translateY(-1px)}

/* Acervo */
.acv{margin-top:34px;padding-top:24px;border-top:1px dashed rgba(21,20,15,.2);display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.acv p{margin:0;font-size:14.5px;line-height:1.5;color:var(--mute);max-width:440px}
.acv p b{color:var(--ink)}
.acv a{font-family:'Inter Tight',sans-serif;font-weight:800;font-size:15px;text-decoration:none;border:1.5px solid var(--ink);border-radius:11px;padding:11px 18px;white-space:nowrap}
.acv a:hover{background:var(--ink);color:var(--pop)}
.foot{margin-top:30px;font-size:11px;color:var(--mute)}
@media (max-width:560px){
  .wa{padding:26px 20px 22px} .btn-wa{width:100%;font-size:15.5px;padding:0 14px;white-space:nowrap}
  .ig{padding:20px} .btn-ig{width:100%}
}
@media (prefers-reduced-motion:reduce){.btn{transition:none}}
</style>
</head>
<body>
<main class="wrap">
  <a class="brand" href="https://www.neuroacervo.com.br"><svg viewBox="0 0 1344 1728" aria-hidden="true"><path fill="currentColor" d="M713 1704C707 1702 696 1697 685 1690C682 1688 678 1685 674 1683C671 1681 665 1678 662 1675C658 1672 653 1670 651 1668C649 1668 644 1664 640 1662C635 1659 627 1654 622 1650C616 1647 608 1642 602 1638C598 1635 591 1631 588 1629C570 1619 563 1614 558 1612C553 1608 530 1593 515 1584C486 1567 479 1563 478 1562C477 1561 474 1559 470 1557C467 1555 461 1552 458 1549C454 1546 449 1544 447 1542C445 1542 440 1538 436 1536C431 1533 423 1528 418 1524C412 1521 403 1516 398 1512C394 1509 387 1505 384 1503C367 1493 359 1488 354 1486C348 1481 335 1473 318 1462C309 1458 296 1450 289 1445C282 1440 271 1434 265 1430C260 1427 253 1423 251 1421C248 1420 245 1418 243 1416C241 1416 236 1412 232 1410C227 1407 219 1402 214 1398C208 1395 199 1390 194 1386C190 1383 183 1379 180 1377C162 1367 155 1362 150 1360C144 1355 122 1342 111 1335C102 1330 85 1319 74 1312C71 1310 65 1306 62 1305C51 1299 40 1290 35 1284C33 1281 30 1275 28 1271L24 1264L24 666C24 123 24 69 26 64C30 49 40 37 54 30C59 28 65 26 68 25C75 23 87 24 94 27C100 30 117 39 129 47C134 50 139 54 141 54C143 55 150 60 156 64C162 68 170 73 173 74C184 82 228 110 240 117C247 121 257 128 264 132C270 136 281 143 288 147C294 151 301 156 304 157C306 158 313 163 320 167C326 171 332 175 334 176C345 183 363 194 372 200C378 204 386 209 390 212C395 214 400 218 402 219C404 220 408 223 412 225C415 227 422 231 428 235C453 251 462 257 466 259C468 260 475 265 481 269C507 285 511 288 518 290C527 294 533 294 544 289C553 285 559 279 562 272L564 266L565 168L566 68L568 61C572 51 574 47 583 38C589 33 592 31 599 28C607 25 608 24 619 25C632 25 638 26 648 33C651 35 657 39 661 41C672 48 687 57 698 64C703 68 709 72 711 72C713 73 720 78 726 82C732 86 740 91 743 92C763 105 799 128 805 132C809 134 816 139 820 142C831 148 842 155 858 165C864 169 871 174 873 174C875 175 882 180 888 184C894 188 902 193 904 194C910 198 929 210 940 216C944 219 951 224 956 226C960 229 966 233 970 236C985 245 1000 255 1008 259C1013 262 1018 266 1020 267C1022 268 1027 272 1031 274C1035 276 1044 282 1050 286C1057 290 1066 296 1071 299C1076 302 1088 310 1096 315C1105 321 1114 326 1117 328C1133 338 1139 342 1150 349C1156 353 1165 358 1170 361C1175 364 1180 367 1182 369C1183 370 1189 374 1195 377C1207 384 1219 392 1233 401C1238 404 1249 411 1257 416C1265 421 1274 427 1276 428C1279 430 1284 433 1288 435C1303 445 1310 453 1316 466L1320 474L1320 1069L1320 1664L1316 1672C1306 1695 1285 1707 1260 1704C1252 1704 1242 1699 1225 1689C1218 1684 1207 1678 1201 1674C1196 1670 1187 1665 1182 1662C1177 1659 1169 1654 1165 1652C1160 1649 1153 1644 1148 1641C1143 1638 1137 1634 1134 1633C1126 1628 1114 1620 1103 1613C1098 1610 1089 1605 1084 1602C1079 1598 1069 1592 1063 1588C1056 1584 1046 1578 1041 1575C1035 1572 1028 1567 1025 1565C1022 1563 1017 1560 1014 1558C1010 1556 1006 1553 1003 1552C1000 1550 996 1547 992 1545C989 1543 983 1540 980 1537C976 1534 971 1532 969 1530C967 1530 962 1526 958 1524C953 1521 945 1516 940 1512C934 1509 926 1504 920 1500C916 1497 909 1493 906 1491C888 1481 881 1476 876 1474C870 1470 850 1457 840 1451C828 1444 820 1441 813 1441C805 1442 794 1448 788 1454C779 1463 780 1454 779 1564L778 1660L776 1668C766 1695 742 1709 713 1704Z"/></svg>NeuroAcervo</a>

  <section class="ok" aria-live="polite">
    <i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg></i>
    <div>
      <p class="kick mono">Presente entregue</p>
      <h1>Seu download <em>começou</em>.</h1>
      <p class="sub">As 5 escalas estão num arquivo .zip. Se o download não começar em alguns segundos, <a href="${downloadUrl}" id="dl">clique aqui para baixar</a>.</p>
    </div>
  </section>

  <section class="wa" aria-labelledby="wa-t">
    <span class="tape" aria-hidden="true"></span>
    <p class="kick mono">Antes de ir</p>
    <h2 id="wa-t">Entre no grupo e receba <em>mais materiais</em>.</h2>
    <p>No grupo do WhatsApp eu compartilho materiais de apoio para a avaliação e aviso primeiro sobre as novidades do NeuroAcervo.</p>
    <ul class="perks">
      <li><span><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg></span>Novos materiais de apoio em primeira mão</li>
      <li><span><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg></span>Avisos de lançamentos e atualizações do acervo</li>
      <li><span><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg></span>Grupo só de avisos, sem conversa paralela</li>
    </ul>
    <a class="btn btn-wa" href="${whatsappGrupoUrl}" target="_blank" rel="noopener" data-cta="whatsapp">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.08c-.24.68-1.42 1.3-1.95 1.35-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.93-4.66-4.11-.13-.18-1.11-1.48-1.11-2.83s.71-2 .96-2.28c.25-.27.55-.34.73-.34l.52.01c.17.01.4-.06.62.48.24.56.8 1.94.87 2.08.07.14.12.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.2 1.37.27.14.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.59.75 1.86.89.27.14.45.2.52.32.07.11.07.66-.17 1.32Z"/></svg>
      Entrar no grupo do WhatsApp
    </a>
    <p class="note">É gratuito. Você pode sair do grupo quando quiser.</p>
  </section>

  <section class="ig" aria-labelledby="ig-t">
    <div class="av" aria-hidden="true"><div><svg viewBox="0 0 1344 1728"><path fill="currentColor" d="M713 1704C707 1702 696 1697 685 1690C682 1688 678 1685 674 1683C671 1681 665 1678 662 1675C658 1672 653 1670 651 1668C649 1668 644 1664 640 1662C635 1659 627 1654 622 1650C616 1647 608 1642 602 1638C598 1635 591 1631 588 1629C570 1619 563 1614 558 1612C553 1608 530 1593 515 1584C486 1567 479 1563 478 1562C477 1561 474 1559 470 1557C467 1555 461 1552 458 1549C454 1546 449 1544 447 1542C445 1542 440 1538 436 1536C431 1533 423 1528 418 1524C412 1521 403 1516 398 1512C394 1509 387 1505 384 1503C367 1493 359 1488 354 1486C348 1481 335 1473 318 1462C309 1458 296 1450 289 1445C282 1440 271 1434 265 1430C260 1427 253 1423 251 1421C248 1420 245 1418 243 1416C241 1416 236 1412 232 1410C227 1407 219 1402 214 1398C208 1395 199 1390 194 1386C190 1383 183 1379 180 1377C162 1367 155 1362 150 1360C144 1355 122 1342 111 1335C102 1330 85 1319 74 1312C71 1310 65 1306 62 1305C51 1299 40 1290 35 1284C33 1281 30 1275 28 1271L24 1264L24 666C24 123 24 69 26 64C30 49 40 37 54 30C59 28 65 26 68 25C75 23 87 24 94 27C100 30 117 39 129 47C134 50 139 54 141 54C143 55 150 60 156 64C162 68 170 73 173 74C184 82 228 110 240 117C247 121 257 128 264 132C270 136 281 143 288 147C294 151 301 156 304 157C306 158 313 163 320 167C326 171 332 175 334 176C345 183 363 194 372 200C378 204 386 209 390 212C395 214 400 218 402 219C404 220 408 223 412 225C415 227 422 231 428 235C453 251 462 257 466 259C468 260 475 265 481 269C507 285 511 288 518 290C527 294 533 294 544 289C553 285 559 279 562 272L564 266L565 168L566 68L568 61C572 51 574 47 583 38C589 33 592 31 599 28C607 25 608 24 619 25C632 25 638 26 648 33C651 35 657 39 661 41C672 48 687 57 698 64C703 68 709 72 711 72C713 73 720 78 726 82C732 86 740 91 743 92C763 105 799 128 805 132C809 134 816 139 820 142C831 148 842 155 858 165C864 169 871 174 873 174C875 175 882 180 888 184C894 188 902 193 904 194C910 198 929 210 940 216C944 219 951 224 956 226C960 229 966 233 970 236C985 245 1000 255 1008 259C1013 262 1018 266 1020 267C1022 268 1027 272 1031 274C1035 276 1044 282 1050 286C1057 290 1066 296 1071 299C1076 302 1088 310 1096 315C1105 321 1114 326 1117 328C1133 338 1139 342 1150 349C1156 353 1165 358 1170 361C1175 364 1180 367 1182 369C1183 370 1189 374 1195 377C1207 384 1219 392 1233 401C1238 404 1249 411 1257 416C1265 421 1274 427 1276 428C1279 430 1284 433 1288 435C1303 445 1310 453 1316 466L1320 474L1320 1069L1320 1664L1316 1672C1306 1695 1285 1707 1260 1704C1252 1704 1242 1699 1225 1689C1218 1684 1207 1678 1201 1674C1196 1670 1187 1665 1182 1662C1177 1659 1169 1654 1165 1652C1160 1649 1153 1644 1148 1641C1143 1638 1137 1634 1134 1633C1126 1628 1114 1620 1103 1613C1098 1610 1089 1605 1084 1602C1079 1598 1069 1592 1063 1588C1056 1584 1046 1578 1041 1575C1035 1572 1028 1567 1025 1565C1022 1563 1017 1560 1014 1558C1010 1556 1006 1553 1003 1552C1000 1550 996 1547 992 1545C989 1543 983 1540 980 1537C976 1534 971 1532 969 1530C967 1530 962 1526 958 1524C953 1521 945 1516 940 1512C934 1509 926 1504 920 1500C916 1497 909 1493 906 1491C888 1481 881 1476 876 1474C870 1470 850 1457 840 1451C828 1444 820 1441 813 1441C805 1442 794 1448 788 1454C779 1463 780 1454 779 1564L778 1660L776 1668C766 1695 742 1709 713 1704Z"/></svg></div></div>
    <div class="txt">
      <b id="ig-t">Siga @netodarlin no Instagram</b>
      <span>Dicas de avaliação, bastidores do acervo e os próximos presentes.</span>
    </div>
    <a class="btn btn-ig" href="https://www.instagram.com/netodarlin/" target="_blank" rel="noopener" data-cta="instagram">Seguir no Instagram</a>
  </section>

  <section class="acv">
    <p>Quer a <b>correção e a interpretação</b> de cada escala? Estão no acervo completo, a partir de <b>R$&nbsp;24,90/mês</b>.</p>
    <a href="https://www.neuroacervo.com.br/#planos" data-cta="planos">Conhecer os planos →</a>
  </section>

  <p class="foot mono">Material de apoio para psicólogos · não substitui os manuais originais</p>
</main>

<script>
/* Inicia o download automaticamente ~1s após abrir a página. */
(function(){
  var a=document.getElementById('dl'); if(!a) return;
  var href=a.getAttribute('href'); if(!href || href.indexOf('{{')===0) return;
  setTimeout(function(){ window.location.href=href; }, 1000);
})();
</script>
</body>
</html>`;
}
