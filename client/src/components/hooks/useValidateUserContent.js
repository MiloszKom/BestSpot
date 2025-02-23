import { useContext } from "react";
import { Filter } from "bad-words";
import { AlertContext } from "../context/AlertContext";
export const useValidateUserContent = () => {
  const { showAlert } = useContext(AlertContext);
  const badWordFilter = new Filter();

  const textValidator = (fieldsToCheck) => {
    for (let field of fieldsToCheck) {
      if (badWordFilter.isProfane(field)) {
        showAlert(
          "Inappropriate language detected. Please revise your content",
          "fail"
        );
        return false;
      }
    }
    return true;
  };

  const imageValidator = async (file, model) => {
    if (!model) {
      showAlert("Model not loaded yet. Please try again.", "fail");
      return false;
    }

    return new Promise((resolve) => {
      if (!file || !(file instanceof Blob)) {
        showAlert("Invalid file type. Please upload a valid image.", "fail");
        return false;
      }

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
          showAlert(
            "The profile image is inappropriate and cannot be uploaded.",
            "fail"
          );
          resolve(false);
        } else {
          resolve(true);
        }
      };

      img.onerror = () => {
        showAlert("Error loading image. Please try again.", "fail");
        resolve(false);
      };
    });
  };

  return { textValidator, imageValidator };
};
