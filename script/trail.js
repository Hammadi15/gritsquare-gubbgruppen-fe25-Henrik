function getCurrentSparkleColor() {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  return isLight ? "#ff7f00" : "#003554"; 
}


document.addEventListener("mousemove", function(e) {
  const sparkle = document.createElement("div");
  sparkle.classList.add("sparkle");

  sparkle.style.left = e.clientX + "px";
  sparkle.style.top = e.clientY + "px";


  const color = getCurrentSparkleColor();
  sparkle.style.background = `radial-gradient(circle, #fff 0%, ${color} 70%, transparent 100%)`;

  document.body.appendChild(sparkle);


  sparkle.addEventListener("animationend", () => {
    sparkle.remove();
  });
});