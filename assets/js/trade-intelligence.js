/**
 * Enhanced Trade Intelligence Functions
 * Improved version with inline product matching and always-visible advanced search
 */

// Global variables
let currentSearchData = [];
let buyersData = [];
let sellersData = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add enter key support
  document.getElementById('query').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      callWorkflow();
    }
  });

  // Add enter key support for CRUD if element exists
  const crudCommand = document.getElementById('crudCommand');
  if (crudCommand) {
    crudCommand.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        callCrudOperation();
      }
    });
  }

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

// Advanced search function
function performAdvancedSearch() {
  const searchType = document.getElementById('searchType').value;
  const product = document.getElementById('productSearch').value.trim();
  const country = document.getElementById('countryFilter').value;
  
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
  
  if (country) {
    query += ` from ${country}`;
  }
  
  document.getElementById('query').value = query;
  callWorkflow();
}

// Reset Advanced Filters Function
function resetAdvancedFilters() {
  document.getElementById('searchType').value = 'all';
  document.getElementById('productSearch').value = '';
  document.getElementById('countryFilter').value = '';
  console.log('Advanced filters reset');
}

// Product matching function with inline display
async function performProductMatching() {
  const product = document.getElementById('productSearch').value.trim();
  const country = document.getElementById('countryFilter').value;
  
  if (!product) {
    alert('Please enter a product in the Product/Brand field to find matches');
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
      <p class="text-gray-600">Finding buyers and sellers for ${product}...</p>
    </div>
  `;
  
  try {
    // Search for buyers
    const buyerQuery = `find buyers with ${product}${country ? ` from ${country}` : ''}`;
    console.log('Buyer query:', buyerQuery);
    
    const buyerResponse = await fetch(`https://thecyberlearn.app.n8n.cloud/webhook/search-airtable?query=${encodeURIComponent(buyerQuery)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    // Search for sellers
    const sellerQuery = `find sellers with ${product}${country ? ` from ${country}` : ''}`;
    console.log('Seller query:', sellerQuery);
    
    const sellerResponse = await fetch(`https://thecyberlearn.app.n8n.cloud/webhook/search-airtable?query=${encodeURIComponent(sellerQuery)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    const buyerData = await buyerResponse.json();
    const sellerData = await sellerResponse.json();
    
    console.log('Buyer response:', buyerData);
    console.log('Seller response:', sellerData);
    
    // Parse responses
    const buyers = parseApiResponse(extractMessageContent(buyerData));
    const sellers = parseApiResponse(extractMessageContent(sellerData));
    
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
      </div>
    `;
  }
}

// Show product matching results inline instead of modal
function displayProductMatchResults(product, buyers, sellers, country) {
  const resultsSection = document.getElementById('productMatchingResults');
  const productHeader = document.getElementById('productInfoHeader');
  const subtitle = document.getElementById('productMatchingSubtitle');
  const buyersTitle = document.getElementById('buyersTitle');
  const sellersTitle = document.getElementById('sellersTitle');
  const buyersList = document.getElementById('buyersList');
  const sellersList = document.getElementById('sellersList');
  const buyersByCountry = document.getElementById('buyersByCountry');
  const sellersByCountry = document.getElementById('sellersByCountry');
  const tradeOpportunitySummary = document.getElementById('tradeOpportunitySummary');
  
  // Update header info
  productHeader.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <h4 class="text-lg font-bold text-gray-800">Product: ${product}</h4>
        ${country ? `<p class="text-gray-600">Filtered by: ${country}</p>` : ''}
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
  
  // Generate country breakdowns
  buyersByCountry.innerHTML = generateCountryBreakdown(buyers);
  sellersByCountry.innerHTML = generateCountryBreakdown(sellers);
  
  // Generate trade opportunity summary
  if (buyers.length > 0 && sellers.length > 0) {
    tradeOpportunitySummary.innerHTML = `
      <div class="flex items-start gap-3">
        <i class="fas fa-lightbulb text-purple-600 mt-1"></i>
        <div>
          <p class="text-sm text-purple-700 font-medium">Trade Opportunity Identified!</p>
          <p class="text-sm text-gray-600 mt-1">
            ${buyers.length} potential buyers and ${sellers.length} sellers found for ${product}. 
            Consider connecting companies from different regions for cross-border trade opportunities.
          </p>
        </div>
      </div>
    `;
  } else {
    tradeOpportunitySummary.innerHTML = `
      <div class="flex items-start gap-3">
        <i class="fas fa-info-circle text-gray-500 mt-1"></i>
        <p class="text-sm text-gray-600">
          No potential connections found. Try expanding your search criteria or exploring different product categories.
        </p>
      </div>
    `;
  }
  
  // Show the results section
  resultsSection.classList.remove('hidden');
  
  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      // Keep original order
      break;
  }
  
  // Re-render results
  const results = document.getElementById('results');
  let cards = '';
  sortedData.forEach((company, index) => {
    cards += generateCompanyCard(company, index + 1);
  });
  results.innerHTML = cards;
}

