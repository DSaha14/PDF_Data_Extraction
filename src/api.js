const API_URL = "http://localhost:5000/upload";

export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append("pdf", file);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload PDF");
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error;
  }
};
