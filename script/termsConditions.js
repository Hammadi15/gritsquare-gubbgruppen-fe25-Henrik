

document.addEventListener('DOMContentLoaded', function() {
  const termsModal = document.getElementById('termsModal');
  const acceptTermsBtn = document.getElementById('acceptTermsBtn');
  const declineTermsBtn = document.getElementById('declineTermsBtn');
  const declineBtn = document.getElementById('declineBtn');
  const agreeCheckbox = document.getElementById('agreeCheckbox');
  
  const TERMS_ACCEPTED_KEY = 'gubbChat_termsAccepted';

  // Clear old localStorage to show modal (for testing/resetting)
  // Comment this line out after you've verified the modal works
  localStorage.removeItem(TERMS_ACCEPTED_KEY);

  // Check if user has already accepted terms
  function hasUserAcceptedTerms() {
    return localStorage.getItem(TERMS_ACCEPTED_KEY) === 'true';
  }

  
  function showTermsModal() {
    if (termsModal) {
      termsModal.classList.remove('hidden');
    }
  }

  // Hide the modal
  function hideTermsModal() {
    if (termsModal) {
      termsModal.classList.add('hidden');
    }
  }

  // Accept terms
  function acceptTerms() {
    localStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
    hideTermsModal();
  }

  // Decline terms - you can customize this behavior
  function declineTerms() {
    // Option 1: Just hide the modal (user can still use the site)
    hideTermsModal();
    
    // Option 2: Uncomment below to redirect user away from site
    // alert('You must accept the Terms and Conditions to use Gubb Chat');
    // window.location.href = 'about:blank';
  }

  // Show modal on page load if user hasn't accepted terms yet
  if (!hasUserAcceptedTerms()) {
    showTermsModal();
  } else {
    // Hide modal if already accepted
    hideTermsModal();
  }

  
  if (agreeCheckbox) {
    agreeCheckbox.addEventListener('change', function() {
      acceptTermsBtn.disabled = !this.checked;
    });
  }

  // Event listeners
  if (acceptTermsBtn) {
    acceptTermsBtn.addEventListener('click', acceptTerms);
  }

  if (declineTermsBtn) {
    declineTermsBtn.addEventListener('click', declineTerms);
  }

  if (declineBtn) {
    declineBtn.addEventListener('click', declineTerms);
  }

  // Optional: Close modal when clicking outside (uncomment if desired)
  // termsModal.addEventListener('click', function(event) {
  //   if (event.target === termsModal) {
  //     declineTerms();
  //   }
  // });
});
