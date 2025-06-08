/**
 * Enhanced Trade Intelligence Functions
 * With searchable country dropdown and improved offline handling
 */

// Global variables
let currentSearchData = [];
let buyersData = [];
let sellersData = [];

// Enhanced country list
const availableCountries = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia', 'Brazil', 'Bulgaria',
  'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Czech Republic',
  'Denmark', 'Ecuador', 'Egypt', 'Estonia', 'Ethiopia', 'Finland', 'France',
  'Georgia', 'Germany', 'Ghana', 'Greece', 'Hungary', 'Iceland', 'India', 'Indonesia', 
  'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kazakhstan', 
  'Kenya', 'Kuwait', 'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg', 'Malaysia', 
  'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 
  'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 
  'Saudi Arabia', 'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 
  'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'Taiwan', 'Thailand', 'Turkey', 
  'UAE', 'Ukraine', 'United Kingdom', 'United States', 'Uruguay', 'Vietnam'
];

// Function to create searchable country dropdown
function createSearchableCountryDropdown(selectElement, withAllCountries = true) {
  if (!selectElement) {
    console.warn('Select element not found');
    return;
  }
  
  const container = selectElement.parentNode;
  const wrapper = document.createElement('div');
  wrapper.className = 'relative w-full';
  
  // Create input field that looks like the original select
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type to search countries...';
  input.className = selectElement.className + ' pr-8';
  input.id = selectElement.id + '_input';
  
  // Add search icon
  const searchIcon = document.createElement('div');
  searchIcon.className = 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none';
  searchIcon.innerHTML = '<i class="fas fa-search text-sm"></i>';
  
  // Create dropdown container
  const dropdown = document.createElement('div');
  dropdown.className = 'absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto hidden mt-1';
  dropdown.style.top = '100%';
  
  // Prepare countries list
  const countries = withAllCountries ? ['All Countries', ...availableCountries] : availableCountries;
  
  // Function to create dropdown options
  const createOptions = (filteredCountries) => {
    dropdown.innerHTML = '';
    
    if (filteredCountries.length === 0) {
      dropdown.innerHTML = '<div class="p-3 text-gray-500 text-sm">No countries found</div>';
      return;
    }
    
    filteredCountries.forEach(country => {
      const option = document.createElement('div');
      option.className = 'p-3 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 transition-colors';
      option.textContent = country;
      
      // Add click handler
      option.addEventListener('click', () => {
        input.value = country;
        selectElement.value = country;
        dropdown.classList.add('hidden');
        
        // Update search icon to checkmark temporarily
        searchIcon.innerHTML = '<i class="fas fa-check text-green-500 text-sm"></i>';
        setTimeout(() => {
          searchIcon.innerHTML = '<i class="fas fa-search text-gray-400 text-sm"></i>';
        }, 1000);
        
        // Trigger change event on original select
        const changeEvent = new Event('change', { bubbles: true });
        selectElement.dispatchEvent(changeEvent);
        
        console.log('Selected country:', country);
      });
      
      dropdown.appendChild(option);
    });
  };
  
  // Initialize with all countries
  createOptions(countries);
  
  // Handle input changes (search functionality)
  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (query === '') {
      createOptions(countries);
    } else {
      const filtered = countries.filter(country => 
        country.toLowerCase().includes(query)
      );
      createOptions(filtered);
    }
    
    dropdown.classList.remove('hidden');
  });
  
  // Show dropdown on focus
  input.addEventListener('focus', () => {
    dropdown.classList.remove('hidden');
  });
  
  // Handle keyboard navigation
  input.addEventListener('keydown', (e) => {
    const options = dropdown.querySelectorAll('div[class*="cursor-pointer"]');
    let currentIndex = -1;
    
    // Find currently highlighted option
    options.forEach((option, index) => {
      if (option.classList.contains('bg-blue-100')) {
        currentIndex = index;
      }
    });
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Remove current highlight
      if (currentIndex >= 0) {
        options[currentIndex].classList.remove('bg-blue-100');
      }
      // Add highlight to next option
      currentIndex = (currentIndex + 1) % options.length;
      if (options[currentIndex]) {
        options[currentIndex].classList.add('bg-blue-100');
        options[currentIndex].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Remove current highlight
      if (currentIndex >= 0) {
        options[currentIndex].classList.remove('bg-blue-100');
      }
      // Add highlight to previous option
      currentIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
      if (options[currentIndex]) {
        options[currentIndex].classList.add('bg-blue-100');
        options[currentIndex].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentIndex >= 0 && options[currentIndex]) {
        options[currentIndex].click();
      }
    } else if (e.key === 'Escape') {
      dropdown.classList.add('hidden');
      input.blur();
    }
  });
  
  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
  
  // Build the wrapper
  wrapper.appendChild(input);
  wrapper.appendChild(searchIcon);
  wrapper.appendChild(dropdown);
  
  // Replace original select with wrapper
  container.insertBefore(wrapper, selectElement);
  
  // Hide original select but keep it for form submission
  selectElement.style.display = 'none';
  wrapper.appendChild(selectElement);
  
  console.log('✅ Searchable country dropdown created for:', selectElement.id);
  return wrapper;
}

