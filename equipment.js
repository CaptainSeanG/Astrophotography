import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const byId = id => document.getElementById(id);
const components = [
  { id: 'scope', label: 'ES127', name: 'Explore Scientific ES127', role: 'Gathering the light',
    description: 'The 127 mm apochromatic refractor gathers light and brings it to a focus at the camera. Its lens-based design produces the wide, detailed star fields seen throughout the gallery.',
    detail: 'The imaging profile records a focal length of 952 mm at f/7.5. The telescope, cameras and adapters form one optical train.', source: 'https://explorescientific.com/collections/ed-apo-fcd100-triplet-series' },
  { id: 'mount', label: 'EQ6-R Pro', name: 'Sky-Watcher EQ6-R Pro', role: 'Following the sky',
    description: 'Earth’s rotation makes the stars appear to move. This equatorial mount tracks that motion so a long exposure can keep collecting light from the same patch of sky.',
    detail: 'Polar alignment aims the mount’s right-ascension axis toward the celestial pole. Counterweights balance the telescope. PHD2 sends small guiding corrections during exposures.', source: 'https://www.skywatcherusa.com/products/eq6-r-pro' },
  { id: 'camera', label: 'ASI533MC Pro', name: 'ZWO ASI533MC Pro', role: 'The imaging camera',
    description: 'This cooled color camera records the main exposures. Its square sensor captures red, green and blue information through a color-filter array, building the data used for the final photograph.',
    detail: 'The sensor has 3008 × 3008 pixels with a 3.76 μm pixel pitch. Cooling helps control thermal signal and supports consistent calibration.', source: 'https://i.zwoastro.com/wp-content/uploads/2024/07/9f26af0bec5c60ea84107dfec8314859.pdf' },
  { id: 'guide', label: 'ASI290 guider', name: 'ZWO ASI290 guide camera', role: 'Keeping stars steady',
    description: 'The second camera repeatedly measures guide stars while the main camera exposes. PHD2 watches their movement and asks the mount for small corrections.',
    detail: 'The guide camera receives light from the off-axis guider, so it watches through the same telescope as the imaging camera. The main camera records the photograph while the ASI290 measures the tracking corrections.', source: 'https://openphdguiding.org/man/Basic_use.htm' },
  { id: 'oag', label: 'ZWO OAG', name: 'ZWO off-axis guider', role: 'Two cameras, one telescope',
    description: 'A small prism near the edge of the light cone redirects a little starlight upward to the guide camera. Most of the field continues toward the imaging camera.',
    detail: 'Sharing the main telescope’s optical path helps the guider detect motion that a separate guide scope might miss. The drawing simplifies the prism and adapter spacing.', source: 'https://openphdguiding.org/man/Basic_use.htm' },
  { id: 'filters', label: '5-position EFW', name: 'ZWO five-position filter wheel', role: 'Choosing the wavelengths',
    description: 'The electronic filter wheel places a selected filter in front of the camera. The choice of filter changes which wavelengths of light reach the sensor.',
    detail: 'The current profile includes IR/Cut and L-eXtreme Pro positions. Filter choice depends on the target and observing conditions.', source: 'https://www.nighttime-imaging.eu/docs/master/site/tabs/equipment/filterwheel/' },
  { id: 'focuser', label: 'Deep Sky Dad AF3', name: 'Deep Sky Dad AF3 focuser', role: 'Finding the sharpest stars',
    description: 'A small motor moves the focuser in repeatable steps. N.I.N.A. can sample stars at different positions and find the focus position that produces the tightest images.',
    detail: 'The installed profile identifies the Deep Sky Dad AF3. Focus can change as the telescope cools through the night, so it is checked again during a session.', source: 'https://shop.deepskydad.com/product/af3/' },
  { id: 'laptop', label: 'Laptop / N.I.N.A.', name: 'The observing laptop', role: 'The imaging workspace',
    description: 'The laptop brings the equipment together. N.I.N.A. manages the exposures and displays the latest image, while PHD2 guides and ASTAP identifies the star field.',
    detail: 'An on-screen stretch makes a faint exposure easier to inspect while preserving the linear image recorded to disk.', source: 'https://www.nighttime-imaging.eu/docs/master/site/tabs/imaging/' },
  { id: 'data', label: 'USB data', name: 'USB data connections', role: 'Images and commands',
    description: 'USB links carry camera images back to the laptop and commands out to connected equipment. The software can coordinate exposures, filter changes, focus and mount control.',
    detail: 'Blue cables show the data connections in this illustration. The real cable routing and adapters may differ.', source: 'https://www.nighttime-imaging.eu/docs/master/site/quickstart/equipment/' },
  { id: 'power', label: 'Power supply', name: 'Power for the night', role: 'Keeping the rig running',
    description: 'A suitable power supply keeps the mount and camera cooler running through the session. Secure connections and enough cable slack let the telescope track without tugging on the equipment.',
    detail: 'Amber cables represent power in the illustration. The supply and distribution layout are simplified.', source: 'https://www.skywatcherusa.com/products/eq6-r-pro' }
];

