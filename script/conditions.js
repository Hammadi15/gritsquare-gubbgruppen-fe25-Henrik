document.addEventListener('DOMContentLoaded', function() {
  console.log('Conditions JS loaded');
  const popup = document.getElementById('termsPopup');
  const acceptBtn = document.getElementById('acceptBtn');
  const declineBtn = document.getElementById('declineBtn');
  const agreeCheckbox = document.getElementById('agreeCheckbox');

  // Show popup only if not agreed before
  if (!localStorage.getItem('agreed')) {
    if (popup) {
      popup.style.display = 'flex';
    }
  }

  // Enable accept button only if checkbox is checked
  agreeCheckbox.addEventListener('change', function() {
    acceptBtn.disabled = !this.checked;
  });

  // Accept: hide popup and save agreement
  acceptBtn.addEventListener('click', function() {
    localStorage.setItem('agreed', 'true');
    popup.style.display = 'none';
  });

  // Decline: redirect to Google
  declineBtn.addEventListener('click', function() {
    window.location.href = 'https://www.google.com';
  });
});