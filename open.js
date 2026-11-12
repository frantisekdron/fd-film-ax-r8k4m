(async function () {
  const status=document.getElementById('status');
  const code=new URLSearchParams(location.hash.slice(1)).get('k') || '';
  if (!/^[a-zA-Z0-9_-]{43}$/.test(code)) {
    status.textContent='Otevřete celý odkaz, který vám poslalo FD Studio.';return;
  }
  try {
    const secret=Uint8Array.from(atob(code.replace(/-/g,'+').replace(/_/g,'/')+'='),c=>c.charCodeAt(0));
    const key=await crypto.subtle.importKey('raw',secret,'AES-GCM',false,['decrypt']);
    const response=await fetch('proposal.bin',{cache:'no-cache'});
    if (!response.ok) throw new Error('Podklady nejsou dostupné.');
    const bytes=new Uint8Array(await response.arrayBuffer());
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.subarray(0,12)},key,bytes.subarray(12));
    const html=new TextDecoder().decode(plain);
    document.open();document.write(html);document.close();
  } catch {
    status.textContent='Podklady se nepodařilo otevřít. Zkontrolujte připojení a použijte celý původní odkaz.';
    document.getElementById('retry').hidden=false;
  }
})();