// Main search function
async function callWorkflow() {
  const query = document.getElementById('query').value.trim();
  if (!query) {
    alert('Please enter a search query');
    return;
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
    
    const response = await fetch(`https://thecyberlearn.app.n8n.cloud/webhook/search-airtable?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw API Response:', data);
    
    // Process the API response - handle multiple formats
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
      // Show the API response for debugging
      const debugInfo = messageContent ? 
        `<div class="text-xs text-gray-500 mt-4 p-3 bg-gray-100 rounded">
          <details>
            <summary>Debug Info (click to expand)</summary>
            <pre class="mt-2 text-xs">${messageContent.substring(0, 500)}...</pre>
          </details>
        </div>` : '';
      
      results.innerHTML = `
        <div class="bg-white rounded-lg p-8 text-center border border-gray-200">
          <div class="text-4xl mb-3">😔</div>
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
          ${debugInfo}
        </div>`;
      resultsSection.classList.remove('hidden');
      console.log('❌ No results found');
    }

  } catch (error) {
    console.error('Search error:', error);
    results.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div class="text-red-600 text-2xl mb-3">⚠️</div>
        <p class="text-red-700 font-semibold">Search failed</p>
        <p class="text-red-600 text-sm mt-2">${error.message}</p>
        <div class="mt-4 p-3 bg-red-100 rounded text-left">
          <p class="text-xs text-red-700 font-mono">Error details: ${error.stack || error.toString()}</p>
        </div>
      </div>`;
    resultsSection.classList.remove('hidden');
  } finally {
    searchBtn.innerHTML = '<i class="fas fa-search"></i> <span>Search</span>';
    searchBtn.disabled = false;
  }
}

// CRUD operations function
async function callCrudOperation() {
  const crudCommand = document.getElementById('crudCommand');
  if (!crudCommand) return;

  const command = crudCommand.value.trim();
  if (!command) {
    alert('Please enter a CRUD command');
    return;
  }

  const crudBtn = document.getElementById('crudBtn');
  crudBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Executing...';
  crudBtn.disabled = true;

  try {
    const response = await fetch(`https://thecyberlearn.app.n8n.cloud/webhook/search-airtable?query=${encodeURIComponent(command)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    const raw = result?.content?.originalMessage || result?.content?.message || '✅ Operation completed.';
    const clean = raw.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').trim();

    alert(clean);
    crudCommand.value = '';

  } catch (error) {
    console.error('CRUD error:', error);
    alert('❌ ' + error.message);
  } finally {
    crudBtn.innerHTML = '<i class="fas fa-terminal"></i> <span>Execute</span>';
    crudBtn.disabled = false;
  }
}

// Parse API response function
function parseApiResponse(responseText) {
  let companies = [];
  
  try {
    console.log('Raw response text length:', responseText.length);
    console.log('First 200 chars:', responseText.substring(0, 200));
    
    // Check if response indicates no results
    if (responseText.includes('No results found') || 
        responseText.includes('Found 0 companies') ||
        responseText.includes('Could not find')) {
      console.log('API indicates no results found');
      return companies; // Return empty array
    }
    
    // Clean up the text and remove markdown/HTML formatting
    let cleanText = responseText
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/🔍.*?🚢/g, '') // Remove search header with ship emoji
      .replace(/🔍.*?📦/g, '') // Remove search header with package emoji
      .replace(/📊.*?────+/g, '') // Remove stats line
      .replace(/💡.*$/gm, '') // Remove suggestions
      .replace(/Complete dataset returned.*$/gm, '') // Remove footer
      .trim();
    
    console.log('Cleaned text length:', cleanText.length);
    console.log('Cleaned text preview:', cleanText.substring(0, 300));
    
    // Split by numbered company entries (1. 2. 3. etc.)
    const splitPattern = /\b(\d+)\.\s+/;
    const parts = cleanText.split(splitPattern);
    
    console.log('Split parts count:', parts.length);
    
    // Extract company blocks (every other element after split, starting from index 2)
    const companyBlocks = [];
    for (let i = 2; i < parts.length; i += 2) {
      if (parts[i] && parts[i].trim()) {
        companyBlocks.push(parts[i].trim());
        console.log(`Block ${Math.floor(i/2)}:`, parts[i].substring(0, 100));
      }
    }
    
    console.log('Company blocks found:', companyBlocks.length);
    
    companyBlocks.forEach((block, index) => {
      if (!block || block.trim().length === 0) return;
      
      const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const companyName = lines[0] || '';
      
      console.log(`Processing company ${index + 1}: "${companyName}"`);
      
      // Extract phone numbers (look for ☎️ emoji or phone patterns)
      const phoneMatches = block.match(/☎️\s*([\d\s\-\(\)\.E\+]+)/g) || 
                          block.match(/(?:phone|tel|contact)[:]\s*([\d\s\-\(\)\.E\+]+)/gi) ||
                          block.match(/(\+\d{1,3}[\s\-]?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{1,9})/g) || [];
      const phone = phoneMatches[0] ? phoneMatches[0].replace(/☎️\s*/, '').replace(/(?:phone|tel|contact)[:]\s*/gi, '').trim() : '';
      
      // Extract emails (look for 📧 emoji or email patterns)
      const emailMatches = block.match(/📧\s*([^\s\n]+@[^\s\n]+)/g) || 
                          block.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g) || [];
      const email = emailMatches[0] ? emailMatches[0].replace(/📧\s*/, '').trim() : '';
      
      // Extract websites (look for 🔗 emoji or URL patterns)
      const websiteMatches = block.match(/🔗\s*(https?:\/\/[^\s\n]+)/g) || 
                            block.match(/(https?:\/\/[^\s\n]+)/g) ||
                            block.match(/(?:website|www)[:]\s*([^\s\n]+)/gi) || [];
      const website = websiteMatches[0] ? websiteMatches[0].replace(/🔗\s*/, '').replace(/(?:website|www)[:]\s*/gi, '').replace(/\/$/, '') : '';
      
      // Extract location (look for 📍 emoji or location indicators)
      const locationMatches = block.match(/📍\s*([^\n🔗📧☎️📦🏷️]+)/g) || 
                             block.match(/(?:location|address|country)[:]\s*([^\n]+)/gi) || [];
      let location = 'Unknown';
      
      if (locationMatches.length > 0) {
        location = locationMatches[0].replace(/📍\s*/, '').replace(/(?:location|address|country)[:]\s*/gi, '').trim();
      }
      
      // Fallback location detection from text
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
      
      // Extract products (look for 📦 emoji or product indicators)
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
      } else {
        console.log(`❌ Skipped invalid company: "${companyName}"`);
      }
    });
    
    console.log(`Final parsed companies count: ${companies.length}`);
    
  } catch (error) {
    console.error('Error parsing API response:', error);
    console.log('Raw response that caused error:', responseText);
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
    alert('No data to export');
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
}

// Clear results function
function clearResults() {
  document.getElementById('resultsSection').classList.add('hidden');
  currentSearchData = [];
}

// Modal functions
function closeAIModal() {
  document.getElementById('aiModal').classList.add('hidden');
}

// Navigation function
function goHome() {
  window.location.href = 'index.html';
}



// CRUD Operations Functions - Add these to your trade-intelligence.js file

// Toggle CRUD panel visibility
function toggleCrudPanel() {
  const panel = document.getElementById('crudFormsPanel');
  const gearBtn = document.getElementById('crudGearBtn');
  
  if (panel.classList.contains('hidden')) {
    panel.classList.remove('hidden');
    panel.classList.add('slide-down');
    gearBtn.classList.add('rotate-90');
  } else {
    panel.classList.add('hidden');
    panel.classList.remove('slide-down');
    gearBtn.classList.remove('rotate-90');
    
    // Hide all forms when closing panel
    hideAllCrudForms();
  }
}

// Show specific CRUD form
function showCrudForm(operation) {
  const panel = document.getElementById('crudFormsPanel');
  
  // Show panel if hidden
  if (panel.classList.contains('hidden')) {
    panel.classList.remove('hidden');
    panel.classList.add('slide-down');
    document.getElementById('crudGearBtn').classList.add('rotate-90');
  }
  
  // Hide all forms first
  hideAllCrudForms();
  
  // Show selected form
  const formId = operation + 'Form';
  document.getElementById(formId).classList.remove('hidden');
  
  // Setup form-specific behavior
  if (operation === 'delete') {
    setupDeleteFormValidation();
  }
}

// Hide all CRUD forms
function hideAllCrudForms() {
  document.getElementById('createForm').classList.add('hidden');
  document.getElementById('updateForm').classList.add('hidden');
  document.getElementById('deleteForm').classList.add('hidden');
}

// Setup delete form validation
function setupDeleteFormValidation() {
  const checkbox = document.getElementById('deleteConfirm');
  const deleteBtn = document.getElementById('deleteBtn');
  
  checkbox.addEventListener('change', function() {
    deleteBtn.disabled = !this.checked;
    if (this.checked) {
      deleteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
      deleteBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
  });
}

// Execute CRUD operation
async function executeCrudOperation(operation) {
  let command = '';
  let buttonId = operation + 'Btn';
  const button = document.getElementById(buttonId);
  
  // Build command based on operation
  if (operation === 'create') {
    command = buildCreateCommand();
  } else if (operation === 'update') {
    command = buildUpdateCommand();
  } else if (operation === 'delete') {
    command = buildDeleteCommand();
  }
  
  if (!command) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Show loading state
  const originalContent = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  button.disabled = true;
  
  try {
    console.log('Executing CRUD command:', command);
    
    const response = await fetch(`https://thecyberlearn.app.n8n.cloud/webhook/search-airtable?query=${encodeURIComponent(command)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    const message = extractMessageContent(result) || '✅ Operation completed successfully.';
    const cleanMessage = message.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').trim();

    // Show success message
    alert(cleanMessage);
    
    // Reset form after success
    if (operation === 'create') resetCreateForm();
    else if (operation === 'update') resetUpdateForm();
    else if (operation === 'delete') resetDeleteForm();
    
    // Optionally refresh search results if there are any
    if (currentSearchData.length > 0) {
      const currentQuery = document.getElementById('query').value;
      if (currentQuery) {
        setTimeout(() => {
          callWorkflow(); // Refresh results
        }, 1000);
      }
    }

  } catch (error) {
    console.error('CRUD operation error:', error);
    alert('❌ Operation failed: ' + error.message);
  } finally {
    button.innerHTML = originalContent;
    button.disabled = false;
  }
}

// Build create command
function buildCreateCommand() {
  const type = document.getElementById('createType').value;
  const companyName = document.getElementById('createCompanyName').value.trim();
  const country = document.getElementById('createCountry').value;
  const email = document.getElementById('createEmail').value.trim();
  const phone = document.getElementById('createPhone').value.trim();
  const website = document.getElementById('createWebsite').value.trim();
  const products = document.getElementById('createProducts').value.trim();
  
  if (!type || !companyName) {
    return '';
  }
  
  let command = `create ${type} ${companyName}`;
  
  if (country) command += ` from ${country}`;
  if (email) command += ` email ${email}`;
  if (phone) command += ` phone ${phone}`;
  if (website) command += ` website ${website}`;
  if (products) command += ` products ${products}`;
  
  return command;
}

// Build update command
function buildUpdateCommand() {
  const companyName = document.getElementById('updateCompanyName').value.trim();
  const field = document.getElementById('updateField').value;
  const value = document.getElementById('updateValue').value.trim();
  
  if (!companyName || !field || !value) {
    return '';
  }
  
  return `update ${companyName} ${field} to ${value}`;
}

// Build delete command
function buildDeleteCommand() {
  const companyName = document.getElementById('deleteCompanyName').value.trim();
  const confirmed = document.getElementById('deleteConfirm').checked;
  
  if (!companyName || !confirmed) {
    return '';
  }
  
  return `delete ${companyName}`;
}

// Reset form functions
function resetCreateForm() {
  document.getElementById('createType').value = '';
  document.getElementById('createCompanyName').value = '';
  document.getElementById('createCountry').value = '';
  document.getElementById('createEmail').value = '';
  document.getElementById('createPhone').value = '';
  document.getElementById('createWebsite').value = '';
  document.getElementById('createProducts').value = '';
}

function resetUpdateForm() {
  document.getElementById('updateCompanyName').value = '';
  document.getElementById('updateField').value = '';
  document.getElementById('updateValue').value = '';
}

function resetDeleteForm() {
  document.getElementById('deleteCompanyName').value = '';
  document.getElementById('deleteConfirm').checked = false;
  document.getElementById('deleteBtn').disabled = true;
  document.getElementById('deleteBtn').classList.add('opacity-50', 'cursor-not-allowed');
}

// Initialize CRUD functionality when page loads - add this to your existing DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
  // ... your existing initialization code ...
  
  // Initialize delete form validation
  setupDeleteFormValidation();
});


