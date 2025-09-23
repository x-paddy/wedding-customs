/**
 * Combined Wedding Traditions JavaScript
 * Generated automatically - do not edit directly
 *
 * Includes:
 * - wedding-traditions.js (all functionality including accordions)
 */

/* ===== START: wedding-traditions.js ===== */
/**
 * Wedding Traditions Shared JavaScript - Optimized Version
 * Handles accordion functionality, audio pronunciation, mobile menu, and progressive enhancements
 *
 * @version 2.0.0
 * @author Wedding Traditions Pipeline
 * @description Consolidated JavaScript for all wedding traditions functionality
 */
const CONFIG = {
    // Audio base path - simplified relative path
    audioBasePath: '/wedding-customs/cdn/pronunciations/',

    // Feature flags
    enableLazyAudio: true,
    enableSearch: true,
    enableServiceWorker: false,  // Set to true when ready for caching
    enablePerformanceMonitoring: true,

    // Performance settings
    animationDuration: 300,
    scrollOffset: 50,
    debounceDelay: 250,
    reviewAnimationInterval: 4000,

    // Audio settings
    audioPreloadMargin: '50px',
    audioErrorTimeout: 3000
};

// Polyfill for window.matchMedia (for older browsers)
if (!window.matchMedia) {
    window.matchMedia = function(query) {
        const parsed = query.match(/\(([^:]+):\s*([^)]+)\)/);
        const mqType = parsed ? parsed[1] : null;
        const mqValue = parsed ? parsed[2] : null;

        return {
            matches: false,
            media: query,
            onchange: null,
            addListener: function(listener) {
                // Legacy support
                console.warn('matchMedia.addListener is deprecated. Use addEventListener instead.');
            },
            removeListener: function(listener) {
                // Legacy support
                console.warn('matchMedia.removeListener is deprecated. Use removeEventListener instead.');
            },
            addEventListener: function() {},
            removeEventListener: function() {},
            dispatchEvent: function() { return true; }
        };
    };
}

// Feature detection
const FEATURES = {
    localStorage: 'localStorage' in window,
    intersectionObserver: 'IntersectionObserver' in window,
    audioAPI: 'Audio' in window,
    serviceWorker: 'serviceWorker' in navigator
};

// Global state management
const STATE = {};

// Utility functions
const utils = {
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    isElementInViewport: function(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Enhanced Main Initialization
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize core functionality
        initializeAccordions();
        initializeBalloonTooltips(); // Must run before audio terms to setup data
        initializeAudioTerms();
        initializeMobileMenu();
        initializeCurrencyTooltips();
        initializeReviewCards();

        // Initialize Discover-3 carousel if function exists
        if (typeof initializeDiscover3Carousel === 'function') {
            initializeDiscover3Carousel();
        }

        // Initialize enhancements
        initializeMutationObserver();

        // Style special callouts after a short delay
        setTimeout(styleEmojiCallouts, 150);

        // Handle URL navigation
        handleHashNavigation();
        window.addEventListener('hashchange', handleHashNavigation);

        // Add error handling for uncaught errors
        window.addEventListener('error', function(e) {
            console.warn('Wedding Traditions JS Error:', e.error);
        });

    } catch (error) {
        console.error('Failed to initialize Wedding Traditions JavaScript:', error);
    }
});

function initializeAccordions() {
    const accordions = document.querySelectorAll('h2.accordion');

    if (!accordions.length) {
        return; // No accordions found
    }

    accordions.forEach((accordion, index) => {
        const content = accordion.nextElementSibling;
        const accordionId = `accordion-${index}`;
        
        // Set initial state
        setupAccordionState(accordion, content, accordionId);
        
        // Add ARIA attributes for accessibility
        accordion.setAttribute('role', 'button');
        accordion.setAttribute('tabindex', '0');
        accordion.setAttribute('aria-controls', accordionId);
        content.setAttribute('id', accordionId);
        
        // Handle both click and keyboard events
        accordion.addEventListener('click', handleAccordionToggle);
        accordion.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleAccordionToggle.call(this);
            }
        });
        
        function handleAccordionToggle() {
            const clickedContent = this.nextElementSibling;
            const isActive = this.classList.contains('active');

            // Get all accordions and contents
            const allContents = document.querySelectorAll('.accordion-content');
            const allAccordions = document.querySelectorAll('h2.accordion');

            // Close all accordions immediately (no animation due to display:none)
            allContents.forEach(content => {
                content.classList.remove('active');
            });

            allAccordions.forEach(acc => {
                acc.classList.remove('active');
                acc.setAttribute('title', 'Click to open');
                acc.setAttribute('aria-expanded', 'false');
            });

            // If the clicked accordion wasn't active, open it
            if (!isActive) {
                this.classList.add('active');
                this.setAttribute('title', 'Click to close');
                this.setAttribute('aria-expanded', 'true');

                if (clickedContent) {
                    // Open immediately (no delay)
                    clickedContent.classList.add('active');

                    // Smooth scroll to the opened section after a small delay
                    setTimeout(() => {
                        this.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                            inline: 'nearest'
                        });
                    }, 100);
                }
            }
        }
    });
}

// Setup accordion initial state
function setupAccordionState(accordion, content, accordionId) {
    if (content && content.classList.contains('active')) {
        accordion.classList.add('active');
        accordion.setAttribute('title', 'Click to close');
        accordion.setAttribute('aria-expanded', 'true');
    } else {
        accordion.setAttribute('title', 'Click to open');
        accordion.setAttribute('aria-expanded', 'false');
    }
}

