const backgroundImage = document.getElementById("background-image");
const pageLoader = document.getElementById("page-loader");
const scrollContent = document.getElementById("invitation-content");
const scrollUp = document.querySelector(".scroll-up");
const scrollDown = document.querySelector(".scroll-down");
const openRsvp = document.getElementById("open-rsvp");
const closeRsvp = document.getElementById("close-rsvp");
const rsvpModal = document.getElementById("rsvp-modal");
const rsvpForm = document.getElementById("rsvp-form");
const fullName = document.getElementById("full-name");
const formStatus = document.getElementById("form-status");
const submitRsvp = rsvpForm.querySelector(".submit-rsvp");
const rsvpResponse = document.getElementById("rsvp-response");
let awaitingResponse = false;
let responseTimer;

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

function setFormStatus(message, type = "") {
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`.trim();
}

function showRsvpModal() {
  rsvpModal.hidden = false;
  requestAnimationFrame(() => rsvpModal.classList.add("is-open"));
  window.setTimeout(() => fullName.focus(), 230);
}

function hideRsvpModal() {
  rsvpModal.classList.remove("is-open");
  window.setTimeout(() => {
    rsvpModal.hidden = true;
    openRsvp.focus();
  }, 220);
}

openRsvp.addEventListener("click", showRsvpModal);
closeRsvp.addEventListener("click", hideRsvpModal);

rsvpModal.addEventListener("click", (event) => {
  if (event.target === rsvpModal) hideRsvpModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !rsvpModal.hidden) hideRsvpModal();
});

rsvpForm.addEventListener("submit", (event) => {
  fullName.value = fullName.value.trim();

  if (!fullName.value) {
    event.preventDefault();
    fullName.setCustomValidity("Ingresá tu nombre completo.");
    fullName.reportValidity();
    return;
  }

  fullName.setCustomValidity("");

  const endpoint = rsvpForm.dataset.endpoint;
  if (!endpoint) {
    event.preventDefault();
    setFormStatus("Falta conectar la URL de Google Sheets.", "error");
    return;
  }

  rsvpForm.action = endpoint;
  awaitingResponse = true;
  submitRsvp.disabled = true;
  setFormStatus("Enviando confirmación...");

  clearTimeout(responseTimer);
  responseTimer = window.setTimeout(() => {
    if (!awaitingResponse) return;
    awaitingResponse = false;
    submitRsvp.disabled = false;
    setFormStatus("No pudimos confirmar el envío. Intentá nuevamente.", "error");
  }, 12000);
});

fullName.addEventListener("input", () => fullName.setCustomValidity(""));

rsvpResponse.addEventListener("load", () => {
  if (!awaitingResponse) return;

  awaitingResponse = false;
  clearTimeout(responseTimer);
  submitRsvp.disabled = false;
  rsvpForm.reset();
  setFormStatus("¡Gracias! Tu asistencia quedó confirmada.", "success");
});