// Clean CRUD Functions - Replace the old CRUD functions with these

// Toggle CRUD Modal
function toggleCrudModal() {
  const modal = document.getElementById('crudModal');
  if (modal.classList.contains('hidden')) {
    modal.classList.remove('hidden');
    // Default to create operation
    selectCrudOperation('create');
  } else {
    closeCrudModal();
  }
}

// Close CRUD Modal
function closeCrudModal() {
  document.getElementById('crudModal').classList.add('hidden');
  resetAllCrudForms();
}

// Select CRUD Operation
function selectCrudOperation(operation) {
  // Hide all operations
  document.getElementById('createOperation').classList.add('hidden');
  document.getElementById('updateOperation').classList.add('hidden');
  document.getElementById('deleteOperation').classList.add('hidden');
  
  // Reset all tab styles
  const tabs = ['createTab', 'updateTab', 'deleteTab'];
  tabs.forEach(tab => {
    const el = document.getElementById(tab);
    el.className = 'flex-1 py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800';
  });
  
  // Show selected operation
  document.getElementById(operation + 'Operation').classList.remove('hidden');
  
  // Style active tab
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

// Setup delete validation
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

// Execute CRUD Operation
async function executeCrud(operation) {
  const button = document.getElementById(operation + 'Btn');
  const originalText = button.innerHTML;
  
  // Build command
  let command = '';
  if (operation === 'create') {
    command = buildCreateCommand();
  } else if (operation === 'update') {
    command = buildUpdateCommand();
  } else if (operation === 'delete') {
    command = buildDeleteCommand();
  }
  
  if (!command) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  // Show loading
  button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
  button.disabled = true;
  
  try {
    const response = await fetch(`https://thecyberlearn.app.n8n.cloud/webhook/search-airtable?query=${encodeURIComponent(command)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    const message = extractMessageContent(result) || 'Operation completed successfully';
    const cleanMessage = message.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').trim();

    // Show success toast
    showToast(cleanMessage, 'success');
    
    // Reset form and close modal
    resetAllCrudForms();
    closeCrudModal();
    
    // Refresh results if any exist
    if (currentSearchData.length > 0) {
      setTimeout(() => {
        const currentQuery = document.getElementById('query').value;
        if (currentQuery) callWorkflow();
      }, 1000);
    }

  } catch (error) {
    console.error('CRUD operation error:', error);
    showToast('Operation failed: ' + error.message, 'error');
  } finally {
    button.innerHTML = originalText;
    button.disabled = false;
  }
}

// Build Create Command
function buildCreateCommand() {
  const type = document.getElementById('createType').value;
  const name = document.getElementById('createName').value.trim();
  const country = document.getElementById('createCountry').value;
  const email = document.getElementById('createEmail').value.trim();
  
  if (!type || !name) return '';
  
  let command = `create ${type} ${name}`;
  if (country) command += ` from ${country}`;
  if (email) command += ` email ${email}`;
  
  return command;
}

// Build Update Command
function buildUpdateCommand() {
  const name = document.getElementById('updateName').value.trim();
  const field = document.getElementById('updateField').value;
  const value = document.getElementById('updateValue').value.trim();
  
  if (!name || !field || !value) return '';
  
  return `update ${name} ${field} to ${value}`;
}

// Build Delete Command
function buildDeleteCommand() {
  const name = document.getElementById('deleteName').value.trim();
  const confirmed = document.getElementById('deleteConfirm').checked;
  
  if (!name || !confirmed) return '';
  
  return `delete ${name}`;
}

// Reset All CRUD Forms
function resetAllCrudForms() {
  // Reset create form
  document.getElementById('createType').value = '';
  document.getElementById('createName').value = '';
  document.getElementById('createCountry').value = '';
  document.getElementById('createEmail').value = '';
  
  // Reset update form
  document.getElementById('updateName').value = '';
  document.getElementById('updateField').value = '';
  document.getElementById('updateValue').value = '';
  
  // Reset delete form
  document.getElementById('deleteName').value = '';
  document.getElementById('deleteConfirm').checked = false;
  const deleteBtn = document.getElementById('deleteBtn');
  deleteBtn.disabled = true;
  deleteBtn.classList.add('opacity-50', 'cursor-not-allowed');
}

// Toast Notification System
function showToast(message, type = 'info', duration = 5000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  
  // Set toast styles based on type
  let bgColor, iconClass, borderColor;
  switch (type) {
    case 'success':
      bgColor = 'bg-green-500';
      iconClass = 'fas fa-check-circle';
      borderColor = 'border-green-400';
      break;
    case 'error':
      bgColor = 'bg-red-500';
      iconClass = 'fas fa-exclamation-circle';
      borderColor = 'border-red-400';
      break;
    case 'warning':
      bgColor = 'bg-yellow-500';
      iconClass = 'fas fa-exclamation-triangle';
      borderColor = 'border-yellow-400';
      break;
    default:
      bgColor = 'bg-blue-500';
      iconClass = 'fas fa-info-circle';
      borderColor = 'border-blue-400';
  }
  
  toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg border-l-4 ${borderColor} max-w-sm transform translate-x-full transition-transform duration-300 ease-out`;
  toast.innerHTML = `
    <div class="flex items-start gap-3">
      <i class="${iconClass} mt-0.5"></i>
      <div class="flex-1">
        <p class="text-sm font-medium">${message}</p>
      </div>
      <button onclick="removeToast(this)" class="text-white hover:text-gray-200 ml-2">
        <i class="fas fa-times text-sm"></i>
      </button>
    </div>
  `;
  
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 100);
  
  // Auto remove
  setTimeout(() => {
    removeToast(toast);
  }, duration);
}

// Remove Toast
function removeToast(element) {
  const toast = element.tagName === 'BUTTON' ? element.closest('div') : element;
  toast.classList.add('translate-x-full');
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
  const modal = document.getElementById('crudModal');
  if (event.target === modal) {
    closeCrudModal();
  }
});

// Initialize on page load - add this to your existing DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  // ... your existing code ...
  
  // Setup delete validation initially
  setupDeleteValidation();
});

