document.addEventListener('DOMContentLoaded', () => {
  if (!navigator.onLine) {
    document.getElementById('root').innerHTML = '<div class="offline">You are currently offline...</div>';
  }
}, false);
