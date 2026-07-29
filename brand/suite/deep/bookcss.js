module.exports = `
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4;margin:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16302b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:297mm;padding:18mm 17mm 12mm;page-break-after:always;position:relative;display:flex;flex-direction:column;background:#fff}
.pgbody{flex:1;overflow:hidden}
.foot{position:absolute;left:17mm;right:17mm;bottom:8mm;display:flex;justify-content:space-between;font-size:9px;color:#7b88a8;border-top:1px solid #e0e6f4;padding-top:5px}
h1{font-size:52px;letter-spacing:-.02em;color:#111c3a;margin:6px 0}
h2{font-size:25px;color:#111c3a;letter-spacing:-.01em;margin-bottom:10px;padding-bottom:8px;border-bottom:3px solid #2f5de0}
h3{font-size:15px;color:#2f5de0;margin:16px 0 8px}
p{font-size:12.5px;line-height:1.62;margin-bottom:10px;color:#33405e}
p.big{font-size:15px;line-height:1.6}
.note{background:#eaf0fe;border-left:3px solid #2f5de0;padding:9px 12px;border-radius:0 8px 8px 0;font-size:11.5px;color:#245}
.cap{font-size:10.5px;color:#7b88a8;font-style:italic;text-align:center;margin-top:-2px}
figure{margin:8px 0}
figure img{width:100%;border:1px solid #d7deef;border-radius:9px;box-shadow:0 2px 10px rgba(17,28,58,.08)}
figcaption{font-size:10px;color:#7b88a8;text-align:center;margin-top:5px;font-style:italic}
ul.pts{margin:10px 0 0 2px;list-style:none}
ul.pts li{font-size:12px;line-height:1.5;padding:4px 0 4px 18px;position:relative;color:#33405e}
ul.pts li:before{content:'▸';color:#0fae90;position:absolute;left:0;font-weight:700}
ul.pts.big2 li{font-size:13px;padding:7px 0 7px 18px}
/* cover */
.cover{background:linear-gradient(150deg,#141c3a 0%,#1b2550 55%,#3f5fe0 130%);color:#fff;justify-content:center}
.cover .cwrap{color:#fff}
.cover .logo{font-size:26px;font-weight:800;letter-spacing:-.01em;display:flex;align-items:center;gap:10px}
.cover .logo .mk{width:38px;height:38px;border-radius:11px;background:#2f5de0;display:flex;align-items:center;justify-content:center;font-size:22px}
.cover .ed{margin-top:26px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#9db6ff;font-weight:700}
.cover h1{color:#fff;font-size:62px;margin:4px 0 2px}
.cover .sub{font-size:16px;color:#d3ddfa;font-weight:500}
.cover .module{margin-top:16px;font-size:12px;color:#a8bcf5;font-weight:600;letter-spacing:.02em}
.cover .lede{margin-top:20px;font-size:14px;line-height:1.7;color:#e9eefc;max-width:150mm}
.cover .badges{margin-top:26px;display:flex;gap:9px;flex-wrap:wrap}
.cover .badges span{background:rgba(255,255,255,.12);border:1px solid rgba(157,182,255,.4);color:#dee7fd;font-size:11px;font-weight:600;padding:6px 13px;border-radius:20px}
.cover .cfoot{position:absolute;bottom:16mm;left:17mm;font-size:11px;color:#8fa2d8}
/* toc */
.toc{margin-top:14px;background:#f5f8fe;border:1px solid #dde5f6;border-radius:10px;padding:14px 18px}
.toc ol{margin-left:18px}
.toc li{font-size:12px;line-height:1.9;color:#33405e}
/* flow */
.flow{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin:16px 0 4px}
.flow.sm{margin:10px 0}
.fb{background:#2f5de0;color:#fff;font-weight:700;font-size:12.5px;padding:9px 15px;border-radius:9px;box-shadow:0 2px 6px rgba(47,93,224,.3)}
.flow.sm .fb{background:#e9eefc;color:#1e40af;box-shadow:none;border:1px solid #cbd7fa;font-size:11px;padding:6px 11px}
.ar{color:#9cb8b0;font-weight:800;font-size:16px}
.wire2{margin-top:18px;border:1px dashed #bcd8cf;border-radius:12px;padding:16px}
.core{background:#141c3a;color:#fff;border:2px solid #2f5de0;border-radius:10px;padding:12px 16px;text-align:center;margin-bottom:14px}
.core b{font-size:14px;letter-spacing:.03em}.core span{display:block;font-size:11px;color:#9db6ff;margin-top:3px}
.ring{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.rn{font-size:11.5px;padding:8px 12px;border-radius:8px;font-weight:600}
.rn.out{background:#e9eefc;color:#1e40af;border:1px solid #cbd7fa}
.rn.in{background:#fff3e6;color:#9a5a22;border:1px solid #f2d8bd}
/* tables */
table{width:100%;border-collapse:collapse;margin:10px 0;font-size:11.5px}
th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #e4eaf7;vertical-align:top}
th{background:#eef2fd;color:#1e40af;font-size:10px;text-transform:uppercase;letter-spacing:.04em}
table.dm td:first-child{width:32%}
.tt td{font-size:11px}.tt td.pass{color:#12a06e;font-weight:700;white-space:nowrap;width:16%}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10.5px}
/* code */
pre.code{background:#111c3a;color:#dbe4fb;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10.5px;line-height:1.65;padding:16px 18px;border-radius:10px;white-space:pre-wrap;margin:8px 0}
/* run */
ol.run{margin:8px 0 0 20px}ol.run li{font-size:12.5px;line-height:1.5;padding:5px 0}
.accept{margin-top:16px;background:#e9eefc;border:1px solid #cbd7fa;border-radius:10px;padding:13px 16px;font-size:12.5px;color:#1e40af;font-weight:600}
.end{margin-top:22px;text-align:center;font-size:12px;color:#7b88a8;letter-spacing:.02em}
`;