// Handle hash navigation to open accordions
function handleHashNavigation() {
    const hash = window.location.hash;
    if (!hash) return;
    
    // Try to find the element with this ID
    const targetElement = document.querySelector(hash);
    if (!targetElement) return;
    
    // Check if it's inside an accordion content section
    const accordionContent = targetElement.closest('.accordion-content');
    if (!accordionContent) return;
    
    // Get the accordion header (previous sibling)
    const accordionHeader = accordionContent.previousElementSibling;
    if (!accordionHeader || !accordionHeader.classList.contains('accordion')) return;
    
    // If accordion is not already active, open it
    if (!accordionHeader.classList.contains('active')) {
        // Close all other accordions first
        const allAccordions = document.querySelectorAll('h2.accordion');
        const allContents = document.querySelectorAll('.accordion-content');
        
        allAccordions.forEach(acc => {
            acc.classList.remove('active');
            acc.setAttribute('aria-expanded', 'false');
        });
        
        allContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Open the target accordion
        accordionHeader.classList.add('active');
        accordionHeader.setAttribute('aria-expanded', 'true');
        accordionContent.classList.add('active');
        
        // Scroll to the target element after accordion opens
        setTimeout(() => {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, CONFIG.animationDuration);
    } else {
        // If accordion is already open, just scroll to the element
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

// ============================================
// SIMPLIFIED PRONUNCIATION SYSTEM
// ============================================
// Simple audio playback for consistent fast experience

// Removed PRONUNCIATION_CONFIG and PRONUNCIATION_STATE - no longer needed
// Simple Audio Pronunciation Functionality
function initializeAudioTerms() {
    const terms = document.querySelectorAll('.audio-term');

    if (!terms.length) {
        return; // No audio terms found
    }

    // Add click handlers with simple pronunciation system
    terms.forEach((term) => {
        term.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleUnifiedPronunciation(term);
        });

        // Keyboard support
        term.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                await handleUnifiedPronunciation(term);
            }
        });
    });
}


// Removed checkMP3Exists - no longer needed

// Removed getAudio - no longer needed

// Removed playAudioSimple - no longer needed

// Removed playSimpleSequence - no longer needed

// Simple pronunciation handler
async function handleUnifiedPronunciation(element) {
    // Prevent multiple simultaneous plays
    if (element.classList.contains('playing')) {
        return;
    }

    const audioFile = element.getAttribute('data-audio');
    if (!audioFile) return;

    // Show playing state
    element.classList.add('playing');

    try {
        // Build simple audio URL
        const audioUrl = audioFile.startsWith('http') ? audioFile :
                        CONFIG.audioBasePath + audioFile;

        // Create and play audio
        const audio = new Audio(audioUrl);
        audio.playbackRate = 1.0; // Always normal speed for best experience

        await audio.play();

        // Wait for audio to finish
        await new Promise((resolve) => {
            audio.addEventListener('ended', resolve, { once: true });
        });

    } catch (error) {
        console.error('Audio playback error:', error);

        // Show phonetic as fallback
        const phoneticEl = element.querySelector('.phonetic');
        if (phoneticEl) {
            phoneticEl.style.display = 'inline';
        }
    } finally {
        element.classList.remove('playing');
    }
}

// Cleanup and enhance pronunciation elements
function cleanupPronunciationElements() {
    // Fix any generic term descriptions
    const audioTerms = document.querySelectorAll('.audio-term');
    audioTerms.forEach(term => {
        const termText = term.querySelector('.term-text')?.textContent || term.textContent.trim();

        if (term.title && term.title.includes('traditional') && term.title.includes('wedding term')) {
            const definition = term.getAttribute('data-definition') || '';

            if (definition) {
                term.title = `${termText}: ${definition}`;
            } else {
                term.title = termText;
            }
        }

        // Remove any legacy balloon classes if they exist
        term.classList.remove('balloon-trigger', 'has-balloon');
    });
}

// Initialize cleanup on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanupPronunciationElements);
} else {
    cleanupPronunciationElements();
}

// Also run cleanup after a short delay
setTimeout(cleanupPronunciationElements, 1000);

// Removed clearPronunciationCaches - no longer needed

function preloadAudio(term) {
    const audioFile = term.getAttribute('data-audio');
    if (!audioFile || !FEATURES.audioAPI) {
        return;
    }

    try {
        let src;

        // Check if audioFile is already a complete URL
        if (audioFile.startsWith('http://') || audioFile.startsWith('https://')) {
            src = audioFile;
        } else {
            src = CONFIG.audioBasePath + audioFile;

            // If we're running from file://, ensure the path is relative
            if (window.location.protocol === 'file:') {
                src = src.replace(/^\/+/, '');
            }
        }

        const audio = new Audio(src);
        audio.preload = 'metadata'; // Preload metadata for faster playback

        // Add error handling for preload
        audio.addEventListener('error', () => {
            console.warn('Failed to preload audio:', src);
        }, { once: true });

        // Mark as preloaded
        term.setAttribute('data-preloaded', 'true');
    } catch (error) {
        console.warn('Error preloading audio for term:', error);
    }
}

// Helper function to get term definitions
function getTermDefinition(term, element) {
    // Check if there's a data-definition attribute
    const dataDefinition = element.getAttribute('data-definition');
    if (dataDefinition) {
        return dataDefinition;
    }

    // Return generic description if no data-definition attribute
    return ''; // Return empty string instead of generic text
}

// Enhanced tooltip system
function showTooltip(element, message, duration = 3000) {
    // Remove any existing tooltip
    const existingTooltip = document.querySelector('.error-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'error-tooltip';
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        white-space: pre-line;
        max-width: 200px;
        text-align: center;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    // Position tooltip
    document.body.appendChild(tooltip);
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';

    // Show tooltip
    requestAnimationFrame(() => {
        tooltip.style.opacity = '1';
    });

    // Remove tooltip after duration
    setTimeout(() => {
        if (tooltip.parentNode) {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 300);
        }
    }, duration);
}

