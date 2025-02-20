export const imageValidator = (model, file) => {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      const predictions = await model.classify(img);
      const nsfwPredictions = predictions.find(
        (p) =>
          p.className === "Porn" ||
          p.className === "Hentai" ||
          p.className === "Sexy"
      );

      if (nsfwPredictions && nsfwPredictions.probability > 0.5) {
        resolve(false);
      } else {
        resolve(true);
      }
    };

    img.onerror = () => reject("Error loading image");
  });
};