// Function to initialize all country dropdowns
function initializeSearchableCountryDropdowns() {
  console.log('🔄 Initializing searchable country dropdowns...');
  
  // Main country filter in advanced search
  const countryFilter = document.getElementById('countryFilter');
  if (countryFilter) {
    createSearchableCountryDropdown(countryFilter, true); // with "All Countries" option
  }

  // CRUD create country dropdown
  const createCountry = document.getElementById('createCountry');
  if (createCountry) {
    createSearchableCountryDropdown(createCountry, false); // without "All Countries" option
  }
  
  console.log('✅ Searchable country dropdowns initialized');
}

// Function to get selected country value (works with both dropdowns)
function getSelectedCountry(selectId) {
  const input = document.getElementById(selectId + '_input');
  const select = document.getElementById(selectId);
  
  if (input && input.value) {
    return input.value;
  } else if (select && select.value) {
    return select.value;
  }
  
  return '';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add enter key support
  const queryInput = document.getElementById('query');
  if (queryInput) {
    queryInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        callWorkflow();
      }
    });
  }

  // Initialize searchable country dropdowns with a small delay
  setTimeout(() => {
    initializeSearchableCountryDropdowns();
  }, 500);

  // Update last updated time
  updateLastUpdated();
});

function updateLastUpdated() {
  const element = document.getElementById('lastUpdated');
  if (element) {
    element.textContent = new Date().toLocaleTimeString();
  }
}

function setQuickSearch(query) {
  console.log('Setting quick search:', query);
  document.getElementById('query').value = query;
  callWorkflow();
}

function quickSearch(type) {
  const queries = {
    'all buyers': 'find all buyers',
    'all sellers': 'find all sellers',
    'gulfood data': 'find gulfood data'
  };
  
  if (queries[type]) {
    document.getElementById('query').value = queries[type];
    callWorkflow();
  }
}

// Updated performAdvancedSearch function
function performAdvancedSearch() {
  const searchType = document.getElementById('searchType').value;
  const product = document.getElementById('productSearch').value.trim();
  const country = getSelectedCountry('countryFilter'); // Use helper function
  
  let query = '';
  
  // Build query based on selections
  if (searchType === 'buyer') {
    query = 'find buyers';
  } else if (searchType === 'seller') {
    query = 'find sellers';
  } else {
    query = 'find companies';
  }
  
  if (product) {
    query += ` with ${product}`;
  }
  
  if (country && country !== 'All Countries') {
    query += ` from ${country}`;
  }
  
  document.getElementById('query').value = query;
  callWorkflow();
}

// Updated resetAdvancedFilters function
function resetAdvancedFilters() {
  document.getElementById('searchType').value = 'all';
  document.getElementById('productSearch').value = '';
  
  // Reset searchable country dropdown
  const countryInput = document.getElementById('countryFilter_input');
  if (countryInput) {
    countryInput.value = '';
  }
  document.getElementById('countryFilter').value = '';
  
  console.log('Advanced filters reset');
}

