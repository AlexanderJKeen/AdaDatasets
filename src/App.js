import React, { useEffect, useRef, useState } from 'react';
import ml5 from 'ml5';
import './App.css';

const App = () => {
    const modelURLs = [
        'https://teachablemachine.withgoogle.com/models/IEfVJFQpB/',
        'https://teachablemachine.withgoogle.com/models/1C7yVCkLt/',
        'https://teachablemachine.withgoogle.com/models/MVftDG3k0/',
    ];

    const [uploadedImage, setUploadedImage] = useState(null);
    const [results, setResults] = useState([]);
    const [imageSize, setImageSize] = useState('66%'); // 2/3 of the screen

    const imageInputRef = useRef(null);

    useEffect(() => {
        if (uploadedImage) {
            classifyImages(uploadedImage);
        }
    }, [uploadedImage]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setUploadedImage(imageUrl);
        }
    };

    const classifyImages = (imageUrl) => {
        const isLikelyThreshold = 0.6; // Set your "is likely" threshold
        const isThreshold = 0.8; // Set your "is" threshold

        const promises = modelURLs.map((modelURL) => {
          return new Promise((resolve) => {
            const imageElement = new Image();
            imageElement.src = imageUrl;
      
            const classifier = ml5.imageClassifier(modelURL, () => {
              classifier.classify(imageElement, (error, results) => {
                if (error) {
                  console.error('Classifier error:', error);
                  resolve([]);
                } else {
                  results.sort((a, b) => b.confidence - a.confidence);
      
                  const topLabels = results.slice(0, 1); // Get the label with the highest confidence

                  const categorizedLabels = topLabels.map((label) => ({
                    label: label.label,
                    confidence: label.confidence,
                    category: label.confidence >= isThreshold ? 'is' : label.confidence >= isLikelyThreshold ? 'is likely' : 'could be',
                  }));
      
                  resolve(categorizedLabels);
                }
              });
            });
          });
        });
      
        Promise.all(promises)
          .then((allResults) => {
            setResults(allResults);
          });
      };

    return (
        <div className="App">
            <label htmlFor="fileInput" className="image-input-label">
            Upload an Image
            </label>
            <input
            type="file"
            accept="image/*"
            id="fileInput"
            ref={imageInputRef}
            onChange={handleImageUpload}
            className="image-input"
            />
            <div className="image-text-container" style={{ width: imageSize }}>
                {uploadedImage && <img src={uploadedImage} alt="Uploaded" className="uploaded-image" />}
                <div className="results-container">
                    {results.length > 0 &&
                        results.map((topLabels, index) => (
                            <div key={index} className="model-result">
                                <ul>
                                    {topLabels.map((label, i) => (
                                        <li key={i} className="result-item">
                                            <span className="label">{label.label}:</span>
                                            <span className="confidence">{(label.confidence * 100).toFixed(2)}% ({label.category})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default App;