const componentMap = new Map(components.map(component => [component.id, component]));
const componentPhotos = {
  scope: ['es127-earlier-rig.webp', 'Earlier configuration, before the OAG and filter wheel were installed.'],
  mount: ['es127-earlier-rig.webp', 'The ES127 and EQ6-R Pro in an earlier configuration.'],
  focuser: ['af3-belt-drive.webp', 'The motor and belt drive on my telescope.'],
  guide: ['oag-filter-wheel-installation.webp', 'The guide-camera and OAG assembly during installation.'],
  oag: ['oag-filter-wheel-installation.webp', 'The off-axis guider during installation.'],
  filters: ['oag-filter-wheel-installation.webp', 'The five-position filter wheel and camera train during installation.'],
  camera: ['asi533-connections.webp', 'The ASI533MC Pro’s cooling fan, power and USB connections.'],
  data: ['asi533-connections.webp', 'USB data connections on the ASI533MC Pro.'],
  power: ['asi533-connections.webp', 'Power connected to the ASI533MC Pro’s 12 V input.']
};
const dialog = byId('component-dialog');
let selectedPart = 'scope';
let highlightPart = () => {};
let renderScene = () => {};

function openComponent(id) {
  const component = componentMap.get(id);
  if (!component) return;
  selectedPart = id;
  byId('component-role').textContent = component.role;
  byId('component-title').textContent = component.name;
  byId('component-description').textContent = component.description;
  byId('component-detail').textContent = component.detail;
  byId('component-source').href = component.source;
  const photo = componentPhotos[id];
  byId('component-photo').hidden = !photo;
  if (photo) {
    byId('component-photo-image').src = 'equipment-assets/' + photo[0];
    byId('component-photo-image').alt = photo[1];
    byId('component-photo-caption').textContent = photo[1];
  }
  highlightPart(id);
  byId('rig-tooltip').hidden = true;
  if (!dialog.open) dialog.showModal();
}

for (const component of components) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = component.name;
  button.dataset.component = component.id;
  button.addEventListener('click', () => openComponent(component.id));
  byId('component-list').append(button);
}
byId('close-component').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => highlightPart(selectedPart));

const setup = await fetch('equipment-assets/setup.json').then(response => {
  if (!response.ok) throw new Error('Equipment presentation settings are unavailable.');
  return response.json();
}).catch(() => ({}));

if (setup.ninaImage) {
  byId('nina-screenshot').src = setup.ninaImage;
  byId('nina-large').src = setup.ninaImage;
  byId('nina-caption').textContent = setup.ninaCaption;
  byId('nina-large-caption').textContent = setup.ninaCaption;
  byId('nina-figure').hidden = false;
}
byId('open-nina').addEventListener('click', () => byId('nina-dialog').showModal());
byId('close-nina').addEventListener('click', () => byId('nina-dialog').close());
byId('nina-dialog').addEventListener('click', event => { if (event.target === byId('nina-dialog')) byId('nina-dialog').close(); });
for (const button of document.querySelectorAll('.rig-photo')) {
  button.addEventListener('click', () => {
    byId('rig-photo-large').src = button.dataset.photo;
    byId('rig-photo-large').alt = button.dataset.caption;
    byId('rig-photo-caption').textContent = button.dataset.caption;
    byId('rig-photo-dialog').showModal();
  });
}
byId('close-rig-photo').addEventListener('click', () => byId('rig-photo-dialog').close());
byId('rig-photo-dialog').addEventListener('click', event => { if (event.target === byId('rig-photo-dialog')) byId('rig-photo-dialog').close(); });

function makeScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#12161e'; ctx.fillRect(0, 0, 1000, 600);
  ctx.fillStyle = '#323a46'; ctx.fillRect(0, 0, 1000, 45);
  ctx.fillStyle = '#e1ebf3'; ctx.font = '24px sans-serif'; ctx.fillText('N.I.N.A.  ·  Imaging', 24, 31);
  ctx.fillStyle = '#202733'; ctx.fillRect(18, 64, 690, 416);
  for (let i = 0; i < 100; i++) {
    const x = 32 + ((i * 127.37) % 650), y = 78 + ((i * 83.17) % 380);
    ctx.fillStyle = i % 4 === 0 ? '#d7e5f4' : '#8997ac';
    ctx.fillRect(x, y, i % 4 === 0 ? 3 : 1.5, i % 4 === 0 ? 3 : 1.5);
  }
  const glow = ctx.createRadialGradient(360, 270, 5, 360, 270, 90);
  glow.addColorStop(0, '#a6d2dc88'); glow.addColorStop(1, '#20314800');
  ctx.fillStyle = glow; ctx.fillRect(200, 140, 320, 260);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = '#26313d'; ctx.fillRect(728, 64 + i * 104, 250, 88);
    ctx.fillStyle = '#adc5dc'; ctx.font = '18px sans-serif'; ctx.fillText(['Camera', 'Focus', 'Telescope', 'Guiding'][i], 742, 91 + i * 104);
    ctx.fillStyle = '#849ab1'; ctx.fillRect(742, 107 + i * 104, 170, 4);
  }
  ctx.strokeStyle = '#80bcb1'; ctx.beginPath();
  for (let x = 20; x < 980; x += 6) { const y = 535 + Math.sin(x * .035) * 9; x === 20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
  ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createRig() {
  const stage = byId('rig-stage');
  const canvas = byId('rig-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(37, 1, .1, 60);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(.25, 1.55, .25);
  controls.enablePan = false;
  controls.minDistance = 4.8;
  controls.maxDistance = 15;
  controls.minPolarAngle = .25;
  controls.maxPolarAngle = Math.PI / 2 - .04;
  controls.enableDamping = false;

  scene.add(new THREE.HemisphereLight(0xc5e4ff, 0x263129, 2.2));
  const key = new THREE.DirectionalLight(0xffe8d1, 3.3);
  key.position.set(-3, 7, 5); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
  key.shadow.normalBias = .035;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x79bfff, 2.2);
  rim.position.set(4, 4, -4); scene.add(rim);

  const materials = {
    white: new THREE.MeshStandardMaterial({ color: 0xe0e5e4, roughness: .35, metalness: .22 }),
    black: new THREE.MeshStandardMaterial({ color: 0x20272f, roughness: .44, metalness: .46 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x0a1017, roughness: .86 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xbac6cd, roughness: .24, metalness: .86 }),
    red: new THREE.MeshStandardMaterial({ color: 0xb92e36, roughness: .3, metalness: .55 }),
    green: new THREE.MeshStandardMaterial({ color: 0x8bb84b, roughness: .4, metalness: .25 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x426c9b, roughness: .38, metalness: .55 }),
    amber: new THREE.MeshStandardMaterial({ color: 0xd99838, roughness: .5, emissive: 0x6a3505, emissiveIntensity: .25 }),
    data: new THREE.MeshStandardMaterial({ color: 0x349ee9, roughness: .48, emissive: 0x1457a0, emissiveIntensity: .3 })
  };
  const pickable = [];
  const partMeshes = new Map();
  const anchors = new Map();
  const dataGroup = new THREE.Group(), powerGroup = new THREE.Group(), lightGroup = new THREE.Group();
  scene.add(dataGroup, powerGroup);

  function mesh(parent, geometry, material, position, id) {
    const object = new THREE.Mesh(geometry, material.clone());
    object.position.set(...position);
    object.castShadow = true; object.receiveShadow = true;
    if (id) {
      object.userData.component = id;
      pickable.push(object);
      if (!partMeshes.has(id)) partMeshes.set(id, []);
      partMeshes.get(id).push(object);
    }
    parent.add(object);
    return object;
  }
  function box(parent, size, position, material, id) { return mesh(parent, new THREE.BoxGeometry(...size), material, position, id); }
  function cylinder(parent, radius, length, position, material, id, axis = 'y') {
    const object = mesh(parent, new THREE.CylinderGeometry(radius, radius, length, 48), material, position, id);
    if (axis === 'x') object.rotation.z = Math.PI / 2;
    if (axis === 'z') object.rotation.x = Math.PI / 2;
    return object;
  }
  function bar(parent, start, end, radius, material, id) {
    const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end);
    const object = cylinder(parent, radius, a.distanceTo(b), a.clone().add(b).multiplyScalar(.5).toArray(), material, id);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize());
    return object;
  }
  function ring(parent, radius, tube, position, material, id) {
    const object = mesh(parent, new THREE.TorusGeometry(radius, tube, 12, 64), material, position, id);
    object.rotation.y = Math.PI / 2;
    return object;
  }
  function anchor(id, parent, position) {
    const object = new THREE.Object3D(); object.position.set(...position); parent.add(object); anchors.set(id, object);
  }
  function cable(parent, points, radius, material, id) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    return mesh(parent, new THREE.TubeGeometry(curve, 70, radius, 8, false), material, [0, 0, 0], id);
  }

  const ground = mesh(scene, new THREE.CircleGeometry(5.5, 96), new THREE.MeshStandardMaterial({ color: 0x19232d, roughness: .98 }), [0, -.025, .1]);
  ground.rotation.x = -Math.PI / 2;
  ground.castShadow = false;
  cylinder(scene, .26, .18, [0, 1.07, 0], materials.black, 'mount');
  for (const angle of [Math.PI / 6, Math.PI / 6 + Math.PI * 2 / 3, Math.PI / 6 + Math.PI * 4 / 3]) {
    const top = [.19 * Math.cos(angle), 1.08, .19 * Math.sin(angle)];
    const foot = [1.17 * Math.cos(angle), .05, 1.17 * Math.sin(angle)];
    const midpoint = top.map((value, i) => value * .52 + foot[i] * .48);
    bar(scene, top, midpoint, .065, materials.steel, 'mount');
    bar(scene, midpoint, foot, .043, materials.steel, 'mount');
    const cuff = midpoint.map((value, index) => value * .24 + foot[index] * .76);
    bar(scene, cuff, foot, .056, materials.white, 'mount');
    cylinder(scene, .08, .07, foot, materials.rubber, 'mount');
    bar(scene, [0, .55, 0], [foot[0] * .55, .55, foot[2] * .55], .02, materials.black, 'mount');
  }
  cylinder(scene, .32, .07, [0, .55, 0], materials.black, 'mount');
  cylinder(scene, .24, .3, [0, 1.28, 0], materials.white, 'mount');
  box(scene, [.49, .24, .43], [0, 1.5, -.04], materials.white, 'mount');
  bar(scene, [0, 1.49, -.13], [0, 1.91, .23], .23, materials.white, 'mount');
  bar(scene, [0, 1.45, -.16], [0, 1.49, -.13], .235, materials.green, 'mount');
  box(scene, [.23, .38, .43], [.26, 1.67, .02], materials.white, 'mount');
  box(scene, [.025, .3, .34], [.39, 1.67, .02], materials.black, 'mount');
  cylinder(scene, .21, .63, [0, 1.99, .06], materials.white, 'mount', 'z');
  cylinder(scene, .215, .045, [0, 1.99, .4], materials.green, 'mount', 'z');
  box(scene, [.52, .16, .43], [0, 2.17, 0], materials.black, 'mount');
  const counterA = [0, 1.98, -.24], counterB = [.05, .84, -.75];
  bar(scene, counterA, counterB, .035, materials.steel, 'mount');
  for (const fraction of [.66, .82]) {
    const center = counterA.map((value, i) => value + (counterB[i] - value) * fraction);
    const weight = cylinder(scene, .24, .14, center, materials.white, 'mount');
    weight.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...counterB).sub(new THREE.Vector3(...counterA)).normalize());
  }
  anchor('mount', scene, [.28, 1.67, .3]);

  const optics = new THREE.Group(); optics.position.set(-.18, 2.62, 0); optics.rotation.z = -.22; scene.add(optics);
  cylinder(optics, .27, 2.45, [-.71, 0, 0], materials.white, 'scope', 'x');
  cylinder(optics, .335, .68, [-2.1, 0, 0], materials.white, 'scope', 'x');
  cylinder(optics, .338, .075, [-1.75, 0, 0], materials.black, 'scope', 'x');
  cylinder(optics, .34, .045, [-2.45, 0, 0], materials.black, 'scope', 'x');
  cylinder(optics, .295, .012, [-2.478, 0, 0], new THREE.MeshPhysicalMaterial({ color: 0x13283b, roughness: .08, metalness: .5, clearcoat: 1 }), 'scope', 'x');
  ring(optics, .3, .017, [-2.49, 0, 0], materials.black, 'scope');
  for (const x of [-1.15, .05]) {
    ring(optics, .285, .045, [x, 0, 0], materials.black, 'scope');
    box(optics, [.15, .2, .28], [x, -.33, 0], materials.black, 'scope');
    cylinder(optics, .047, .1, [x, .32, 0], materials.steel, 'scope');
  }
  box(optics, [1.8, .1, .24], [-.55, -.465, 0], materials.blue, 'scope');
  box(optics, [1.35, .07, .12], [-.55, .45, 0], materials.black, 'scope');
  for (const x of [-1.15, .05]) box(optics, [.075, .18, .12], [x, .36, 0], materials.black, 'scope');
  const logoCanvas = document.createElement('canvas'); logoCanvas.width = 640; logoCanvas.height = 100;
  const logo = logoCanvas.getContext('2d'); logo.clearRect(0, 0, 640, 100); logo.fillStyle = '#23334b'; logo.font = 'bold 27px sans-serif'; logo.fillText('EXPLORE SCIENTIFIC', 35, 40); logo.font = '21px sans-serif'; logo.fillText('127 mm  ·  APO REFRACTOR', 35, 75);
  const logoTexture = new THREE.CanvasTexture(logoCanvas); logoTexture.colorSpace = THREE.SRGBColorSpace;
  mesh(optics, new THREE.PlaneGeometry(1.35, .21), new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true }), [-.73, .01, .273], 'scope');
  anchor('scope', optics, [-1.1, .26, 0]);

  cylinder(optics, .215, .35, [.67, 0, 0], materials.black, 'focuser', 'x');
  cylinder(optics, .145, .34, [.98, 0, 0], materials.steel, 'focuser', 'x');
  cylinder(optics, .17, .08, [1.17, 0, 0], materials.black, 'focuser', 'x');
  box(optics, [.34, .3, .28], [.35, -.26, .27], materials.black, 'focuser');
  box(optics, [.56, .045, .13], [.55, -.32, .24], materials.black, 'focuser');
  cylinder(optics, .145, .11, [.72, -.08, .43], materials.steel, 'focuser', 'z');
  cylinder(optics, .153, .045, [.72, -.08, .51], materials.black, 'focuser', 'z');
  cylinder(optics, .118, .012, [.72, -.08, .545], materials.steel, 'focuser', 'z');
  cylinder(optics, .054, .09, [.35, -.31, .49], materials.steel, 'focuser', 'z');
  const beltPoints = [[.72, .08, .55], [.87, -.08, .55], [.76, -.23, .55], [.35, -.37, .55], [.29, -.31, .55], [.35, -.25, .55], [.57, -.08, .55]];
  const beltCurve = new THREE.CatmullRomCurve3(beltPoints.map(point => new THREE.Vector3(...point)), true);
  mesh(optics, new THREE.TubeGeometry(beltCurve, 80, .012, 7, true), materials.rubber, [0, 0, 0], 'focuser');
  for (let i = 0; i < 24; i++) {
    const angle = i / 24 * Math.PI * 2;
    const tooth = box(optics, [.014, .019, .04], [.72 + Math.cos(angle) * .15, -.08 + Math.sin(angle) * .15, .51], materials.black, 'focuser');
    tooth.rotation.z = angle;
  }
  anchor('focuser', optics, [.41, -.25, .44]);

  cylinder(optics, .2, .13, [1.28, 0, 0], materials.black, 'oag', 'x');
  box(optics, [.13, .15, .16], [1.28, .19, 0], materials.black, 'oag');
  cylinder(optics, .065, .29, [1.28, .37, 0], materials.black, 'oag');
  ring(optics, .195, .014, [1.22, 0, 0], materials.steel, 'oag');
  anchor('oag', optics, [1.28, .19, .07]);
  cylinder(optics, .16, .19, [1.28, .63, 0], materials.red, 'guide');
  cylinder(optics, .18, .055, [1.28, .73, 0], materials.red, 'guide');
  cylinder(optics, .152, .015, [1.28, .77, 0], materials.black, 'guide');
  anchor('guide', optics, [1.28, .77, 0]);

  cylinder(optics, .37, .115, [1.48, -.09, 0], materials.black, 'filters', 'x');
  cylinder(optics, .16, .15, [1.48, 0, 0], materials.black, 'filters', 'x');
  for (let i = 0; i < 5; i++) {
    const angle = i / 5 * Math.PI * 2;
    cylinder(optics, .017, .012, [1.545, -.09 + Math.cos(angle) * .3, Math.sin(angle) * .3], materials.steel, 'filters', 'x');
  }
  anchor('filters', optics, [1.49, -.38, .1]);
  cylinder(optics, .155, .12, [1.62, 0, 0], materials.black, 'camera', 'x');
  cylinder(optics, .255, .38, [1.87, 0, 0], materials.red, 'camera', 'x');
  cylinder(optics, .26, .04, [2.08, 0, 0], materials.black, 'camera', 'x');
  cylinder(optics, .14, .018, [2.105, 0, 0], materials.rubber, 'camera', 'x');
  for (let i = 0; i < 7; i++) {
    const angle = i / 7 * Math.PI * 2;
    const vent = box(optics, [.025, .026, .12], [2.12, .1 * Math.cos(angle), .1 * Math.sin(angle)], materials.steel, 'camera');
    vent.rotation.x = -angle;
  }
  anchor('camera', optics, [1.92, .23, .12]);

  box(scene, [1.25, .055, .9], [2.12, .83, 1.55], materials.black, 'laptop');
  for (const x of [1.62, 2.62]) for (const z of [1.21, 1.88]) bar(scene, [x, .81, z], [x + (x > 2 ? .08 : -.08), .03, z], .025, materials.steel, 'laptop');
  const laptop = new THREE.Group(); laptop.position.set(2.12, .89, 1.57); laptop.rotation.y = -.25; scene.add(laptop);
  box(laptop, [1.03, .04, .69], [0, 0, 0], materials.steel, 'laptop');
  box(laptop, [.77, .008, .28], [0, .025, -.09], materials.black, 'laptop');
  box(laptop, [.25, .004, .14], [0, .025, .2], materials.black, 'laptop');
  for (let row = 0; row < 4; row++) for (let col = 0; col < 12; col++) box(laptop, [.042, .005, .036], [-.35 + col * .064, .032, -.2 + row * .064], materials.steel, 'laptop');
  const display = new THREE.Group(); display.position.set(0, .015, -.31); display.rotation.x = -.17; laptop.add(display);
  box(display, [1.06, .63, .025], [0, .31, 0], materials.black, 'laptop');
  const screen = makeScreenTexture();
  const screenMesh = mesh(display, new THREE.PlaneGeometry(.98, .54), new THREE.MeshBasicMaterial({ map: screen, toneMapped: false }), [0, .32, .018], 'laptop');
  if (setup.ninaImage) new THREE.TextureLoader().load(setup.ninaImage, texture => { texture.colorSpace = THREE.SRGBColorSpace; screenMesh.material.map = texture; renderScene(); });
  anchor('laptop', scene, [2.12, 1.4, 1.44]);

  box(powerGroup, [.35, .18, .52], [1.4, .09, .55], materials.black, 'power');
  cylinder(powerGroup, .018, .005, [1.4, .185, .5], new THREE.MeshStandardMaterial({ color: 0x93d57b, emissive: 0x65b14e }), 'power');
  cable(powerGroup, [[1.4, .1, .8], [1.65, .06, 1.1], [2.85, .06, 1.9], [3.3, .06, 2.1]], .015, materials.amber, 'power');
  cable(powerGroup, [[1.4, .1, .28], [.8, .09, .25], [.45, .9, .23], [.35, 1.6, .23]], .015, materials.amber, 'power');
  cable(powerGroup, [[1.4, .1, .28], [1.7, .4, .18], [1.73, 1.6, .18], [1.95, 2.2, .15]], .014, materials.amber, 'power');
  cable(powerGroup, [[1.45, .14, .76], [2.6, .05, 1.1], [2.75, .65, 1.6], [2.62, .9, 1.65]], .012, materials.amber, 'power');
  anchor('power', scene, [1.4, .2, .55]);
  cable(dataGroup, [[1.62, .93, 1.52], [1.3, .66, 1.2], [.95, .27, .7], [.8, .9, .2], [1.55, 2, .21], [1.98, 2.2, .18]], .018, materials.data, 'data');
  cable(dataGroup, [[1.55, 2, .21], [.5, 1.9, .35], [.35, 1.55, .25]], .014, materials.data, 'data');
  cable(optics, [[2.06, -.06, .16], [1.84, -.3, .3], [1.53, -.35, .19]], .012, materials.data, 'data');
  cable(optics, [[2.06, .03, .13], [1.8, .44, .13], [1.3, .81, .05]], .012, materials.data, 'data');
  anchor('data', scene, [1.14, .64, .99]);

  optics.add(lightGroup);
  const beamMaterial = new THREE.MeshBasicMaterial({ color: 0x9fe7fa, transparent: true, opacity: .13, depthWrite: false, depthTest: false, side: THREE.DoubleSide });
  const beam = mesh(lightGroup, new THREE.CylinderGeometry(.018, .25, 4.45, 40, 1, true), beamMaterial, [-.21, 0, 0]);
  beam.rotation.z = -Math.PI / 2;
  bar(lightGroup, [-2.48, 0, 0], [2.02, 0, 0], .008, new THREE.MeshBasicMaterial({ color: 0xaeeeff, depthTest: false }));
  bar(lightGroup, [1.28, .08, 0], [1.28, .65, 0], .009, new THREE.MeshBasicMaterial({ color: 0x7dffbf, depthTest: false }));
  lightGroup.visible = false;

  const markerElements = new Map();
  for (const component of components) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'rig-marker'; button.dataset.component = component.id;
    button.textContent = component.label; button.setAttribute('aria-label', 'Explore ' + component.name);
    button.addEventListener('click', () => openComponent(component.id));
    button.addEventListener('pointerenter', () => showTooltip(component.id, button));
    button.addEventListener('focus', () => showTooltip(component.id, button));
    button.addEventListener('pointerleave', hideTooltip);
    button.addEventListener('blur', hideTooltip);
    byId('rig-markers').append(button); markerElements.set(component.id, button);
  }
  function showTooltip(id, button, point) {
    if (dialog.open) return;
    const component = componentMap.get(id), tooltip = byId('rig-tooltip');
    tooltip.replaceChildren();
    const title = document.createElement('strong'), text = document.createElement('p');
    title.textContent = component.name; text.textContent = component.description;
    tooltip.append(title, text); tooltip.hidden = false;
    const bounds = stage.getBoundingClientRect();
    const rect = button ? button.getBoundingClientRect() : null;
    const x = rect ? rect.left - bounds.left : point.x;
    const y = rect ? rect.bottom - bounds.top + 8 : point.y + 18;
    tooltip.style.left = Math.max(10, Math.min(x, bounds.width - tooltip.offsetWidth - 12)) + 'px';
    tooltip.style.top = Math.max(10, Math.min(y, bounds.height - tooltip.offsetHeight - 70)) + 'px';
    highlightPart(id);
  }
  function hideTooltip() { byId('rig-tooltip').hidden = true; highlightPart(selectedPart); }

  const leaders = byId('rig-leaders'), leaderContext = leaders.getContext('2d');
  function updateMarkers() {
    const width = stage.clientWidth, height = stage.clientHeight;
    leaders.width = width * renderer.getPixelRatio(); leaders.height = height * renderer.getPixelRatio();
    leaderContext.setTransform(renderer.getPixelRatio(), 0, 0, renderer.getPixelRatio(), 0, 0);
    leaderContext.clearRect(0, 0, width, height);
    const columns = [[], []];
    const world = new THREE.Vector3();
    for (const component of components) {
      const button = markerElements.get(component.id);
      const mobileVisible = ['scope', 'mount', 'camera', 'laptop'].includes(component.id) || component.id === selectedPart;
      anchors.get(component.id).getWorldPosition(world);
      world.project(camera);
      button.hidden = world.z > 1 || world.z < -1 || (width < 650 && !mobileVisible);
      if (button.hidden) continue;
      const x = (world.x * .5 + .5) * width, y = (-world.y * .5 + .5) * height;
      const side = x < width / 2 ? 0 : 1;
      columns[side].push({ button, x, y, targetY: Math.min(height - 110, Math.max(24, y - 10)) });
    }
    for (let side = 0; side < 2; side++) {
      const items = columns[side].sort((a, b) => a.targetY - b.targetY);
      let last = 14;
      for (const item of items) { item.targetY = Math.max(last, item.targetY); last = item.targetY + 34; }
      const overflow = Math.max(0, last - (height - 90));
      for (const item of items) {
        const x = side === 0 ? 18 : width - item.button.offsetWidth - 18;
        const y = Math.max(16, item.targetY - overflow);
        item.button.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        item.button.setAttribute('aria-pressed', String(item.button.dataset.component === selectedPart));
        leaderContext.strokeStyle = '#94bdd17a'; leaderContext.lineWidth = 1;
        leaderContext.beginPath();
        leaderContext.moveTo(side === 0 ? x + item.button.offsetWidth : x, y + item.button.offsetHeight / 2);
        leaderContext.lineTo(item.x, item.y); leaderContext.stroke();
        leaderContext.fillStyle = '#b3e4f2'; leaderContext.beginPath(); leaderContext.arc(item.x, item.y, 2.5, 0, Math.PI * 2); leaderContext.fill();
      }
    }
  }
  let scheduled = false;
  renderScene = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; scene.updateMatrixWorld(); renderer.render(scene, camera); updateMarkers(); });
  };
  highlightPart = id => {
    for (const [part, objects] of partMeshes) {
      for (const object of objects) if (object.material.emissive) {
        object.material.emissive.setHex(part === id ? 0x1a4565 : 0x000000);
        object.material.emissiveIntensity = part === id ? .34 : 0;
      }
    }
    renderScene();
  };
  function resetView() {
    const portrait = stage.clientWidth < 650;
    camera.position.set(portrait ? 8.7 : 6.6, portrait ? 5.1 : 4.1, portrait ? 10.6 : 7.7);
    controls.target.set(.2, 1.5, .25); controls.update(); renderScene();
  }
  controls.addEventListener('change', () => { hideTooltip(); renderScene(); });
  byId('reset-view').addEventListener('click', resetView);
  byId('show-light').addEventListener('click', event => { lightGroup.visible = !lightGroup.visible; event.currentTarget.setAttribute('aria-pressed', String(lightGroup.visible)); renderScene(); });
  byId('show-cables').addEventListener('click', event => {
    const visible = !dataGroup.visible; dataGroup.visible = visible; powerGroup.visible = visible;
    for (const object of partMeshes.get('data')) object.visible = visible;
    for (const object of partMeshes.get('power')) object.visible = visible;
    event.currentTarget.setAttribute('aria-pressed', String(visible)); renderScene();
  });
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  let down = null;
  function pick(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const found = raycaster.intersectObjects(pickable).find(hit => hit.object.visible && hit.object.parent.visible);
    return found && found.object.userData.component;
  }
  canvas.addEventListener('pointerdown', event => { down = [event.clientX, event.clientY]; hideTooltip(); });
  canvas.addEventListener('pointerup', event => {
    if (down && Math.hypot(event.clientX - down[0], event.clientY - down[1]) < 6) { const id = pick(event); if (id) openComponent(id); }
    down = null;
  });
  canvas.addEventListener('pointermove', event => {
    if (event.buttons || event.pointerType === 'touch') return;
    const id = pick(event);
    if (id) { const rect = stage.getBoundingClientRect(); showTooltip(id, null, { x: event.clientX - rect.left, y: event.clientY - rect.top }); }
    else hideTooltip();
  });
  canvas.addEventListener('pointerleave', hideTooltip);
  new ResizeObserver(() => {
    camera.aspect = stage.clientWidth / stage.clientHeight; camera.updateProjectionMatrix();
    renderer.setSize(stage.clientWidth, stage.clientHeight, false); renderScene();
  }).observe(stage);
  resetView(); highlightPart('scope');
  byId('rig-loading').hidden = true;
  stage.dataset.ready = 'true';
}