// Enhanced main search function with offline handling
async function callWorkflow() {
  const query = document.getElementById('query').value.trim();
  if (!query) {
    Utils.toast.warning('Please enter a search query');
    return;
  }

  // Check network status before making request
  if (Utils.network && !Utils.network.canMakeRequests()) {
    return; // User already notified by canMakeRequests()
  }

  const searchBtn = document.getElementById('searchBtn');
  const results = document.getElementById('results');
  const resultsSection = document.getElementById('resultsSection');
  const resultsCount = document.getElementById('resultsCount');
  
  // Show loading state
  searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
  searchBtn.disabled = true;
  resultsSection.classList.add('hidden');
  
  // Show loading skeleton
  results.innerHTML = Array(6).fill().map(() => `
    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div class="animate-pulse">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-6 bg-gray-200 rounded"></div>
          <div class="h-5 bg-gray-200 rounded flex-1"></div>
        </div>
        <div class="space-y-2">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          <div class="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  `).join('');
  resultsSection.classList.remove('hidden');

  try {
    console.log('Making API request with query:', query);
    
    // Use the enhanced API utility
    const data = await Utils.api.get(
      'https://thecyberlearn.app.n8n.cloud/webhook/search-airtable',
      { query: query }
    );
    
    console.log('Raw API Response:', data);
    
    // Process the API response
    let cards = '';
    let resultCount = 0;
    let messageContent = extractMessageContent(data);

    console.log('Message content to parse:', messageContent);

    if (messageContent) {
      const companies = parseApiResponse(messageContent);
      resultCount = companies.length;
      currentSearchData = companies;

      console.log('Parsed companies:', companies);

      companies.forEach((company, index) => {
        cards += generateCompanyCard(company, index + 1);
      });
    }

    // Update UI
    resultsCount.textContent = `Found ${resultCount} companies matching "${query}"`;
    updateLastUpdated();
    
    if (cards && resultCount > 0) {
      results.innerHTML = cards;
      resultsSection.classList.remove('hidden');
      console.log('✅ Showing results:', resultCount);
    } else {
      // Show no results message (not an error)
      results.innerHTML = `
        <div class="bg-white rounded-lg p-8 text-center border border-gray-200">
          <div class="text-4xl mb-3">🔍</div>
          <p class="text-gray-600 font-semibold">No results found</p>
          <p class="text-gray-500 text-sm mt-2">Try a different search term or check the query format</p>
          <div class="mt-4">
            <p class="text-sm text-gray-600">Try these formats:</p>
            <div class="mt-2 space-y-1 text-sm text-blue-600">
              <p>• "find all buyers"</p>
              <p>• "find sellers from india"</p>
              <p>• "search buyers uk"</p>
              <p>• "find pepsi sellers"</p>
            </div>
          </div>
        </div>`;
      resultsSection.classList.remove('hidden');
      console.log('❌ No results found');
    }

  } catch (error) {
    console.error('Search error:', error);
    
    // Show offline-friendly error message with retry button
    results.innerHTML = `
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <div class="text-blue-600 text-2xl mb-3">📱</div>
        <p class="text-blue-700 font-semibold">Unable to search right now</p>
        <p class="text-blue-600 text-sm mt-2">Please check your internet connection and try again</p>
        <div class="mt-4">
          <button onclick="callWorkflow()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <i class="fas fa-refresh mr-2"></i>Try Again
          </button>
        </div>
      </div>`;
    resultsSection.classList.remove('hidden');
  } finally {
    searchBtn.innerHTML = '<i class="fas fa-search"></i> <span>Search</span>';
    searchBtn.disabled = false;
  }
}