// Balloon tooltip functionality
function initializeBalloonTooltips() {
    const audioTerms = document.querySelectorAll('.audio-term');
    let currentPlayingTerm = null;
    let currentPlayingAudio = null;
    
    audioTerms.forEach(term => {
        // Extract phonetic data from the child span if present
        const phoneticSpan = term.querySelector('.audio-phonetic');
        if (phoneticSpan) {
            const phoneticText = phoneticSpan.textContent;
            term.setAttribute('data-phonetic', phoneticText);
        }

        // Extract the term text
        const termTextElement = term.querySelector('.term-text');
        let termText;

        if (termTextElement) {
            // New semantic structure
            termText = termTextElement.textContent.trim();
        } else {
            // Legacy structure - get term text by cloning and removing phonetic span
            const termClone = term.cloneNode(true);
            const phoneticSpanClone = termClone.querySelector('.audio-phonetic');
            if (phoneticSpanClone) phoneticSpanClone.remove();
            termText = termClone.textContent.replace(/\s+/g, ' ').trim();
        }

        // Get definition from data attribute or fallback
        let definition = term.getAttribute('data-definition') || getTermDefinition(termText, term);

        // Replace spaces in term with non-breaking spaces to prevent line breaks
        const termDisplay = termText.replace(/ /g, '\u00A0');

        // Build tooltip content with phonetic if available
        const phoneticElement = term.querySelector('.phonetic');
        if (phoneticElement && phoneticElement.textContent) {
            const phoneticText = phoneticElement.textContent;
            term.setAttribute('data-display-text', `${termDisplay}\n${phoneticText}\n"${definition}"`)
        } else {
            term.setAttribute('data-display-text', `${termDisplay}:\n${definition}`);
        }
        
        // Handle click events to show pronunciation and play audio
        term.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Update balloon to show pronunciation
            term.classList.add('show-pronunciation');
            
            // Show tooltip if not already visible
            if (!term.classList.contains('show-tooltip')) {
                // Close other tooltips
                audioTerms.forEach(otherTerm => {
                    if (otherTerm !== term) {
                        otherTerm.classList.remove('show-tooltip', 'show-pronunciation');
                        otherTerm.classList.add('bounce-out');
                        setTimeout(() => {
                            otherTerm.classList.remove('bounce-out');
                        }, 400);
                    }
                });
                
                // Show this tooltip
                term.classList.add('show-tooltip');
                term.classList.remove('bounce-out');
                currentPlayingTerm = term;
            }
            
            // Play the audio (let the existing audio handler deal with this)
            const audioFile = term.getAttribute('data-audio');
            if (audioFile) {
                const audioEvent = new CustomEvent('playAudio', { detail: { term: term } });
                term.dispatchEvent(audioEvent);
            }
        });
        
        // On desktop, show "click to play" on hover (don't click)
        if (window.innerWidth > 768) {
            term.addEventListener('mouseenter', function() {
                if (!term.classList.contains('show-pronunciation')) {
                    // Just show the hover state, don't trigger click
                }
            });
            
            term.addEventListener('mouseleave', function() {
                if (!term.classList.contains('playing')) {
                    term.classList.add('bounce-out');
                    setTimeout(() => {
                        term.classList.remove('bounce-out');
                    }, 400);
                }
            });
        }
    });
    
    // Listen for audio ended events to trigger bounce back
    document.addEventListener('ended', function(e) {
        if (e.target && e.target.tagName === 'AUDIO' && currentPlayingTerm) {
            // Add bounce-out animation
            currentPlayingTerm.classList.add('bounce-out');
            
            // Remove classes after animation completes
            setTimeout(() => {
                currentPlayingTerm.classList.remove('show-tooltip', 'show-pronunciation', 'bounce-out');
                currentPlayingTerm = null;
            }, 400);
        }
    }, true);
    
    // Also handle when audio is paused
    document.addEventListener('pause', function(e) {
        if (e.target && e.target.tagName === 'AUDIO' && currentPlayingTerm && !e.target.ended) {
            // Add bounce-out animation
            currentPlayingTerm.classList.add('bounce-out');
            
            // Remove classes after animation completes
            setTimeout(() => {
                currentPlayingTerm.classList.remove('show-tooltip', 'show-pronunciation', 'bounce-out');
                currentPlayingTerm = null;
            }, 400);
        }
    }, true);
    
    // Close tooltips when clicking elsewhere
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.audio-term')) {
            audioTerms.forEach(term => {
                if (term.classList.contains('show-tooltip')) {
                    term.classList.add('bounce-out');
                    setTimeout(() => {
                        term.classList.remove('show-tooltip', 'show-pronunciation', 'bounce-out');
                    }, 400);
                }
            });
            currentPlayingTerm = null;
        }
    });
}








// Mobile Menu Functionality
function initializeMobileMenu() {
    const hamburger = document.querySelector('.nav-hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        // Add ARIA attributes for accessibility
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-controls', 'nav-links');
        hamburger.setAttribute('aria-label', 'Toggle navigation menu');

        // Handle hamburger click
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const isExpanded = navLinks.classList.contains('active');
            hamburger.setAttribute('aria-expanded', isExpanded);
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });

        // Close menu when pressing Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.focus(); // Return focus to hamburger button
            }
        });

        // Handle keyboard navigation within menu
        hamburger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
}


// Network status detection
if ('onLine' in navigator) {
    window.addEventListener('online', () => {
        console.log('Connection restored');
        document.body.classList.remove('offline');
    });
    
    window.addEventListener('offline', () => {
        console.log('Connection lost');
        document.body.classList.add('offline');
    });
}


