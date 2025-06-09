export function promptForImage() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("cancel", () => {
      console.log("Cancel event detected.");
      reject(new Error("Image upload canceled."));
    });

    input.addEventListener("change", () => {
      if (input.files.length === 0) {
        reject(new Error("Image upload canceled."));
      } else {
        resolve(input.files[0]);
      }
    });
    input.click();
  });
}
