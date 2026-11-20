(() => {
  const canvas = document.getElementById('moon-phase');
  if (!canvas || !window.SunCalc) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const surface = new Image();
  let pixels;
  function phaseName({ fraction, phase }) {
    if (fraction < .01) return 'New Moon';
    if (fraction > .99) return 'Full Moon';
    if (Math.abs(fraction - .5) < .015) return phase < .5 ? 'First Quarter' : 'Last Quarter';
    return (phase < .5 ? 'Waxing ' : 'Waning ') + (fraction < .5 ? 'Crescent' : 'Gibbous');
  }
  function update() {
    const now = new Date();
    const illumination = SunCalc.getMoonIllumination(now);
    const name = phaseName(illumination);
    const percent = Math.round(illumination.fraction * 100);
    document.getElementById('moon-name').textContent = name;
    document.getElementById('moon-illumination').textContent = `${percent}% illuminated`;
    document.getElementById('moon-link').setAttribute('aria-label', `${name}, ${percent}% illuminated. Explore the Moon on TheSkyLive (opens a new tab).`);
    canvas.setAttribute('aria-label', `${name}, ${percent}% illuminated. Phase illustration.`);
    canvas.dataset.phase = illumination.phase;
    canvas.dataset.illumination = illumination.fraction;
    if (!pixels) return;
    const image = new ImageData(new Uint8ClampedArray(pixels), 256, 256);
    const lightZ = 2 * illumination.fraction - 1;
    const lightX = Math.sqrt(1 - lightZ * lightZ) * (illumination.phase < .5 ? 1 : -1);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const nx = (x - 127.5) / 127, ny = (y - 127.5) / 127;
      const radius = nx * nx + ny * ny;
      const offset = (y * 256 + x) * 4;
      if (radius > 1) { image.data[offset + 3] = 0; continue; }
      const light = nx * lightX + Math.sqrt(1 - radius) * lightZ;
      const shade = .055 + .945 * Math.pow(Math.max(0, light), .15);
      for (let channel = 0; channel < 3; channel++) image.data[offset + channel] *= shade;
    }
    context.putImageData(image, 0, 0);
  }
  surface.onload = () => {
    context.drawImage(surface, 0, 0, 256, 256);
    pixels = context.getImageData(0, 0, 256, 256).data;
    update();
    canvas.dataset.ready = 'true';
  };
  surface.src = 'moon-assets/lunar-surface.webp';
  update();
  setInterval(update, 5 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
})();
