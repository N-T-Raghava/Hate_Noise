document.getElementById('noiseForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;
  const place = form.place.value;
  const time = form.time.value;

  const status = document.getElementById("status");
  status.innerText = "Recording noise...";

  // Get geolocation
  const getLocation = () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        err => reject("Location access denied")
      );
    });

  const getMaxDecibel = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    analyser.fftSize = 2048;
    source.connect(analyser);

    let maxDb = -Infinity;
    const buffer = new Uint8Array(analyser.frequencyBinCount);

    const record = new Promise(resolve => {
      const start = Date.now();
      const loop = () => {
        analyser.getByteFrequencyData(buffer);
        const db = 20 * Math.log10(Math.max(...buffer) / 255);
        if (db > maxDb) maxDb = db;
        if (Date.now() - start < 5000) requestAnimationFrame(loop);
        else resolve(maxDb.toFixed(2));
      };
      loop();
    });

    return record;
  };

  try {
    const location = await getLocation();
    const decibel = await getMaxDecibel();

    status.innerText = `Noise recorded: ${decibel} dB. Submitting...`;

    await fetch("https://hate-noise.onrender.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ place, time, decibel, ...location })
    });

    status.innerText = "Submitted successfully! ✅";
  } catch (err) {
    status.innerText = "Error: " + err;
  }
});
