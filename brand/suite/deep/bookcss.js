module.exports = `
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4;margin:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16302b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:297mm;padding:18mm 17mm 12mm;page-break-after:always;position:relative;display:flex;flex-direction:column;background:#fff}
.pgbody{flex:1;overflow:hidden}
.foot{position:absolute;left:17mm;right:17mm;bottom:8mm;display:flex;justify-content:space-between;font-size:9px;color:#7d938c;border-top:1px solid #e3ede9;padding-top:5px}
h1{font-size:52px;letter-spacing:-.02em;color:#0b3b31;margin:6px 0}
h2{font-size:25px;color:#0b3b31;letter-spacing:-.01em;margin-bottom:10px;padding-bottom:8px;border-bottom:3px solid #0fae90}
h3{font-size:15px;color:#0b8f76;margin:16px 0 8px}
p{font-size:12.5px;line-height:1.62;margin-bottom:10px;color:#31473f}
p.big{font-size:15px;line-height:1.6}
.note{background:#eaf0fe;border-left:3px solid #2f5de0;padding:9px 12px;border-radius:0 8px 8px 0;font-size:11.5px;color:#245}
.cap{font-size:10.5px;color:#7d938c;font-style:italic;text-align:center;margin-top:-2px}
figure{margin:8px 0}
figure img{width:100%;border:1px solid #d7e6e0;border-radius:9px;box-shadow:0 2px 10px rgba(16,42,36,.08)}
figcaption{font-size:10px;color:#7d938c;text-align:center;margin-top:5px;font-style:italic}
ul.pts{margin:10px 0 0 2px;list-style:none}
ul.pts li{font-size:12px;line-height:1.5;padding:4px 0 4px 18px;position:relative;color:#31473f}
ul.pts li:before{content:'▸';color:#0fae90;position:absolute;left:0;font-weight:700}
ul.pts.big2 li{font-size:13px;padding:7px 0 7px 18px}
/* cover */
.cover{background:linear-gradient(150deg,#0b3b31 0%,#12312d 55%,#0b8f76 130%);color:#fff;justify-content:center}
.cover .cwrap{color:#fff}
.cover .logo{font-size:26px;font-weight:800;letter-spacing:-.01em;display:flex;align-items:center;gap:10px}
.cover .logo .mk{width:38px;height:38px;border-radius:11px;background:#0fae90;display:flex;align-items:center;justify-content:center;font-size:22px}
.cover .ed{margin-top:26px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#7fe6cf;font-weight:700}
.cover h1{color:#fff;font-size:62px;margin:4px 0 2px}
.cover .sub{font-size:16px;color:#cdeee4;font-weight:500}
.cover .module{margin-top:16px;font-size:12px;color:#9fd8c9;font-weight:600;letter-spacing:.02em}
.cover .lede{margin-top:20px;font-size:14px;line-height:1.7;color:#e7f5f0;max-width:150mm}
.cover .badges{margin-top:26px;display:flex;gap:9px;flex-wrap:wrap}
.cover .badges span{background:rgba(255,255,255,.12);border:1px solid rgba(127,230,207,.4);color:#d9f5ec;font-size:11px;font-weight:600;padding:6px 13px;border-radius:20px}
.cover .cfoot{position:absolute;bottom:16mm;left:17mm;font-size:11px;color:#8fcabb}
/* toc */
.toc{margin-top:14px;background:#f4f9f7;border:1px solid #dcebe5;border-radius:10px;padding:14px 18px}
.toc ol{margin-left:18px}
.toc li{font-size:12px;line-height:1.9;color:#31473f}
/* flow */
.flow{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin:16px 0 4px}
.flow.sm{margin:10px 0}
.fb{background:#0fae90;color:#fff;font-weight:700;font-size:12.5px;padding:9px 15px;border-radius:9px;box-shadow:0 2px 6px rgba(15,174,144,.3)}
.flow.sm .fb{background:#e7f5f0;color:#0b6a58;box-shadow:none;border:1px solid #bfe6d9;font-size:11px;padding:6px 11px}
.ar{color:#9cb8b0;font-weight:800;font-size:16px}
.wire2{margin-top:18px;border:1px dashed #bcd8cf;border-radius:12px;padding:16px}
.core{background:#141c3a;color:#fff;border:2px solid #2f5de0;border-radius:10px;padding:12px 16px;text-align:center;margin-bottom:14px}
.core b{font-size:14px;letter-spacing:.03em}.core span{display:block;font-size:11px;color:#7fe6cf;margin-top:3px}
.ring{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.rn{font-size:11.5px;padding:8px 12px;border-radius:8px;font-weight:600}
.rn.out{background:#e7f5f0;color:#0b6a58;border:1px solid #bfe6d9}
.rn.in{background:#fff3e6;color:#9a5a22;border:1px solid #f2d8bd}
/* tables */
table{width:100%;border-collapse:collapse;margin:10px 0;font-size:11.5px}
th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #e6efeb;vertical-align:top}
th{background:#eef7f4;color:#0b6a58;font-size:10px;text-transform:uppercase;letter-spacing:.04em}
table.dm td:first-child{width:32%}
.tt td{font-size:11px}.tt td.pass{color:#12a06e;font-weight:700;white-space:nowrap;width:16%}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10.5px}
/* code */
pre.code{background:#0f2a25;color:#d7f2e9;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10.5px;line-height:1.65;padding:16px 18px;border-radius:10px;white-space:pre-wrap;margin:8px 0}
/* run */
ol.run{margin:8px 0 0 20px}ol.run li{font-size:12.5px;line-height:1.5;padding:5px 0}
.accept{margin-top:16px;background:#e7f5f0;border:1px solid #bfe6d9;border-radius:10px;padding:13px 16px;font-size:12.5px;color:#0b6a58;font-weight:600}
.end{margin-top:22px;text-align:center;font-size:12px;color:#7d938c;letter-spacing:.02em}
`;
