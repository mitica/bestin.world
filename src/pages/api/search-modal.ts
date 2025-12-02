import countriesData from "../../content/common/countries.json";


export async function GET() {
  const modalHTML = `
    <div id="search-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
      <div class="flex items-start justify-center min-h-screen p-4 pt-16">
        <div class="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div class="p-4 border-b">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold">Search Countries</h2>
              <button id="close-modal" class="text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <input
              type="text"
              id="country-search"
              placeholder="Type to search countries..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div id="s-countries-list" class="flex-1 overflow-y-auto p-4">
            ${countriesData.map((country) => `
              <a
                href="/${country.slug}/"
                class="s-country-item block p-3 hover:bg-gray-100 rounded-lg transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                data-name="${country.name.toLowerCase()}"
                data-common-name="${country.commonName.toLowerCase()}"
              >
                <div class="font-medium text-gray-900">${country.name}</div>
                ${country.commonName !== country.name ? `<div class="text-sm text-gray-500">${country.commonName}</div>` : ''}
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  return new Response(modalHTML, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
