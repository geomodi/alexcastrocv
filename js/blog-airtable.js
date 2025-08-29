// Blog Airtable Integration
// Handles fetching and displaying blog data from Airtable

console.log('📊 [AIRTABLE] Blog Airtable integration loaded');

// Airtable Configuration - REPLACE WITH YOUR ACTUAL VALUES
const AIRTABLE_CONFIG = {
    baseId: 'YOUR_BASE_ID', // Replace with your Airtable base ID
    tableName: 'Blog Posts', // Your table name
    apiKey: 'YOUR_API_KEY', // Replace with your Airtable API key
    apiUrl: 'https://api.airtable.com/v0'
};

// Blog state management
let blogState = {
    allPosts: [],
    filteredPosts: [],
    currentPage: 1,
    postsPerPage: 10,
    totalPages: 1,
    currentCategory: '',
    currentSearch: '',
    currentSort: 'date-desc',
    isLoading: false
};

// Initialize blog when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 [AIRTABLE] Initializing blog...');
    
    initBlogEventListeners();
    loadBlogPosts();
});

// Initialize event listeners
function initBlogEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('blogSearch');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                blogState.currentSearch = this.value.toLowerCase();
                blogState.currentPage = 1;
                filterAndDisplayPosts();
            }, 300);
        });
    }

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            blogState.currentCategory = this.value;
            blogState.currentPage = 1;
            filterAndDisplayPosts();
        });
    }

    // Sort functionality
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            blogState.currentSort = this.value;
            filterAndDisplayPosts();
        });
    }

    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleNewsletterSignup(this);
        });
    }
}