// Enhanced CRUD Functions with Country Fetching and All Fields

// Global variables
let countriesLoaded = false;
let availableCountries = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia', 'Brazil', 'Bulgaria',
  'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Czech Republic',
  'Denmark', 'Ecuador', 'Egypt', 'Estonia', 'Ethiopia', 'Finland', 'France',
  'Georgia', 'Germany', 'Ghana', 'Greece', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg',
  'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway',
  'Pakistan', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia',
  'Saudi Arabia', 'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland',
  'Taiwan', 'Thailand', 'Turkey', 'UAE', 'Ukraine', 'United Kingdom', 'United States', 'Uruguay', 'Vietnam'
];

// Initialize countries when page loads
document.addEventListener('DOMContentLoaded', function() {
  // ... your existing initialization code ...
  
  // Load countries into select elements
  loadCountries();
  
  // Setup delete validation initially
  setupDeleteValidation();
});

// Load countries into select elements
function loadCountries() {
  const countrySelects = ['createCountry', 'countryFilter'];
  
  countrySelects.forEach(selectId => {
    const select = document.getElementById(selectId);
    if (select) {
      // Clear existing options except the first one
      const firstOption = select.options[0];
      select.innerHTML = '';
      select.appendChild(firstOption);
      
      // Add country options
      availableCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        select.appendChild(option);
      });
    }
  });
  
  countriesLoaded = true;
  console.log('Countries loaded successfully');
}