// Style special callout boxes with emoticons
function styleEmojiCallouts() {
    // List of emoji and keywords that indicate special callouts
    const emojiPatterns = [
        '💍', '📍', '💰', '🎯', '🎵', '🕐', '👥', '💡', '📸', '🎭', '🍾',
        '🌟', '💝', '🎊', '🏛️', '⛪', '🍷', '🥂', '🎂', '💐', '🎁', '❤️',
        '💒', '👰', '🤵', '📅', '📋', '💎', '🎪', '🎨', '🎯', '🔔', '⚠️',
        '🚨', '⚡', '💵', '💸', 'ℹ️', '📌', '🎉'
    ];
    
    const keywordPatterns = [
        'Budget Alert', 'Guest Count', 'Cost Comparison', 'The Vibe',
        'Real Wedding Story', 'Pro Tip', 'Important Note', 'Quick Tip',
        'Fun Fact', 'Did You Know', 'Planning Tip', 'Tradition Alert',
        'Critical Warning', 'Survival Tip', 'Time Management', 'Professional Support',
        'Destination Magic', 'Two-Day Approach', 'Photo Opportunity', 'Double Reception',
        'International Guests'
    ];
    
    // Style variations to cycle through
    const styles = ['style-postit', 'style-torn', 'style-bubble', 'style-notebook', 'style-vintage', 'style-alert'];
    let styleIndex = 0;
    
    // Find all paragraphs in accordion content
    const paragraphs = document.querySelectorAll('.accordion-content p');
    
    paragraphs.forEach(p => {
        const firstChild = p.firstElementChild;
        const textContent = p.textContent.trim();
        
        // Check if paragraph starts with emoji or contains special keywords
        let isSpecialCallout = false;
        let hasSpecificEmoji = null;
        
        // Check for emojis at the start
        for (const emoji of emojiPatterns) {
            if (textContent.startsWith(emoji)) {
                isSpecialCallout = true;
                hasSpecificEmoji = emoji;
                break;
            }
        }
        
        // Check for keywords in strong tags
        if (firstChild && firstChild.tagName === 'STRONG') {
            const strongText = firstChild.textContent;
            for (const keyword of keywordPatterns) {
                if (strongText.includes(keyword)) {
                    isSpecialCallout = true;
                    break;
                }
            }
        }
        
        // Apply special styling if it's a callout
        if (isSpecialCallout && !p.classList.contains('emoji-callout')) {
            p.classList.add('emoji-callout');
            
            // Apply specific style based on content
            if (hasSpecificEmoji) {
                // Warning/Alert emojis
                if (['⚠️', '🚨', '⚡'].includes(hasSpecificEmoji)) {
                    p.classList.add('style-alert');
                }
                // Money/Budget emojis
                else if (['💰', '💵', '💸'].includes(hasSpecificEmoji)) {
                    p.classList.add('style-vintage');
                }
                // Tips/Info emojis
                else if (['💡', 'ℹ️', '📌'].includes(hasSpecificEmoji)) {
                    p.classList.add('style-bubble');
                }
                // Music/Party emojis
                else if (['🎵', '🎉', '🎊'].includes(hasSpecificEmoji)) {
                    p.classList.add('style-torn');
                }
                // Default: cycle through styles
                else {
                    p.classList.add(styles[styleIndex % styles.length]);
                    styleIndex++;
                }
            } else {
                // For keyword-based callouts, cycle through styles
                p.classList.add(styles[styleIndex % styles.length]);
                styleIndex++;
            }
        }
    });
}

// Currency Tooltip Functionality
function initializeCurrencyTooltips() {
    const currencies = document.querySelectorAll('.currency');
    
    currencies.forEach(currency => {
        // Make focusable if not already
        if (!currency.hasAttribute('tabindex')) {
            currency.setAttribute('tabindex', '0');
        }
        
        // Add ARIA attributes if not present
        if (!currency.hasAttribute('role')) {
            currency.setAttribute('role', 'text');
        }
        
        // Add click handler for touch devices
        currency.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Close other tooltips
            currencies.forEach(other => {
                if (other !== this) {
                    other.classList.remove('show-conversion');
                }
            });
            
            // Toggle this tooltip
            this.classList.toggle('show-conversion');
        });
        
        // Keyboard support
        currency.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Close tooltips when clicking elsewhere
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.currency')) {
            currencies.forEach(currency => {
                currency.classList.remove('show-conversion');
            });
        }
    });
}

// Enhanced mutation observer for dynamic content
function initializeMutationObserver() {
    if (!('MutationObserver' in window)) {
        return;
    }

    try {
        const observer = new MutationObserver(utils.throttle(function(mutations) {
            let hasNewContent = false;

            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    // Check if any added nodes contain relevant content
                    Array.from(mutation.addedNodes).forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.matches('.accordion-content, .audio-term, .currency') ||
                                node.querySelector('.accordion-content, .audio-term, .currency')) {
                                hasNewContent = true;
                            }
                        }
                    });
                }
            });

            if (hasNewContent) {
                // Re-initialize components for new content
                styleEmojiCallouts();
                initializeCurrencyTooltips();

                // Re-initialize audio terms if any were added
                const newAudioTerms = document.querySelectorAll('.audio-term:not([data-initialized])');
                if (newAudioTerms.length > 0) {
                    console.log('Initializing', newAudioTerms.length, 'new audio terms');
                    // Mark as initialized to avoid double processing
                    newAudioTerms.forEach(term => term.setAttribute('data-initialized', 'true'));
                }
            }
        }, 250));

        // Start observing with optimized settings
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false, // Don't watch attribute changes
            characterData: false // Don't watch text changes
        });

        console.log('Mutation observer initialized for dynamic content');
    } catch (error) {
        console.warn('Failed to initialize mutation observer:', error);
    }
}

// ============================================
// REVIEW CARDS NAVIGATION SYSTEM
// ============================================
// Enhanced review cards with navigation, auto-scroll, and lazy loading

// Helper functions for review cards
function getReviewerInitials(name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length > 0) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return 'RV';
}

function getAvatarColor(name) {
    return '#6c757d'; // Always return gray for avatar backgrounds
}

// Function to create review card HTML with wrapper
function createDetailedReviewCard(review, index) {
    const initials = getReviewerInitials(review.reviewer_name);
    const avatarColor = getAvatarColor(review.reviewer_name);
    const stars = '★'.repeat(Math.floor(review.rating || 5));
    // Use highlighted text from JSON if available
    const reviewText = review.review_text_highlighted || review.review_text;

    // Extract reviewer slug from name for sprite positioning
    const reviewerSlug = review.reviewer_name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    const badges = [];
    if (review.is_local_guide) {
        badges.push('<span class="local-guide-badge">Local Guide</span>');
    }
    if (review.is_verified) {
        badges.push('<span class="verified-badge">Verified</span>');
    }

    const actions = [];
    if (review.photo_count > 0) {
        actions.push(`<span class="review-photos"><svg class="photo-icon" viewBox="0 0 24 24" width="18" height="18"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/></svg> ${review.photo_count} photos</span>`);
    }
    if (review.helpful_count > 0) {
        actions.push(`<span class="review-helpful"><svg class="helpful-icon" viewBox="0 0 24 24" width="18" height="18"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg> ${review.helpful_count} helpful</span>`);
    }

    const wrapperClass = index === 0 ? 'review-card-wrapper active' : 'review-card-wrapper offscreen-right';

    return `<div class="${wrapperClass}">
        <div class="review-card-modern">
            <div class="review-header">
                <div class="reviewer-avatar" data-reviewer="${reviewerSlug}"></div>
                <div class="reviewer-info">
                    <div class="reviewer-name">
                        ${review.reviewer_name}
                        ${badges.join('')}
                    </div>
                    <div class="review-stars">${stars}</div>
                </div>
                <div class="google-maps-icon" data-reviewer="google-maps" title="Google Maps review"></div>
            </div>
            <p class="review-text">
                ${reviewText}
            </p>
            <div class="review-footer">
                <span class="review-date">${review.review_date || ''}</span>
                <div class="review-actions">
                    ${actions.join('')}
                </div>
            </div>
        </div>
    </div>`;
}