// Updated performProductMatching function
async function performProductMatching() {
  const product = document.getElementById('productSearch').value.trim();
  const country = getSelectedCountry('countryFilter'); // Use helper function
  
  if (!product) {
    Utils.toast.warning('Please enter a product in the Product/Brand field to find matches');
    return;
  }
  
  console.log('Starting product matching for:', product, 'in country:', country);
  
  // Show loading in the inline results
  const resultsSection = document.getElementById('productMatchingResults');
  const productHeader = document.getElementById('productInfoHeader');
  
  resultsSection.classList.remove('hidden');
  productHeader.innerHTML = `
    <div class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Finding buyers and sellers for ${product}${country && country !== 'All Countries' ? ` in ${country}` : ''}...</p>
    </div>
  `;
  
  try {
    // Search for buyers
    const buyerQuery = `find buyers with ${product}${country && country !== 'All Countries' ? ` from ${country}` : ''}`;
    console.log('Buyer query:', buyerQuery);
    
    const buyerResponse = await Utils.api.get(
      'https://thecyberlearn.app.n8n.cloud/webhook/search-airtable',
      { query: buyerQuery }
    );
    
    // Search for sellers
    const sellerQuery = `find sellers with ${product}${country && country !== 'All Countries' ? ` from ${country}` : ''}`;
    console.log('Seller query:', sellerQuery);
    
    const sellerResponse = await Utils.api.get(
      'https://thecyberlearn.app.n8n.cloud/webhook/search-airtable',
      { query: sellerQuery }
    );
    
    console.log('Buyer response:', buyerResponse);
    console.log('Seller response:', sellerResponse);
    
    // Parse responses
    const buyers = parseApiResponse(extractMessageContent(buyerResponse));
    const sellers = parseApiResponse(extractMessageContent(sellerResponse));
    
    console.log('Parsed buyers:', buyers.length);
    console.log('Parsed sellers:', sellers.length);
    
    displayProductMatchResults(product, buyers, sellers, country);
    
  } catch (error) {
    console.error('Product matching error:', error);
    productHeader.innerHTML = `
      <div class="text-center py-8">
        <div class="text-red-600 text-2xl mb-3">⚠️</div>
        <p class="text-red-700 font-semibold">Search failed</p>
        <p class="text-red-600 text-sm mt-2">${error.message}</p>
        <button onclick="performProductMatching()" class="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          <i class="fas fa-refresh mr-2"></i>Try Again
        </button>
      </div>
    `;
  }
}

// Show product matching results inline instead of modal
// FIXED displayProductMatchResults function - Replace in your trade-intelligence.js

