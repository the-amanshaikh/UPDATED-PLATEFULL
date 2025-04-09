// Nav-bar animation
window.addEventListener("scroll", function() {
    let navbar = document.querySelector(".navigation");
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});