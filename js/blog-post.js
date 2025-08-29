// Individual Blog Post Handler
// Handles loading and displaying individual blog posts using URL parameters

console.log('📄 [BLOG POST] Blog post handler loaded');

// Blog post state
let currentPost = null;
let relatedPosts = [];

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 [BLOG POST] Initializing blog post page...');
    
    initBlogPost();
});

// Main initialization function
async function initBlogPost() {
    try {
        // Read slug from URL parameters
        const postSlug = getPostSlugFromURL();
        
        if (!postSlug) {
            console.log('📄 [BLOG POST] No slug found, redirecting to blog');
            redirectToBlog();
            return;
        }
        
        console.log('📄 [BLOG POST] Loading post with slug:', postSlug);
        
        // Show loading state
        showLoadingState();
        
        // Load the specific post
        await loadSpecificPost(postSlug);
        
        // Initialize page features
        initPageFeatures();
        
    } catch (error) {
        console.error('📄 [BLOG POST] Error initializing blog post:', error);
        showErrorState();
    }
}

// Get post slug from URL parameters
function getPostSlugFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('slug');
}

// Load specific post from Airtable
async function loadSpecificPost(slug) {
    try {
        console.log('📄 [BLOG POST] Fetching post from Airtable...');
        
        // Check if Airtable is configured
        if (!window.BlogAirtable || 
            window.BlogAirtable.AIRTABLE_CONFIG.baseId === 'YOUR_BASE_ID' || 
            window.BlogAirtable.AIRTABLE_CONFIG.apiKey === 'YOUR_API_KEY') {
            
            console.log('📄 [BLOG POST] Using placeholder data - Airtable not configured');
            currentPost = getPlaceholderPost(slug);
            
            if (!currentPost) {
                show404Error();
                return;
            }
        } else {
            // Fetch from Airtable
            const config = window.BlogAirtable.AIRTABLE_CONFIG;
            const response = await fetch(
                `${config.apiUrl}/${config.baseId}/${encodeURIComponent(config.tableName)}?filterByFormula={Slug}='${slug}'&filterByFormula=AND({Status}='Published')`,
                {
                    headers: {
                        'Authorization': `Bearer ${config.apiKey}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.records.length === 0) {
                show404Error();
                return;
            }
            
            currentPost = formatAirtableRecord(data.records[0]);
        }
        
        // Populate the page with post data
        populatePostPage(currentPost);
        
        // Load related content
        await loadRelatedContent();
        
        // Update view count
        updateViewCount(currentPost.id);
        
        console.log('📄 [BLOG POST] Post loaded successfully:', currentPost.title);
        
    } catch (error) {
        console.error('📄 [BLOG POST] Error loading post:', error);
        showErrorState();
    }
}

// Format Airtable record (reuse from blog-airtable.js)
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

// Get placeholder post for development
function getPlaceholderPost(slug) {
    // Get placeholder posts from blog-airtable.js
    if (window.BlogAirtable && window.BlogAirtable.blogState.allPosts.length > 0) {
        return window.BlogAirtable.blogState.allPosts.find(post => post.slug === slug);
    }
    
    // Fallback placeholder posts
    const placeholderPosts = [
        {
            id: '1',
            title: 'Automating Sales Processes with AI: A Complete Guide',
            slug: 'automating-sales-processes-ai-guide',
            excerpt: 'Discover how artificial intelligence can revolutionize your sales workflow, from lead qualification to deal closing. Learn practical strategies and tools.',
            content: `# Automating Sales Processes with AI: A Complete Guide

## Introduction

Artificial Intelligence is transforming the sales landscape, offering unprecedented opportunities to streamline processes, improve efficiency, and boost revenue. In this comprehensive guide, we'll explore how you can leverage AI to automate your sales processes and stay ahead of the competition.

## Why AI in Sales?

The modern sales environment is more complex than ever. Sales teams are dealing with:

- **Increased competition** across all industries
- **Higher customer expectations** for personalized experiences
- **Massive amounts of data** that need to be processed and analyzed
- **Longer sales cycles** requiring more touchpoints
- **Remote selling challenges** in a post-pandemic world

AI addresses these challenges by providing:

### 1. Intelligent Lead Scoring

AI algorithms can analyze hundreds of data points to identify the most promising leads. This includes:

- **Demographic information**
- **Behavioral patterns** on your website
- **Social media activity**
- **Email engagement rates**
- **Past purchase history**

### 2. Predictive Analytics

Machine learning models can predict:

- Which deals are most likely to close
- When prospects are ready to buy
- What products customers might need next
- Potential churn risks

### 3. Automated Personalization

AI can create personalized experiences at scale:

- **Dynamic email content** based on recipient behavior
- **Customized product recommendations**
- **Personalized pricing strategies**
- **Tailored communication timing**

## Implementation Strategy

### Phase 1: Data Foundation

Before implementing AI, ensure you have:

1. **Clean, organized data** in your CRM
2. **Consistent data entry** processes
3. **Integration** between your tools
4. **Clear objectives** for what you want to achieve

### Phase 2: Tool Selection

Choose AI tools that integrate with your existing stack:

- **CRM-native AI** features
- **Third-party AI platforms**
- **Custom AI solutions**

### Phase 3: Training and Adoption

- **Train your team** on new tools
- **Start with pilot programs**
- **Measure and optimize** continuously

## Best Practices

1. **Start small** and scale gradually
2. **Focus on high-impact areas** first
3. **Maintain human oversight**
4. **Continuously monitor** and adjust
5. **Invest in training** your team

## Conclusion

AI automation in sales isn't about replacing human salespeople—it's about empowering them to be more effective, efficient, and successful. By automating routine tasks and providing intelligent insights, AI allows your sales team to focus on what they do best: building relationships and closing deals.

The future of sales is here, and it's powered by AI. Start your automation journey today and watch your sales performance soar.`,
            featuredImage: null,
            publishedDate: '2024-01-15',
            author: 'Alex Castro',
            category: 'ai',
            tags: ['AI', 'Sales', 'Automation'],
            readTime: 8,
            views: 245,
            featured: true
        }
    ];
    
    return placeholderPosts.find(post => post.slug === slug);
}

// Populate the post page with data
function populatePostPage(post) {
    console.log('📄 [BLOG POST] Populating page with post data');
    
    // Update page title
    document.title = `${post.title} - Alex Castro Blog`;
    
    // Update meta tags
    updateMetaTags(post);
    
    // Update post header
    document.getElementById('postTitle').textContent = post.title;
    document.getElementById('postExcerpt').textContent = post.excerpt;
    document.getElementById('postDate').textContent = formatDate(post.publishedDate);
    document.getElementById('postReadTime').textContent = `${post.readTime} min read`;
    document.getElementById('postViews').textContent = `${post.views} views`;
    
    // Update category badge
    const categoryBadge = document.getElementById('postCategory');
    if (categoryBadge) {
        categoryBadge.textContent = getCategoryDisplayName(post.category);
        categoryBadge.className = `post-category-badge category-${post.category}`;
    }
    
    // Update tags
    const tagsContainer = document.getElementById('postTags');
    if (tagsContainer && post.tags.length > 0) {
        tagsContainer.innerHTML = post.tags.map(tag => 
            `<span class="post-tag">${tag}</span>`
        ).join('');
    }
    
    // Update featured image
    const featuredImageContainer = document.getElementById('postFeaturedImage');
    if (featuredImageContainer) {
        if (post.featuredImage) {
            featuredImageContainer.innerHTML = `
                <img src="${post.featuredImage}" alt="${post.title}" class="featured-image" />
            `;
        } else {
            featuredImageContainer.innerHTML = `
                <div class="featured-image-placeholder">
                    <i class="fas fa-image"></i>
                </div>
            `;
        }
    }
    
    // Update main content
    const contentContainer = document.getElementById('postContent');
    if (contentContainer) {
        contentContainer.innerHTML = markdownToHTML(post.content);
    }
    
    // Hide loading state
    hideLoadingState();
    
    // Generate table of contents
    generateTableOfContents();
    
    // Initialize reading progress
    initReadingProgress();
}

// Utility functions
function generateSlug(title) {
    if (!title) return '';
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

function getCategoryDisplayName(category) {
    const categoryNames = {
        'ai': 'AI & Automation',
        'sales': 'Sales Strategies',
        'development': 'Development',
        'insights': 'Business Insights'
    };
    return categoryNames[category.toLowerCase()] || category;
}

// Redirect to blog page
function redirectToBlog() {
    window.location.href = 'blog.html';
}

// Loading and error states
function showLoadingState() {
    const contentContainer = document.getElementById('postContent');
    if (contentContainer) {
        contentContainer.innerHTML = `
            <div class="content-loading">
                <div class="loading-spinner"></div>
                <p>Loading content...</p>
            </div>
        `;
    }
}

function hideLoadingState() {
    const loadingElements = document.querySelectorAll('.content-loading');
    loadingElements.forEach(element => {
        element.style.display = 'none';
    });
}

function showErrorState() {
    const contentContainer = document.getElementById('postContent');
    if (contentContainer) {
        contentContainer.innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Unable to load article</h3>
                <p>Sorry, we couldn't load this article. Please check your connection and try again.</p>
                <button onclick="window.location.reload()" class="btn-primary">
                    <i class="fas fa-refresh"></i> Try Again
                </button>
                <a href="blog.html" class="btn-secondary">
                    <i class="fas fa-arrow-left"></i> Back to Blog
                </a>
            </div>
        `;
    }
}

function show404Error() {
    const contentContainer = document.getElementById('postContent');
    if (contentContainer) {
        contentContainer.innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>Article not found</h3>
                <p>The article you're looking for doesn't exist or has been moved.</p>
                <a href="blog.html" class="btn-primary">
                    <i class="fas fa-arrow-left"></i> Back to Blog
                </a>
            </div>
        `;
    }
    
    // Update page title
    document.title = 'Article Not Found - Alex Castro Blog';
}

// Update meta tags for SEO and social sharing
function updateMetaTags(post) {
    console.log('📄 [BLOG POST] Updating meta tags for SEO');

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = post.excerpt;
    }

    // Update Open Graph tags
    const ogTitle = document.getElementById('og-title');
    const ogDescription = document.getElementById('og-description');
    const ogImage = document.getElementById('og-image');
    const ogUrl = document.getElementById('og-url');

    if (ogTitle) ogTitle.content = post.title;
    if (ogDescription) ogDescription.content = post.excerpt;
    if (ogUrl) ogUrl.content = window.location.href;

    if (ogImage && post.featuredImage) {
        ogImage.content = post.featuredImage;
    }

    // Update keywords meta tag
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && post.tags.length > 0) {
        metaKeywords.content = post.tags.join(', ');
    }
}

// Simple markdown to HTML conversion
function markdownToHTML(markdown) {
    if (!markdown) return '';

    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

    // Wrap consecutive list items in ul/ol
    html = html.replace(/(<li>.*<\/li>)/gs, function(match) {
        return '<ul>' + match + '</ul>';
    });

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');

    return html;
}

// Generate table of contents from headings
function generateTableOfContents() {
    console.log('📄 [BLOG POST] Generating table of contents');

    const contentContainer = document.getElementById('postContent');
    const tocContainer = document.getElementById('tocNav');

    if (!contentContainer || !tocContainer) return;

    const headings = contentContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');

    if (headings.length === 0) {
        document.getElementById('tableOfContents').style.display = 'none';
        return;
    }

    let tocHTML = '';

    headings.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;

        const level = parseInt(heading.tagName.charAt(1));
        const indent = (level - 1) * 20;

        tocHTML += `
            <a href="#${id}" class="toc-link" style="padding-left: ${indent}px;" onclick="scrollToHeading('${id}'); return false;">
                ${heading.textContent}
            </a>
        `;
    });

    tocContainer.innerHTML = tocHTML;
}