// Load blog posts from Airtable
async function loadBlogPosts() {
    if (blogState.isLoading) return;
    
    blogState.isLoading = true;
    BlogAnimations.showLoadingState();
    
    try {
        console.log('📊 [AIRTABLE] Fetching blog posts...');
        
        // Check if Airtable is configured
        if (AIRTABLE_CONFIG.baseId === 'YOUR_BASE_ID' || AIRTABLE_CONFIG.apiKey === 'YOUR_API_KEY') {
            console.log('📊 [AIRTABLE] Using placeholder data - Airtable not configured yet');
            blogState.allPosts = getPlaceholderPosts();
        } else {
            // Fetch from Airtable
            const response = await fetch(`${AIRTABLE_CONFIG.apiUrl}/${AIRTABLE_CONFIG.baseId}/${encodeURIComponent(AIRTABLE_CONFIG.tableName)}?filterByFormula={Status}='Published'&sort[0][field]=Published Date&sort[0][direction]=desc`, {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            blogState.allPosts = data.records.map(record => formatAirtableRecord(record));
        }
        
        console.log(`📊 [AIRTABLE] Loaded ${blogState.allPosts.length} posts`);
        
        filterAndDisplayPosts();
        loadSidebarContent();
        
    } catch (error) {
        console.error('📊 [AIRTABLE] Error loading posts:', error);
        displayErrorState();
    } finally {
        blogState.isLoading = false;
        BlogAnimations.hideLoadingState();
    }
}

// Format Airtable record to blog post format
function formatAirtableRecord(record) {
    const fields = record.fields;
    return {
        id: record.id,
        title: fields.Title || 'Untitled Post',
        slug: fields.Slug || generateSlug(fields.Title),
        content: fields.Content || '',
        excerpt: fields.Excerpt || generateExcerpt(fields.Content),
        featuredImage: fields['Featured Image'] ? fields['Featured Image'][0]?.url : null,
        publishedDate: fields['Published Date'] || new Date().toISOString(),
        author: fields.Author || 'Alex Castro',
        category: fields.Category || 'General',
        tags: fields.Tags || [],
        readTime: fields['Read Time'] || calculateReadTime(fields.Content),
        views: fields.Views || 0,
        featured: fields.Featured || false
    };
}

// Generate placeholder posts for development
function getPlaceholderPosts() {
    return [
        {
            id: '1',
            title: 'Automating Sales Processes with AI: A Complete Guide',
            slug: 'automating-sales-processes-ai-guide',
            excerpt: 'Discover how artificial intelligence can revolutionize your sales workflow, from lead qualification to deal closing. Learn practical strategies and tools.',
            content: 'Full content would be here...',
            featuredImage: null,
            publishedDate: '2024-01-15',
            author: 'Alex Castro',
            category: 'ai',
            tags: ['AI', 'Sales', 'Automation'],
            readTime: 8,
            views: 245,
            featured: true
        },
        {
            id: '2',
            title: 'Building Custom Dashboards: From Data to Insights',
            slug: 'building-custom-dashboards-data-insights',
            excerpt: 'Step-by-step guide to creating powerful analytics dashboards that drive business decisions. Includes code examples and best practices.',
            content: 'Full content would be here...',
            featuredImage: null,
            publishedDate: '2024-01-10',
            author: 'Alex Castro',
            category: 'development',
            tags: ['Dashboard', 'Analytics', 'Development'],
            readTime: 12,
            views: 189,
            featured: false
        },
        {
            id: '3',
            title: 'The Psychology of B2B Sales: Understanding Your Buyers',
            slug: 'psychology-b2b-sales-understanding-buyers',
            excerpt: 'Dive deep into the psychological factors that influence B2B purchasing decisions and how to leverage them ethically.',
            content: 'Full content would be here...',
            featuredImage: null,
            publishedDate: '2024-01-05',
            author: 'Alex Castro',
            category: 'sales',
            tags: ['B2B', 'Psychology', 'Sales Strategy'],
            readTime: 6,
            views: 156,
            featured: false
        },
        {
            id: '4',
            title: 'CRM Integration Strategies for Growing Teams',
            slug: 'crm-integration-strategies-growing-teams',
            excerpt: 'Learn how to seamlessly integrate CRM systems with your existing tools and workflows for maximum efficiency.',
            content: 'Full content would be here...',
            featuredImage: null,
            publishedDate: '2024-01-01',
            author: 'Alex Castro',
            category: 'insights',
            tags: ['CRM', 'Integration', 'Team Management'],
            readTime: 10,
            views: 203,
            featured: false
        },
        {
            id: '5',
            title: 'Machine Learning for Sales Forecasting',
            slug: 'machine-learning-sales-forecasting',
            excerpt: 'Explore how machine learning algorithms can improve sales forecasting accuracy and help predict market trends.',
            content: 'Full content would be here...',
            featuredImage: null,
            publishedDate: '2023-12-28',
            author: 'Alex Castro',
            category: 'ai',
            tags: ['Machine Learning', 'Forecasting', 'Sales Analytics'],
            readTime: 15,
            views: 178,
            featured: false
        },
        {
            id: '6',
            title: 'Responsive Web Design: Mobile-First Approach',
            slug: 'responsive-web-design-mobile-first',
            excerpt: 'Master the art of creating websites that work beautifully on all devices with modern CSS techniques and best practices.',
            content: 'Full content would be here...',
            featuredImage: null,
            publishedDate: '2023-12-25',
            author: 'Alex Castro',
            category: 'development',
            tags: ['Web Design', 'CSS', 'Mobile'],
            readTime: 9,
            views: 134,
            featured: false
        },
        {
            id: '7',
            title: 'Sales Team Performance Metrics That Matter',
            slug: 'sales-team-performance-metrics-matter',
            excerpt: 'Identify and track the key performance indicators that actually drive sales success and team growth.',
            content: 'Full content would be here...',
            featuredImage: null,
            publishedDate: '2023-12-20',
            author: 'Alex Castro',
            category: 'sales',
            tags: ['KPIs', 'Performance', 'Sales Management'],
            readTime: 7,
            views: 167,
            featured: false
        },
        {
            id: '8',
            title: 'API Integration Best Practices for Developers',
            slug: 'api-integration-best-practices-developers',
            excerpt: 'Learn essential techniques for building robust API integrations that scale with your business needs.',
            content: 'Full content would be here...',
            featuredImage: null,
            publishedDate: '2023-12-15',
            author: 'Alex Castro',
            category: 'development',
            tags: ['API', 'Integration', 'Best Practices'],
            readTime: 11,
            views: 145,
            featured: false
        },
        {
            id: '9',
            title: 'Digital Transformation in Small Businesses',
            slug: 'digital-transformation-small-businesses',
            excerpt: 'A practical roadmap for small businesses to embrace digital transformation without breaking the bank.',
            content: 'Full content would be here...',
            featuredImage: null,
            publishedDate: '2023-12-10',
            author: 'Alex Castro',
            category: 'insights',
            tags: ['Digital Transformation', 'Small Business', 'Strategy'],
            readTime: 8,
            views: 198,
            featured: false
        },
        {
            id: '10',
            title: 'Chatbots and Customer Service Automation',
            slug: 'chatbots-customer-service-automation',
            excerpt: 'Explore how AI-powered chatbots can enhance customer service while reducing operational costs.',
            content: 'Full content would be here...',
            featuredImage: null,
            publishedDate: '2023-12-05',
            author: 'Alex Castro',
            category: 'ai',
            tags: ['Chatbots', 'Customer Service', 'Automation'],
            readTime: 6,
            views: 123,
            featured: false
        },
        {
            id: '11',
            title: 'Advanced JavaScript Patterns for Modern Web Apps',
            slug: 'advanced-javascript-patterns-modern-web-apps',
            excerpt: 'Deep dive into advanced JavaScript patterns and techniques for building scalable, maintainable web applications.',
            content: 'Full content would be here...',
            featuredImage: null,
            publishedDate: '2023-12-01',
            author: 'Alex Castro',
            category: 'development',
            tags: ['JavaScript', 'Patterns', 'Web Development'],
            readTime: 14,
            views: 156,
            featured: false
        },
        {
            id: '12',
            title: 'The Future of Remote Sales Teams',
            slug: 'future-remote-sales-teams',
            excerpt: 'How remote work is reshaping sales strategies and what tools and techniques are essential for success.',
            content: 'Full content would be here...',
            featuredImage: null,
            publishedDate: '2023-11-28',
            author: 'Alex Castro',
            category: 'insights',
            tags: ['Remote Work', 'Sales Strategy', 'Future of Work'],
            readTime: 9,
            views: 187,
            featured: false
        }
    ];
}

// Utility functions
function generateSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
}

function generateExcerpt(content, maxLength = 150) {
    if (!content) return '';
    return content.length > maxLength 
        ? content.substring(0, maxLength) + '...'
        : content;
}

function calculateReadTime(content) {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Filter and display posts
function filterAndDisplayPosts() {
    console.log('📊 [AIRTABLE] Filtering posts...');

    let filtered = [...blogState.allPosts];

    // Apply category filter
    if (blogState.currentCategory) {
        filtered = filtered.filter(post =>
            post.category.toLowerCase() === blogState.currentCategory.toLowerCase()
        );
    }

    // Apply search filter
    if (blogState.currentSearch) {
        filtered = filtered.filter(post =>
            post.title.toLowerCase().includes(blogState.currentSearch) ||
            post.excerpt.toLowerCase().includes(blogState.currentSearch) ||
            post.tags.some(tag => tag.toLowerCase().includes(blogState.currentSearch))
        );
    }

    // Apply sorting
    filtered = sortPosts(filtered, blogState.currentSort);

    blogState.filteredPosts = filtered;
    blogState.totalPages = Math.ceil(filtered.length / blogState.postsPerPage);

    // Ensure current page is valid
    if (blogState.currentPage > blogState.totalPages) {
        blogState.currentPage = 1;
    }

    displayPosts();
    displayPagination();
    updatePostsCount();
}

// Sort posts based on criteria
function sortPosts(posts, sortBy) {
    switch (sortBy) {
        case 'date-desc':
            return posts.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
        case 'date-asc':
            return posts.sort((a, b) => new Date(a.publishedDate) - new Date(b.publishedDate));
        case 'title':
            return posts.sort((a, b) => a.title.localeCompare(b.title));
        case 'popular':
            return posts.sort((a, b) => b.views - a.views);
        default:
            return posts;
    }
}

// Display posts in grid
function displayPosts() {
    const postsGrid = document.getElementById('postsGrid');
    if (!postsGrid) return;

    const startIndex = (blogState.currentPage - 1) * blogState.postsPerPage;
    const endIndex = startIndex + blogState.postsPerPage;
    const postsToShow = blogState.filteredPosts.slice(startIndex, endIndex);

    if (postsToShow.length === 0) {
        displayNoResults();
        return;
    }

    postsGrid.innerHTML = postsToShow.map(post => createPostCard(post)).join('');

    // Add click handlers to post cards
    postsGrid.querySelectorAll('.blog-post-card').forEach(card => {
        card.addEventListener('click', function() {
            const postSlug = this.dataset.postSlug;
            openPost(postSlug);
        });
    });

    // Animate the new posts and initialize mouse effects
    setTimeout(() => {
        BlogAnimations.animatePostGrid();
        if (BlogAnimations.initQoderMouseEffect) {
            BlogAnimations.initQoderMouseEffect();
        }
    }, 100);
}

// Create HTML for a post card
function createPostCard(post) {
    const categoryColors = {
        'ai': 'rgba(0, 212, 255, 0.1)',
        'sales': 'rgba(78, 205, 196, 0.1)',
        'development': 'rgba(255, 107, 107, 0.1)',
        'insights': 'rgba(255, 193, 7, 0.1)'
    };

    const categoryColor = categoryColors[post.category.toLowerCase()] || 'rgba(0, 212, 255, 0.1)';

    return `
        <div class="blog-post-card fade-in" data-post-slug="${post.slug}">
            <div class="blog-post-card-inner">
                <div class="post-image">
                    ${post.featuredImage
                        ? `<img src="${post.featuredImage}" alt="${post.title}" loading="lazy" />`
                        : `<div class="post-image-placeholder"><i class="fas fa-file-alt"></i></div>`
                    }
                </div>
                <div class="post-content">
                    <div class="post-meta">
                        <div class="post-date">
                            <i class="fas fa-calendar-alt"></i>
                            <span>${formatDate(post.publishedDate)}</span>
                        </div>
                        <div class="post-read-time">
                            <i class="fas fa-clock"></i>
                            <span>${post.readTime} min read</span>
                        </div>
                    </div>
                    <div class="post-category" style="background: ${categoryColor}">
                        ${getCategoryDisplayName(post.category)}
                    </div>
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-tags">
                        ${post.tags.slice(0, 3).map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                    </div>
                    <a href="#" class="read-more">
                        <span>Read More</span>
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Get display name for category
function getCategoryDisplayName(category) {
    const categoryNames = {
        'ai': 'AI & Automation',
        'sales': 'Sales Strategies',
        'development': 'Development',
        'insights': 'Business Insights'
    };
    return categoryNames[category.toLowerCase()] || category;
}

// Display pagination
function displayPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    const paginationNumbers = document.getElementById('paginationNumbers');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const paginationInfo = document.getElementById('paginationInfo');

    if (!paginationContainer) return;

    // Show/hide pagination based on total pages
    if (blogState.totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    } else {
        paginationContainer.style.display = 'flex';
    }

    // Update pagination info
    if (paginationInfo) {
        paginationInfo.textContent = `Page ${blogState.currentPage} of ${blogState.totalPages}`;
    }

    // Update prev/next buttons
    if (prevBtn) {
        prevBtn.disabled = blogState.currentPage === 1;
        prevBtn.onclick = () => {
            if (blogState.currentPage > 1) {
                blogState.currentPage--;
                filterAndDisplayPosts();
                scrollToTop();
            }
        };
    }

    if (nextBtn) {
        nextBtn.disabled = blogState.currentPage === blogState.totalPages;
        nextBtn.onclick = () => {
            if (blogState.currentPage < blogState.totalPages) {
                blogState.currentPage++;
                filterAndDisplayPosts();
                scrollToTop();
            }
        };
    }

    // Generate page numbers
    if (paginationNumbers) {
        const pageNumbers = generatePageNumbers();
        paginationNumbers.innerHTML = pageNumbers.map(page => {
            if (page === '...') {
                return '<span class="page-ellipsis">...</span>';
            }
            return `
                <a href="#" class="page-number ${page === blogState.currentPage ? 'active' : ''}"
                   onclick="goToPage(${page}); return false;">
                    ${page}
                </a>
            `;
        }).join('');
    }

    // Animate pagination
    BlogAnimations.animatePagination();
}

// Generate page numbers with ellipsis
function generatePageNumbers() {
    const pages = [];
    const totalPages = blogState.totalPages;
    const currentPage = blogState.currentPage;

    if (totalPages <= 7) {
        // Show all pages if 7 or fewer
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        // Always show first page
        pages.push(1);

        if (currentPage > 4) {
            pages.push('...');
        }

        // Show pages around current page
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 3) {
            pages.push('...');
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }
    }

    return pages;
}

// Go to specific page
function goToPage(page) {
    blogState.currentPage = page;
    filterAndDisplayPosts();
    scrollToTop();
}

// Scroll to top of posts
function scrollToTop() {
    const postsSection = document.querySelector('.blog-posts-section');
    if (postsSection) {
        postsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Update posts count display
function updatePostsCount() {
    const postsCount = document.getElementById('postsCount');
    if (postsCount) {
        const total = blogState.filteredPosts.length;
        const start = (blogState.currentPage - 1) * blogState.postsPerPage + 1;
        const end = Math.min(start + blogState.postsPerPage - 1, total);

        if (total === 0) {
            postsCount.textContent = 'No posts found';
        } else if (total === 1) {
            postsCount.textContent = '1 post';
        } else if (blogState.totalPages === 1) {
            postsCount.textContent = `${total} posts`;
        } else {
            postsCount.textContent = `Showing ${start}-${end} of ${total} posts`;
        }
    }
}

// Display no results state
function displayNoResults() {
    const postsGrid = document.getElementById('postsGrid');
    if (postsGrid) {
        postsGrid.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No posts found</h3>
                <p>Try adjusting your search terms or filters to find what you're looking for.</p>
            </div>
        `;
    }
}

// Display error state
function displayErrorState() {
    const postsGrid = document.getElementById('postsGrid');
    if (postsGrid) {
        postsGrid.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Unable to load posts</h3>
                <p>Please check your internet connection and try again.</p>
                <button onclick="loadBlogPosts()" class="btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-refresh"></i> Try Again
                </button>
            </div>
        `;
    }
}

// Open individual post using dynamic single page approach
function openPost(postSlug) {
    console.log('📊 [AIRTABLE] Opening post with slug:', postSlug);

    // Redirect to blog-post.html with slug parameter
    window.location.href = `blog-post.html?slug=${postSlug}`;
}

// Load sidebar content
function loadSidebarContent() {
    loadFeaturedPost();
    loadCategories();
    loadPopularPosts();
    loadTags();
}

// Load featured post
function loadFeaturedPost() {
    const featuredContainer = document.getElementById('featuredPost');
    if (!featuredContainer) return;

    const featuredPost = blogState.allPosts.find(post => post.featured) || blogState.allPosts[0];

    if (featuredPost) {
        featuredContainer.innerHTML = `
            <div class="featured-content">
                <div class="featured-image">
                    ${featuredPost.featuredImage
                        ? `<img src="${featuredPost.featuredImage}" alt="${featuredPost.title}" />`
                        : `<div class="post-image-placeholder"><i class="fas fa-star"></i></div>`
                    }
                </div>
                <h4 class="featured-title">${featuredPost.title}</h4>
                <p class="featured-excerpt">${featuredPost.excerpt}</p>
            </div>
        `;

        featuredContainer.addEventListener('click', () => openPost(featuredPost.slug));
        featuredContainer.style.cursor = 'pointer';
    }
}

// Load categories
function loadCategories() {
    const categoriesContainer = document.getElementById('categoriesList');
    if (!categoriesContainer) return;

    const categories = {};
    blogState.allPosts.forEach(post => {
        const category = post.category.toLowerCase();
        categories[category] = (categories[category] || 0) + 1;
    });

    const categoryItems = Object.entries(categories).map(([category, count]) => `
        <a href="#" class="category-item" onclick="filterByCategory('${category}'); return false;">
            <span class="category-name">${getCategoryDisplayName(category)}</span>
            <span class="category-count">${count}</span>
        </a>
    `).join('');

    categoriesContainer.innerHTML = categoryItems;
}

// Load popular posts
function loadPopularPosts() {
    const popularContainer = document.getElementById('popularList');
    if (!popularContainer) return;

    const popularPosts = [...blogState.allPosts]
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

    const popularItems = popularPosts.map(post => `
        <a href="#" class="popular-item" onclick="openPost('${post.slug}'); return false;">
            <div class="popular-image">
                ${post.featuredImage
                    ? `<img src="${post.featuredImage}" alt="${post.title}" />`
                    : `<div class="post-image-placeholder"><i class="fas fa-fire"></i></div>`
                }
            </div>
            <div class="popular-content">
                <h5 class="popular-title">${post.title}</h5>
                <div class="popular-date">${formatDate(post.publishedDate)}</div>
            </div>
        </a>
    `).join('');

    popularContainer.innerHTML = popularItems;
}

// Load tags
function loadTags() {
    const tagsContainer = document.getElementById('tagsContainer');
    if (!tagsContainer) return;

    const allTags = {};
    blogState.allPosts.forEach(post => {
        post.tags.forEach(tag => {
            allTags[tag] = (allTags[tag] || 0) + 1;
        });
    });

    const tagItems = Object.entries(allTags)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 15)
        .map(([tag, count]) => `
            <a href="#" class="tag-item" onclick="filterByTag('${tag}'); return false;">
                ${tag}
            </a>
        `).join('');

    tagsContainer.innerHTML = tagItems;
}

// Filter by category
function filterByCategory(category) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = category;
        blogState.currentCategory = category;
        blogState.currentPage = 1;
        filterAndDisplayPosts();
    }
}

// Filter by tag
function filterByTag(tag) {
    const searchInput = document.getElementById('blogSearch');
    if (searchInput) {
        searchInput.value = tag;
        blogState.currentSearch = tag.toLowerCase();
        blogState.currentPage = 1;
        filterAndDisplayPosts();
    }
}

// Newsletter signup
function handleNewsletterSignup(form) {
    const email = form.querySelector('input[type="email"]').value;
    const button = form.querySelector('.newsletter-btn');

    // Animate button
    anime({
        targets: button,
        scale: [1, 0.95, 1],
        duration: 200,
        easing: 'easeOutQuad'
    });

    // TODO: Implement actual newsletter signup
    console.log('📧 Newsletter signup:', email);
    alert('Newsletter signup coming soon! Thanks for your interest.');

    form.reset();
}

// Make functions globally available
window.goToPage = goToPage;
window.filterByCategory = filterByCategory;
window.filterByTag = filterByTag;
window.openPost = openPost;

// Export functions for external use
window.BlogAirtable = {
    loadBlogPosts,
    blogState,
    AIRTABLE_CONFIG,
    filterAndDisplayPosts,
    loadSidebarContent
};
