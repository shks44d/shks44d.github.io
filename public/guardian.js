import * as THREE from './assets/vendor/three.module.min.js';

// An original, procedural guardian. No remote model, tracking, or animation service.
const stage = document.querySelector('.guardian-stage');
const canvas = document.getElementById('guardian-canvas');
const control = document.getElementById('motion-toggle');
const hint = document.getElementById('guardian-hint');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(pointer: fine)');

try {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, .1, 40);
  camera.position.set(0, 1.65, 8.6);
  camera.lookAt(0, 1.22, 0);

  // Studio reflections give the armor depth without large image assets.
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0x152435);
  function softbox(x, y, z, w, h, color, intensity) {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    panel.material.color.multiplyScalar(intensity);
    panel.position.set(x, y, z); panel.lookAt(0, 1, 0); studio.add(panel);
  }
  softbox(-4, 3, 3, 2, 7, 0xc7e2ff, 3);
  softbox(4, 2, 1, 1, 6, 0x318bff, 4);
  softbox(0, 6, -2, 5, 2, 0xffffff, 2);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, .025);
  scene.environment = environment.texture;
  pmrem.dispose();
  studio.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
  scene.add(new THREE.HemisphereLight(0xcee6ff, 0x08111e, 2.1));
  for (const [color, power, x, y, z] of [[0xe4efff, 4, -3, 5, 5], [0x499eff, 6, 4, 3, -1], [0x84baff, 3, -4, 0, -2]]) {
    const light = new THREE.DirectionalLight(color, power); light.position.set(x, y, z); scene.add(light);
  }

  const armor = new THREE.MeshStandardMaterial({ color: 0x304259, metalness: .65, roughness: .32 });
  const edge = new THREE.MeshStandardMaterial({ color: 0x53667b, metalness: .9, roughness: .25 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x050b13, metalness: .6, roughness: .36 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x111e2c, metalness: .3, roughness: .24, clearcoat: 1, clearcoatRoughness: .1 });
  const blue = new THREE.MeshStandardMaterial({ color: 0x389ce9, emissive: 0x1588ff, emissiveIntensity: 1.2, metalness: .2, roughness: .3 });
  const mutedBlue = new THREE.MeshStandardMaterial({ color: 0x4385b4, emissive: 0x1b62a2, emissiveIntensity: .5, metalness: .7, roughness: .3 });
  const robot = new THREE.Group(); scene.add(robot); robot.rotation.y = -.12;

  function mesh(geometry, material, parent, x=0, y=0, z=0) {
    const m = new THREE.Mesh(geometry, material); m.position.set(x, y, z); parent.add(m); return m;
  }
  function ellipsoid(parent, material, x, y, z, sx, sy, sz) {
    const m = mesh(new THREE.SphereGeometry(1, 48, 32), material, parent, x, y, z); m.scale.set(sx, sy, sz); return m;
  }
  function plate(parent, points, material, depth, x, y, z, bevel=.04) {
    const shape = new THREE.Shape(); points.forEach(([px,py],i)=> i ? shape.lineTo(px,py) : shape.moveTo(px,py)); shape.closePath();
    return mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: bevel, bevelThickness: bevel }), material, parent, x,y,z);
  }
  function ring(parent, radius, tube, material, x, y, z) { return mesh(new THREE.TorusGeometry(radius,tube,8,64),material,parent,x,y,z); }
  function tube(parent, points, radius, material) {
    return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,radius,8,false),material,parent);
  }

  // Shoulder joints, layered chest plates, and a visible mechanical neck.
  ellipsoid(robot,dark,0,.05,-.12,1.48,.91,.53);
  for(const side of [-1,1]) {
    ellipsoid(robot,edge,side*1.23,.32,-.05,.51,.52,.49);
    const shoulder=ellipsoid(robot,armor,side*1.49,.19,.06,.6,.66,.56); shoulder.rotation.z=side*.23;
    plate(robot,[[1.16,.7],[1.52,.66],[1.91,.26],[1.86,-.2],[1.52,-.29],[1.25,.08]].map(([x,y])=>[x*side,y]),armor,.12,0,0,.37,.055);
    tube(robot,[[side*1.26,.64,.57],[side*1.5,.59,.6],[side*1.77,.29,.59]],.017,edge);
    plate(robot,[[0,.63],[.66,.45],[.91,.14],[.69,-.57],[.14,-.7],[-.04,-.15]].map(([x,y])=>[x*side,y]),armor,.2,side*.13,.16,.46,.07);
    tube(robot,[[side*.21,.86,.42],[side*.65,.8,.51],[side*1.03,.56,.48]],.035,edge);
    tube(robot,[[side*.28,.69,.66],[side*.67,.62,.7],[side*.87,.44,.69]],.012,mutedBlue);
    for(let i=0;i<3;i++) {
      const vent=mesh(new THREE.BoxGeometry(.28,.035,.035),dark,robot,side*1.32,.35-i*.1,.58); vent.rotation.z=side*.2;
    }
    for(const [x,y] of [[.35,.59],[.82,.26],[.3,-.32]]) mesh(new THREE.CylinderGeometry(.025,.025,.015,12),edge,robot,x*side,y,.73).rotation.x=Math.PI/2;
    tube(robot,[[side*.34,.73,.1],[side*.43,1.1,.15],[side*.26,1.37,.08]],.065,dark);
  }
  plate(robot,[[-.18,.38],[.18,.38],[.27,-.05],[0,-.29],[-.27,-.05]],edge,.08,0,.18,.72,.025);
  plate(robot,[[-.1,.22],[.1,.22],[.13,0],[0,-.13],[-.13,0]],dark,.025,0,.18,.82,.015);
  ring(robot,.055,.012,blue,0,.26,.87);
  const collar=ring(robot,.46,.12,armor,0,.94,0); collar.rotation.x=Math.PI/2;
  const collarTrim=ring(robot,.46,.016,mutedBlue,0,1.03,0); collarTrim.rotation.x=Math.PI/2;
  mesh(new THREE.CylinderGeometry(.23,.3,.62,32),dark,robot,0,1.25,0);
  for(let i=0;i<5;i++) mesh(new THREE.CylinderGeometry(.27,.27,.055,32),edge,robot,0,1.03+i*.11,0);

  const head=new THREE.Group(); head.position.set(0,1.37,0); robot.add(head);
  ellipsoid(head,armor,0,.85,-.06,.76,.91,.66);
  // Crown: individual armor segments with dark seams.
  plate(head,[[-.54,1.42],[-.29,1.65],[-.045,1.67],[-.045,1.13],[-.5,1.05]],armor,.17,0,0,.37,.055);
  plate(head,[[.54,1.42],[.29,1.65],[.045,1.67],[.045,1.13],[.5,1.05]],armor,.17,0,0,.37,.055);
  plate(head,[[-.59,1.2],[-.55,.6],[-.32,.12],[0,.02],[.32,.12],[.55,.6],[.59,1.2],[.38,1.4],[-.38,1.4]],edge,.06,0,0,.49,.055);
  plate(head,[[-.55,1.18],[-.5,.61],[-.29,.16],[0,.08],[.29,.16],[.5,.61],[.55,1.18],[.35,1.35],[-.35,1.35]],glass,.08,0,0,.55,.065);
  for(const side of [-1,1]) {
    plate(head,[[-.16,.025],[.14,.055],[.16,.015],[-.14,-.02]].map(([x,y])=>[x*side,y]),blue,.008,side*.3,.88,.716,.012);
    plate(head,[[.48,.68],[.69,.76],[.64,.3],[.33,.05],[.29,.2]].map(([x,y])=>[side*x,y]),armor,.07,0,0,.53,.03);
    const ear=mesh(new THREE.CylinderGeometry(.32,.32,.2,48),dark,head,side*.76,.88,-.04); ear.rotation.z=Math.PI/2;
    const cover=mesh(new THREE.CylinderGeometry(.25,.28,.09,48),edge,head,side*.89,.88,-.04); cover.rotation.z=Math.PI/2;
    const inset=mesh(new THREE.CylinderGeometry(.185,.185,.1,48),armor,head,side*.94,.88,-.04); inset.rotation.z=Math.PI/2;
    const earRing=ring(head,.205,.014,mutedBlue,side*1,.88,-.04); earRing.rotation.y=Math.PI/2;
    for(let i=0;i<4;i++) {
      const a=i*Math.PI/2;
      const bolt=mesh(new THREE.CylinderGeometry(.025,.025,.03,12),edge,head,side*1.005,.88+Math.cos(a)*.14,-.04+Math.sin(a)*.14); bolt.rotation.z=Math.PI/2;
    }
    tube(head,[[side*.68,.62,.11],[side*.58,.21,.24],[side*.29,.02,.3]],.04,edge);
  }
  plate(head,[[-.18,.16],[-.12,.27],[.12,.27],[.18,.16],[.11,.02],[-.11,.02]],armor,.08,0,0,.62,.02);
  plate(head,[[-.045,1.25],[.045,1.25],[0,1.17]],mutedBlue,.005,0,0,.72,.004);

  let enabled=!reduceMotion.matches, visible=true, frame=0, last=0, targetX=0, targetY=-.08;
  const home = document.getElementById('home');
  function render(){renderer.render(scene,camera);}
  function resize(){const {width,height}=stage.getBoundingClientRect(); renderer.setSize(width,height,false); camera.aspect=width/height; camera.updateProjectionMatrix(); render();}
  function updateControl(){control.setAttribute('aria-pressed',String(enabled));control.textContent=enabled?'Pause motion':'Enable motion';hint.textContent=enabled?(finePointer.matches?'Move your cursor. I’m following.':'Touch and move. I’m following.'):'A curious mind. A defensive purpose.';}
  function tick(time) {
    frame=0;
    if(!enabled||!visible||document.hidden)return;
    const dt=Math.min((time-last)/1000,.05);last=time;
    head.rotation.y=THREE.MathUtils.damp(head.rotation.y,targetX,5,dt);
    head.rotation.x=THREE.MathUtils.damp(head.rotation.x,targetY,5,dt);
    head.rotation.z=THREE.MathUtils.damp(head.rotation.z,-targetX*.1,5,dt);
    robot.position.y=Math.sin(time*.0007)*.012;
    render();frame=requestAnimationFrame(tick);
  }
  function start(){if(!frame&&enabled&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(tick);}}
  function stop(){cancelAnimationFrame(frame);frame=0;}
  function reset(){targetX=0;targetY=-.08;}
  function follow(clientX,clientY){
    if(!enabled)return;
    const bounds=home.getBoundingClientRect();
    targetX=THREE.MathUtils.clamp((clientX-(bounds.left+bounds.width/2))/(bounds.width/2),-1,1)*.48;
    targetY=THREE.MathUtils.clamp((clientY-(bounds.top+bounds.height*.54))/(bounds.height/2),-1,1)*.22;
  }
  home.addEventListener('pointermove',event=>{
    if(event.pointerType!=='touch')follow(event.clientX,event.clientY);
  },{passive:true});
  // Passive touch events keep native scrolling and pinch zoom available on phones.
  function followTouch(event){
    if(event.touches.length!==1){reset();return;}
    const touch=event.touches[0];follow(touch.clientX,touch.clientY);
  }
  home.addEventListener('touchstart',followTouch,{passive:true});
  home.addEventListener('touchmove',followTouch,{passive:true});
  home.addEventListener('touchend',reset,{passive:true});
  home.addEventListener('touchcancel',reset,{passive:true});
  home.addEventListener('pointerleave',reset);
  control.addEventListener('click',()=>{enabled=!enabled;updateControl();if(enabled)start();else stop();});
  reduceMotion.addEventListener('change',()=>{enabled=!reduceMotion.matches;reset();updateControl();if(enabled)start();else{stop();head.rotation.set(0,0,0);render();}});
  finePointer.addEventListener('change',updateControl);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;visible?start():stop();},{threshold:0}).observe(stage);
  new ResizeObserver(resize).observe(stage);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();stop();stage.classList.remove('is-ready');control.hidden=true;hint.textContent='A curious mind. A defensive purpose.';});
  canvas.addEventListener('webglcontextrestored',()=>{resize();stage.classList.add('is-ready');control.hidden=false;start();});
  resize();updateControl();stage.classList.add('is-ready');control.hidden=false;start();
} catch (error) {
  // Leave the light field empty if 3D is unavailable, without swapping in a different robot.
  stage.classList.remove('is-ready');
  hint.textContent='A curious mind. A defensive purpose.';
  console.warn('3D guardian unavailable.',error);
}
