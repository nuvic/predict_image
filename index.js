/*
  * Reads the selected image file,
  * shows the image file on the page,
  * calls the API with the image file in base64 string,
  * records the prediction (label) of the API
  
  References to JS functionality:
  * FileReader (allows reading of file content): https://developer.mozilla.org/en-US/docs/Web/API/FileReader
  * Element.innerHTML (replace content within HTML block): https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
  * Fetch (making API call): https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  * getElementById (retrieve the html element with specific id): https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
*/
function onFileSelected(event) {
  const selectedFile = event.target.files[0];
  const reader = new FileReader();

  const imgtag = document.getElementById("myImage");
  imgtag.title = selectedFile.name;

  reader.onload = function(event) {
    // set the div element with "id=myImage" to show the uploaded image file
    imgtag.src = event.target.result;
  };

  reader.readAsDataURL(selectedFile);

  const predictionEl = document.getElementById('prediction')
  const confidencesEl = document.getElementById('confidences')
  const errorEl = document.getElementById('error')

  reader.addEventListener("loadend", function() {             
      // Make a API call by passing our image
      fetch('https://hf.space/embed/jph00/testing/+/api/predict/', {
          method: "POST",
          // reader.result is the base64 string of the uploaded image
          body: JSON.stringify({"data": [reader.result]}),
          headers: { "Content-Type": "application/json" } })
          .then(function(response) {
            if (response.status != 200) {
                // early return if the api errors out and show error message
                errorEl.innerHTML = '<u>Sorry the API is not working currently. Please try again later</u>'
                predictionEl.innerHTML = '';
                confidencesEl.innerHTML = '';
                return;
            }
            return response.json(); })
            .then(function(json_response) {
              // json_response has this format:
              // {
              //   "data": [
              //     {
              //       "label": "Cat",
              //       "confidences": [
              //         {
              //           "label": "Cat",
              //           "confidence": 1
              //         },
              //         {
              //           "label": "Dog",
              //           "confidence": 2.430905149281037e-15
              //         }
              //       ]
              //     }
              //   ],
              //   "flag_index": null,
              //   "updated_state": null,
              //   "durations": [
              //     0.04598379135131836
              //   ],
              //   "avg_durations": [
              //     0.16849387327829995
              //   ]
              // }

              const label = json_response?.data[0]?.label;

              // Get the confidences for cat and dog
              // firstLabel and secondLabel are cat and dog
              // the order changes depending on the category predicted,
              // that's why the variable names are not fixed to catLabel/dogLabel
              const firstLabel = json_response?.data[0]?.confidences[0]?.label;
              const firstLabelConfidence = json_response?.data[0]?.confidences[0]?.confidence
              const secondLabel = json_response?.data[0]?.confidences[1]?.label;
              const secondLabelConfidence = json_response?.data[0]?.confidences[1]?.confidence

              // show the prediction
              predictionEl.innerHTML = `🎉 <u>Prediction: ${label}</u> 🎉`
              confidencesEl.innerHTML = `Confidence:<br>
                                          ${firstLabel}: ${firstLabelConfidence}<br>
                                          ${secondLabel}: ${secondLabelConfidence}`
              errorEl.innerHTML = '';
              return;
            })
  });
}