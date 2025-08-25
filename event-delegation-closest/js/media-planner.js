class MediaPlanner extends HTMLElement {
  #media = [
    {
      name: "28 Years Later",
      poster: "./posters/28-years-later-movie-poster.webp",
    },
    {
      name: "A Man Called Otto",
      poster: "./posters/a-man-called-otto-movie-poster.webp",
    },
    {
      name: "A Minecraft Movie",
      poster: "./posters/a-minecraft-movie-movie-poster.webp",
    },
    {
      name: "Spider-man Across The Spider-verse",
      poster: "./posters/spider-man-across-the-spider-verse-movie-poster.webp",
    },
    {
      name: "The Amateur",
      poster: "./posters/the-amateur-movie-poster.webp",
    },
  ];

  constructor() {
    super();
  }

  #getMediaEntry(entry) {
    const mediaEntryTmpl = this.querySelector("#media-entry");

    if (!mediaEntryTmpl) {
      return;
    }

    const mediaEntry = mediaEntryTmpl.content
      .querySelector(".media-entry")
      .cloneNode(true);
    const mediaEntryPoster = mediaEntry.querySelector(".media-poster");
    const mediaEntryButton = mediaEntry.querySelector(".media-action-button");
    const mediaName = entry.name;

    const visuallyHiddenContainer = document.createElement("span");
    visuallyHiddenContainer.classList.add("visually-hidden");
    visuallyHiddenContainer.textContent = mediaName;

    mediaEntryPoster.src = entry.poster;
    mediaEntryPoster.alt = mediaName;

    mediaEntryButton.textContent = "Add ";
    mediaEntryButton.append(visuallyHiddenContainer);
    return mediaEntry;
  }

  #showAvailable() {
    const availableTitlesContainer = this.querySelector(".available-titles");

    if (!availableTitlesContainer) {
      return;
    }

    const availableMedia = this.#media.map((mediaEntry) => {
      return this.#getMediaEntry(mediaEntry);
    });

    availableTitlesContainer.append(...availableMedia);
  }

  connectedCallback() {
    this.#showAvailable();

    this.#addEventListeners();
  }

  #addToWatchlist(entry) {
    const watchlist = document.querySelector(".watchlist");
    const clonedEntry = entry.cloneNode(true);
    const clonedEntryButton = clonedEntry.querySelector(".media-action-button");
    clonedEntryButton.innerHTML = clonedEntryButton.innerHTML.replace(
      "Add",
      "Remove",
    );
    clonedEntryButton.dataset.removeItem = true;

    watchlist.appendChild(clonedEntry);
  }

  #removeFromWatchlist(entry) {
    entry.remove();
  }

  #addEventListeners() {
    this.addEventListener("click", (event) => {
      const target = event.target;
      const actionButton = target.closest(".media-action-button");

      if (actionButton) {
        const mediaItem = target.closest(".media-entry");
        const action = actionButton.dataset.removeItem
          ? this.#removeFromWatchlist
          : this.#addToWatchlist;
        action(mediaItem);
      }
    });
  }
}

customElements.define("media-planner", MediaPlanner);