// Smooth scroll to heading
function scrollToHeading(headingId) {
    const heading = document.getElementById(headingId);
    if (heading) {
        heading.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Initialize reading progress bar
function initReadingProgress() {
    console.log('📄 [BLOG POST] Initializing reading progress');

    const progressBar = document.getElementById('readingProgressBar');
    if (!progressBar) return;

    function updateProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;

        progressBar.style.width = Math.min(scrollPercent, 100) + '%';
    }

    window.addEventListener('scroll', updateProgress);
    updateProgress(); // Initial call
}

// Load related content
async function loadRelatedContent() {
    console.log('📄 [BLOG POST] Loading related content');

    try {
        // Get all posts for finding related ones
        let allPosts = [];

        if (window.BlogAirtable && window.BlogAirtable.blogState.allPosts.length > 0) {
            allPosts = window.BlogAirtable.blogState.allPosts;
        } else {
            // Fallback to placeholder posts
            allPosts = getPlaceholderPosts();
        }

        // Find related posts
        relatedPosts = findRelatedPosts(currentPost, allPosts);

        // Display related posts
        displayRelatedPosts(relatedPosts);

    } catch (error) {
        console.error('📄 [BLOG POST] Error loading related content:', error);
    }
}

// Find related posts based on category and tags
function findRelatedPosts(currentPost, allPosts) {
    if (!currentPost || !allPosts) return [];

    const related = allPosts
        .filter(post => post.slug !== currentPost.slug) // Exclude current post
        .map(post => {
            let score = 0;

            // Same category gets high score
            if (post.category === currentPost.category) {
                score += 10;
            }

            // Shared tags get points
            const sharedTags = post.tags.filter(tag =>
                currentPost.tags.includes(tag)
            );
            score += sharedTags.length * 3;

            return { post, score };
        })
        .filter(item => item.score > 0) // Only posts with some relation
        .sort((a, b) => b.score - a.score) // Sort by relevance
        .slice(0, 3) // Take top 3
        .map(item => item.post);

    return related;
}

// Display related posts
function displayRelatedPosts(posts) {
    const relatedContainer = document.getElementById('relatedPostsGrid');
    if (!relatedContainer) return;

    if (posts.length === 0) {
        document.getElementById('relatedPosts').style.display = 'none';
        return;
    }

    const relatedHTML = posts.map(post => `
        <div class="related-post-card blog-post-card" onclick="openPost('${post.slug}')">
            <div class="glowing-container">
                <div class="glowing-effect"></div>
            </div>
            <div class="blog-post-card-inner">
                <div class="related-post-image post-image">
                    ${post.featuredImage
                        ? `<img src="${post.featuredImage}" alt="${post.title}" />`
                        : `<div class="related-image-placeholder post-image-placeholder"><i class="fas fa-file-alt"></i></div>`
                    }
                </div>
                <div class="related-post-content post-content">
                    <div class="related-post-category post-category">${getCategoryDisplayName(post.category)}</div>
                    <h4 class="related-post-title post-title">${post.title}</h4>
                    <p class="related-post-excerpt post-excerpt">${post.excerpt}</p>
                    <div class="related-post-meta post-meta">
                        <span class="related-post-date post-date">${formatDate(post.publishedDate)}</span>
                        <span class="related-post-read-time post-read-time">${post.readTime} min read</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    relatedContainer.innerHTML = relatedHTML;
}

// Get placeholder posts for development
function getPlaceholderPosts() {
    return [
        {
            id: '2',
            title: 'Building Custom Dashboards: From Data to Insights',
            slug: 'building-custom-dashboards-data-insights',
            excerpt: 'Step-by-step guide to creating powerful analytics dashboards that drive business decisions.',
            category: 'development',
            tags: ['Dashboard', 'Analytics', 'Development'],
            readTime: 12,
            publishedDate: '2024-01-10',
            featuredImage: null
        },
        {
            id: '3',
            title: 'The Psychology of B2B Sales: Understanding Your Buyers',
            slug: 'psychology-b2b-sales-understanding-buyers',
            excerpt: 'Dive deep into the psychological factors that influence B2B purchasing decisions.',
            category: 'sales',
            tags: ['B2B', 'Psychology', 'Sales Strategy'],
            readTime: 6,
            publishedDate: '2024-01-05',
            featuredImage: null
        }
    ];
}

// Initialize page features
function initPageFeatures() {
    console.log('📄 [BLOG POST] Initializing page features');

    // Initialize back to top button
    initBackToTop();

    // Initialize social sharing
    initSocialSharing();

    // Initialize navigation
    initPostNavigation();

    // Initialize Qoder mouse effect for related posts
    if (window.BlogAnimations && window.BlogAnimations.initQoderMouseEffect) {
        setTimeout(() => {
            window.BlogAnimations.initQoderMouseEffect();
        }, 500);
    }
}

// Initialize back to top button
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;

    function toggleBackToTop() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    }

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', toggleBackToTop);
    toggleBackToTop(); // Initial call
}

// Update view count
function updateViewCount(postId) {
    // TODO: Implement view count update in Airtable
    console.log('📄 [BLOG POST] View count updated for post:', postId);
}

// Make functions globally available
window.scrollToHeading = scrollToHeading;
window.openPost = function(slug) {
    window.location.href = `blog-post.html?slug=${slug}`;
};

// Initialize social sharing
function initSocialSharing() {
    console.log('📄 [BLOG POST] Initializing social sharing');

    // Social sharing functions are defined globally for onclick handlers
    window.shareOnTwitter = function() {
        if (!currentPost) return;

        const text = `${currentPost.title} by @alexcastro`;
        const url = window.location.href;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

        window.open(twitterUrl, '_blank', 'width=600,height=400');
    };

    window.shareOnLinkedIn = function() {
        if (!currentPost) return;

        const url = window.location.href;
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

        window.open(linkedInUrl, '_blank', 'width=600,height=400');
    };

    window.shareOnFacebook = function() {
        if (!currentPost) return;

        const url = window.location.href;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

        window.open(facebookUrl, '_blank', 'width=600,height=400');
    };

    window.copyLink = function() {
        const url = window.location.href;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(function() {
                showCopySuccess();
            }).catch(function() {
                fallbackCopyLink(url);
            });
        } else {
            fallbackCopyLink(url);
        }
    };
}

// Show copy success message
function showCopySuccess() {
    const copyBtn = document.querySelector('.share-btn.copy');
    if (copyBtn) {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>';
        copyBtn.style.background = 'var(--success-color, #28a745)';

        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }
}

// Fallback copy method for older browsers
function fallbackCopyLink(url) {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        showCopySuccess();
    } catch (err) {
        console.error('Failed to copy link:', err);
        alert('Failed to copy link. Please copy manually: ' + url);
    }

    document.body.removeChild(textArea);
}

// Initialize post navigation
function initPostNavigation() {
    console.log('📄 [BLOG POST] Initializing post navigation');

    // TODO: Implement previous/next post navigation
    // This would require loading all posts and finding the current post's position
    const navigationContainer = document.getElementById('postNavigation');
    if (navigationContainer) {
        navigationContainer.innerHTML = `
            <div class="post-nav-links">
                <a href="blog.html" class="nav-link prev-link">
                    <i class="fas fa-arrow-left"></i>
                    <div class="nav-link-content">
                        <span class="nav-link-label">Back to</span>
                        <span class="nav-link-title">All Articles</span>
                    </div>
                </a>
            </div>
        `;
    }
}

// Export for external use
window.BlogPost = {
    currentPost,
    relatedPosts,
    loadSpecificPost,
    populatePostPage,
    initSocialSharing
};
