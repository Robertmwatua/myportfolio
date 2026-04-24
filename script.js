const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("nav");
const backToTopButton = document.querySelector(".back-to-top");

// Smooth scroll for internal links.
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
        const target = document.querySelector(anchor.getAttribute("href"));
        if (!target) {
            return;
        }

        event.preventDefault();
        target.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth"
        });

        if (window.innerWidth <= 720 && document.body.classList.contains("nav-open")) {
            document.body.classList.remove("nav-open");
            navToggle?.setAttribute("aria-expanded", "false");
        }
    });
});

// Fade sections in as they enter the viewport.
const sections = document.querySelectorAll("section");

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, {
    threshold: 0.14
});

sections.forEach((section) => {
    section.classList.add("hidden");
    revealObserver.observe(section);
});

// Stagger key cards into view for a more progressive read.
const revealCards = document.querySelectorAll(
    ".stat-card, .journey-step, .highlight-card, .skill-card, .service-card, .project-card, .certificate-card, .hobby-card, .social-link"
);

revealCards.forEach((card, index) => {
    card.classList.add("reveal-card");
    card.style.setProperty("--reveal-delay", `${(index % 6) * 70}ms`);
});

const revealCardObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) {
            return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
    });
}, {
    threshold: 0.18
});

revealCards.forEach((card) => revealCardObserver.observe(card));

// Keep the nav synced with the visible section.
const navLinks = document.querySelectorAll('nav a[href^="#"]');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) {
            return;
        }

        navLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === `#${entry.target.id}`;
            link.classList.toggle("active", isActive);
        });
    });
}, {
    threshold: 0.55
});

sections.forEach((section) => navObserver.observe(section));

if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
        const isOpen = document.body.classList.toggle("nav-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 720) {
            document.body.classList.remove("nav-open");
            navToggle.setAttribute("aria-expanded", "false");
        }
    });
}

// Update the top scroll indicator.
const updateScrollProgress = () => {
    const scrollTop = window.scrollY;
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? scrollTop / scrollableHeight : 0;
    document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(3));
};

updateScrollProgress();
window.addEventListener("scroll", updateScrollProgress, { passive: true });

const updateBackToTop = () => {
    if (!backToTopButton) {
        return;
    }

    backToTopButton.classList.toggle("show-button", window.scrollY > 520);
};

updateBackToTop();
window.addEventListener("scroll", updateBackToTop, { passive: true });

backToTopButton?.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth"
    });
});

// Track pointer position for a subtle ambient glow.
if (!prefersReducedMotion) {
    window.addEventListener("pointermove", (event) => {
        document.body.style.setProperty("--pointer-x", `${event.clientX}px`);
        document.body.style.setProperty("--pointer-y", `${event.clientY}px`);
    });
}

// Count up spotlight metrics once they appear.
const metricValues = document.querySelectorAll(".metric-value");

const animateValue = (element) => {
    const target = Number(element.dataset.target || 0);
    const duration = prefersReducedMotion ? 0 : 1200;

    if (!duration) {
        element.textContent = `${target}+`;
        return;
    }

    const startTime = performance.now();

    const tick = (currentTime) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = `${Math.round(target * eased)}+`;

        if (progress < 1) {
            requestAnimationFrame(tick);
        }
    };

    requestAnimationFrame(tick);
};

const metricObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) {
            return;
        }

        animateValue(entry.target);
        observer.unobserve(entry.target);
    });
}, {
    threshold: 0.5
});

metricValues.forEach((metric) => metricObserver.observe(metric));

// Certificate carousel controls.
const carouselTrack = document.querySelector(".carousel-track");
const carouselViewport = document.querySelector(".carousel-viewport");
const carouselSlides = document.querySelectorAll(".certificate-card");
const carouselDots = document.querySelectorAll(".carousel-dot");
const prevButton = document.querySelector(".carousel-button-prev");
const nextButton = document.querySelector(".carousel-button-next");