function displayProductMatchResults(product, buyers, sellers, country) {
  const resultsSection = document.getElementById('productMatchingResults');
  const productHeader = document.getElementById('productInfoHeader');
  const buyersTitle = document.getElementById('buyersTitle');
  const sellersTitle = document.getElementById('sellersTitle');
  const buyersList = document.getElementById('buyersList');
  const sellersList = document.getElementById('sellersList');
  
  // Check if elements exist before trying to update them
  if (!resultsSection || !productHeader || !buyersTitle || !sellersTitle || !buyersList || !sellersList) {
    console.error('Required elements not found for product matching results');
    return;
  }
  
  // Update header info
  productHeader.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <h4 class="text-lg font-bold text-gray-800">Product: ${product}</h4>
        ${country && country !== 'All Countries' ? `<p class="text-gray-600">Filtered by: ${country}</p>` : ''}
      </div>
      <div class="flex gap-4 text-sm">
        <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">${buyers.length} Buyers</span>
        <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">${sellers.length} Sellers</span>
      </div>
    </div>
  `;
  
  // Update titles
  buyersTitle.textContent = `Buyers (${buyers.length})`;
  sellersTitle.textContent = `Sellers (${sellers.length})`;
  
  // Populate buyers list
  if (buyers.length > 0) {
    buyersList.innerHTML = buyers.map(buyer => `
      <div class="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
        <h6 class="font-medium text-gray-800 mb-2">${buyer.name}</h6>
        <p class="text-sm text-gray-600 mb-1">${buyer.address}</p>
        ${buyer.email ? `<p class="text-xs text-blue-600">${buyer.email}</p>` : ''}
        ${buyer.phone ? `<p class="text-xs text-gray-500">${buyer.phone}</p>` : ''}
      </div>
    `).join('');
  } else {
    buyersList.innerHTML = '<p class="text-gray-500 italic text-center py-4">No buyers found for this product</p>';
  }
  
  // Populate sellers list
  if (sellers.length > 0) {
    sellersList.innerHTML = sellers.map(seller => `
      <div class="bg-white p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
        <h6 class="font-medium text-gray-800 mb-2">${seller.name}</h6>
        <p class="text-sm text-gray-600 mb-1">${seller.address}</p>
        ${seller.email ? `<p class="text-xs text-green-600">${seller.email}</p>` : ''}
        ${seller.phone ? `<p class="text-xs text-gray-500">${seller.phone}</p>` : ''}
      </div>
    `).join('');
  } else {
    sellersList.innerHTML = '<p class="text-gray-500 italic text-center py-4">No sellers found for this product</p>';
  }
  
  // Show the results section
  resultsSection.classList.remove('hidden');
  
  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  console.log('✅ Product matching results displayed successfully');
}

// Close product matching results
function closeProductMatching() {
  document.getElementById('productMatchingResults').classList.add('hidden');
}

// Helper function to extract message content
function extractMessageContent(data) {
  if (data && Array.isArray(data) && data.length > 0) {
    const apiData = data[0];
    if (apiData.success && apiData.content) {
      return apiData.content.originalMessage || apiData.content.message;
    } else if (apiData.message) {
      return apiData.message;
    }
  } else if (data && data.success && data.content) {
    return data.content.originalMessage || data.content.message;
  } else if (data && data.message) {
    return data.message;
  } else if (typeof data === 'string') {
    return data;
  }
  return '';
}

// Generate country breakdown
function generateCountryBreakdown(companies) {
  const countryCount = {};
  companies.forEach(company => {
    const country = company.address || 'Unknown';
    countryCount[country] = (countryCount[country] || 0) + 1;
  });
  
  const sortedCountries = Object.entries(countryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  return sortedCountries.map(([country, count]) => 
    `<div class="flex justify-between text-sm">
      <span>${country}</span>
      <span class="font-medium">${count}</span>
    </div>`
  ).join('');
}

// Sort results function
function sortResults() {
  const sortBy = document.getElementById('sortBy').value;
  if (!currentSearchData.length) return;
  
  let sortedData = [...currentSearchData];
  
  switch (sortBy) {
    case 'name':
      sortedData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      break;
    case 'country':
      sortedData.sort((a, b) => (a.address || '').localeCompare(b.address || ''));
      break;
    case 'products':
      sortedData.sort((a, b) => {
        const aProducts = (a.products || []).join(' ');
        const bProducts = (b.products || []).join(' ');
        return aProducts.localeCompare(bProducts);
      });
      break;
    default:
      break;
  }
  
  const results = document.getElementById('results');
  let cards = '';
  sortedData.forEach((company, index) => {
    cards += generateCompanyCard(company, index + 1);
  });
  results.innerHTML = cards;
}

// Parse API response function (keeping your existing implementation)
function parseApiResponse(responseText) {
  let companies = [];
  
  try {
    console.log('Raw response text length:', responseText.length);
    console.log('First 200 chars:', responseText.substring(0, 200));
    
    if (responseText.includes('No results found') || 
        responseText.includes('Found 0 companies') ||
        responseText.includes('Could not find')) {
      console.log('API indicates no results found');
      return companies;
    }
    
    let cleanText = responseText
      .replace(/<[^>]*>/g, '')
      .replace(/\*\*/g, '')
      .replace(/🔍.*?🚢/g, '')
      .replace(/🔍.*?📦/g, '')
      .replace(/📊.*?────+/g, '')
      .replace(/💡.*$/gm, '')
      .replace(/Complete dataset returned.*$/gm, '')
      .trim();
    
    const splitPattern = /\b(\d+)\.\s+/;
    const parts = cleanText.split(splitPattern);
    
    const companyBlocks = [];
    for (let i = 2; i < parts.length; i += 2) {
      if (parts[i] && parts[i].trim()) {
        companyBlocks.push(parts[i].trim());
      }
    }
    
    companyBlocks.forEach((block, index) => {
      if (!block || block.trim().length === 0) return;
      
      const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const companyName = lines[0] || '';
      
      const phoneMatches = block.match(/☎️\s*([\d\s\-\(\)\.E\+]+)/g) || 
                          block.match(/(?:phone|tel|contact)[:]\s*([\d\s\-\(\)\.E\+]+)/gi) ||
                          block.match(/(\+\d{1,3}[\s\-]?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{1,9})/g) || [];
      const phone = phoneMatches[0] ? phoneMatches[0].replace(/☎️\s*/, '').replace(/(?:phone|tel|contact)[:]\s*/gi, '').trim() : '';
      
      const emailMatches = block.match(/📧\s*([^\s\n]+@[^\s\n]+)/g) || 
                          block.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g) || [];
      const email = emailMatches[0] ? emailMatches[0].replace(/📧\s*/, '').trim() : '';
      
      const websiteMatches = block.match(/🔗\s*(https?:\/\/[^\s\n]+)/g) || 
                            block.match(/(https?:\/\/[^\s\n]+)/g) ||
                            block.match(/(?:website|www)[:]\s*([^\s\n]+)/gi) || [];
      const website = websiteMatches[0] ? websiteMatches[0].replace(/🔗\s*/, '').replace(/(?:website|www)[:]\s*/gi, '').replace(/\/$/, '') : '';
      
      const locationMatches = block.match(/📍\s*([^\n🔗📧☎️📦🏷️]+)/g) || 
                             block.match(/(?:location|address|country)[:]\s*([^\n]+)/gi) || [];
      let location = 'Unknown';
      
      if (locationMatches.length > 0) {
        location = locationMatches[0].replace(/📍\s*/, '').replace(/(?:location|address|country)[:]\s*/gi, '').trim();
      }
      
      if (location === 'Unknown' || location.length < 2) {
        if (block.includes('United Kingdom') || block.includes('UK')) location = 'United Kingdom';
        else if (block.includes('India')) location = 'India';
        else if (block.includes('USA') || block.includes('United States')) location = 'USA';
        else if (block.includes('UAE') || block.includes('Dubai')) location = 'UAE';
        else if (block.includes('China')) location = 'China';
        else if (block.includes('Germany')) location = 'Germany';
        else if (block.includes('France')) location = 'France';
        else if (block.includes('Italy')) location = 'Italy';
        else if (block.includes('Spain')) location = 'Spain';
        else if (block.includes('Canada')) location = 'Canada';
        else if (block.includes('Australia')) location = 'Australia';
        else if (block.includes('Japan')) location = 'Japan';
      }
      
      const productMatches = block.match(/📦\s*([^\n🏷️]+)/g) || 
                            block.match(/(?:products|items|goods)[:]\s*([^\n]+)/gi) || [];
      const brandMatches = block.match(/🏷️\s*([^\n]+)/g) ||
                          block.match(/(?:brands|brand)[:]\s*([^\n]+)/gi) || [];
      
      const products = [];
      
      productMatches.forEach(match => {
        const productText = match.replace(/📦\s*/, '').replace(/(?:products|items|goods)[:]\s*/gi, '').trim();
        const productList = productText.split(/[,&]/).map(p => p.trim()).filter(p => p.length > 0);
        products.push(...productList);
      });
      
      brandMatches.forEach(match => {
        const brandText = match.replace(/🏷️\s*/, '').replace(/(?:brands|brand)[:]\s*/gi, '').trim();
        const brandList = brandText.split(/[,&]/).map(b => b.trim()).filter(b => b.length > 0);
        products.push(...brandList);
      });
      
      if (companyName && companyName.length > 0 && !companyName.toLowerCase().includes('no result')) {
        const company = {
          name: companyName,
          phone: phone,
          email: email,
          website: website,
          address: location,
          products: products.slice(0, 8)
        };
        
        companies.push(company);
        console.log(`✅ Added company:`, company);
      }
    });
    
    console.log(`Final parsed companies count: ${companies.length}`);
    
  } catch (error) {
    console.error('Error parsing API response:', error);
  }
  
  return companies;
}

// Generate company card function
function generateCompanyCard(company, index) {
  const location = company.address?.toLowerCase() || '';
  let flagHtml = '';
  
  if (location.includes('india')) {
    flagHtml = '<div class="w-8 h-6 bg-gradient-to-b from-orange-400 via-white to-green-500 rounded border border-gray-300"></div>';
  } else if (location.includes('united kingdom') || location.includes('uk')) {
    flagHtml = '<div class="w-8 h-6 bg-blue-800 rounded border border-gray-300"></div>';
  } else if (location.includes('usa') || location.includes('united states')) {
    flagHtml = '<div class="w-8 h-6 bg-red-600 rounded border border-gray-300"></div>';
  } else if (location.includes('uae') || location.includes('dubai')) {
    flagHtml = '<div class="w-8 h-6 bg-gradient-to-b from-green-600 via-white to-red-600 rounded border border-gray-300"></div>';
  } else if (location.includes('china')) {
    flagHtml = '<div class="w-8 h-6 bg-red-600 rounded border border-gray-300"></div>';
  } else {
    flagHtml = '<div class="w-8 h-6 bg-gray-300 rounded border border-gray-300 flex items-center justify-center text-xs">🌍</div>';
  }
  
  return `
    <div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-300">
      <div class="flex items-center gap-3 mb-3">
        ${flagHtml}
        <h3 class="text-base font-bold text-blue-700">${company.name}</h3>
      </div>
      
      <div class="space-y-2 text-sm text-gray-700">
        ${company.phone ? `
          <div class="flex items-center gap-2">
            <i class="fas fa-phone text-green-600 w-4"></i>
            <span>${company.phone}</span>
          </div>
        ` : ''}
        
        ${company.email ? `
          <div class="flex items-center gap-2">
            <i class="fas fa-envelope text-blue-600 w-4"></i>
            <a href="mailto:${company.email}" class="text-blue-600 hover:text-blue-800">${company.email}</a>
          </div>
        ` : ''}
        
        ${company.website ? `
          <div class="flex items-center gap-2">
            <i class="fas fa-globe text-purple-600 w-4"></i>
            <a href="${company.website}" class="text-blue-600 hover:text-blue-800 underline" target="_blank">${company.website}</a>
          </div>
        ` : ''}
        
        ${company.address ? `
          <div class="flex items-start gap-2">
            <i class="fas fa-map-marker-alt text-red-600 w-4 mt-0.5"></i>
            <span class="text-gray-600">${company.address}</span>
          </div>
        ` : ''}
      </div>
      
      ${company.products && company.products.length > 0 ? `
        <div class="mt-3 flex flex-wrap gap-1">
          ${company.products.slice(0, 3).map(product => `
            <span class="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">${product}</span>
          `).join('')}
          ${company.products.length > 3 ? `
            <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">+${company.products.length - 3} more</span>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `;
}

// Export results function
function exportResults() {
  if (currentSearchData.length === 0) {
    Utils.toast.warning('No data to export');
    return;
  }
  
  const headers = ['Company Name', 'Phone', 'Email', 'Website', 'Address', 'Products'];
  const csvContent = [
    headers.join(','),
    ...currentSearchData.map(company => [
      `"${company.name || ''}"`,
      `"${company.phone || ''}"`,
      `"${company.email || ''}"`,
      `"${company.website || ''}"`,
      `"${company.address || ''}"`,
      `"${(company.products || []).join('; ')}"`
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trade_search_results_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  Utils.toast.success('Export completed successfully!');
}

// Clear results function
function clearResults() {
  document.getElementById('resultsSection').classList.add('hidden');
  currentSearchData = [];
}

// CRUD Modal functions
function toggleCrudModal() {
  const modal = document.getElementById('crudModal');
  if (modal.classList.contains('hidden')) {
    modal.classList.remove('hidden');
    selectCrudOperation('create');
  } else {
    closeCrudModal();
  }
}

function closeCrudModal() {
  document.getElementById('crudModal').classList.add('hidden');
  resetAllCrudForms();
}

function selectCrudOperation(operation) {
  document.getElementById('createOperation').classList.add('hidden');
  document.getElementById('updateOperation').classList.add('hidden');
  document.getElementById('deleteOperation').classList.add('hidden');
  
  const tabs = ['createTab', 'updateTab', 'deleteTab'];
  tabs.forEach(tab => {
    const el = document.getElementById(tab);
    el.className = 'flex-1 py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800';
  });
  
  document.getElementById(operation + 'Operation').classList.remove('hidden');
  
  const activeTab = document.getElementById(operation + 'Tab');
  if (operation === 'create') {
    activeTab.className = 'flex-1 py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center gap-2 bg-green-600 text-white';
  } else if (operation === 'update') {
    activeTab.className = 'flex-1 py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center gap-2 bg-blue-600 text-white';
  } else if (operation === 'delete') {
    activeTab.className = 'flex-1 py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center gap-2 bg-red-600 text-white';
    setupDeleteValidation();
  }
}

function setupDeleteValidation() {
  const checkbox = document.getElementById('deleteConfirm');
  const deleteBtn = document.getElementById('deleteBtn');
  
  checkbox.addEventListener('change', function() {
    if (this.checked) {
      deleteBtn.disabled = false;
      deleteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
      deleteBtn.disabled = true;
      deleteBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
  });
}

async function executeCrud(operation) {
  const button = document.getElementById(operation + 'Btn');
  const originalText = button.innerHTML;
  
  let command = '';
  if (operation === 'create') {
    command = buildCreateCommand();
  } else if (operation === 'update') {
    command = buildUpdateCommand();
  } else if (operation === 'delete') {
    command = buildDeleteCommand();
  }
  
  if (!command) {
    Utils.toast.warning('Please fill in all required fields');
    return;
  }
  
  button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
  button.disabled = true;
  
  try {
    console.log('Executing CRUD command:', command);
    
    const result = await Utils.api.get(
      'https://thecyberlearn.app.n8n.cloud/webhook/search-airtable',
      { query: command }
    );

    const message = extractMessageContent(result) || 'Operation completed successfully';
    const cleanMessage = message.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').trim();

    Utils.toast.success(cleanMessage);
    resetAllCrudForms();
    closeCrudModal();
    
    if (currentSearchData.length > 0) {
      setTimeout(() => {
        const currentQuery = document.getElementById('query').value;
        if (currentQuery) callWorkflow();
      }, 1000);
    }

  } catch (error) {
    console.error('CRUD operation error:', error);
    Utils.toast.error('Operation failed. Please try again.');
  } finally {
    button.innerHTML = originalText;
    button.disabled = false;
  }
}

function buildCreateCommand() {
  const type = document.getElementById('createType').value;
  const name = document.getElementById('createName').value.trim();
  const country = getSelectedCountry('createCountry');
  const email = document.getElementById('createEmail').value.trim();
  const phone = document.getElementById('createPhone').value.trim();
  const website = document.getElementById('createWebsite').value.trim();
  const products = document.getElementById('createProducts').value.trim();
  const address = document.getElementById('createAddress').value.trim();
  
  if (!type || !name) return '';
  
  let command = `create ${type} ${name}`;
  if (country) command += ` from ${country}`;
  if (email) command += ` email ${email}`;
  if (phone) command += ` phone ${phone}`;
  if (website) command += ` website ${website}`;
  if (products) command += ` products ${products}`;
  if (address) command += ` address ${address}`;
  
  return command;
}

function buildUpdateCommand() {
  const name = document.getElementById('updateName').value.trim();
  const field = document.getElementById('updateField').value;
  const value = document.getElementById('updateValue').value.trim();
  
  if (!name || !field || !value) return '';
  
  return `update ${name} ${field} to ${value}`;
}

function buildDeleteCommand() {
  const name = document.getElementById('deleteName').value.trim();
  const confirmed = document.getElementById('deleteConfirm').checked;
  
  if (!name || !confirmed) return '';
  
  return `delete ${name}`;
}

function resetAllCrudForms() {
  document.getElementById('createType').value = '';
  document.getElementById('createName').value = '';
  
  const createCountryInput = document.getElementById('createCountry_input');
  if (createCountryInput) {
    createCountryInput.value = '';
  }
  document.getElementById('createCountry').value = '';
  
  document.getElementById('createEmail').value = '';
  document.getElementById('createPhone').value = '';
  document.getElementById('createWebsite').value = '';
  document.getElementById('createProducts').value = '';
  document.getElementById('createAddress').value = '';
  
  document.getElementById('updateName').value = '';
  document.getElementById('updateField').value = '';
  document.getElementById('updateValue').value = '';
  
  document.getElementById('deleteName').value = '';
  document.getElementById('deleteConfirm').checked = false;
  const deleteBtn = document.getElementById('deleteBtn');
  deleteBtn.disabled = true;
  deleteBtn.classList.add('opacity-50', 'cursor-not-allowed');
}

// Modal functions
function closeAIModal() {
  document.getElementById('aiModal').classList.add('hidden');
}

// Navigation function
function goHome() {
  window.location.href = 'index.html';
}