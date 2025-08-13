import { decodeHTML } from "./utils.js";

class OpenTrivia extends HTMLElement {
  #baseEndpoint = "https://opentdb.com/";
  #storageKey = "OpenTrivia";

  constructor() {
    super();
  }

  #showNoCategoryFallbackMessage(message) {
    const heading = document.createElement("h2");
    heading.textContent = message;

    this.append(heading);
    return;
  }

  connectedCallback() {
    try {
      this.#loadCategories();
    } catch (error) {
      this.#showNoCategoryFallbackMessage(
        `Failed to load categories: ${error.message}`,
      );
    }
  }

  #fetchCategories = async () => {
    try {
      const response = await fetch(`${this.#baseEndpoint}api_category.php`);

      if (!response.ok) {
        throw new Error(
          `Failed to get categories: ${response.status}: ${response.statusText}`,
        );
      }

      const responseJSON = await response.json();
      this.#cacheCategories(responseJSON.trivia_categories);

      return responseJSON.trivia_categories;
    } catch (error) {
      throw new Error("Failed to fetch categories", { cause: error });
    }
  };

  #getCategoriesFromStorage() {
    try {
      const storageObject = sessionStorage.getItem(this.#storageKey);

      if (!storageObject) {
        return null;
      }

      return JSON.parse(storageObject);
    } catch (error) {
      throw new Error(
        `Failed to get categories from storage: ${error.message}`,
      );
    }
  }

  #cacheCategories(categories) {
    try {
      sessionStorage.setItem(this.#storageKey, JSON.stringify(categories));
    } catch (error) {
      throw new Error(`Failed to cache categories: ${error.message}`);
    }
  }

  #loadCategories = async () => {
    const cachedCategories = this.#getCategoriesFromStorage();
    const categories = cachedCategories || (await this.#fetchCategories());

    this.innerHTML = "";

    if (!categories) {
      this.#showNoCategoryFallbackMessage(
        "No categories. Please try again later.",
      );
      return;
    }

    const categoryContainer = document.createElement("ul");
    categoryContainer.classList.add("open-trivia-container");

    const categoryList = categories.map((category) => {
      const item = document.createElement("li");
      const categoryButton = document.createElement("button");
      categoryButton.type = "button";
      categoryButton.classList.add("open-trivia-category-button");
      categoryButton.textContent = category.name;
      categoryButton.dataset.categoryId = category.id;
      item.appendChild(categoryButton);
      return item;
    });

    categoryContainer.append(...categoryList);
    this.append(categoryContainer);

    this.#addEventListeners();
  };

  #loadTriviaQuestion = async (category) => {
    try {
      const response = await fetch(
        `${this.#baseEndpoint}api.php?amount=1&category=${category}`,
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get trivia question: ${response.status}: ${response.statusText}`,
        );
      }

      const responseJSON = await response.json();
      return responseJSON;
    } catch (error) {
      throw new Error("Error loading trivia question", { cause: error });
    }
  };

  #showTriviaQuestion = (triviaQuestion) => {
    const previousContainer = this.querySelector(
      ".open-trivia-question-container",
    );

    if (previousContainer) {
      previousContainer.remove();
    }

    const container = document.createElement("div");
    container.classList.add("open-trivia-question-container");

    const question = document.createElement("h2");
    question.classList.add("open-trivia-question-heading");
    question.textContent = decodeHTML(triviaQuestion.question);

    const revealButton = document.createElement("button");
    revealButton.type = "button";
    revealButton.textContent = "Show Answer";

    const answer = document.createElement("p");
    answer.hidden = true;
    answer.tabIndex = -1;
    answer.textContent = decodeHTML(triviaQuestion.correct_answer);

    container.append(question, revealButton, answer);

    revealButton.addEventListener("click", (event) => {
      event.stopPropagation();
      answer.hidden = false;
    });

    this.append(container);
  };

  #toggleCategories() {
    const categorySelections = Array.from(
      this.querySelectorAll(".open-trivia-container button"),
    );

    if (!categorySelections.length) {
      return;
    }

    categorySelections.forEach((categoryButton) => {
      categoryButton.disabled = !categoryButton.disabled;
    });
  }

  #addEventListeners() {
    this.addEventListener("click", async (event) => {
      if (!event.target.closest(".open-trivia-category-button")) {
        return;
      }

      this.#toggleCategories();

      const triviaQuestion = await this.#loadTriviaQuestion(
        event.target.dataset.categoryId,
      );

      if (!triviaQuestion) {
        const message = "No trivia question. Please try another category.";
        const noQuestionHeading = document.createElement("h2");
        noQuestionHeading.textContent = message;

        const previousContainer = this.querySelector(
          ".open-trivia-question-container",
        );

        if (previousContainer) {
          previousContainer.innerHTML = "";
          previousContainer.append(noQuestionHeading);
          return;
        }

        const container = document.createElement("div");
        container.classList.add("open-trivia-question-container");
        container.append(noQuestionHeading);

        this.append(container);
        return;
      }

      // requests are rate limited to 1 per 5 seconds
      setTimeout(this.#toggleCategories.bind(this), 5000);
      this.#showTriviaQuestion(triviaQuestion.results[0]);
    });
  }
}

customElements.define("open-trivia", OpenTrivia);
