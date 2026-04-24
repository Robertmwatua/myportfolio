const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("nav");

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

    const updateCarousel = (index, behavior = "smooth") => {
        currentSlide = index;

        if (window.innerWidth <= 720) {
            carouselSlides[index].scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : behavior,
                block: "nearest",
                inline: "start"
            });
        } else {
            carouselTrack.style.transform = `translateX(calc(${index * -100}% - ${index}rem))`;
        }

        carouselDots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === index);
        });
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
        carouselDots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === index);
        });
        currentSlide = index;
    }, { passive: true });

    window.addEventListener("resize", () => updateCarousel(currentSlide, "auto"));
    updateCarousel(0, "auto");
}
