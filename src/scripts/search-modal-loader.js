// Search Modal Lazy Loader
(function() {
  let isLoading = false;
  let isLoaded = false;
  let pendingCallbacks = [];

  // Global function to handle search modal opening
  async function openSearchModal() {
    if (isLoaded) {
      // Modal is already loaded, just open it
      if (window.openSearchModal) {
        window.openSearchModal();
      }
      return;
    }

    if (isLoading) {
      // Modal is loading, queue the callback
      return new Promise(resolve => {
        pendingCallbacks.push(resolve);
      });
    }

    // Start loading the modal
    isLoading = true;

    try {
      // Show loading indicator (optional)
      showLoadingIndicator();

      // Fetch the search modal HTML
      const response = await fetch('/search-modal-content.html');
      if (!response.ok) {
        throw new Error('Failed to load search modal');
      }

      const modalHTML = await response.text();
      
      // Inject the modal HTML into the page
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = modalHTML;
      document.body.appendChild(modalContainer);

      // Initialize the modal functionality
      if (window.initializeSearchModal) {
        const openModal = window.initializeSearchModal();
        window.openSearchModal = openModal;
        isLoaded = true;
        
        // Open the modal immediately
        openModal();

        // Execute any pending callbacks
        pendingCallbacks.forEach(callback => callback());
        pendingCallbacks = [];
      }

    } catch (error) {
      console.error('Error loading search modal:', error);
      alert('Failed to load search modal. Please try again.');
    } finally {
      isLoading = false;
      hideLoadingIndicator();
    }
  }

  function showLoadingIndicator() {
    // Create a simple loading indicator
    const loader = document.createElement('div');
    loader.id = 'search-modal-loader';
    loader.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
    loader.innerHTML = `
      <div class="bg-white rounded-lg p-6 flex items-center gap-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span>Loading search...</span>
      </div>
    `;
    document.body.appendChild(loader);
  }

  function hideLoadingIndicator() {
    const loader = document.getElementById('search-modal-loader');
    if (loader) {
      loader.remove();
    }
  }

  // Make the function globally available
  window.openSearchModal = openSearchModal;
})();