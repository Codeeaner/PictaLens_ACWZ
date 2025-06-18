        const { useState, useEffect, useRef, useMemo, useCallback, createElement: h } = React;

        // Performance optimizations and utilities
        const useIntersectionObserver = (callback, options = {}) => {
            const ref = useRef();
            
            useEffect(() => {
                const element = ref.current;
                if (!element) return;
                
                const observer = new IntersectionObserver(callback, {
                    threshold: 0.1,
                    rootMargin: '50px',
                    ...options
                });
                
                observer.observe(element);
                
                return () => observer.disconnect();
            }, [callback, options]);
            
            return ref;
        };

        // Lazy loading hook
        const useLazyLoad = () => {
            const [isLoaded, setIsLoaded] = useState(false);
            
            const callback = useCallback((entries) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    setIsLoaded(true);
                }
            }, []);
            
            const ref = useIntersectionObserver(callback);
            
            return [ref, isLoaded];
        };

        // Performance monitoring
        const usePerformanceMonitor = () => {
            useEffect(() => {
                if ('performance' in window) {
                    const observer = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (entry.entryType === 'paint') {
                                console.log(`${entry.name}: ${entry.startTime}ms`);
                            }
                        }
                    });
                    
                    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
                    
                    return () => observer.disconnect();
                }
            }, []);
        };

        // Throttle utility for performance
        const useThrottle = (callback, delay) => {
            const [throttledCallback, setThrottledCallback] = useState(null);
            
            useEffect(() => {
                let timeoutId;
                let isThrottled = false;
                
                const throttled = (...args) => {
                    if (!isThrottled) {
                        callback(...args);
                        isThrottled = true;
                        timeoutId = setTimeout(() => {
                            isThrottled = false;
                        }, delay);
                    }
                };
                
                setThrottledCallback(() => throttled);
                
                return () => {
                    if (timeoutId) clearTimeout(timeoutId);
                };
            }, [callback, delay]);
            
            return throttledCallback;
        };

        // Scroll Progress Indicator Component
        const ScrollProgress = () => {
            const [scrollProgress, setScrollProgress] = useState(0);

            const updateScrollProgress = useCallback(() => {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = (scrollTop / docHeight) * 100;
                setScrollProgress(scrollPercent);
            }, []);

            const throttledScrollProgress = useThrottle(updateScrollProgress, 16);

            useEffect(() => {
                if (throttledScrollProgress) {
                    window.addEventListener('scroll', throttledScrollProgress, { passive: true });
                    return () => window.removeEventListener('scroll', throttledScrollProgress);
                }
            }, [throttledScrollProgress]);

            return h(
                "div",
                { className: "scroll-progress" },
                h("div", {
                    className: "scroll-progress-bar",
                    style: { width: `${scrollProgress}%` }
                })
            );
        };

        // Toast Notification Component
        const ToastNotification = ({ isVisible, message, onClose, duration = 3000 }) => {
            useEffect(() => {
                if (isVisible) {
                    const timer = setTimeout(() => {
                        onClose();
                    }, duration);
                    return () => clearTimeout(timer);
                }
            }, [isVisible, duration, onClose]);

            if (!isVisible) return null;

            return h(
                "div",
                {
                    className: "toast",
                    style: {
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? "translateY(0) scale(1)" : "translateY(100px) scale(0.8)",
                        transition: "all 0.3s ease",
                    },
                },
                h(
                    "div",
                    { className: "toast-container" },
                    h("div", { className: "toast-bg" }),
                    h(
                        "div",
                        { className: "toast-content" },
                        h(
                            "div",
                            { className: "toast-icon" },
                            h(
                                "svg",
                                {
                                    width: "16",
                                    height: "16",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                },
                                h("polyline", { points: "20,6 9,17 4,12" }),
                            ),
                        ),
                        h("div", { className: "toast-message" }, message),
                        h(
                            "div",
                            { className: "toast-copy-icon" },
                            h(
                                "svg",
                                {
                                    width: "16",
                                    height: "16",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                },
                                h("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }),
                                h("path", { d: "m5,15H4a2,2 0 0,1 -2,-2V4A2,2 0 0,1 4,2H13a2,2 0 0,1 2,2v1" }),
                            ),
                        ),
                    ),
                    h("div", {
                        className: "toast-progress",
                        style: {
                            width: "100%",
                            animation: `shrink ${duration}ms linear`,
                        },
                    }),
                ),
            );
        };

        // Navigation Component
        const Navigation = () => {
            const [isOpen, setIsOpen] = useState(false);
            const [scrolled, setScrolled] = useState(false);
            const [activeSection, setActiveSection] = useState('hero');

            // Throttled scroll handler for performance
            const handleScroll = useCallback(() => {
                setScrolled(window.scrollY > 50);
                
                // Update active section based on scroll position
                const sections = ['hero', 'timeline', 'gallery', 'fashion', 'digital'];
                const currentSection = sections.find(section => {
                    const element = document.getElementById(section);
                    if (element) {
                        const rect = element.getBoundingClientRect();
                        return rect.top <= 100 && rect.bottom >= 100;
                    }
                    return false;
                });
                
                if (currentSection) {
                    setActiveSection(currentSection);
                }
            }, []);

            const throttledScroll = useThrottle(handleScroll, 16); // 60fps

            useEffect(() => {
                if (throttledScroll) {
                    window.addEventListener("scroll", throttledScroll, { passive: true });
                    return () => window.removeEventListener("scroll", throttledScroll);
                }
            }, [throttledScroll]);

            const navItems = [
                { name: "Timeline", href: "#timeline", icon: "⏳", ariaLabel: "Navigate to Timeline section" },
                { name: "Art Gallery", href: "#gallery", icon: "🎨", ariaLabel: "Navigate to Art Gallery section" },
                { name: "Fashion", href: "#fashion", icon: "👔", ariaLabel: "Navigate to Fashion section" },
                { name: "Digital Art", href: "#digital", icon: "🤖", ariaLabel: "Navigate to Digital Art section" },
            ];

            const scrollToSection = useCallback((href) => {
                const element = document.querySelector(href);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                    // Announce to screen readers
                    const sectionName = href.replace('#', '');
                    const announcement = document.createElement('div');
                    announcement.setAttribute('aria-live', 'polite');
                    announcement.setAttribute('aria-atomic', 'true');
                    announcement.style.position = 'absolute';
                    announcement.style.left = '-10000px';
                    announcement.textContent = `Navigated to ${sectionName} section`;
                    document.body.appendChild(announcement);
                    setTimeout(() => document.body.removeChild(announcement), 1000);
                }
                setIsOpen(false);
            }, []);

            // Keyboard navigation
            const handleKeyDown = useCallback((e, href) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    scrollToSection(href);
                }
            }, [scrollToSection]);

            // Close mobile menu on escape key
            useEffect(() => {
                const handleEscape = (e) => {
                    if (e.key === 'Escape' && isOpen) {
                        setIsOpen(false);
                    }
                };
                
                document.addEventListener('keydown', handleEscape);
                return () => document.removeEventListener('keydown', handleEscape);
            }, [isOpen]);

            // Liquid glass mouse tracking effect (only when scrolled)
            useEffect(() => {
                if (!scrolled) return;
                
                const nav = document.querySelector('.nav.scrolled');
                if (!nav) return;

                const handleMouseMove = (e) => {
                    const rect = nav.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    
                    nav.style.setProperty('--mouse-x', `${x}%`);
                    nav.style.setProperty('--mouse-y', `${y}%`);
                };

                const handleMouseEnter = () => {
                    nav.style.setProperty('--after-opacity', '1');
                };

                const handleMouseLeave = () => {
                    nav.style.setProperty('--after-opacity', '0');
                };

                nav.addEventListener('mousemove', handleMouseMove);
                nav.addEventListener('mouseenter', handleMouseEnter);
                nav.addEventListener('mouseleave', handleMouseLeave);
                
                return () => {
                    nav.removeEventListener('mousemove', handleMouseMove);
                    nav.removeEventListener('mouseenter', handleMouseEnter);
                    nav.removeEventListener('mouseleave', handleMouseLeave);
                };
            }, [scrolled]);

            return h(
                "nav",
                {
                    className: `nav ${scrolled ? "scrolled" : ""} gpu-layer`,
                    role: "navigation",
                    "aria-label": "Main navigation",
                },
                h(
                    "div",
                    { className: "nav-container" },
                    h(
                        "button",
                        {
                            className: "nav-logo",
                            onClick: () => scrollToSection("#hero"),
                            onKeyDown: (e) => handleKeyDown(e, "#hero"),
                            "aria-label": "Go to homepage",
                            type: "button",
                        },
                        "PictaLens",
                    ),
                    h(
                        "div",
                        {
                            className: "nav-items",
                            role: "menubar",
                            "aria-label": "Main menu"
                        },
                        navItems.map((item) =>
                            h(
                                "button",
                                {
                                    key: item.name,
                                    className: `nav-item ${activeSection === item.href.replace('#', '') ? 'active' : ''}`,
                                    onClick: (e) => {
                                        e.preventDefault();
                                        scrollToSection(item.href);
                                    },
                                    onKeyDown: (e) => handleKeyDown(e, item.href),
                                    "aria-label": item.ariaLabel,
                                    "aria-current": activeSection === item.href.replace('#', '') ? 'page' : undefined,
                                    role: "menuitem",
                                    type: "button",
                                },
                                h("span", { "aria-hidden": "true" }, item.icon),
                                " ",
                                item.name,
                            ),
                        ),
                    ),
                    h(
                        "button",
                        {
                            className: "mobile-menu-btn",
                            onClick: () => setIsOpen(!isOpen),
                            "aria-label": isOpen ? "Close mobile menu" : "Open mobile menu",
                            "aria-expanded": isOpen,
                            "aria-controls": "mobile-menu",
                            type: "button",
                        },
                        isOpen ? "✕" : "☰",
                    ),
                ),
                isOpen &&
                    h(
                        "div",
                        {
                            className: "mobile-menu",
                            id: "mobile-menu",
                            role: "menu",
                            "aria-label": "Mobile navigation menu"
                        },
                        navItems.map((item) =>
                            h(
                                "button",
                                {
                                    key: item.name,
                                    className: `mobile-menu-item ${activeSection === item.href.replace('#', '') ? 'active' : ''}`,
                                    onClick: (e) => {
                                        e.preventDefault();
                                        scrollToSection(item.href);
                                    },
                                    onKeyDown: (e) => handleKeyDown(e, item.href),
                                    "aria-label": item.ariaLabel,
                                    "aria-current": activeSection === item.href.replace('#', '') ? 'page' : undefined,
                                    role: "menuitem",
                                    type: "button",
                                },
                                h("span", { "aria-hidden": "true" }, item.icon),
                                " ",
                                item.name,
                            ),
                        ),
                    ),
            );
        };

        // Stunning Background Component
        const StunningBackground = () => {
            const [mounted, setMounted] = useState(false);

            useEffect(() => {
                setMounted(true);
            }, []);

            if (!mounted) return null;

            return h(
                "div",
                { className: "stunning-background" },
                h("div", { className: "animated-mesh" }),
                // Floating elements
                Array.from({ length: 12 }).map((_, i) =>
                    h("div", {
                        key: `floating-${i}`,
                        className: "floating-element",
                        style: {
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${20 + Math.random() * 40}px`,
                            height: `${20 + Math.random() * 40}px`,
                            background: `linear-gradient(45deg, 
                                rgba(59, 130, 246, ${0.1 + Math.random() * 0.2}), 
                                rgba(147, 51, 234, ${0.1 + Math.random() * 0.2}), 
                                rgba(236, 72, 153, ${0.1 + Math.random() * 0.2})
                            )`,
                            animationDelay: `${i * 2}s`,
                            animationDuration: `${15 + i * 2}s`,
                        },
                    }),
                ),
                // Particles
                Array.from({ length: 50 }).map((_, i) =>
                    h("div", {
                        key: `particle-${i}`,
                        className: "particle",
                        style: {
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 2}s`,
                        },
                    }),
                ),
            );
        };

        // Hero Section Component
        const HeroSection = () => {
            const scrollToTimeline = () => {
                const element = document.querySelector("#timeline");
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            };

            return h(
                "section",
                {
                    id: "hero",
                    className: "hero",
                },
                h(
                    "div",
                    { className: "hero-bg" },
                    h("div", { className: "hero-bg-element hero-bg-1" }),
                    h("div", { className: "hero-bg-element hero-bg-2" }),
                ),
                h(
                    "div",
                    { className: "hero-content animate-fadeInUp" },
                    h(
                        "div",
                        { className: "hero-badge" },
                        h(
                            "svg",
                            {
                                width: "32",
                                height: "32",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                            },
                            h("path", {
                                d: "m12,3 -1.912,5.813a2,2 0 0,1 -1.275,1.275L3,12l5.813,1.912a2,2 0 0,1 1.275,1.275L12,21l1.912,-5.813a2,2 0 0,1 1.275,-1.275L21,12l-5.813,-1.912a2,2 0 0,1 -1.275,-1.275L12,3Z",
                            }),
                        ),
                        h("span", null, "Journey Through Time"),
                    ),
                    h(
                        "h1",
                        { className: "hero-title" },
                        h("span", { className: "hero-title-1" }, "Timeless"),
                        h("br"),
                        h("span", { className: "hero-title-2" }, "Chronicles"),
                    ),
                    h(
                        "p",
                        { className: "hero-description" },
                        "Explore the fascinating evolution of art, history, and fashion from ancient cave paintings to AI-generated masterpieces. Discover how creativity has shaped human civilization across millennia.",
                    ),
                    h(
                        "button",
                        {
                            className: "hero-button",
                            onClick: scrollToTimeline,
                        },
                        "Begin Your Journey",
                    ),
                    h(
                        "div",
                        { className: "hero-arrow animate-bounce" },
                        h(
                            "svg",
                            {
                                width: "32",
                                height: "32",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                            },
                            h("path", { d: "m7,13 5,5 5,-5" }),
                            h("path", { d: "m7,6 5,5 5,-5" }),
                        ),
                    ),
                ),
            );
        };

        // Interactive Timeline Component
        const InteractiveTimeline = () => {
            const [selectedEra, setSelectedEra] = useState(0);

            const timelineData = [
                {
                    era: "Prehistoric",
                    period: "40,000 BCE",
                    title: "Cave Paintings",
                    description: "The earliest known art forms, depicting animals and human figures on cave walls.",
                    image: "https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/040A/production/_95243010_cavedavidstanley.jpg",
                },
                {
                    era: "Ancient",
                    period: "3000 BCE",
                    title: "Egyptian Art",
                    description: "Hieroglyphic art and monumental architecture defining ancient civilization.",
                    image: "https://www.swanbazaar.com/pub/media/mageplaza/blog/post/c/o/cover_1_.jpg",
                },
                {
                    era: "Classical",
                    period: "500 BCE",
                    title: "Greek & Roman",
                    description: "Classical sculptures and architectural marvels that influenced Western art.",
                    image: "https://images.saymedia-content.com/.image/t_share/MTc0NDg3NzY0NDIxNTg0NTE4/greek-influence-on-rome.jpg",
                },
                {
                    era: "Medieval",
                    period: "1000 CE",
                    title: "Gothic Art",
                    description: "Religious art and magnificent cathedrals reaching toward the heavens.",
                    image: "https://englishispart.wordpress.com/wp-content/uploads/2015/01/milan-cathedral.jpg",
                },
                {
                    era: "Renaissance",
                    period: "1400 CE",
                    title: "Artistic Revival",
                    description: "The rebirth of classical learning and artistic innovation.",
                    image: "https://usaartnews.com/wp-content/uploads/1-1-%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F-%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F-100.jpg",
                },
                {
                    era: "Modern",
                    period: "1900 CE",
                    title: "Abstract Revolution",
                    description: "Breaking traditional forms with abstract and experimental art.",
                    image: "https://cdna.artstation.com/p/assets/images/images/017/554/534/large/acr-croart-d2900-559c9da2ac29ef23c136bd400abb86122f523588.jpg?1556469424",
                },
                {
                    era: "Digital",
                    period: "2020 CE",
                    title: "AI Art",
                    description: "Artificial intelligence creating new forms of artistic expression.",
                    image: "https://image.pollinations.ai/prompt/Artificial%20intelligence%20creating%20new%20forms%20of%20artistic%20expression?height=576&nologo=true&model=flux",
                },
            ];

            return h(
                "section",
                {
                    id: "timeline",
                    className: "section",
                },
                h(
                    "div",
                    { className: "container" },
                    h(
                        "div",
                        { className: "text-center animate-fadeInUp" },
                        h(
                            "h2",
                            { className: "section-title" },
                            h(
                                "span",
                                {
                                    style: {
                                        background: "linear-gradient(to right, #ffffff, #22d3ee)",
                                        WebkitBackgroundClip: "text",
                                        backgroundClip: "text",
                                        color: "transparent",
                                    },
                                },
                                "Journey Through Time"
                            )
                        ),
                        h(
                            "p",
                            { className: "section-description" },
                            "Explore the evolution of human creativity across millennia"
                        )
                    ),
                    h(
                        "div",
                        { className: "timeline-nav" },
                        timelineData.map((item, index) =>
                            h(
                                "button",
                                {
                                    key: index,
                                    className: `timeline-btn ${selectedEra === index ? "active" : ""}`,
                                    onClick: () => setSelectedEra(index),
                                },
                                item.era
                            )
                        )
                    ),
                    h(
                        "div",
                        { className: "timeline-content" },
                        h(
                            "div",
                            { className: "timeline-info animate-slideInLeft" },
                            h("div", { className: "timeline-badge" }, timelineData[selectedEra].period),
                            h("h3", { className: "timeline-title" }, timelineData[selectedEra].title),
                            h("p", { className: "timeline-desc" }, timelineData[selectedEra].description),
                            h("div", { className: "timeline-progress" })
                        ),
                        h(
                            "div",
                            { className: "timeline-image animate-slideInRight" },
                            h(
                                "div",
                                { className: "timeline-card" },
                                h("img", {
                                    src: timelineData[selectedEra].image,
                                    alt: timelineData[selectedEra].title,
                                }),
                                h(
                                    "div",
                                    { className: "timeline-card-content" },
                                    h("h4", { className: "timeline-card-title" }, `${timelineData[selectedEra].era} Era`),
                                    h(
                                        "p",
                                        { className: "timeline-card-desc" },
                                        "Discover the artistic innovations of this remarkable period"
                                    )
                                )
                            )
                        )
                    )
                )
            );
        };

        // Enhanced Art Gallery Component with Performance Optimizations
        const ArtGallery = () => {
            const [selectedCategory, setSelectedCategory] = useState("All");
            const [viewMode, setViewMode] = useState("grid");
            const [searchTerm, setSearchTerm] = useState("");
            const [visibleItems, setVisibleItems] = useState(6);
            const [isLoading, setIsLoading] = useState(false);

            // Performance monitoring
            usePerformanceMonitor();

            const artworks = [
                {
                    id: 1,
                    title: "Starry Night Reimagined",
                    artist: "AI Generated",
                    period: "Digital Age",
                    category: "Digital Art",
                    image: "https://image.pollinations.ai/prompt/A%20modern%20interpretation%20of%20Van%20Gogh's%20masterpiece%20using%20AI%20algorithms.?height=576&nologo=true&model=flux",
                    description: "A modern interpretation of Van Gogh's masterpiece using AI algorithms.",
                },
                {
                    id: 2,
                    title: "Ancient Pottery",
                    artist: "Unknown Artisan",
                    period: "Bronze Age",
                    category: "Ceramics",
                    image: "https://images.ctfassets.net/cnu0m8re1exe/46iKYQz4SAi9YqGVco7LLE/f8811e49b291d6a5b88c722507e7a2dd/ancient-pottery.jpg",
                    description: "Beautifully crafted pottery showcasing early human artistic expression.",
                },
                {
                    id: 3,
                    title: "Renaissance Portrait",
                    artist: "Master Artist",
                    period: "Renaissance",
                    category: "Painting",
                    image: "https://media.istockphoto.com/id/1718274155/vector/portrait-of-mona-lisa-painted-by-leonardo-da-vinci.jpg?s=612x612&w=0&k=20&c=M8SL388hMNWaeAlNK6zkPsAKIfggWM572TO4W9Yr75E=",
                    description: "A stunning portrait exemplifying Renaissance artistic techniques.",
                },
                {
                    id: 4,
                    title: "Modern Sculpture",
                    artist: "Contemporary Artist",
                    period: "Modern",
                    category: "Sculpture",
                    image: "https://most-iconic-art.com/cdn/shop/files/modern-contemporary-sculpture-508.jpg?v=1724257901&width=1200",
                    description: "Abstract sculpture representing modern artistic expression.",
                },
                {
                    id: 5,
                    title: "Cave Art Recreation",
                    artist: "Prehistoric Humans",
                    period: "Prehistoric",
                    category: "Cave Art",
                    image: "https://th-thumbnailer.cdn-si-edu.com/bpaXsxS4cDpWDTPt4Z0XCTVhKE8=/1072x720/filters:no_upscale()/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer/75/9d/759d0831-61fc-4e60-b7d8-25cf7441cea8/apr2015_h03_chauvetcave.jpg",
                    description: "Digital recreation of ancient cave paintings.",
                },
                {
                    id: 6,
                    title: "Futuristic Design",
                    artist: "AI Collective",
                    period: "Future",
                    category: "Concept Art",
                    image: "https://foyr.com/learn/wp-content/uploads/2021/04/futuristic-interior-design.jpg",
                    description: "Conceptual art imagining future artistic possibilities.",
                },
            ];

            const categories = ["All", "Digital Art", "Painting", "Sculpture", "Ceramics", "Cave Art", "Concept Art"];

            // Memoized filtered artworks for performance
            const filteredArtworks = useMemo(() => {
                return artworks.filter((artwork) => {
                    const matchesCategory = selectedCategory === "All" || artwork.category === selectedCategory;
                    const matchesSearch =
                        artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        artwork.artist.toLowerCase().includes(searchTerm.toLowerCase());
                    return matchesCategory && matchesSearch;
                });
            }, [selectedCategory, searchTerm, artworks]);

            // Load more items handler
            const loadMoreItems = useCallback(() => {
                if (visibleItems < filteredArtworks.length) {
                    setIsLoading(true);
                    setTimeout(() => {
                        setVisibleItems(prev => Math.min(prev + 6, filteredArtworks.length));
                        setIsLoading(false);
                    }, 500);
                }
            }, [visibleItems, filteredArtworks.length]);

            // Reset visible items when filters change
            useEffect(() => {
                setVisibleItems(6);
            }, [selectedCategory, searchTerm]);

            // Optimized Gallery Card Component
            const GalleryCard = useMemo(() => ({ artwork, index }) => {
                const [ref, isLoaded] = useLazyLoad();
                
                return h(
                    "div",
                    {
                        key: artwork.id,
                        ref,
                        className: `gallery-card gpu-layer ${isLoaded ? 'loaded' : 'lazy-load'}`,
                        style: {
                            animationDelay: `${index * 0.1}s`,
                            '--row-span': Math.floor(Math.random() * 20) + 30
                        },
                        role: "article",
                        "aria-labelledby": `artwork-title-${artwork.id}`,
                        "aria-describedby": `artwork-desc-${artwork.id}`,
                        tabIndex: 0,
                    },
                    h(
                        "div",
                        { className: "gallery-card-image" },
                        h("img", {
                            src: isLoaded ? artwork.image : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
                            alt: artwork.title,
                            loading: "lazy",
                            decoding: "async",
                            style: isLoaded ? {} : { filter: 'blur(5px)' }
                        }),
                        h("div", { className: "gallery-card-badge" }, artwork.period),
                    ),
                    h(
                        "div",
                        { className: "gallery-card-content" },
                        h("h3", {
                            className: "gallery-card-title",
                            id: `artwork-title-${artwork.id}`
                        }, artwork.title),
                        h("p", { className: "gallery-card-artist" }, artwork.artist),
                        h("p", {
                            className: "gallery-card-desc",
                            id: `artwork-desc-${artwork.id}`
                        }, artwork.description),
                    ),
                );
            }, []);

            return h(
                "section",
                {
                    id: "gallery",
                    className: "section",
                },
                h(
                    "div",
                    { className: "container" },
                    h(
                        "div",
                        { className: "text-center animate-fadeInUp" },
                        h(
                            "h2",
                            { className: "section-title" },
                            h(
                                "span",
                                {
                                    style: {
                                        background: "linear-gradient(to right, #ffffff, #a855f7)",
                                        WebkitBackgroundClip: "text",
                                        backgroundClip: "text",
                                        color: "transparent",
                                    },
                                },
                                "Art Evolution Gallery"
                            )
                        ),
                        h(
                            "p",
                            { className: "section-description" },
                            "Witness the transformation of artistic expression across civilizations"
                        )
                    ),
                    h(
                        "div",
                        { className: "gallery-controls" },
                        h(
                            "div",
                            { className: "search-container" },
                            h(
                                "svg",
                                {
                                    className: "search-icon",
                                    width: "20",
                                    height: "20",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                },
                                h("circle", { cx: "11", cy: "11", r: "8" }),
                                h("path", { d: "m21,21 -4.35,-4.35" }),
                            ),
                            h("input", {
                                type: "text",
                                placeholder: "Search artworks...",
                                className: "search-input",
                                value: searchTerm,
                                onChange: (e) => setSearchTerm(e.target.value),
                            }),
                        ),
                        h(
                            "div",
                            { className: "view-controls" },
                            h(
                                "button",
                                {
                                    className: `view-btn ${viewMode === "grid" ? "active" : ""}`,
                                    onClick: () => setViewMode("grid"),
                                },
                                h(
                                    "svg",
                                    {
                                        width: "16",
                                        height: "16",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                    },
                                    h("rect", { x: "3", y: "3", width: "7", height: "7" }),
                                    h("rect", { x: "14", y: "3", width: "7", height: "7" }),
                                    h("rect", { x: "14", y: "14", width: "7", height: "7" }),
                                    h("rect", { x: "3", y: "14", width: "7", height: "7" }),
                                ),
                            ),
                            h(
                                "button",
                                {
                                    className: `view-btn ${viewMode === "list" ? "active" : ""}`,
                                    onClick: () => setViewMode("list"),
                                },
                                h(
                                    "svg",
                                    {
                                        width: "16",
                                        height: "16",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                    },
                                    h("line", { x1: "8", y1: "6", x2: "21", y2: "6" }),
                                    h("line", { x1: "8", y1: "12", x2: "21", y2: "12" }),
                                    h("line", { x1: "8", y1: "18", x2: "21", y2: "18" }),
                                    h("line", { x1: "3", y1: "6", x2: "3.01", y2: "6" }),
                                    h("line", { x1: "3", y1: "12", x2: "3.01", y2: "12" }),
                                    h("line", { x1: "3", y1: "18", x2: "3.01", y2: "18" }),
                                ),
                            ),
                        ),
                    ),
                    h(
                        "div",
                        { className: "category-filters" },
                        categories.map((category) =>
                            h(
                                "button",
                                {
                                    key: category,
                                    className: `category-btn ${selectedCategory === category ? "active" : ""}`,
                                    onClick: () => setSelectedCategory(category),
                                },
                                category,
                            ),
                        ),
                    ),
                    h(
                        "div",
                        {
                            className: `gallery-grid ${viewMode === 'list' ? 'gallery-list' : ''}`,
                            style: viewMode === 'list' ? { display: 'flex', flexDirection: 'column', gap: '1rem' } : {}
                        },
                        filteredArtworks.slice(0, visibleItems).map((artwork, index) =>
                            h(GalleryCard, {
                                key: artwork.id,
                                artwork,
                                index
                            })
                        ),
                    ),
                    visibleItems < filteredArtworks.length &&
                        h(
                            "div",
                            {
                                style: {
                                    textAlign: 'center',
                                    marginTop: '2rem'
                                }
                            },
                            h(
                                "button",
                                {
                                    className: "hero-button",
                                    onClick: loadMoreItems,
                                    disabled: isLoading
                                },
                                isLoading ? "Loading..." : "Load More"
                            )
                        ),
                    filteredArtworks.length === 0 &&
                        h(
                            "div",
                            {
                                className: "text-center",
                                style: { padding: "4rem 0" },
                            },
                            h(
                                "p",
                                {
                                    style: { fontSize: "1.25rem", color: "#9ca3af" },
                                },
                                "No artworks found matching your criteria.",
                            ),
                        ),
                ),
            );
        };

        // Fashion Evolution Component
        const FashionEvolution = () => {
            const [currentEra, setCurrentEra] = useState(0);

            const fashionEras = [
                {
                    era: "Ancient Egypt",
                    period: "3000 BCE",
                    description: "Linen garments, jewelry, and elaborate headdresses symbolizing status and divinity.",
                    image: "https://www.egypttoursportal.com/images/2025/01/Ancient-Egyptian-Clothes-Egypt-Tours-Portal.jpg",
                    keyFeatures: ["Linen fabrics", "Gold jewelry", "Elaborate makeup", "Symbolic colors"],
                    modernInfluence: "Minimalist silhouettes and metallic accessories",
                },
                {
                    era: "Medieval",
                    period: "1000-1400 CE",
                    description: "Layered clothing, rich fabrics, and garments that reflected social hierarchy.",
                    image: "https://timelessfashionhub.com/wp-content/uploads/2024/06/middle_class_fashion_in_19th_century.jpg",
                    keyFeatures: ["Layered garments", "Rich brocades", "Long sleeves", "Head coverings"],
                    modernInfluence: "Layering techniques and structured silhouettes",
                },
                {
                    era: "Renaissance",
                    period: "1400-1600 CE",
                    description: "Elaborate gowns, corsets, and fashion as an art form expressing wealth and culture.",
                    image: "https://www.fashionabc.org/wp-content/uploads/2025/01/rococo.jpg",
                    keyFeatures: ["Corsetry", "Voluminous skirts", "Rich embroidery", "Luxury fabrics"],
                    modernInfluence: "Structured bodices and dramatic silhouettes",
                },
                {
                    era: "Victorian",
                    period: "1837-1901 CE",
                    description: "Modest yet elaborate fashion with emphasis on propriety and social status.",
                    image: "https://www.mimimatthews.com/wp-content/uploads/2022/02/Women-1864-Plate-014-via-Met-Museum-1.jpg",
                    keyFeatures: ["Bustles", "High necklines", "Long gloves", "Intricate details"],
                    modernInfluence: "Vintage-inspired details and modest fashion",
                },
                {
                    era: "1920s Flapper",
                    period: "1920s",
                    description: "Revolutionary fashion breaking traditional norms with shorter hemlines and looser fits.",
                    image: "https://fashiondrive.org/wp-content/uploads/1920s-women-fashion-700x528.jpg",
                    keyFeatures: ["Drop waists", "Short hemlines", "Beaded dresses", "Bobbed hair"],
                    modernInfluence: "Relaxed fits and geometric patterns",
                },
                {
                    era: "Modern Minimalism",
                    period: "1990s-2000s",
                    description: "Clean lines, neutral colors, and functional fashion prioritizing comfort and versatility.",
                    image: "https://intheblouse.com/wp-content/uploads/2024/08/Copy-of-Pastel-Aesthetic-Minimalist-Black-Friday-Sale-Photo-Collage-Your-Story-30.webp",
                    keyFeatures: ["Clean lines", "Neutral palettes", "Functional design", "Quality fabrics"],
                    modernInfluence: "Sustainable and versatile wardrobe staples",
                },
                {
                    era: "AI Fashion",
                    period: "2020s+",
                    description: "Technology-driven design with AI-generated patterns, sustainable materials, and personalized fits.",
                    image: "https://images.squarespace-cdn.com/content/v1/6198b30895e9de68c9a4f2ba/1712678229582-2QI0H11IQ6JFHYZEJ2SP/1*tBODJrqlsZAc1Pc-z3IGxA.png",
                    keyFeatures: ["AI-generated designs", "Smart fabrics", "Sustainable materials", "Personalized fits"],
                    modernInfluence: "The future of fashion is being written now",
                },
            ];

            const nextEra = () => {
                setCurrentEra((prev) => (prev + 1) % fashionEras.length);
            };

            const prevEra = () => {
                setCurrentEra((prev) => (prev - 1 + fashionEras.length) % fashionEras.length);
            };

            return h(
                "section",
                {
                    id: "fashion",
                    className: "section fashion-section",
                },
                h(
                    "div",
                    { className: "container" },
                    h(
                        "div",
                        { className: "text-center animate-fadeInUp" },
                        h(
                            "h2",
                            { className: "section-title" },
                            h(
                                "span",
                                {
                                    style: {
                                        background: "linear-gradient(to right, #ffffff, #ec4899)",
                                        WebkitBackgroundClip: "text",
                                        backgroundClip: "text",
                                        color: "transparent",
                                    },
                                },
                                "Fashion Through Time"
                            )
                        ),
                        h(
                            "p",
                            { className: "section-description" },
                            "Discover how clothing and style have evolved to reflect culture, technology, and human expression"
                        )
                    ),
                    h(
                        "div",
                        { className: "fashion-container" },
                        h(
                            "div",
                            { className: "fashion-display animate-slideInLeft" },
                            h(
                                "div",
                                { className: "fashion-card" },
                                h(
                                    "div",
                                    { className: "fashion-image-container" },
                                    h("img", {
                                        src: fashionEras[currentEra].image,
                                        alt: fashionEras[currentEra].era,
                                        className: "fashion-image",
                                    }),
                                    h("div", { className: "fashion-overlay" }),
                                    h(
                                        "div",
                                        { className: "fashion-title-overlay" },
                                        h(
                                            "div",
                                            {
                                                className: "timeline-badge",
                                                style: { background: "linear-gradient(to right, #7c3aed, #ec4899)" },
                                            },
                                            fashionEras[currentEra].period,
                                        ),
                                        h("h3", { className: "fashion-era-title" }, fashionEras[currentEra].era),
                                    ),
                                ),
                            ),
                            h(
                                "div",
                                { className: "fashion-controls" },
                                h(
                                    "button",
                                    {
                                        className: "fashion-nav-btn",
                                        onClick: prevEra,
                                    },
                                    h(
                                        "svg",
                                        {
                                            width: "16",
                                            height: "16",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                        },
                                        h("path", { d: "m15,18 -6,-6 6,-6" }),
                                    ),
                                    "Previous",
                                ),
                                h(
                                    "div",
                                    { className: "fashion-dots" },
                                    fashionEras.map((_, index) =>
                                        h("button", {
                                            key: index,
                                            className: `fashion-dot ${index === currentEra ? "active" : ""}`,
                                            onClick: () => setCurrentEra(index),
                                        }),
                                    ),
                                ),
                                h(
                                    "button",
                                    {
                                        className: "fashion-nav-btn",
                                        onClick: nextEra,
                                    },
                                    "Next",
                                    h(
                                        "svg",
                                        {
                                            width: "16",
                                            height: "16",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                        },
                                        h("path", { d: "m9,18 6,-6 -6,-6" }),
                                    ),
                                ),
                            ),
                        ),
                        h(
                            "div",
                            { className: "fashion-info animate-slideInRight" },
                            h(
                                "div",
                                { className: "fashion-era-info" },
                                h("h3", null, fashionEras[currentEra].era),
                                h("p", null, fashionEras[currentEra].description),
                            ),
                            h(
                                "div",
                                { className: "fashion-features" },
                                h(
                                    "h4",
                                    null,
                                    h(
                                        "svg",
                                        {
                                            width: "20",
                                            height: "20",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            style: { color: "#ec4899" },
                                        },
                                        h("path", {
                                            d: "m12,3 -1.912,5.813a2,2 0 0,1 -1.275,1.275L3,12l5.813,1.912a2,2 0 0,1 1.275,1.275L12,21l1.912,-5.813a2,2 0 0,1 1.275,-1.275L21,12l-5.813,-1.912a2,2 0 0,1 -1.275,-1.275L12,3Z",
                                        }),
                                    ),
                                    "Key Features",
                                ),
                                h(
                                    "div",
                                    { className: "fashion-features-grid" },
                                    fashionEras[currentEra].keyFeatures.map((feature, index) =>
                                        h(
                                            "div",
                                            {
                                                key: feature,
                                                className: "fashion-feature",
                                                style: { animationDelay: `${index * 0.1}s` },
                                            },
                                            feature,
                                        ),
                                    ),
                                ),
                            ),
                            h(
                                "div",
                                { className: "fashion-influence" },
                                h("h4", null, "Modern Influence"),
                                h("p", null, fashionEras[currentEra].modernInfluence),
                            ),
                        ),
                    ),
                ),
            );
        };

        // Digital Art Component
        const DigitalArt = () => {
            const [selectedTab, setSelectedTab] = useState("art");
            const [generatingArt, setGeneratingArt] = useState(false);
            const [generatedImage, setGeneratedImage] = useState(
                "https://image.pollinations.ai/prompt/A%20surreal%20landscape%20where%20time%20flows%20like%20water%20through%20crystalline%20structures?width=512&height=512&nologo=true&model=flux",
            );
            const [currentPrompt, setCurrentPrompt] = useState(
                "A surreal landscape where time flows like water through crystalline structures",
            );
            const [imageWidth, setImageWidth] = useState(512);
            const [imageHeight, setImageHeight] = useState(512);
            const [showAdvanced, setShowAdvanced] = useState(false);
            const [generatingFashion, setGeneratingFashion] = useState(false);
            const [generatedFashion, setGeneratedFashion] = useState(
                "https://image.pollinations.ai/prompt/Fashion%20clothes%20with%20realistic%20model,%20elegant%20evening%20gown%20with%20flowing%20fabric?width=512&height=768&nologo=true&model=flux",
            );
            const [fashionPrompt, setFashionPrompt] = useState("elegant evening gown with flowing fabric");
            const [fashionWidth, setFashionWidth] = useState(512);
            const [fashionHeight, setFashionHeight] = useState(768);
            const [showFashionAdvanced, setShowFashionAdvanced] = useState(false);
            const [toastVisible, setToastVisible] = useState(false);
            const [toastMessage, setToastMessage] = useState("");

            const showToast = (message) => {
                setToastMessage(message);
                setToastVisible(true);
            };

            const hideToast = () => {
                setToastVisible(false);
            };

            const aiArtworks = [
                {
                    id: 1,
                    title: "Neural Dreams",
                    style: "Abstract Expressionism",
                    prompt: "Vibrant colors flowing like consciousness through digital space",
                    image: "https://image.pollinations.ai/prompt/Vibrant%20colors%20flowing%20like%20consciousness%20through%20digital%20space?height=400&nologo=true&model=flux",
                    algorithm: "Flux",
                    likes: 1247,
                },
                {
                    id: 2,
                    title: "Quantum Portraits",
                    style: "Surrealism",
                    prompt: "Portrait of a person existing in multiple dimensions simultaneously",
                    image: "https://image.pollinations.ai/prompt/Portrait%20of%20a%20person%20existing%20in%20multiple%20dimensions%20simultaneously?height=400&nologo=true&model=flux",
                    algorithm: "Flux",
                    likes: 892,
                },
                {
                    id: 3,
                    title: "Digital Renaissance",
                    style: "Classical Revival",
                    prompt: "Renaissance painting style applied to futuristic cityscape",
                    image: "https://image.pollinations.ai/prompt/Renaissance%20painting%20style%20applied%20to%20futuristic%20cityscape?height=400&nologo=true&model=flux",
                    algorithm: "Flux",
                    likes: 2156,
                },
                {
                    id: 4,
                    title: "Algorithmic Nature",
                    style: "Bio-Art",
                    prompt: "Nature patterns generated through mathematical algorithms",
                    image: "https://image.pollinations.ai/prompt/Nature%20patterns%20generated%20through%20mathematical%20algorithms?height=400&nologo=true&model=flux",
                    algorithm: "Flux",
                    likes: 743,
                },
            ];

            const fashionDesigns = [
                {
                    id: 1,
                    title: "Neo-Victorian Gown",
                    description: "AI-designed gown combining Victorian elegance with futuristic materials",
                    image: "https://image.pollinations.ai/prompt/Neo-Victorian%20Gown%0AAI-designed%20gown%20combining%20Victorian%20elegance%20with%20futuristic%20materials%0A%0ASmart%20Materials%0ASmart%20fabricLED%20fibersRecycled%20silk%0AAI%20Features%0ATemperature%20regulation%0AColor-changing%0ASelf-cleaning?height=576&nologo=true&model=flux",
                    materials: ["Smart fabric", "LED fibers", "Recycled silk"],
                    features: ["Temperature regulation", "Color-changing", "Self-cleaning"],
                },
                {
                    id: 2,
                    title: "Minimalist Tech Wear",
                    description: "Clean lines meet functionality in this AI-optimized design",
                    image: "https://image.pollinations.ai/prompt/A%20futuristic%20minimalist%20techwear%20outfit%20designed%20with%20clean%20lines%20and%20a%20sleek%20silhouette%2C%20worn%20by%20a%20model%20standing%20in%20a%20neutral%20urban%20environment.%20The%20clothing%20is%20made%20from%20a%20high-tech%20blend%20of%20graphene%20threads%20and%20organic%20cotton%2C%20with%20subtle%2C%20integrated%20solar%20cells%20visible%20on%20the%20jacket%20shoulders%20and%20sleeves.%20The%20outfit%20features%20a%20matte%20black%20and%20dark%20gray%20color%20palette%2C%20smooth%20textures%2C%20and%20no%20unnecessary%20embellishments.%20The%20design%20is%20AI-optimized%20for%20functionality%3A%20discreet%20biometric%20sensors%20on%20the%20wrist%20area%2C%20weather-adaptive%20material%20subtly%20shifting%20hues%20or%20texture%2C%20and%20an%20integrated%20device%20charging%20port%20near%20the%20hip.%20Lighting%20is%20soft%20and%20modern%2C%20evoking%20a%20smart%2C%20clean%2C%20and%20efficient%20aesthetic.%20Style%20inspired%20by%20futuristic%20streetwear%20and%20minimal%20fashion%20photography.?width=512&height=768&nologo=true&model=flux",
                    materials: ["Graphene threads", "Organic cotton", "Solar cells"],
                    features: ["Device charging", "Weather adaptive", "Biometric monitoring"],
                },
                {
                    id: 3,
                    title: "Holographic Evening Dress",
                    description: "Shimmering dress with integrated holographic projections",
                    image: "https://image.pollinations.ai/prompt/Holographic%20evening%20dress%20with%20integrated%20projections%20and%20shimmering%20materials?height=576&nologo=true&model=flux",
                    materials: ["Holographic fibers", "Memory foam padding", "Crystalline threads"],
                    features: ["Light projection", "Shape adaptation", "Mood responsive"],
                },
                {
                    id: 4,
                    title: "Sustainable Bio-Couture",
                    description: "Eco-friendly haute couture grown from sustainable bio-materials",
                    image: "https://image.pollinations.ai/prompt/Sustainable%20bio-couture%20dress%20made%20from%20eco-friendly%20grown%20materials?height=576&nologo=true&model=flux",
                    materials: ["Lab-grown leather", "Mushroom fibers", "Algae dyes"],
                    features: ["Biodegradable", "Self-repairing", "Carbon negative"],
                },
            ];

            const dimensionPresets = [
                { name: "Square", width: 512, height: 512 },
                { name: "Portrait", width: 512, height: 768 },
                { name: "Landscape", width: 768, height: 512 },
                { name: "Wide", width: 1024, height: 576 },
                { name: "Ultra Wide", width: 1152, height: 512 },
            ];

            const generateArt = async () => {
                setGeneratingArt(true);
                try {
                    const encodedPrompt = encodeURIComponent(currentPrompt);
                    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${imageWidth}&height=${imageHeight}&nologo=true&model=flux`;

                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    setGeneratedImage(imageUrl);
                } catch (error) {
                    console.error("Error generating image:", error);
                } finally {
                    setGeneratingArt(false);
                }
            };

            const generateFashion = async () => {
                setGeneratingFashion(true);
                try {
                    const fullPrompt = `Fashion clothes with realistic model, ${fashionPrompt}`;
                    const encodedPrompt = encodeURIComponent(fullPrompt);
                    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${fashionWidth}&height=${fashionHeight}&nologo=true&model=flux`;

                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    setGeneratedFashion(imageUrl);
                } catch (error) {
                    console.error("Error generating fashion:", error);
                } finally {
                    setGeneratingFashion(false);
                }
            };

            const randomPrompts = [
                "A majestic dragon soaring through clouds of stardust",
                "Cyberpunk cityscape with neon reflections in rain puddles",
                "Ancient library floating in space with books as planets",
                "Steampunk mechanical butterfly with copper wings",
                "Underwater palace made of coral and pearls",
                "Time traveler's workshop filled with clockwork inventions",
                "Phoenix rising from digital flames in pixel art style",
                "Enchanted forest where trees grow circuit boards as leaves",
            ];

            const randomFashionPrompts = [
                "elegant evening gown with flowing fabric",
                "modern streetwear with urban aesthetic",
                "vintage 1950s inspired dress with polka dots",
                "futuristic cyberpunk outfit with LED accents",
                "bohemian summer dress with floral patterns",
                "professional business suit with contemporary cut",
                "avant-garde haute couture with geometric shapes",
                "casual denim outfit with artistic distressing",
            ];

            const getRandomPrompt = () => {
                const randomPrompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
                setCurrentPrompt(randomPrompt);
            };

            const getRandomFashionPrompt = () => {
                const randomPrompt = randomFashionPrompts[Math.floor(Math.random() * randomFashionPrompts.length)];
                setFashionPrompt(randomPrompt);
            };

            const downloadImage = async (imageUrl, filename) => {
                try {
                    const response = await fetch(imageUrl);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                } catch (error) {
                    console.error("Download failed:", error);
                }
            };

            const shareImage = async (imageUrl) => {
                try {
                    await navigator.clipboard.writeText(imageUrl);
                    showToast("Image link copied to clipboard!");
                } catch (error) {
                    console.error("Failed to copy link:", error);
                    showToast("Failed to copy link");
                }
            };

            return h(
                "section",
                {
                    id: "digital",
                    className: "section digital-section",
                },
                h(
                    "div",
                    { className: "container" },
                    h(
                        "div",
                        { className: "text-center animate-fadeInUp" },
                        h(
                            "h2",
                            { className: "section-title" },
                            h(
                                "span",
                                {
                                    style: {
                                        background: "linear-gradient(to right, #ffffff, #22d3ee)",
                                        WebkitBackgroundClip: "text",
                                        backgroundClip: "text",
                                        color: "transparent",
                                    },
                                },
                                "Digital Art & AI Fashion"
                            )
                        ),
                        h(
                            "p",
                            { className: "section-description" },
                            "Explore the cutting edge of creativity where artificial intelligence meets human imagination"
                        )
                    ),
                    h(
                        "div",
                        { className: "tab-navigation" },
                        h(
                            "div",
                            { className: `tab-container ${selectedTab === "fashion" ? "fashion-active" : ""}` },
                            h(
                                "button",
                                {
                                    className: `tab-btn ${selectedTab === "art" ? "active" : ""}`,
                                    onClick: () => setSelectedTab("art"),
                                },
                                h(
                                    "svg",
                                    {
                                        width: "16",
                                        height: "16",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                    },
                                    h("circle", { cx: "13.5", cy: "6.5", r: ".5", fill: "currentColor" }),
                                    h("circle", { cx: "17.5", cy: "10.5", r: ".5", fill: "currentColor" }),
                                    h("circle", { cx: "8.5", cy: "7.5", r: ".5", fill: "currentColor" }),
                                    h("circle", { cx: "6.5", cy: "12.5", r: ".5", fill: "currentColor" }),
                                    h("path", { d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" }),
                                ),
                                "AI Art Gallery",
                            ),
                            h(
                                "button",
                                {
                                    className: `tab-btn ${selectedTab === "fashion" ? "active" : ""}`,
                                    onClick: () => setSelectedTab("fashion"),
                                },
                                h(
                                    "svg",
                                    {
                                        width: "16",
                                        height: "16",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                    },
                                    h("path", {
                                        d: "m12,3 -1.912,5.813a2,2 0 0,1 -1.275,1.275L3,12l5.813,1.912a2,2 0 0,1 1.275,1.275L12,21l1.912,-5.813a2,2 0 0,1 1.275,-1.275L21,12l-5.813,-1.912a2,2 0 0,1 -1.275,-1.275L12,3Z",
                                    }),
                                ),
                                "AI Fashion",
                            ),
                        ),
                    ),
                    selectedTab === "art" &&
                        h(
                            "div",
                            { className: "animate-fadeIn" },
                            h(
                                "div",
                                { className: "generator-card" },
                                h(
                                    "div",
                                    { className: "generator-header" },
                                    h(
                                        "div",
                                        { className: "generator-title" },
                                        h(
                                            "svg",
                                            {
                                                width: "24",
                                                height: "24",
                                                viewBox: "0 0 24 24",
                                                fill: "none",
                                                stroke: "currentColor",
                                                strokeWidth: "2",
                                                style: { color: "#22d3ee" },
                                            },
                                            h("rect", { x: "2", y: "3", width: "20", height: "14", rx: "2", ry: "2" }),
                                            h("line", { x1: "8", y1: "21", x2: "16", y2: "21" }),
                                            h("line", { x1: "12", y1: "17", x2: "12", y2: "21" }),
                                        ),
                                        "AI Art Generator",
                                    ),
                                    h(
                                        "button",
                                        {
                                            className: "random-btn",
                                            onClick: () => setShowAdvanced(!showAdvanced),
                                        },
                                        h(
                                            "svg",
                                            {
                                                width: "16",
                                                height: "16",
                                                viewBox: "0 0 24 24",
                                                fill: "none",
                                                stroke: "currentColor",
                                                strokeWidth: "2",
                                            },
                                            h("circle", { cx: "12", cy: "12", r: "3" }),
                                            h("path", { d: "m12,1 0,6" }),
                                            h("path", { d: "m12,17 0,6" }),
                                            h("path", { d: "m4.22,4.22 4.24,4.24" }),
                                            h("path", { d: "m15.54,15.54 4.24,4.24" }),
                                            h("path", { d: "m1,12 6,0" }),
                                            h("path", { d: "m17,12 6,0" }),
                                            h("path", { d: "m4.22,19.78 4.24,-4.24" }),
                                            h("path", { d: "m15.54,8.46 4.24,-4.24" }),
                                        ),
                                        showAdvanced ? "Hide" : "Show",
                                        " Advanced",
                                    ),
                                ),
                                h(
                                    "div",
                                    { className: "generator-content" },
                                    h(
                                        "div",
                                        { className: "generator-controls" },
                                        h(
                                            "div",
                                            { className: "form-group" },
                                            h("label", { className: "form-label" }, "Describe your artistic vision"),
                                            h("textarea", {
                                                className: "form-textarea",
                                                placeholder: "Enter your creative prompt here...",
                                                value: currentPrompt,
                                                onChange: (e) => setCurrentPrompt(e.target.value),
                                            }),
                                        ),
                                        showAdvanced &&
                                            h(
                                                "div",
                                                { className: "form-group" },
                                                h("label", { className: "form-label" }, "Image Dimensions"),
                                                h(
                                                    "div",
                                                    { className: "dimension-presets" },
                                                    dimensionPresets.map((preset) =>
                                                        h(
                                                            "button",
                                                            {
                                                                key: preset.name,
                                                                className: `preset-btn ${imageWidth === preset.width && imageHeight === preset.height ? "active" : ""}`,
                                                                onClick: () => {
                                                                    setImageWidth(preset.width);
                                                                    setImageHeight(preset.height);
                                                                },
                                                            },
                                                            `${preset.name} ${preset.width}×${preset.height}`,
                                                        ),
                                                    ),
                                                ),
                                                h(
                                                    "div",
                                                    { className: "dimension-inputs" },
                                                    h(
                                                        "div",
                                                        null,
                                                        h(
                                                            "label",
                                                            { className: "form-label", style: { fontSize: "0.75rem" } },
                                                            "Width",
                                                        ),
                                                        h("input", {
                                                            type: "number",
                                                            min: "256",
                                                            max: "1920",
                                                            step: "64",
                                                            value: imageWidth,
                                                            onChange: (e) => setImageWidth(Number(e.target.value)),
                                                            className: "dimension-input",
                                                        }),
                                                    ),
                                                    h(
                                                        "div",
                                                        null,
                                                        h(
                                                            "label",
                                                            { className: "form-label", style: { fontSize: "0.75rem" } },
                                                            "Height",
                                                        ),
                                                        h("input", {
                                                            type: "number",
                                                            min: "256",
                                                            max: "1920",
                                                            step: "64",
                                                            value: imageHeight,
                                                            onChange: (e) => setImageHeight(Number(e.target.value)),
                                                            className: "dimension-input",
                                                        }),
                                                    ),
                                                ),
                                            ),
                                        h(
                                            "div",
                                            { className: "action-buttons" },
                                            h(
                                                "button",
                                                {
                                                    className: "generate-btn",
                                                    onClick: generateArt,
                                                    disabled: generatingArt,
                                                },
                                                generatingArt
                                                    ? h("div", {
                                                          className: "spinner",
                                                          style: { width: "16px", height: "16px", margin: "0 8px 0 0" },
                                                      })
                                                    : h(
                                                          "svg",
                                                          {
                                                              width: "16",
                                                              height: "16",
                                                              viewBox: "0 0 24 24",
                                                              fill: "none",
                                                              stroke: "currentColor",
                                                              strokeWidth: "2",
                                                          },
                                                          h("path", {
                                                              d: "m12,3 -1.912,5.813a2,2 0 0,1 -1.275,1.275L3,12l5.813,1.912a2,2 0 0,1 1.275,1.275L12,21l1.912,-5.813a2,2 0 0,1 1.275,-1.275L21,12l-5.813,-1.912a2,2 0 0,1 -1.275,-1.275L12,3Z",
                                                          }),
                                                      ),
                                                generatingArt ? "Generating..." : "Generate Art",
                                            ),
                                            h(
                                                "button",
                                                {
                                                    className: "random-btn",
                                                    onClick: getRandomPrompt,
                                                },
                                                "Random Prompt",
                                            ),
                                        ),
                                    ),
                                    h(
                                        "div",
                                        { className: "generator-display" },
                                        generatingArt
                                            ? h(
                                                  "div",
                                                  { className: "loading-spinner" },
                                                  h("div", { className: "spinner" }),
                                                  h("p", { style: { color: "#d1d5db" } }, "Creating your masterpiece..."),
                                                  h(
                                                      "p",
                                                      { style: { fontSize: "0.875rem", color: "#9ca3af", marginTop: "0.5rem" } },
                                                      `Generating ${imageWidth} × ${imageHeight} image`,
                                                  ),
                                              )
                                            : generatedImage
                                              ? h(
                                                    "div",
                                                    { className: "generated-image-container" },
                                                    h("img", {
                                                        src: generatedImage,
                                                        alt: "Generated artwork",
                                                        className: "generated-image",
                                                        style: { aspectRatio: `${imageWidth}/${imageHeight}` },
                                                    }),
                                                    h(
                                                        "div",
                                                        { className: "image-actions" },
                                                        h(
                                                            "button",
                                                            {
                                                                className: "action-btn",
                                                                onClick: () => downloadImage(generatedImage, `ai-art-${imageWidth}x${imageHeight}.jpg`),
                                                            },
                                                            h(
                                                                "svg",
                                                                {
                                                                    width: "16",
                                                                    height: "16",
                                                                    viewBox: "0 0 24 24",
                                                                    fill: "none",
                                                                    stroke: "currentColor",
                                                                    strokeWidth: "2",
                                                                },
                                                                h("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                                                                h("polyline", { points: "7,10 12,15 17,10" }),
                                                                h("line", { x1: "12", y1: "15", x2: "12", y2: "3" }),
                                                            ),
                                                            "Download",
                                                        ),
                                                        h(
                                                            "button",
                                                            {
                                                                className: "action-btn",
                                                                onClick: () => shareImage(generatedImage),
                                                            },
                                                            h(
                                                                "svg",
                                                                {
                                                                    width: "16",
                                                                    height: "16",
                                                                    viewBox: "0 0 24 24",
                                                                    fill: "none",
                                                                    stroke: "currentColor",
                                                                    strokeWidth: "2",
                                                                },
                                                                h("circle", { cx: "18", cy: "5", r: "3" }),
                                                                h("circle", { cx: "6", cy: "12", r: "3" }),
                                                                h("circle", { cx: "18", cy: "19", r: "3" }),
                                                                h("line", { x1: "8.59", y1: "13.51", x2: "15.42", y2: "17.49" }),
                                                                h("line", { x1: "15.41", y1: "6.51", x2: "8.59", y2: "10.49" }),
                                                            ),
                                                            "Share",
                                                        ),
                                                    ),
                                                )
                                              : null,
                                    ),
                                ),
                            ),
                            h(
                                "div",
                                { className: "ai-gallery" },
                                aiArtworks.map((artwork, index) =>
                                    h(
                                        "div",
                                        {
                                            key: artwork.id,
                                            className: "ai-card",
                                            style: { animationDelay: `${index * 0.1}s` },
                                        },
                                        h(
                                            "div",
                                            { className: "ai-card-image" },
                                            h("img", {
                                                src: artwork.image,
                                                alt: artwork.title,
                                            }),
                                            h("div", { className: "ai-card-badge" }, artwork.algorithm),
                                        ),
                                        h(
                                            "div",
                                            { className: "ai-card-content" },
                                            h("h3", { className: "ai-card-title" }, artwork.title),
                                            h("p", { className: "ai-card-style" }, artwork.style),
                                            h("p", { className: "ai-card-prompt" }, `"${artwork.prompt}"`),
                                            h(
                                                "div",
                                                { className: "ai-card-footer" },
                                                h("span", { className: "ai-card-likes" }, `❤️ ${artwork.likes}`),
                                                h(
                                                    "div",
                                                    { className: "ai-card-actions" },
                                                    h(
                                                        "button",
                                                        {
                                                            className: "ai-action-btn",
                                                            onClick: () => downloadImage(artwork.image, `${artwork.title.replace(/\s+/g, "-").toLowerCase()}.jpg`),
                                                        },
                                                        h(
                                                            "svg",
                                                            {
                                                                width: "16",
                                                                height: "16",
                                                                viewBox: "0 0 24 24",
                                                                fill: "none",
                                                                stroke: "currentColor",
                                                                strokeWidth: "2",
                                                            },
                                                            h("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                                                            h("polyline", { points: "7,10 12,15 17,10" }),
                                                            h("line", { x1: "12", y1: "15", x2: "12", y2: "3" }),
                                                        ),
                                                    ),
                                                    h(
                                                        "button",
                                                        {
                                                            className: "ai-action-btn",
                                                            onClick: () => shareImage(artwork.image),
                                                        },
                                                        h(
                                                            "svg",
                                                            {
                                                                width: "16",
                                                                height: "16",
                                                                viewBox: "0 0 24 24",
                                                                fill: "none",
                                                                stroke: "currentColor",
                                                                strokeWidth: "2",
                                                            },
                                                            h("circle", { cx: "18", cy: "5", r: "3" }),
                                                            h("circle", { cx: "6", cy: "12", r: "3" }),
                                                            h("circle", { cx: "18", cy: "19", r: "3" }),
                                                            h("line", { x1: "8.59", y1: "13.51", x2: "15.42", y2: "17.49" }),
                                                            h("line", { x1: "15.41", y1: "6.51", x2: "8.59", y2: "10.49" }),
                                                        ),
                                                    ),
                                                ),
                                            ),
                                        ),
                                    ),
                                ),
                            ),
                        ),
                    selectedTab === "fashion" &&
                        h(
                            "div",
                            { className: "animate-fadeIn" },
                            h(
                                "div",
                                { className: "generator-card" },
                                h(
                                    "div",
                                    { className: "generator-header" },
                                    h(
                                        "div",
                                        { className: "generator-title" },
                                        h(
                                            "svg",
                                            {
                                                width: "24",
                                                height: "24",
                                                viewBox: "0 0 24 24",
                                                fill: "none",
                                                stroke: "currentColor",
                                                strokeWidth: "2",
                                                style: { color: "#ec4899" },
                                            },
                                            h("rect", { x: "2", y: "3", width: "20", height: "14", rx: "2", ry: "2" }),
                                            h("line", { x1: "8", y1: "21", x2: "16", y2: "21" }),
                                            h("line", { x1: "12", y1: "17", x2: "12", y2: "21" }),
                                        ),
                                        "AI Fashion Generator",
                                    ),
                                    h(
                                        "button",
                                        {
                                            className: "random-btn",
                                            onClick: () => setShowFashionAdvanced(!showFashionAdvanced),
                                        },
                                        h(
                                            "svg",
                                            {
                                                width: "16",
                                                height: "16",
                                                viewBox: "0 0 24 24",
                                                fill: "none",
                                                stroke: "currentColor",
                                                strokeWidth: "2",
                                            },
                                            h("circle", { cx: "12", cy: "12", r: "3" }),
                                            h("path", { d: "m12,1 0,6" }),
                                            h("path", { d: "m12,17 0,6" }),
                                            h("path", { d: "m4.22,4.22 4.24,4.24" }),
                                            h("path", { d: "m15.54,15.54 4.24,4.24" }),
                                            h("path", { d: "m1,12 6,0" }),
                                            h("path", { d: "m17,12 6,0" }),
                                            h("path", { d: "m4.22,19.78 4.24,-4.24" }),
                                            h("path", { d: "m15.54,8.46 4.24,-4.24" }),
                                        ),
                                        showFashionAdvanced ? "Hide" : "Show",
                                        " Advanced",
                                    ),
                                ),
                                h(
                                    "div",
                                    { className: "generator-content" },
                                    h(
                                        "div",
                                        { className: "generator-controls" },
                                        h(
                                            "div",
                                            { className: "form-group" },
                                            h("label", { className: "form-label" }, "Describe your fashion vision"),
                                            h("textarea", {
                                                className: "form-textarea",
                                                placeholder: "Enter your creative prompt here...",
                                                value: fashionPrompt,
                                                onChange: (e) => setFashionPrompt(e.target.value),
                                            }),
                                        ),
                                        showFashionAdvanced &&
                                            h(
                                                "div",
                                                { className: "form-group" },
                                                h("label", { className: "form-label" }, "Fashion Dimensions"),
                                                h(
                                                    "div",
                                                    { className: "dimension-presets" },
                                                    dimensionPresets.map((preset) =>
                                                        h(
                                                            "button",
                                                            {
                                                                key: preset.name,
                                                                className: `preset-btn ${fashionWidth === preset.width && fashionHeight === preset.height ? "active" : ""}`,
                                                                onClick: () => {
                                                                    setFashionWidth(preset.width);
                                                                    setFashionHeight(preset.height);
                                                                },
                                                            },
                                                            `${preset.name} ${preset.width}×${preset.height}`,
                                                        ),
                                                    ),
                                                ),
                                                h(
                                                    "div",
                                                    { className: "dimension-inputs" },
                                                    h(
                                                        "div",
                                                        null,
                                                        h(
                                                            "label",
                                                            { className: "form-label", style: { fontSize: "0.75rem" } },
                                                            "Width",
                                                        ),
                                                        h("input", {
                                                            type: "number",
                                                            min: "256",
                                                            max: "1920",
                                                            step: "64",
                                                            value: fashionWidth,
                                                            onChange: (e) => setFashionWidth(Number(e.target.value)),
                                                            className: "dimension-input",
                                                        }),
                                                    ),
                                                    h(
                                                        "div",
                                                        null,
                                                        h(
                                                            "label",
                                                            { className: "form-label", style: { fontSize: "0.75rem" } },
                                                            "Height",
                                                        ),
                                                        h("input", {
                                                            type: "number",
                                                            min: "256",
                                                            max: "1920",
                                                            step: "64",
                                                            value: fashionHeight,
                                                            onChange: (e) => setFashionHeight(Number(e.target.value)),
                                                            className: "dimension-input",
                                                        }),
                                                    ),
                                                ),
                                            ),
                                        h(
                                            "div",
                                            { className: "action-buttons" },
                                            h(
                                                "button",
                                                {
                                                    className: "generate-btn",
                                                    onClick: generateFashion,
                                                    disabled: generatingFashion,
                                                },
                                                generatingFashion
                                                    ? h("div", {
                                                          className: "spinner",
                                                          style: { width: "16px", height: "16px", margin: "0 8px 0 0" },
                                                      })
                                                    : h(
                                                          "svg",
                                                          {
                                                              width: "16",
                                                              height: "16",
                                                              viewBox: "0 0 24 24",
                                                              fill: "none",
                                                              stroke: "currentColor",
                                                              strokeWidth: "2",
                                                          },
                                                          h("path", {
                                                              d: "m12,3 -1.912,5.813a2,2 0 0,1 -1.275,1.275L3,12l5.813,1.912a2,2 0 0,1 1.275,1.275L12,21l1.912,-5.813a2,2 0 0,1 1.275,-1.275L21,12l-5.813,-1.912a2,2 0 0,1 -1.275,-1.275L12,3Z",
                                                          }),
                                                      ),
                                                generatingFashion ? "Generating..." : "Generate Fashion",
                                            ),
                                            h(
                                                "button",
                                                {
                                                    className: "random-btn",
                                                    onClick: getRandomFashionPrompt,
                                                },
                                                "Random Prompt",
                                            ),
                                        ),
                                    ),
                                    h(
                                        "div",
                                        { className: "generator-display" },
                                        generatingFashion
                                            ? h(
                                                  "div",
                                                  { className: "loading-spinner" },
                                                  h("div", { className: "spinner" }),
                                                  h(
                                                      "p",
                                                      { style: { color: "#d1d5db" } },
                                                      "Creating your fashion masterpiece...",
                                                  ),
                                                  h(
                                                      "p",
                                                      { style: { fontSize: "0.875rem", color: "#9ca3af", marginTop: "0.5rem" } },
                                                      `Generating ${fashionWidth} × ${fashionHeight} image`,
                                                  ),
                                              )
                                            : generatedFashion
                                              ? h(
                                                    "div",
                                                    { className: "generated-image-container" },
                                                    h("img", {
                                                        src: generatedFashion,
                                                        alt: "Generated fashion",
                                                        className: "generated-image",
                                                        style: { aspectRatio: `${fashionWidth}/${fashionHeight}` },
                                                    }),
                                                    h(
                                                        "div",
                                                        { className: "image-actions" },
                                                        h(
                                                            "button",
                                                            {
                                                                className: "action-btn",
                                                                onClick: () =>
                                                                    downloadImage(generatedFashion, `ai-fashion-${fashionWidth}x${fashionHeight}.jpg`),
                                                            },
                                                            h(
                                                                "svg",
                                                                {
                                                                    width: "16",
                                                                    height: "16",
                                                                    viewBox: "0 0 24 24",
                                                                    fill: "none",
                                                                    stroke: "currentColor",
                                                                    strokeWidth: "2",
                                                                },
                                                                h("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                                                                h("polyline", { points: "7,10 12,15 17,10" }),
                                                                h("line", { x1: "12", y1: "15", x2: "12", y2: "3" }),
                                                            ),
                                                            "Download",
                                                        ),
                                                        h(
                                                            "button",
                                                            {
                                                                className: "action-btn",
                                                                onClick: () => shareImage(generatedFashion),
                                                            },
                                                            h(
                                                                "svg",
                                                                {
                                                                    width: "16",
                                                                    height: "16",
                                                                    viewBox: "0 0 24 24",
                                                                    fill: "none",
                                                                    stroke: "currentColor",
                                                                    strokeWidth: "2",
                                                                },
                                                                h("circle", { cx: "18", cy: "5", r: "3" }),
                                                                h("circle", { cx: "6", cy: "12", r: "3" }),
                                                                h("circle", { cx: "18", cy: "19", r: "3" }),
                                                                h("line", { x1: "8.59", y1: "13.51", x2: "15.42", y2: "17.49" }),
                                                                h("line", { x1: "15.41", y1: "6.51", x2: "8.59", y2: "10.49" }),
                                                            ),
                                                            "Share",
                                                        ),
                                                    ),
                                                )
                                              : null,
                                    ),
                                ),
                            ),
                            h(
                                "div",
                                {
                                    className: "ai-gallery",
                                    style: { marginTop: "3rem" }
                                },
                                fashionDesigns.map((design, index) =>
                                    h(
                                        "div",
                                        {
                                            key: design.id,
                                            className: "ai-card",
                                            style: { animationDelay: `${index * 0.1}s` },
                                        },
                                        h(
                                            "div",
                                            { className: "ai-card-image" },
                                            h("img", {
                                                src: design.image,
                                                alt: design.title,
                                            }),
                                            h("div", { className: "ai-card-badge" }, "AI Fashion"),
                                        ),
                                        h(
                                            "div",
                                            { className: "ai-card-content" },
                                            h("h3", { className: "ai-card-title" }, design.title),
                                            h("p", { className: "ai-card-style" }, design.description),
                                            h(
                                                "div",
                                                { className: "fashion-materials", style: { marginBottom: "0.75rem" } },
                                                h("h4", {
                                                    style: {
                                                        fontSize: "0.75rem",
                                                        color: "#d1d5db",
                                                        marginBottom: "0.5rem",
                                                        fontWeight: "600"
                                                    }
                                                }, "Materials:"),
                                                h("div", {
                                                    style: {
                                                        display: "flex",
                                                        flexWrap: "wrap",
                                                        gap: "0.25rem"
                                                    }
                                                },
                                                    design.materials.map(material =>
                                                        h("span", {
                                                            key: material,
                                                            style: {
                                                                fontSize: "0.6rem",
                                                                background: "rgba(168, 85, 247, 0.3)",
                                                                color: "#d1d5db",
                                                                padding: "0.125rem 0.375rem",
                                                                borderRadius: "0.25rem",
                                                                border: "1px solid rgba(168, 85, 247, 0.5)"
                                                            }
                                                        }, material)
                                                    )
                                                )
                                            ),
                                            h(
                                                "div",
                                                { className: "fashion-features" },
                                                h("h4", {
                                                    style: {
                                                        fontSize: "0.75rem",
                                                        color: "#d1d5db",
                                                        marginBottom: "0.5rem",
                                                        fontWeight: "600"
                                                    }
                                                }, "Features:"),
                                                h("div", null,
                                                    design.features.map(feature =>
                                                        h("div", {
                                                            key: feature,
                                                            style: {
                                                                fontSize: "0.65rem",
                                                                color: "#9ca3af",
                                                                marginBottom: "0.25rem",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "0.25rem"
                                                            }
                                                        },
                                                            h("span", {
                                                                style: {
                                                                    width: "4px",
                                                                    height: "4px",
                                                                    background: "#ec4899",
                                                                    borderRadius: "50%"
                                                                }
                                                            }),
                                                            feature
                                                        )
                                                    )
                                                )
                                            ),
                                            h(
                                                "div",
                                                { className: "ai-card-footer" },
                                                h("span", { className: "ai-card-likes" }, `✨ AI Designed`),
                                                h(
                                                    "div",
                                                    { className: "ai-card-actions" },
                                                    h(
                                                        "button",
                                                        {
                                                            className: "ai-action-btn",
                                                            onClick: () => downloadImage(design.image, `${design.title.replace(/\s+/g, "-").toLowerCase()}.jpg`),
                                                        },
                                                        h(
                                                            "svg",
                                                            {
                                                                width: "16",
                                                                height: "16",
                                                                viewBox: "0 0 24 24",
                                                                fill: "none",
                                                                stroke: "currentColor",
                                                                strokeWidth: "2",
                                                            },
                                                            h("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                                                            h("polyline", { points: "7,10 12,15 17,10" }),
                                                            h("line", { x1: "12", y1: "15", x2: "12", y2: "3" }),
                                                        ),
                                                    ),
                                                    h(
                                                        "button",
                                                        {
                                                            className: "ai-action-btn",
                                                            onClick: () => shareImage(design.image),
                                                        },
                                                        h(
                                                            "svg",
                                                            {
                                                                width: "16",
                                                                height: "16",
                                                                viewBox: "0 0 24 24",
                                                                fill: "none",
                                                                stroke: "currentColor",
                                                                strokeWidth: "2",
                                                            },
                                                            h("circle", { cx: "18", cy: "5", r: "3" }),
                                                            h("circle", { cx: "6", cy: "12", r: "3" }),
                                                            h("circle", { cx: "18", cy: "19", r: "3" }),
                                                            h("line", { x1: "8.59", y1: "13.51", x2: "15.42", y2: "17.49" }),
                                                            h("line", { x1: "15.41", y1: "6.51", x2: "8.59", y2: "10.49" }),
                                                        ),
                                                    ),
                                                ),
                                            ),
                                        ),
                                    ),
                                ),
                            ),
                        ),
                    h(ToastNotification, {
                        isVisible: toastVisible,
                        message: toastMessage,
                        onClose: hideToast,
                    }),
                ),
            );
        };

        const App = () => {
            // Performance monitoring for the entire app
            usePerformanceMonitor();

            return h(
                "div",
                {
                    className: "app",
                    lang: "en"
                },
                h(ScrollProgress, null),
                h(Navigation, null),
                h(StunningBackground, null),
                h(
                    "main",
                    {
                        id: "main-content",
                        role: "main",
                        "aria-label": "Main content"
                    },
                    h(HeroSection, null),
                    h(InteractiveTimeline, null),
                    h(ArtGallery, null),
                    h(FashionEvolution, null),
                    h(DigitalArt, null),
                ),
            );
        };

        const root = ReactDOM.createRoot(document.getElementById("root"));
        root.render(h(App, null));
