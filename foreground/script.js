async function recordAndSubmit() {
  const place = document.getElementById('place').value;
  const time = document.getElementById('time').value;
  const status = document.getElementById('status');

  // Get location
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const latitude = pos.coords.latitude;
    const longitude = pos.coords.longitude;

    // Record for 5 seconds
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const mic = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    mic.connect(analyser);
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    let maxDB = 0;
    const startTime = audioContext.currentTime;

    function measure() {
      analyser.getByteFrequencyData(dataArray);
      const rms = Math.sqrt(dataArray.reduce((a, b) => a + b * b, 0) / dataArray.length);
      const db = 20 * Math.log10(rms / 255);
      if (!isNaN(db) && db > maxDB) maxDB = db;
      if (audioContext.currentTime - startTime < 5) {
        requestAnimationFrame(measure);
      } else {
        stream.getTracks().forEach(track => track.stop());

        // Submit to backend
        fetch("https://your-backend-url.onrender.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ place_type: place, time_of_day: time, max_db: maxDB, latitude, longitude })
        })
        .then(res => res.json())
        .then(res => status.innerText = "Submitted ✅")
        .catch(() => status.innerText = "Error ❌");
      }
    }

    measure();
  });
}
