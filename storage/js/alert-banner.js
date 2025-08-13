class AlertBanner extends HTMLElement {
  #storageKey = "AlertBanner";

  constructor() {
    super();
  }

  connectedCallback() {
    this.#showBanners();
  }

  #getDismissedBanners() {
    try {
      const storageObject = localStorage.getItem(this.#storageKey);

      if (!storageObject) {
        return null;
      }

      const dismissedBanners = JSON.parse(storageObject);
      return dismissedBanners.disabledBanners;
    } catch (error) {
      throw new Error(`Failed to load dismissed banners: ${error.message}`);
    }
  }

  #showActiveBanners(activeBanners) {
    if (!activeBanners) {
      return;
    }

    activeBanners.forEach((activeBanner) => {
      activeBanner.hidden = false;
    });
  }

  #showBanners() {
    let banners = Array.from(this.querySelectorAll(".alert-banner-main"));

    if (!banners.length) {
      return;
    }

    const dismissedBannerIds = this.#getDismissedBanners();

    if (dismissedBannerIds && dismissedBannerIds.length) {
      banners = banners.filter(
        (banner) => !dismissedBannerIds.includes(banner.id),
      );
    }

    this.#showActiveBanners(banners);
    this.#addEventListeners();
  }

  #addEventListeners() {
    this.addEventListener("click", (event) => {
      event.stopPropagation();

      if (event.target.closest(".alert-banner-close")) {
        return;
      }

      const banner = event.target.parentElement;
      const bannerId = banner.id;

      if (bannerId) {
        try {
          localStorage.setItem(
            this.#storageKey,
            JSON.stringify({
              disabledBanners: [bannerId],
            }),
          );
          banner.remove();
        } catch (error) {
          throw new Error(`Could not store banner id: ${error.message}`);
        }
      }
    });
  }
}

customElements.define("alert-banner", AlertBanner);