try { createRig(); }
catch (error) {
  console.warn('Interactive rig unavailable', error);
  byId('rig-canvas').hidden = true; byId('rig-leaders').hidden = true;
  byId('rig-poster').hidden = false; byId('rig-loading').hidden = true;
  byId('model-caption').textContent = 'A still view of my imaging setup. Select a component below for its explanation.';
  byId('rig-stage').dataset.ready = 'fallback';
  for (const button of document.querySelectorAll('.rig-controls button')) button.disabled = true;
}

function learningDemos() {
  const width = 360, height = 220;
  const signal = new Float32Array(width * height), noise = new Float32Array(width * height);
  let seed = 16027;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return (seed + 1) / 4294967297; };
  const stars = Array.from({ length: 38 }, () => [random() * width, random() * height, .09 + random() * .7, .55 + random() * .7]);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const index = y * width + x;
    const dx = (x - 186) / 79, dy = (y - 110) / 49;
    const radius = Math.hypot(dx, dy);
    let value = .012 + .032 * Math.exp(-((radius - .83) ** 2) / .12) + .009 * Math.exp(-(dx * dx + dy * dy) * 1.5);
    value *= 1 + .14 * Math.sin(x * .09 + y * .04);
    for (const [sx, sy, brightness, size] of stars) value += brightness * Math.exp(-((x - sx) ** 2 + (y - sy) ** 2) / (2 * size * size));
    signal[index] = value;
    noise[index] = Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random()) * .008;
  }
  function draw(id, frames, exponent) {
    const canvas = byId(id), context = canvas.getContext('2d');
    const image = context.createImageData(width, height);
    for (let i = 0; i < signal.length; i++) {
      const linear = Math.max(0, Math.min(1, signal[i] + noise[i] / Math.sqrt(frames)));
      const value = Math.pow(linear, exponent);
      image.data[i * 4] = Math.min(255, value * 238);
      image.data[i * 4 + 1] = Math.min(255, value * 228);
      image.data[i * 4 + 2] = Math.min(255, value * 255);
      image.data[i * 4 + 3] = 255;
    }
    const buffer = document.createElement('canvas'); buffer.width = width; buffer.height = height;
    buffer.getContext('2d').putImageData(image, 0, 0);
    context.drawImage(buffer, 0, 0, canvas.width, canvas.height);
  }
  function updateStack() {
    const count = Number(byId('stack-count').value);
    draw('single-demo', 1, .42); draw('stack-demo', count, .42);
    byId('stack-label').textContent = count + (count === 1 ? ' exposure' : ' aligned exposures');
    byId('stack-readout').textContent = 'About ' + Math.sqrt(count) + '× the signal-to-noise of one exposure';
  }
  function updateStretch() {
    const value = Number(byId('stretch-amount').value);
    draw('stretch-demo', 64, 1 - .78 * value / 100);
    byId('stretch-readout').textContent = value === 0 ? 'Linear view' : value < 50 ? 'Gentle stretch' : 'Stronger stretch';
  }
  byId('stack-count').addEventListener('change', updateStack);
  byId('stretch-amount').addEventListener('input', updateStretch);
  updateStack(); updateStretch();
}
learningDemos();
