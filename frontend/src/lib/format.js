export function money(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(n));
}

export function pct(n) {
  if (n == null || Number.isNaN(Number(n))) return "0%";
  const v = Number(n);
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

export function siteLabel(host) {
  if (!host) return "Web";
  return host.replace(/^www\./, "");
}

export function bookmarkletHref(token, apiBase) {
  const src = `(function(){var t=document.createElement('div');t.setAttribute('style','position:fixed;z-index:2147483647;top:16px;right:16px;background:#0d0d0f;color:#f5f5f5;border:1px solid rgba(255,255,255,.12);padding:12px 16px;border-radius:10px;font:13px Inter,system-ui,sans-serif;box-shadow:none');t.textContent='Adding to Dropwatch…';document.body.appendChild(t);fetch(${JSON.stringify(apiBase)}+'/api/products',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+${JSON.stringify(token)}},body:JSON.stringify({url:location.href})}).then(function(r){return r.json().then(function(d){if(!r.ok)throw new Error(d.error||'Failed');return d;});}).then(function(){t.style.borderColor='#00d97e';t.textContent='Added to your price tracker';}).catch(function(e){t.style.borderColor='#ff5c7a';t.textContent=e.message||'Could not add product';}).then(function(){setTimeout(function(){t.remove();},3200);});})();`;
  return `javascript:${encodeURIComponent(src)}`;
}