async function initializeReviewCards() {
    const reviewSection = document.getElementById('customer-review');
    if (!reviewSection) return;

    const carousel = reviewSection.querySelector('.review-carousel');
    if (!carousel) return;

    const reviewsUrl = carousel.dataset.reviewsSource || '/wedding-customs/cdn/json/reviews.min.json';

    try {
        // Fetch reviews from JSON
        const response = await fetch(reviewsUrl);
        if (!response.ok) {
            throw new Error(`Failed to load reviews: ${response.status}`);
        }

        const data = await response.json();
        const reviews = data.reviews || [];

        // Create review cards from JSON data
        reviews.slice(0, 6).forEach((review, index) => {
            const reviewCard = createDetailedReviewCard(review, index);
            carousel.insertAdjacentHTML('beforeend', reviewCard);
        });

        // Store review delays in carousel element for later use
        carousel.reviewDelays = reviews.slice(0, 6).map(r => r.rotation_delay || 5000);

        // Show the review section
        reviewSection.classList.remove('hidden');
        reviewSection.style.display = 'block';

        // Initialize carousel navigation
        initializeReviewCarousel(carousel);

        // Auto-rotation is handled within initializeReviewCarousel

    } catch (error) {
        console.error('Failed to load reviews:', error);
        // Keep section hidden if loading fails
    }
}

function initializeReviewCarousel(carousel) {
    const prevBtn = carousel.querySelector('.review-nav-button.prev');
    const nextBtn = carousel.querySelector('.review-nav-button.next');
    const cards = carousel.querySelectorAll('.review-card-wrapper');

    if (cards.length === 0) return;

    // State management
    let currentIndex = 0;
    let isAnimating = false;
    const totalCards = cards.length;

    // Navigation functions
    function showCard(index) {
        if (isAnimating || index === currentIndex) return;
        isAnimating = true;

        // Remove all active states
        cards.forEach(card => {
            card.classList.remove('active', 'offscreen-left', 'offscreen-right');
        });

        // Determine direction
        const goingForward = index > currentIndex;

        // Position all cards
        cards.forEach((card, i) => {
            if (i === index) {
                card.classList.add('active');
            } else if (i < index) {
                card.classList.add('offscreen-left');
            } else {
                card.classList.add('offscreen-right');
            }
        });

        currentIndex = index;

        setTimeout(() => {
            isAnimating = false;
        }, 600);
    }

    function nextCard() {
        const nextIndex = (currentIndex + 1) % totalCards;
        showCard(nextIndex);
    }

    function prevCard() {
        const prevIndex = (currentIndex - 1 + totalCards) % totalCards;
        showCard(prevIndex);
    }

    // Add event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', prevCard);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', nextCard);
    }

    // Keyboard navigation
    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevCard();
        } else if (e.key === 'ArrowRight') {
            nextCard();
        }
    });

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextCard();
            } else {
                prevCard();
            }
        }
    }

    // Auto-rotation functionality
    let rotationInterval;
    let isHovering = false;

    function getRotationDelay() {
        // Use delay from JSON if available
        if (carousel.reviewDelays && carousel.reviewDelays[currentIndex]) {
            return carousel.reviewDelays[currentIndex];
        }
        // Fallback to default
        return 5000;
    }

    function scheduleNextRotation() {
        if (!isHovering) {
            const delay = getRotationDelay();
            rotationInterval = setTimeout(() => {
                if (!isHovering) {
                    nextCard();
                    scheduleNextRotation(); // Schedule next rotation
                }
            }, delay);
        }
    }

    function startRotation() {
        if (!rotationInterval && !isHovering) {
            scheduleNextRotation();
        }
    }

    function stopRotation() {
        if (rotationInterval) {
            clearTimeout(rotationInterval);
            rotationInterval = null;
        }
    }

    // Pause rotation on hover
    carousel.addEventListener('mouseenter', () => {
        isHovering = true;
        stopRotation();
    });

    carousel.addEventListener('mouseleave', () => {
        isHovering = false;
        startRotation();
    });

    // Modify button clicks to restart rotation after delay
    if (prevBtn) {
        prevBtn.removeEventListener('click', prevCard);
        prevBtn.addEventListener('click', () => {
            stopRotation();
            prevCard();
            // Wait longer after manual navigation to let user read
            setTimeout(() => {
                if (!isHovering) {
                    scheduleNextRotation();
                }
            }, 5000);
        });
    }

    if (nextBtn) {
        nextBtn.removeEventListener('click', nextCard);
        nextBtn.addEventListener('click', () => {
            stopRotation();
            nextCard();
            // Wait longer after manual navigation to let user read
            setTimeout(() => {
                if (!isHovering) {
                    scheduleNextRotation();
                }
            }, 5000);
        });
    }

    // Initialize first card and start rotation
    showCard(0);
    startRotation();
}