// Toggle CRUD Modal
function toggleCrudModal() {
  const modal = document.getElementById('crudModal');
  if (modal.classList.contains('hidden')) {
    modal.classList.remove('hidden');
    // Default to create operation
    selectCrudOperation('create');
    // Ensure countries are loaded
    if (!countriesLoaded) {
      loadCountries();
    }
  } else {
    closeCrudModal();
  }
}

// Close CRUD Modal
function closeCrudModal() {
  document.getElementById('crudModal').classList.add('hidden');
  resetAllCrudForms();
}

// Select CRUD Operation
function selectCrudOperation(operation) {
  // Hide all operations
  document.getElementById('createOperation').classList.add('hidden');
  document.getElementById('updateOperation').classList.add('hidden');
  document.getElementById('deleteOperation').classList.add('hidden');
  
  // Reset all tab styles
  const tabs = ['createTab', 'updateTab', 'deleteTab'];
  tabs.forEach(tab => {
    const el = document.getElementById(tab);
    el.className = 'flex-1 py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800';
  });
  
  // Show selected operation
  document.getElementById(operation + 'Operation').classList.remove('hidden');
  
  // Style active tab
  const activeTab = document.getElementById(operation + 'Tab');
  if (operation === 'create') {
    activeTab.className = 'flex-1 py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center gap-2 bg-green-600 text-white';
    // Ensure countries are loaded for create form
    if (!countriesLoaded) {
      loadCountries();
    }
  } else if (operation === 'update') {
    activeTab.className = 'flex-1 py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center gap-2 bg-blue-600 text-white';
  } else if (operation === 'delete') {
    activeTab.className = 'flex-1 py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center gap-2 bg-red-600 text-white';
    setupDeleteValidation();
  }
}

