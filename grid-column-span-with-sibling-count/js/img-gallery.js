class ImgGallery extends HTMLElement {
  #galleryCount;
  #galleryStyle;

  constructor() {
    super();

    this.#galleryCount = this.getAttribute("gallery-count");
    this.#galleryStyle = this.getAttribute("gallery-style");
  }

  #getImages = async () => {
    try {
      const response = await fetch(
        `https://picsum.photos/v2/list?limit=${this.#galleryCount}`,
      );

      if (response.ok) {
        const imageList = await response.json();
        return imageList.map((image) => {
          return {
            author: image.author,
            download: image.download_url,
            height: image.height,
            width: image.width,
          };
        });
      }
    } catch (error) {
      throw new Error("Error while fetching gallery items from Picsum", {
        cause: error,
      });
    }
  };

  #render = async () => {
    const images = await this.#getImages();
    const container = document.createElement("ul");
    container.classList.add("container");

    if (this.#galleryStyle) {
      container.classList.add(this.#galleryStyle);
    }

    const imageList = images.map((image) => {
      const { author, download, height, width } = image;
      const imgContainer = document.createElement("li");
      const imageElement = document.createElement("img");
      imageElement.src = download;
      imageElement.alt = author;
      imageElement.height = height;
      imageElement.width = width;

      imgContainer.append(imageElement);
      return imgContainer;
    });

    container.append(...imageList);
    this.append(container);
  };

  connectedCallback() {
    this.#render();
  }
}

customElements.define("img-gallery", ImgGallery);
