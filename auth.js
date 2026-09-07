(() => {
  const KEY='amarAdminSession';
  const isLoggedIn=()=>sessionStorage.getItem(KEY)==='1';
  const setSession=()=>sessionStorage.setItem(KEY,'1');
  const logout=()=>{sessionStorage.removeItem(KEY);location.href='login.html';};
  window.AmarAuth={isLoggedIn,logout};
  const form=document.getElementById('loginForm');
  if(!form) return;
  const user=document.getElementById('username');
  const pass=document.getElementById('password');
  const error=document.getElementById('loginError');
  const show=document.getElementById('showPassword');
  if(isLoggedIn()) location.href='admin.html';
  show?.addEventListener('click',()=>{pass.type=pass.type==='password'?'text':'password';show.textContent=pass.type==='password'?'Show':'Hide';});
  form.addEventListener('submit',event=>{
    event.preventDefault();
    error.textContent='';
    if(!user.value.trim() || !pass.value){error.textContent='Enter your username and password.';return;}
    setSession();
    location.href='admin.html';
  });
})();
