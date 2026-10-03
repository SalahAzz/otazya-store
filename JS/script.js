const portfolioImages = [
  "Portfolio1.png",
  "Portfolio2.png",
  "Portfolio3.png",
  "Portfolio4.png",
  "Portfolio5.png",
  "Portfolio6.png",
  "Portfolio7.png",
  "Portfolio8.png",
  "Portfolio9.png",
  "Portfolio10.png",
  "Portfolio11.png",
  "Portfolio12.png",
];

const instagramImages = [
  "Instagram1.png",
  "Instagram2.png",
  "Instagram3.png",
  "Instagram4.png",
  "Instagram5.png",
  "Instagram6.png",
];

function renderImageGrid(containerId, images, className, altPrefix, imageDirectory) {
  const container = document.getElementById(containerId);
  if (!container) return;

  images.forEach((image, index) => {
    const card = document.createElement("div");
    card.className = className;

    const img = document.createElement("img");
    img.src = `${imageDirectory}${image}`;
    img.alt = `${altPrefix} ${index + 1}`;
    img.loading = "lazy";
    img.decoding = "async";

    card.append(img);
    container.append(card);
  });
}

function createReviewCard({ name, email, text, rating }) {
  const card = document.createElement("article");
  card.className = "review-card";

  const reviewText = document.createElement("p");
  reviewText.textContent = `“${text}”`;

  const stars = document.createElement("div");
  stars.className = "review-stars";
  stars.setAttribute("aria-label", `التقييم ${rating} من 5`);
  stars.textContent = `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`;

  const author = document.createElement("div");
  author.className = "review-author";

  const initial = document.createElement("span");
  initial.setAttribute("aria-hidden", "true");
  initial.textContent = name.trim().charAt(0);

  const authorName = document.createElement("div");
  const nameElement = document.createElement("strong");
  nameElement.textContent = name;
  const emailElement = document.createElement("small");
  emailElement.textContent = email;
  authorName.append(nameElement, emailElement);

  author.append(initial, authorName);
  card.append(reviewText, stars, author);
  return card;
}

function setupMobileNavigation() {
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.getElementById("primary-navigation");
  if (!menuButton || !navigation) return;

  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "فتح القائمة");
    navigation.classList.remove("is-open");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "فتح القائمة" : "إغلاق القائمة");
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

function setupActiveNavigation() {
  const navigation = document.getElementById("primary-navigation");
  if (!navigation) return;

  const links = Array.from(navigation.querySelectorAll("a[href^='#']"));
  const setActiveLink = (activeLink) => {
    links.forEach((link) => {
      const isActive = link === activeLink;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const updateActiveLink = () => {
    const activationLine = Math.min(window.innerHeight * 0.35, window.innerHeight - 1);
    let activeLink = links[0];

    links.forEach((link) => {
      const target = document.getElementById(link.hash.slice(1));
      if (target && target.getBoundingClientRect().top <= activationLine) {
        activeLink = link;
      }
    });

    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      activeLink = links[links.length - 1];
    }

    setActiveLink(activeLink);
  };

  let frameRequested = false;
  const scheduleUpdate = () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(() => {
      frameRequested = false;
      updateActiveLink();
    });
  };

  navigation.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLAnchorElement)) return;
    setActiveLink(event.target);
  });

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  updateActiveLink();
}

function setupReviewForm() {
  const form = document.getElementById("review-form");
  const status = document.getElementById("form-status");
  const reviewGrid = document.getElementById("reviews-grid");
  const starButtons = Array.from(document.querySelectorAll(".rating-star"));
  if (!(form instanceof HTMLFormElement) || !status || !reviewGrid) return;

  const apiUrl = "api/reviews.php";
  let selectedRating = 0;
  let isSubmitting = false;

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle("error", isError);
  };

  const loadReviews = async () => {
    try {
      const response = await fetch(apiUrl, {
        headers: { Accept: "application/json" },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "تعذر تحميل التقييمات.");
      }
      if (!Array.isArray(result.reviews)) {
        throw new Error("استجابة الخادم غير صالحة.");
      }

      result.reviews.forEach((review) => {
        reviewGrid.append(
          createReviewCard({
            name: review.name,
            email: review.email,
            text: review.review,
            rating: Number(review.rating),
          }),
        );
      });
    } catch (error) {
      console.error("Failed to load reviews:", error);
      setStatus("تعذر تحميل التقييمات الآن. يرجى المحاولة لاحقًا.", true);
    }
  };

  const updateRating = (rating) => {
    selectedRating = rating;
    starButtons.forEach((button) => {
      const buttonRating = Number(button.dataset.rating);
      const isSelected = buttonRating <= rating;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", String(buttonRating === rating));
    });
  };

  starButtons.forEach((button, index) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      updateRating(Number(button.dataset.rating));
      setStatus("");
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowLeft" ? 1 : -1;
      const nextIndex = Math.min(starButtons.length - 1, Math.max(0, index + direction));
      starButtons[nextIndex].focus();
      updateRating(Number(starButtons[nextIndex].dataset.rating));
    });
  });

  form.addEventListener("input", () => setStatus(""));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    if (selectedRating === 0) {
      setStatus("من فضلك اختاري عدد النجوم قبل إرسال التقييم.", true);
      starButtons[0]?.focus();
      return;
    }

    if (isSubmitting) return;

    const formData = new FormData(form);
    const review = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      text: String(formData.get("review") || "").trim(),
      rating: selectedRating,
    };

    isSubmitting = true;
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton instanceof HTMLButtonElement) submitButton.disabled = true;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(review),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "تعذر حفظ التقييم.");
      }

      reviewGrid.prepend(createReviewCard(result.review || review));
      form.reset();
      updateRating(0);
      setStatus("");
    } catch (error) {
      console.error("Failed to submit review:", error);
      setStatus(error.message || "تعذر حفظ تقييمك. يرجى المحاولة مرة أخرى.", true);
    } finally {
      isSubmitting = false;
      if (submitButton instanceof HTMLButtonElement) submitButton.disabled = false;
    }
  });

  void loadReviews();
}

renderImageGrid("portfolio-grid", portfolioImages, "portfolio-card", "تصميم من أعمال OTAZYA رقم", "assets/images/");
renderImageGrid("instagram-grid", instagramImages, "instagram-card", "صورة من حساب OTAZYA رقم", "assets/images/");
setupMobileNavigation();
setupActiveNavigation();
setupReviewForm();
