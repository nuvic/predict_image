function onFileSelected(event) {
  const selectedFile = event.target.files[0];
  const reader = new FileReader();

  const imgtag = document.getElementById("myImage");
  imgtag.title = selectedFile.name;

  reader.onload = function(event) {
    // set the myImage div to show the uploaded image file
    imgtag.src = event.target.result;
  };

  reader.readAsDataURL(selectedFile);

  const predictionDiv = document.getElementById('prediction')
  const errorDiv = document.getElementById('error')

  reader.addEventListener("loadend", function() {             
      fetch('https://hf.space/embed/jph00/testing/+/api/predict/', {
          method: "POST",
          // reader.result is the base64 string of the uploaded image
          body: JSON.stringify({"data": [reader.result]}),
          headers: { "Content-Type": "application/json" } })
          .then(function(response) {
            if (response.status != 200) {
                // early return if the api errors out and show error message
                errorDiv.innerHTML = '<u>Sorry the API is not working currently. Please try again later</u>'
                predictionDiv.innerHTML = '';
                return;
            }
            return response.json(); })
            .then(function(json_response) {
                const label = json_response?.data[0]?.label
                // show the prediction
                predictionDiv.innerHTML = `🎉 <u>Prediction: ${label}</u> 🎉`
                errorDiv.innerHTML = '';
                return;
            })
  });
}