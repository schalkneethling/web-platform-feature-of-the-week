export const decodeHTML = (html) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body ? doc.body.textContent : "";
};
