const container = document.querySelector(".container");
const output = document.querySelector(".output");

container.addEventListener("click", (event) => {
  const button = event.target.closest(".icon-button");

  if (button) {
    output.textContent = button.dataset.value;
  }
});