// Review Cards Auto-rotation
function setupReviewCardsRotation() {
        const reviewTrack = document.getElementById('reviewTrack');
        if (!reviewTrack) return;

        const cards = reviewTrack.querySelectorAll('.review-card-modern');
        if (cards.length === 0) return;

        let currentIndex = 0;
        let rotationInterval;
        let isHovering = false;

        // Set initial active card
        cards[0].classList.add('active');

        // Ensure all cards are loaded and positioned
        cards.forEach((card, i) => {
            if (i !== 0) {
                card.classList.remove('active');
            }
        });

        // Function to show specific card with animations
        function showCard(index, direction = 'next') {
            const previousIndex = currentIndex;
            const previousCard = cards[previousIndex];
            const nextCard = cards[index];

            if (previousIndex === index) return;

            // Stop any ongoing transitions
            cards.forEach(card => {
                card.classList.remove('exiting-left', 'exiting-right', 'entering-left', 'entering-right');
            });

            // Animate out the current card
            if (direction === 'next') {
                previousCard.classList.add('exiting-left');
                nextCard.classList.add('entering-right');
            } else {
                previousCard.classList.add('exiting-right');
                nextCard.classList.add('entering-left');
            }

            // After a brief delay, switch active states
            setTimeout(() => {
                previousCard.classList.remove('active');
                nextCard.classList.add('active');

                // Clean up animation classes after transition
                setTimeout(() => {
                    previousCard.classList.remove('exiting-left', 'exiting-right');
                    nextCard.classList.remove('entering-left', 'entering-right');
                }, 50);
            }, 50);

            // Update button states
            updateButtonStates();
        }

        // Function to update button states - always enabled for continuous loop
        function updateButtonStates() {
            const prevBtn = document.querySelector('.review-nav-button.prev');
            const nextBtn = document.querySelector('.review-nav-button.next');

            // Never disable buttons since we have infinite loop
            if (prevBtn) {
                prevBtn.disabled = false;
                prevBtn.classList.remove('disabled');
            }

            if (nextBtn) {
                nextBtn.disabled = false;
                nextBtn.classList.remove('disabled');
            }
        }

        // Function to go to next card
        function nextCard() {
            if (!isHovering && currentIndex < cards.length - 1) {
                currentIndex++;
                showCard(currentIndex, 'next');
            } else if (!isHovering && currentIndex === cards.length - 1) {
                // Loop back to first card
                currentIndex = 0;
                showCard(currentIndex, 'next');
            }
        }

        // Function to go to previous card
        function prevCard() {
            if (currentIndex > 0) {
                currentIndex--;
                showCard(currentIndex, 'prev');
            } else {
                // Loop to last card
                currentIndex = cards.length - 1;
                showCard(currentIndex, 'prev');
            }
        }

        // Start rotation
        function startRotation() {
            if (!rotationInterval && !isHovering) {
                rotationInterval = setInterval(nextCard, 4000);
            }
        }

        // Stop rotation
        function stopRotation() {
            if (rotationInterval) {
                clearInterval(rotationInterval);
                rotationInterval = null;
            }
        }

        // Setup Intersection Observer to start/stop rotation when in view
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        startRotation();
                    } else {
                        stopRotation();
                    }
                });
            },
            {
                threshold: 0.5 // Start when 50% of the section is visible
            }
        );

        // Observe the review section
        const reviewSection = reviewTrack.closest('.wedding-review');
        if (reviewSection) {
            observer.observe(reviewSection);
        }

        // Pause rotation on hover
        reviewTrack.addEventListener('mouseenter', () => {
            isHovering = true;
            stopRotation();
        });
        
        reviewTrack.addEventListener('mouseleave', () => {
            isHovering = false;
            const reviewSection = reviewTrack.closest('.wedding-review');
            if (reviewSection) {
                const rect = reviewSection.getBoundingClientRect();
                const inView = rect.top < window.innerHeight && rect.bottom > 0;
                if (inView) {
                    startRotation();
                }
            }
        });

        // Navigation buttons (if present)
        const prevBtn = document.querySelector('.review-nav-button.prev');
        const nextBtn = document.querySelector('.review-nav-button.next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                stopRotation();
                prevCard();
                // Restart rotation after manual navigation
                setTimeout(startRotation, 5000);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                stopRotation();
                nextCard();
                // Restart rotation after manual navigation
                setTimeout(startRotation, 5000);
            });
        }

        // Initialize button states
        updateButtonStates();
}

