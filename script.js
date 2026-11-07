const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const backToTop = document.getElementById('backToTop');
const sections = document.querySelectorAll('main .section, main .hero');
const navLinks = document.querySelectorAll('.nav-link');
const revealItems = document.querySelectorAll('.reveal');
const counters = document.querySelectorAll('.stat-card strong');
const typingText = document.getElementById('typingText');
const heroCard = document.querySelector('.image-card');

const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme === 'light') {
  body.classList.add('light-mode');
  themeToggle.textContent = '🌙';
} else {
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  body.classList.toggle('light-mode');
  const isLight = body.classList.contains('light-mode');
  themeToggle.textContent = isLight ? '🌙' : '☀️';
  localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
});

navToggle?.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.site-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
  observer.observe(item);
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          const target = link.getAttribute('href');
          link.classList.toggle('active', target === `#${entry.target.id}`);
        });
      }
    });
  },
  { threshold: 0.5 }
);

sections.forEach((section) => sectionObserver.observe(section));

const countUp = (element, target) => {
  const duration = 1400;
  const startTime = performance.now();
  const step = (time) => {
    const progress = Math.min((time - startTime) / duration, 1);
    const value = Math.floor(progress * target);
    element.textContent = `${value}${target === 100 ? '%' : '+'}`;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = `${target}${target === 100 ? '%' : '+'}`;
    }
  };
  requestAnimationFrame(step);
};

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = Number(entry.target.dataset.target || entry.target.textContent);
        countUp(entry.target, target);
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.8 }
);

counters.forEach((counter) => statsObserver.observe(counter));

const titles = ['Frontend Developer', 'Flutter Developer', 'WordPress Developer', 'No-Code Developer'];
let titleIndex = 0;
let charIndex = 0;

const typeLoop = () => {
  typingText.textContent = titles[titleIndex].slice(0, charIndex);
  charIndex += 1;

  if (charIndex > titles[titleIndex].length) {
    setTimeout(() => {
      charIndex = 0;
      titleIndex = (titleIndex + 1) % titles.length;
      typeLoop();
    }, 1200);
    return;
  }

  setTimeout(typeLoop, 100);
};

typeLoop();

window.addEventListener('scroll', () => {
  backToTop.style.display = window.scrollY > 600 ? 'grid' : 'none';
});

heroCard?.addEventListener('mousemove', (event) => {
  const rect = heroCard.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  heroCard.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${y * -8}deg) translateY(-6px)`;
});

heroCard?.addEventListener('mouseleave', () => {
  heroCard.style.transform = '';
});

const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('imageModalImage');
const closeModalButton = document.querySelector('.image-modal-close');
const modalPrevButton = document.querySelector('.image-modal-prev');
const modalNextButton = document.querySelector('.image-modal-next');
const modalBackdrop = document.querySelector('.image-modal-backdrop');
let activeGalleryState = null;

document.querySelectorAll('.project-card').forEach((card) => {
  const mainImage = card.querySelector('.gallery-main img');
  const thumbs = card.querySelectorAll('.gallery-thumb');
  const prevButton = card.querySelector('.gallery-prev');
  const nextButton = card.querySelector('.gallery-next');
  const images = Array.from(thumbs).map((thumb) => ({
    src: thumb.dataset.image,
    alt: thumb.dataset.alt || mainImage?.alt
  }));

  const state = {
    currentIndex: 0,
    images,
    update(index) {
      this.currentIndex = (index + this.images.length) % this.images.length;
      const image = this.images[this.currentIndex];

      if (mainImage && image) {
        mainImage.src = image.src;
        mainImage.alt = image.alt;
      }

      thumbs.forEach((thumb, thumbIndex) => {
        thumb.classList.toggle('active', thumbIndex === this.currentIndex);
      });

      if (activeGalleryState === this && modalImage && image) {
        modalImage.src = image.src;
        modalImage.alt = image.alt;
      }
    },
    openModal() {
      if (!modal || !modalImage) return;
      activeGalleryState = this;
      modalImage.src = mainImage?.src || '';
      modalImage.alt = mainImage?.alt || '';
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
  };

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      state.update(index);
    });
  });

  prevButton?.addEventListener('click', () => state.update(state.currentIndex - 1));
  nextButton?.addEventListener('click', () => state.update(state.currentIndex + 1));
  mainImage?.addEventListener('click', () => {
    state.openModal();
  });
});

const closeModal = () => {
  modal?.classList.remove('active');
  modal?.setAttribute('aria-hidden', 'true');
  activeGalleryState = null;
};

closeModalButton?.addEventListener('click', closeModal);
modalBackdrop?.addEventListener('click', closeModal);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

modalPrevButton?.addEventListener('click', () => {
  if (!activeGalleryState) return;
  activeGalleryState.update(activeGalleryState.currentIndex - 1);
});

modalNextButton?.addEventListener('click', () => {
  if (!activeGalleryState) return;
  activeGalleryState.update(activeGalleryState.currentIndex + 1);
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const form = document.querySelector('.contact-form');
form?.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const message = String(formData.get('message') || '').trim();
  const composeUrl = new URL('https://mail.google.com/mail/');

  composeUrl.search = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: 'alvintampus3@gmail.com',
    su: `Portfolio inquiry from ${name}`,
    body: `Name: ${name}\nEmail: ${email}\n\n${message}`
  });

  window.location.assign(composeUrl.toString());
});