if (carouselTrack && carouselViewport && carouselSlides.length) {
    let currentSlide = 0;
    let certificateAutoplay;

    const syncDots = (index) => {
        carouselDots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === index);
        });
    };

    const updateCarousel = (index, behavior = "smooth", preservePagePosition = false) => {
        currentSlide = Math.max(0, Math.min(index, carouselSlides.length - 1));
        const pageTop = window.scrollY;

        if (window.innerWidth <= 720) {
            const slideWidth = carouselViewport.clientWidth;
            carouselViewport.scrollTo({
                left: slideWidth * currentSlide,
                behavior: prefersReducedMotion ? "auto" : behavior
            });
        } else {
            carouselTrack.style.transform = `translateX(calc(${currentSlide * -100}% - ${currentSlide}rem))`;
        }

        syncDots(currentSlide);

        if (preservePagePosition) {
            window.scrollTo({ top: pageTop, behavior: "auto" });
        }
    };

    prevButton?.addEventListener("click", () => {
        const nextIndex = (currentSlide - 1 + carouselSlides.length) % carouselSlides.length;
        updateCarousel(nextIndex);
    });

    nextButton?.addEventListener("click", () => {
        const nextIndex = (currentSlide + 1) % carouselSlides.length;
        updateCarousel(nextIndex);
    });

    carouselDots.forEach((dot, index) => {
        dot.addEventListener("click", () => updateCarousel(index));
    });

    carouselViewport.addEventListener("scroll", () => {
        if (window.innerWidth > 720) {
            return;
        }

        const slideWidth = carouselViewport.clientWidth;
        if (!slideWidth) {
            return;
        }

        const index = Math.round(carouselViewport.scrollLeft / slideWidth);
        syncDots(index);
        currentSlide = index;
    }, { passive: true });

    window.addEventListener("resize", () => updateCarousel(currentSlide, "auto", true));
    syncDots(0);

    if (window.innerWidth > 720) {
        updateCarousel(0, "auto", true);
    } else {
        carouselViewport.scrollLeft = 0;
    }

    if (!prefersReducedMotion) {
        const startAutoplay = () => {
            window.clearInterval(certificateAutoplay);
            certificateAutoplay = window.setInterval(() => {
                const nextIndex = (currentSlide + 1) % carouselSlides.length;
                updateCarousel(nextIndex, "smooth", false);
            }, 4200);
        };

        const stopAutoplay = () => {
            window.clearInterval(certificateAutoplay);
        };

        startAutoplay();
        carouselViewport.addEventListener("pointerenter", stopAutoplay);
        carouselViewport.addEventListener("pointerleave", startAutoplay);
        prevButton?.addEventListener("click", startAutoplay);
        nextButton?.addEventListener("click", startAutoplay);
        carouselDots.forEach((dot) => dot.addEventListener("click", startAutoplay));
    }
}

// Auto-slide hobbies on mobile to keep the section feeling lighter.
const hobbyGrid = document.querySelector(".hobby-grid");
const hobbyViewport = document.querySelector(".hobby-viewport");
const hobbyCards = document.querySelectorAll(".hobby-card");
const hobbyPrevButton = document.querySelector(".hobby-button-prev");
const hobbyNextButton = document.querySelector(".hobby-button-next");

if (hobbyGrid && hobbyViewport && hobbyCards.length > 1) {
    let hobbyIndex = 0;
    let hobbyAutoplay;
    const hobbyGap = 16;

    const goToHobby = (index, behavior = "smooth") => {
        hobbyIndex = (index + hobbyCards.length) % hobbyCards.length;
        const cardWidth = hobbyCards[0].getBoundingClientRect().width;

        hobbyViewport.scrollTo({
            left: hobbyIndex * (cardWidth + hobbyGap),
            behavior: prefersReducedMotion ? "auto" : behavior
        });
    };

    hobbyPrevButton?.addEventListener("click", () => goToHobby(hobbyIndex - 1));
    hobbyNextButton?.addEventListener("click", () => goToHobby(hobbyIndex + 1));

    hobbyViewport.addEventListener("scroll", () => {
        const cardWidth = hobbyCards[0].getBoundingClientRect().width + hobbyGap;
        if (!cardWidth) {
            return;
        }

        hobbyIndex = Math.round(hobbyViewport.scrollLeft / cardWidth);
    }, { passive: true });

    if (!prefersReducedMotion) {
        const startHobbyAutoplay = () => {
            window.clearInterval(hobbyAutoplay);
            hobbyAutoplay = window.setInterval(() => goToHobby(hobbyIndex + 1), 3600);
        };

        startHobbyAutoplay();
        hobbyViewport.addEventListener("pointerenter", () => window.clearInterval(hobbyAutoplay));
        hobbyViewport.addEventListener("pointerleave", startHobbyAutoplay);
        hobbyPrevButton?.addEventListener("click", startHobbyAutoplay);
        hobbyNextButton?.addEventListener("click", startHobbyAutoplay);
    }
}