/* ===== END: wedding-traditions.js ===== */
/* ===== START: discover-carousel.js ===== */
function initializeDiscover3Carousel() {
    const discoverSection = document.querySelector('.discover-3');
    if (!discoverSection) return;

    const traditionsGrid = discoverSection.querySelector('.traditions-grid');
    if (!traditionsGrid) return;

    // Get all tradition panels
    const allPanels = Array.from(traditionsGrid.querySelectorAll('.tradition-panel'));

    if (allPanels.length === 0) return;

    // Create carousel wrapper
    const carouselWrapper = document.createElement('div');
    carouselWrapper.className = 'discover-carousel-wrapper';

    const carouselTrack = document.createElement('div');
    carouselTrack.className = 'discover-carousel-track';

    // Move all panels to carousel track
    allPanels.forEach(panel => {
        panel.classList.add('discover-carousel-item');
        carouselTrack.appendChild(panel);
    });

    carouselWrapper.appendChild(carouselTrack);

    // Replace traditions-grid with carousel wrapper
    traditionsGrid.parentNode.replaceChild(carouselWrapper, traditionsGrid);

    // Add navigation buttons
    const navHTML = `
        <button class="discover-nav-button prev" aria-label="Previous articles">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 18l-6-6 6-6"></path>
            </svg>
        </button>
        <button class="discover-nav-button next" aria-label="Next articles">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18l6-6-6-6"></path>
            </svg>
        </button>
    `;

    carouselWrapper.insertAdjacentHTML('beforeend', navHTML);

    // Initialize carousel state
    let currentIndex = 0;
    const itemsPerView = 4;
    const totalItems = allPanels.length;
    const maxIndex = Math.max(0, totalItems - itemsPerView);

    const prevBtn = carouselWrapper.querySelector('.discover-nav-button.prev');
    const nextBtn = carouselWrapper.querySelector('.discover-nav-button.next');

    // Update carousel position
    function updateCarousel() {
        const itemWidth = 290; // 250px panel + 40px padding
        const offset = currentIndex * -itemWidth;
        carouselTrack.style.transform = `translateX(${offset}px)`;

        // Update button states
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= maxIndex;

        // Update active states for accessibility
        allPanels.forEach((panel, index) => {
            const isVisible = index >= currentIndex && index < currentIndex + itemsPerView;
            panel.setAttribute('aria-hidden', !isVisible);
        });
    }

    // Navigation functions
    function goToPrevious() {
        if (currentIndex > 0) {
            currentIndex = Math.max(0, currentIndex - itemsPerView);
            updateCarousel();
        }
    }

    function goToNext() {
        if (currentIndex < maxIndex) {
            currentIndex = Math.min(maxIndex, currentIndex + itemsPerView);
            updateCarousel();
        }
    }

    // Event listeners
    prevBtn.addEventListener('click', goToPrevious);
    nextBtn.addEventListener('click', goToNext);

    // Keyboard navigation
    carouselWrapper.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            goToPrevious();
        } else if (e.key === 'ArrowRight') {
            goToNext();
        }
    });

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;

    carouselWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    carouselWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                goToNext(); // Swipe left
            } else {
                goToPrevious(); // Swipe right
            }
        }
    }

    // Auto-rotation removed per request

    // Initialize
    updateCarousel();

    // Handle responsive layout
    function handleResponsive() {
        const width = window.innerWidth;
        let newItemsPerView = 4;

        if (width <= 768) {
            newItemsPerView = 1;
        } else if (width <= 1024) {
            newItemsPerView = 2;
        } else if (width <= 1280) {
            newItemsPerView = 3;
        }

        // Only update if changed
        if (newItemsPerView !== itemsPerView) {
            // Adjust currentIndex to maintain visible items
            currentIndex = Math.min(currentIndex, Math.max(0, totalItems - newItemsPerView));
            updateCarousel();
        }
    }

    // Add resize listener for responsive behavior
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResponsive, 150);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDiscover3Carousel);
} else {
    initializeDiscover3Carousel();
}
/* ===== END: discover-carousel.js ===== */
/* ===== START: review-carousel.js ===== */
/**
 * Review Carousel with Swoosh Animation
 * Handles auto-advance, manual navigation, and infinite loop
 * Loads reviews dynamically from JSON
 */

class ReviewCarousel {
  constructor(container) {
    this.container = container;
    this.carousel = container.querySelector('.review-carousel');
    this.cards = [];
    this.currentIndex = 0;
    this.autoPlayInterval = null;
    this.isVisible = false;
    this.isPaused = false;
    this.AUTOPLAY_DELAY = 3000;

    this.init();
  }

  async init() {
    // Check if we need to load reviews from JSON
    const reviewsSource = this.carousel.getAttribute('data-reviews-source');
    if (reviewsSource) {
      await this.loadReviewsFromJSON(reviewsSource);
    }

    // Check if cards are already wrapped
    let wrappers = this.container.querySelectorAll('.review-card-wrapper');

    if (wrappers.length > 0) {
      // Cards are pre-wrapped, just use them
      this.cards = Array.from(wrappers);
    } else {
      // Legacy support: wrap unwrapped cards
      const cardElements = this.container.querySelectorAll('.review-card-modern');

      cardElements.forEach((card, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'review-card-wrapper';
        wrapper.appendChild(card.cloneNode(true));

        // Position initially off-screen
        if (index === 0) {
          wrapper.classList.add('active');
        } else {
          wrapper.classList.add('offscreen-right');
        }

        this.carousel.appendChild(wrapper);
        this.cards.push(wrapper);
      });

      // Remove original cards
      cardElements.forEach(card => card.remove());
    }

    // Only proceed if we have cards
    if (this.cards.length === 0) {
      console.warn('No review cards found');
      return;
    }

    // Setup navigation buttons
    this.setupNavigation();

    // Setup hover pause
    this.setupHoverPause();

    // Setup intersection observer
    this.setupIntersectionObserver();

    // Setup indicators - DISABLED
    // this.setupIndicators();

    // Show the review section once loaded
    this.container.classList.remove('hidden');
    this.container.style.display = '';
  }

  async loadReviewsFromJSON(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const reviews = data.reviews || [];

      // Clear existing content
      this.carousel.innerHTML = '';

      // Add navigation buttons back
      this.carousel.innerHTML = `
        <button class="review-nav-button prev" aria-label="Previous review" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button class="review-nav-button next" aria-label="Next review" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      `;

      // Create review cards from JSON data
      reviews.forEach((review, index) => {
        const cardHTML = this.createReviewCard(review);
        const wrapper = document.createElement('div');
        wrapper.className = 'review-card-wrapper';
        wrapper.innerHTML = cardHTML;

        // Position initially
        if (index === 0) {
          wrapper.classList.add('active');
        } else {
          wrapper.classList.add('offscreen-right');
        }

        this.carousel.appendChild(wrapper);
        this.cards.push(wrapper);
      });

    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  }

  createReviewCard(review) {
    const reviewerName = this.escapeHtml(review.reviewer_name || 'Customer');
    const reviewTitle = this.escapeHtml(review.review_title || '');
    const reviewText = review.review_text_highlighted || review.review_text || '';
    const rating = parseFloat(review.rating || 5.0);
    const reviewDate = this.escapeHtml(review.review_date || review.relative_date || review.date || '');
    const isLocalGuide = review.is_local_guide || false;
    const isVerified = review.is_verified || false;
    const photoCount = review.photo_count || 0;
    const helpfulCount = review.helpful_count || 0;

    // Get initials for default avatar
    const initials = this.getReviewerInitials(reviewerName);

    // Format star rating
    const stars = "★".repeat(Math.floor(rating));

    // Build badges
    let badges = '';
    if (isLocalGuide) {
      badges += '<span class="local-guide-badge">Local Guide</span>';
    }
    if (isVerified) {
      badges += '<span class="verified-badge">Verified</span>';
    }

    // Build metadata
    let metadata = [];
    if (photoCount > 0) {
      metadata.push(`${photoCount} photos`);
    }
    if (helpfulCount > 0) {
      metadata.push(`${helpfulCount} helpful`);
    }

    return `
      <div class="review-card-modern">
        <div class="review-header">
          <div class="reviewer-avatar default">
            <span>${initials}</span>
          </div>
          <div class="reviewer-info">
            <div class="reviewer-name">
              ${reviewerName}
              ${badges}
            </div>
            <div class="review-stars">${stars}</div>
          </div>
          <div class="google-maps-icon" aria-label="Google Maps review"></div>
        </div>

        ${reviewTitle ? `<h3 class="review-title">${reviewTitle}</h3>` : ''}

        <p class="review-text">
          ${reviewText}
        </p>

        <div class="review-footer">
          <span class="review-date">${reviewDate}</span>
          ${metadata.length > 0 ? `<span class="review-metadata">${metadata.join(' • ')}</span>` : ''}
        </div>
      </div>
    `;
  }

