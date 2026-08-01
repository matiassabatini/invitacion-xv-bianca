const backgroundImage = document.getElementById("background-image");
const pageLoader = document.getElementById("page-loader");
const scrollContent = document.getElementById("invitation-content");
const scrollUp = document.querySelector(".scroll-up");
const scrollDown = document.querySelector(".scroll-down");

function finishLoading() {
  if (document.body.classList.contains("is-ready")) return;

  document.body.classList.add("is-ready");
  pageLoader.setAttribute("aria-hidden", "true");

  window.setTimeout(() => {
    document.body.classList.remove("loading");
  }, 430);
}

if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
  requestAnimationFrame(finishLoading);
} else {
  backgroundImage.addEventListener("load", finishLoading, { once: true });
  backgroundImage.addEventListener("error", finishLoading, { once: true });
  window.setTimeout(finishLoading, 6000);
}

function updateScrollArrows() {
  const maxScroll = scrollContent.scrollHeight - scrollContent.clientHeight;
  const hasOverflow = maxScroll > 2;

  if (!hasOverflow && scrollContent.scrollTop !== 0) {
    scrollContent.scrollTop = 0;
  }

  scrollUp.hidden = !hasOverflow || scrollContent.scrollTop <= 2;
  scrollDown.hidden = !hasOverflow || scrollContent.scrollTop >= maxScroll - 2;
}

function moveContent(direction) {
  scrollContent.scrollBy({
    top: direction * Math.max(150, scrollContent.clientHeight * 0.58),
    behavior: "smooth",
  });
}

scrollUp.addEventListener("click", () => moveContent(-1));
scrollDown.addEventListener("click", () => moveContent(1));
scrollContent.addEventListener("scroll", updateScrollArrows, { passive: true });
window.addEventListener("resize", updateScrollArrows);

if (document.fonts?.ready) {
  document.fonts.ready.then(updateScrollArrows);
} else {
  window.addEventListener("load", updateScrollArrows, { once: true });
}

updateScrollArrows();
