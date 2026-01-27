const allLink = document.querySelectorAll(".nav-section .nav-item");
const allSection = document.querySelectorAll("section");

allLink.forEach((link) => {
  link.addEventListener("click", () => {
    allLink.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    const viewName = link.getAttribute("data-view");

    allSection.forEach((section) => {
      if (section.getAttribute("data-section") === viewName) {
        section.classList.remove("view");
      } else {
        section.classList.add("view");
        section.classList.remove("active");
      }
    });
  });
  
});