  getReviewerInitials(name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length > 0) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return 'RV';
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  setupNavigation() {
    const prevBtn = this.container.querySelector('.review-nav-button.prev');
    const nextBtn = this.container.querySelector('.review-nav-button.next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.navigate('prev'));
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.navigate('next'));
    }
  }

  setupHoverPause() {
    // Pause on hover over the card
    this.cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        this.isPaused = true;
        this.stopAutoPlay();
      });

      card.addEventListener('mouseleave', () => {
        this.isPaused = false;
        if (this.isVisible) {
          this.startAutoPlay();
        }
      });
    });
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      threshold: 0.5 // Trigger when 50% visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.isVisible = true;
          if (!this.isPaused) {
            this.startAutoPlay();
          }
        } else {
          this.isVisible = false;
          this.stopAutoPlay();
        }
      });
    }, options);

    observer.observe(this.container);
  }

  setupIndicators() {
    const indicatorContainer = document.createElement('div');
    indicatorContainer.className = 'review-indicators';

    this.cards.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'review-dot';
      dot.setAttribute('aria-label', `Go to review ${index + 1}`);

      if (index === 0) {
        dot.classList.add('active');
      }

      dot.addEventListener('click', () => this.goToSlide(index));
      indicatorContainer.appendChild(dot);
    });

    this.container.appendChild(indicatorContainer);
    this.indicators = indicatorContainer.querySelectorAll('.review-dot');
  }

  navigate(direction) {
    // Stop autoplay temporarily
    this.stopAutoPlay();

    if (direction === 'next') {
      this.showNext();
    } else {
      this.showPrev();
    }

    // Restart autoplay if not paused
    if (this.isVisible && !this.isPaused) {
      this.startAutoPlay();
    }
  }

  showNext() {
    // Current card swooshes off to the right
    this.cards[this.currentIndex].classList.remove('active');
    this.cards[this.currentIndex].classList.add('offscreen-right');

    // Update index (infinite loop)
    this.currentIndex = (this.currentIndex + 1) % this.cards.length;

    // Get next card
    const nextCard = this.cards[this.currentIndex];

    // Temporarily disable transitions
    nextCard.classList.add('no-transition');

    // Position next card off-screen to the left instantly
    nextCard.classList.remove('offscreen-right');
    nextCard.classList.add('offscreen-left');
    nextCard.classList.remove('active');

    // Force reflow to ensure the card is positioned
    void nextCard.offsetWidth;

    // Re-enable transitions
    nextCard.classList.remove('no-transition');

    // Delay the incoming card slightly so we see the outgoing card swoosh
    setTimeout(() => {
      // Now transition the card from left to center
      nextCard.classList.remove('offscreen-left');
      nextCard.classList.add('active');
    }, 100); // 100ms delay to see the swoosh out

    // Update indicators
    // this.updateIndicators(); // Indicators disabled
  }

  showPrev() {
    // Current card swooshes off to the left
    this.cards[this.currentIndex].classList.remove('active');
    this.cards[this.currentIndex].classList.add('offscreen-left');

    // Update index (infinite loop)
    this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;

    // Previous card swooshes in from the right
    this.cards[this.currentIndex].classList.remove('offscreen-left');
    this.cards[this.currentIndex].classList.remove('offscreen-right');
    this.cards[this.currentIndex].classList.add('active');

    // Update indicators
    // this.updateIndicators(); // Indicators disabled
  }

  goToSlide(index) {
    if (index === this.currentIndex) return;

    // Stop autoplay temporarily
    this.stopAutoPlay();

    // Hide current card
    this.cards[this.currentIndex].classList.remove('active');

    if (index > this.currentIndex) {
      this.cards[this.currentIndex].classList.add('offscreen-left');
    } else {
      this.cards[this.currentIndex].classList.add('offscreen-right');
    }

    // Show target card
    this.currentIndex = index;
    this.cards[this.currentIndex].classList.remove('offscreen-left');
    this.cards[this.currentIndex].classList.remove('offscreen-right');
    this.cards[this.currentIndex].classList.add('active');

    // Update indicators
    // this.updateIndicators(); // Indicators disabled

    // Restart autoplay if not paused
    if (this.isVisible && !this.isPaused) {
      this.startAutoPlay();
    }
  }

  updateIndicators() {
    this.indicators.forEach((dot, index) => {
      if (index === this.currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  startAutoPlay() {
    if (this.autoPlayInterval) return;

    this.autoPlayInterval = setInterval(() => {
      this.showNext();
    }, this.AUTOPLAY_DELAY);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const reviewSection = document.querySelector('.wedding-review');
  if (reviewSection && reviewSection.querySelector('.review-carousel')) {
    new ReviewCarousel(reviewSection);
  }
});

// Also initialize when called directly (for dynamic content)
function initReviewCarousel() {
  const reviewSection = document.querySelector('.wedding-review');
  if (reviewSection && reviewSection.querySelector('.review-carousel')) {
    new ReviewCarousel(reviewSection);
  }
}

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ReviewCarousel, initReviewCarousel };
}
/* ===== END: review-carousel.js ===== */