// Setup delete validation
function setupDeleteValidation() {
  const checkbox = document.getElementById('deleteConfirm');
  const deleteBtn = document.getElementById('deleteBtn');
  
  // Remove existing event listeners
  checkbox.removeEventListener('change', deleteValidationHandler);
  
  // Add new event listener
  checkbox.addEventListener('change', deleteValidationHandler);
}

// Delete validation handler
function deleteValidationHandler() {
  const checkbox = document.getElementById('deleteConfirm');
  const deleteBtn = document.getElementById('deleteBtn');
  
  if (checkbox.checked) {
    deleteBtn.disabled = false;
    deleteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  } else {
    deleteBtn.disabled = true;
    deleteBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
}

// Execute CRUD Operation
async function executeCrud(operation) {
  const button = document.getElementById(operation + 'Btn');
  const originalText = button.innerHTML;
  
  // Build command
  let command = '';
  if (operation === 'create') {
    command = buildEnhancedCreateCommand();
  } else if (operation === 'update') {
    command = buildEnhancedUpdateCommand();
  } else if (operation === 'delete') {
    command = buildDeleteCommand();
  }
  
  if (!command) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  // Show loading
  button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
  button.disabled = true;
  
  try {
    console.log('Executing CRUD command:', command);
    
    const response = await fetch(`https://thecyberlearn.app.n8n.cloud/webhook/search-airtable?query=${encodeURIComponent(command)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    const message = extractMessageContent(result) || 'Operation completed successfully';
    const cleanMessage = message.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').trim();

    // Show success toast
    showToast(cleanMessage, 'success');
    
    // Reset form and close modal
    resetAllCrudForms();
    closeCrudModal();
    
    // Refresh results if any exist
    if (currentSearchData.length > 0) {
      setTimeout(() => {
        const currentQuery = document.getElementById('query').value;
        if (currentQuery) callWorkflow();
      }, 1000);
    }

  } catch (error) {
    console.error('CRUD operation error:', error);
    showToast('Operation failed: ' + error.message, 'error');
  } finally {
    button.innerHTML = originalText;
    button.disabled = false;
  }
}

// Enhanced Build Create Command with all fields
function buildEnhancedCreateCommand() {
  const type = document.getElementById('createType').value;
  const name = document.getElementById('createName').value.trim();
  const country = document.getElementById('createCountry').value;
  const email = document.getElementById('createEmail').value.trim();
  const phone = document.getElementById('createPhone').value.trim();
  const website = document.getElementById('createWebsite').value.trim();
  const products = document.getElementById('createProducts').value.trim();
  const address = document.getElementById('createAddress').value.trim();
  
  if (!type || !name) {
    return '';
  }
  
  let command = `create ${type} ${name}`;
  
  // Add all available fields
  if (country) command += ` from ${country}`;
  if (email) command += ` email ${email}`;
  if (phone) command += ` phone ${phone}`;
  if (website) command += ` website ${website}`;
  if (products) command += ` products ${products}`;
  if (address) command += ` address ${address}`;
  
  return command;
}

// Enhanced Build Update Command
function buildEnhancedUpdateCommand() {
  const name = document.getElementById('updateName').value.trim();
  const field = document.getElementById('updateField').value;
  const value = document.getElementById('updateValue').value.trim();
  
  if (!name || !field || !value) {
    return '';
  }
  
  return `update ${name} ${field} to ${value}`;
}

// Build Delete Command (unchanged)
function buildDeleteCommand() {
  const name = document.getElementById('deleteName').value.trim();
  const confirmed = document.getElementById('deleteConfirm').checked;
  
  if (!name || !confirmed) {
    return '';
  }
  
  return `delete ${name}`;
}

// Enhanced Reset All CRUD Forms
function resetAllCrudForms() {
  // Reset create form
  document.getElementById('createType').value = '';
  document.getElementById('createName').value = '';
  document.getElementById('createCountry').value = '';
  document.getElementById('createEmail').value = '';
  document.getElementById('createPhone').value = '';
  document.getElementById('createWebsite').value = '';
  document.getElementById('createProducts').value = '';
  document.getElementById('createAddress').value = '';
  
  // Reset update form
  document.getElementById('updateName').value = '';
  document.getElementById('updateField').value = '';
  document.getElementById('updateValue').value = '';
  
  // Reset delete form
  document.getElementById('deleteName').value = '';
  document.getElementById('deleteConfirm').checked = false;
  const deleteBtn = document.getElementById('deleteBtn');
  deleteBtn.disabled = true;
  deleteBtn.classList.add('opacity-50', 'cursor-not-allowed');
}

// Enhanced Toast Notification System
function showToast(message, type = 'info', duration = 5000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  
  // Set toast styles based on type
  let bgColor, iconClass, borderColor;
  switch (type) {
    case 'success':
      bgColor = 'bg-green-500';
      iconClass = 'fas fa-check-circle';
      borderColor = 'border-green-400';
      break;
    case 'error':
      bgColor = 'bg-red-500';
      iconClass = 'fas fa-exclamation-circle';
      borderColor = 'border-red-400';
      break;
    case 'warning':
      bgColor = 'bg-yellow-500';
      iconClass = 'fas fa-exclamation-triangle';
      borderColor = 'border-yellow-400';
      break;
    default:
      bgColor = 'bg-blue-500';
      iconClass = 'fas fa-info-circle';
      borderColor = 'border-blue-400';
  }
  
  toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg border-l-4 ${borderColor} max-w-sm transform translate-x-full transition-transform duration-300 ease-out`;
  toast.innerHTML = `
    <div class="flex items-start gap-3">
      <i class="${iconClass} mt-0.5"></i>
      <div class="flex-1">
        <p class="text-sm font-medium">${message}</p>
      </div>
      <button onclick="removeToast(this)" class="text-white hover:text-gray-200 ml-2">
        <i class="fas fa-times text-sm"></i>
      </button>
    </div>
  `;
  
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 100);
  
  // Auto remove
  setTimeout(() => {
    removeToast(toast);
  }, duration);
}

// Remove Toast
function removeToast(element) {
  const toast = element.tagName === 'BUTTON' ? element.closest('div') : element;
  toast.classList.add('translate-x-full');
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
  const modal = document.getElementById('crudModal');
  if (event.target === modal) {
    closeCrudModal();
  }
});

// Helper function to extract message content (if not already defined)
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