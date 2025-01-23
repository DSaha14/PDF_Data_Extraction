import React, { useState } from "react";
import background_image from "./images/background_image.jpg";

const App = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedData, setExtractedData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!pdfFile) {
      alert("Please upload a PDF file");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setExtractedData(data);
    } catch (error) {
      console.error("Error uploading PDF:", error);
      alert("Failed to extract data from the PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 bg-cover bg-center flex items-center justify-center"
    style={{
      backgroundImage: `url(${background_image})`,
    }}
    >
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          PDF Data Extractor
        </h1>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Extracting..." : "Extract Data"}
        </button>

        {loading && (
          <div className="mt-4 text-center">
            <div className="loader border-t-blue-500"></div>
            <p className="text-sm text-gray-500 mt-2">Processing...</p>
          </div>
        )}

        {Object.keys(extractedData).length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Extracted Data:
            </h2>
            <p className="text-gray-700">
              <strong>Name:</strong> {extractedData.name || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Phone:</strong> {extractedData.phone || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Address:</strong> {extractedData.address || "N/A"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
