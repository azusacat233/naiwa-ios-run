
class NaiwaScene {
 constructor(mount,p){
 this.mount=mount;this.p=p;this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(55,1,.1,250);
 this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,p.quality==='low'?1:1.75));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.08;this.renderer.shadowMap.enabled=p.quality!=='low';this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;if('useLegacyLights' in this.renderer)this.renderer.useLegacyLights=false;mount.appendChild(this.renderer.domElement);
 this.hemi=new THREE.HemisphereLight(0xdff6ff,0x3d584d,1.35);this.scene.add(this.hemi);this.sun=new THREE.DirectionalLight(0xffe4b0,4.2);this.sun.position.set(-18,32,16);this.sun.castShadow=true;this.sun.shadow.mapSize.set(p.quality==='low'?1024:2048,p.quality==='low'?1024:2048);this.sun.shadow.bias=-.00018;this.sun.shadow.normalBias=.035;Object.assign(this.sun.shadow.camera,{left:-17,right:17,top:22,bottom:-10,near:1,far:90});this.scene.add(this.sun);this.fill=new THREE.DirectionalLight(0x8ed9e6,.7);this.fill.position.set(16,8,-18);this.scene.add(this.fill);const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{topColor:{value:new THREE.Color(0x7fcbd4)},bottomColor:{value:new THREE.Color(0xe9f0d5)},offset:{value:22},exponent:{value:.75}},vertexShader:'varying vec3 vWorldPosition;void main(){vec4 wp=modelMatrix*vec4(position,1.0);vWorldPosition=wp.xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform vec3 topColor;uniform vec3 bottomColor;uniform float offset;uniform float exponent;varying vec3 vWorldPosition;void main(){float h=normalize(vWorldPosition+offset).y;gl_FragColor=vec4(mix(bottomColor,topColor,max(pow(max(h,0.0),exponent),0.0)),1.0);}'});this.sky=new THREE.Mesh(new THREE.SphereGeometry(180,24,14),skyMat);this.scene.add(this.sky);
 this.materials={};this.boxGeo=new THREE.BoxGeometry(1,1,1);this.sphereGeo=new THREE.SphereGeometry(1,12,10);this.objects=new Map();this.world=new THREE.Group();this.scene.add(this.world);this.decor=new THREE.Group();this.world.add(this.decor);this.track=new THREE.Group();this.world.add(this.track);
 this.box(this.track,11,.3,240,0,-.24,-100,0x586862);for(const x of [-2.8,0,2.8]){this.box(this.track,2.15,.045,240,x,-.035,-100,0x7a817b);for(const dx of [-.8,.8]){const rail=this.box(this.track,.085,.11,240,x+dx,.055,-100,0xbac5c4);rail.material=this.metal(0xc4cfce,.2);}}
 this.sleepers=[];for(let i=0;i<90;i++){const g=new THREE.Group();for(const x of [-2.8,0,2.8])this.box(g,2.1,.08,.24,x,0,0,0x647771);g.position.z=-i*2.7;this.track.add(g);this.sleepers.push(g);}
 this.actors={};for(const id of ['runner','bull','dog']){this.actors[id]=this.model(id);this.scene.add(this.actors[id]);}
 this.actor='runner';this.accessories=new THREE.Group();this.actors.runner.add(this.accessories);
 this.bubble=new THREE.Mesh(new THREE.SphereGeometry(1.55,24,16),new THREE.MeshBasicMaterial({color:0x64dfff,transparent:true,opacity:.2,wireframe:true}));this.scene.add(this.bubble);
 this.board=new THREE.Group();this.box(this.board,.85,.12,1.8,0,0,0,0x31e5cc);this.box(this.board,.65,.06,1.2,0,.08,0,0x163f56);this.scene.add(this.board);
 this.jetpack=new THREE.Group();for(const x of [-.38,.38]){this.box(this.jetpack,.28,.75,.28,x,1.25,.43,0x957be5);const flame=this.ball(this.jetpack,.22,x,.7,.43,0xffcf65);flame.scale.y=.44;}this.scene.add(this.jetpack);this.shoes=new THREE.Group();for(const x of [-.27,.27])this.box(this.shoes,.3,.22,.5,x,.15,-.1,0x6ce4b0);this.scene.add(this.shoes);this.homeTrains=new THREE.Group();this.scene.add(this.homeTrains);for(const [lane,d] of [[-1,17],[1,35]]){const g=this.obstacle({type:'train',variant:lane===1?1:0});g.position.set(lane*2.8,0,-d);this.homeTrains.add(g);}
 this.setTheme(p.map);this.setSkin(p.skin);new ResizeObserver(()=>this.resize()).observe(mount);this.resize();
 }
 mat(c){const k='m'+String(c);return this.materials[k]||(this.materials[k]=new THREE.MeshStandardMaterial({color:c,roughness:.72,metalness:.03}));}
 metal(c,r=.28){const k='x'+String(c)+r;return this.materials[k]||(this.materials[k]=new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:.82}));}
 box(parent,w,h,d,x,y,z,c){const m=new THREE.Mesh(this.boxGeo,this.mat(c));m.scale.set(w,h,d);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 ball(parent,r,x,y,z,c){const m=new THREE.Mesh(this.sphereGeo,this.mat(c));m.scale.setScalar(r);m.position.set(x,y,z);parent.add(m);return m;}
 model(id){
 const data=NaiwaModels;const binary=Uint8Array.from(atob(data.binary),c=>c.charCodeAt(0)).buffer;const raw=data.manifest.characters[id].children[0];const geo=new THREE.BufferGeometry();
 for(const [field,name,n] of [['positions','position',3],['normals','normal',3],['uvs','uv',2],['skinWeights','skinWeight',4],['skinIndices','skinIndex',4]]){const a=raw[field];const C=a.type==='Uint16Array'?Uint16Array:Float32Array;geo.setAttribute(name,new THREE.BufferAttribute(new C(binary,a.offset,a.length),n));}
 const a=raw.indices;geo.setIndex(new THREE.BufferAttribute(new Uint16Array(binary,a.offset,a.length),1));
 const tex=new THREE.TextureLoader().load(data.textures[id]);tex.flipY=false;tex.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.SkinnedMesh(geo,new THREE.MeshStandardMaterial({map:tex,roughness:.9,side:THREE.DoubleSide}));mesh.castShadow=true;mesh.frustumCulled=false;
 const bones=raw.rig.map(b=>{const bone=new THREE.Bone();bone.name=b.name;new THREE.Matrix4().fromArray(b.matrix).decompose(bone.position,bone.quaternion,bone.scale);bone.userData.rest=bone.quaternion.clone();return bone;});
 raw.rig.forEach((b,i)=>{if(b.parent>=0)bones[b.parent].add(bones[i]);else mesh.add(bones[i]);});mesh.bind(new THREE.Skeleton(bones));const g=new THREE.Group();g.add(mesh);g.userData={mesh,bones};return g;
 }
 setSkin(i){const s=NaiwaCore.SKINS[i];this.actors.runner.userData.mesh.material.color.set(s.color);this.accessories.clear();const c=s.accent,g=this.accessories;
 if(s.item==='cap'||s.item==='hat'){this.box(g,.95,.15,.8,0,2.19,0,c);this.box(g,.65,s.item==='hat'?.42:.22,.65,0,2.35,0,c);this.box(g,.7,.05,.45,0,2.14,-.48,c);}
 if(s.item==='pack'){this.box(g,.66,.8,.32,0,1.2,.4,c);for(const x of [-.3,.3])this.box(g,.18,.65,.22,x,1.1,.55,0xcce8ed);}
 if(s.item==='cape')this.box(g,1.1,1.15,.07,0,1.05,.49,c);
 if(s.item==='scarf'){this.box(g,.9,.18,.7,0,1.63,0,c);this.box(g,.2,.65,.08,.32,1.3,-.37,c);}
 if(s.item==='bow'){for(const x of [-.27,.27])this.ball(g,.24,x,2.25,0,c);}
 if(s.item==='crown'){this.box(g,.9,.14,.65,0,2.2,0,c);for(const x of [-.35,0,.35])this.box(g,.13,.3,.15,x,2.38,-.25,c);}
 }
 setTheme(i){
 const m=NaiwaCore.MAPS[i];const sky=new THREE.Color(m.sky),night=['temple','tower'].includes(m.kind);this.scene.background=sky;this.scene.fog=new THREE.Fog(sky,night?38:58,night?135:175);this.sky.material.uniforms.topColor.value.copy(sky).offsetHSL(0,.04,night?-.03:.13);this.sky.material.uniforms.bottomColor.value.copy(sky).offsetHSL(0,-.05,night?.06:.22);this.sun.color.setHex(night?0xb8d2ff:0xffe3aa);this.sun.intensity=night?2.2:4.2;this.hemi.intensity=night?.75:1.35;this.fill.intensity=night?1.1:.7;this.decor.clear();this.chunks=[];
 this.box(this.decor,200,.3,260,0,-.5,-100,m.ground);
 for(let i=0;i<16;i++){const g=new THREE.Group();g.position.z=-i*12;this.decor.add(g);this.chunks.push(g);
 for(const side of [-1,1]){const x=side*(8+(i%3)*1.3);const h=4+i%4*2;
 if(['pyramid'].includes(m.kind)){const mesh=new THREE.Mesh(new THREE.ConeGeometry(4,7,4),this.mat(m.wall));mesh.position.set(x,3.5,0);mesh.rotation.y=Math.PI/4;g.add(mesh);}
 else if(['sakura','palm','snow','autumn','island'].includes(m.kind)){this.box(g,.4,3,.4,x,1.5,0,0x8c785c);const leaf=m.kind==='sakura'?0xf5b6cd:m.kind==='autumn'?0xe99641:m.kind==='snow'?0xe6f2f0:0x55a981;for(const off of [-.8,0,.8])this.ball(g,1.3,x+off,3.7+Math.abs(off)*.2,0,leaf);if(i%2===0)this.box(g,3,2.5,4,x+side*4,1.25,1,m.wall);}
 else{this.box(g,4,h,7,x,h/2,0,m.wall);this.box(g,4.4,.25,7.4,x,h,0,m.accent);for(let y=1;y<h-.3;y+=1.5)for(const z of [-2,0,2])this.box(g,.05,.7,.65,x-side*2.03,y,z,m.kind==='tower'?0x80edf2:0xeef0d9);if(m.kind==='dome')this.ball(g,2,x,h+.5,0,m.accent);if(m.kind==='temple'){this.box(g,5,.3,8,x,h+.5,0,0x903f32);this.ball(g,.4,x-side*2.4,2.8,1,0xffb24f);}}
 this.box(g,.12,4,.12,side*5.25,2,3,0x314c49);const lamp=this.box(g,.82,.12,.26,side*5,4,3,0xfff1b7);lamp.material=new THREE.MeshStandardMaterial({color:0xfff3bd,emissive:0xffd779,emissiveIntensity:night?1.8:.3,roughness:.4});if(i%4===0){const cloud=new THREE.Group();for(const q of [-1,0,1])this.ball(cloud,1.6-q*q*.3,q*1.6,0,0,0xf2f5ec);cloud.position.set(side*12,12+i%3*1.4,-3);g.add(cloud);}
 }}
 }
 obstacle(o){
 const g=new THREE.Group(),t=o.type;
 if(t==='train'){const c=[0x258f95,0xe5a25d,0xcd7787][o.variant||0];this.box(g,2.2,2.4,14,0,1.4,0,c);this.box(g,2.25,.2,13.8,0,2.65,0,0xe7ebd6);this.box(g,1.7,.8,.08,0,1.9,7.04,0x304f61);this.box(g,1.8,.45,.1,0,.8,7.07,0xf4d992);for(const x of [-.72,.72])this.ball(g,.12,x,1.07,7.13,0xfff2c3);for(const z of [-5,-2,1,4])for(const x of [-1.11,1.11])this.box(g,.04,.85,1.65,x,1.9,z,0xb8e5dd);}
 else if(t==='ramp'){const geo=new THREE.BufferGeometry();const v=[-1,0,2.5,1,0,2.5,-1,2.7,-2.5,1,0,2.5,1,2.7,-2.5,-1,2.7,-2.5];geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.computeVertexNormals();g.add(new THREE.Mesh(geo,this.mat(0xe8b86d)));}
 else if(t==='low'){this.box(g,2.1,1,.5,0,.5,0,0xf39365);for(const x of [-.7,0,.7]){const b=this.box(g,.18,.9,.03,x,.5,.27,0xffefd1);b.rotation.z=-.4;}}
 else if(t==='bar'){for(const x of [-.96,.96])this.box(g,.18,2.5,.3,x,1.25,0,0xf7c568);this.box(g,2.1,1.15,.4,0,1.95,0,0xe66f60);this.box(g,1.6,.14,.05,0,1.9,.23,0xfff3cd);}
 else if(t==='wall'){this.box(g,2.2,3.1,.8,0,1.55,0,0x849fa5);for(const y of [.5,1.4,2.3])this.box(g,2,.08,.04,0,y,.42,0xc5d4cf);}
 else if(t==='coin'){const mesh=new THREE.Mesh(new THREE.TorusGeometry(.32,.095,10,20),this.metal(0xffc338,.18));mesh.castShadow=true;g.add(mesh);const core=this.box(g,.09,.3,.09,0,0,0,0xffda6e);core.material=new THREE.MeshStandardMaterial({color:0xffd85b,emissive:0xffad21,emissiveIntensity:.35,roughness:.25,metalness:.45});}
 else{const c=NaiwaCore.POWERS[t].color;this.ball(g,.47,0,0,0,c);const glyph=this.box(g,.13,.6,.12,0,0,.44,0xffffff);if(t==='magnet'){this.box(g,.4,.12,.1,0,-.23,.46,0xffffff);this.box(g,.1,.5,.1,-.2,0,.46,0xffffff);this.box(g,.1,.5,.1,.2,0,.46,0xffffff);}if(t==='jet')glyph.rotation.z=.7;}
 return g;
 }
 resize(){const w=this.mount.clientWidth,h=this.mount.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
 selectActor(id){this.actor=id;}
 setQuality(q){this.renderer.setPixelRatio(Math.min(devicePixelRatio,q==='low'?1:1.75));this.renderer.shadowMap.enabled=q!=='low';this.sun.shadow.mapSize.set(q==='low'?1024:2048,q==='low'?1024:2048);}
 render(run,dt,t){
 const playing=run.state!=='menu',moving=run.state==='running';const time=playing?run.time:t;const distance=playing?run.distance:0;
 for(let i=0;i<this.sleepers.length;i++)this.sleepers[i].position.z=10-((i*2.7-distance)%243+243)%243;
 for(let i=0;i<this.chunks.length;i++)this.chunks[i].position.z=12-((i*12-distance)%192+192)%192;
 this.homeTrains.visible=!playing;
 const alive=new Set();for(const o of playing?run.objects:[]){alive.add(o.id);let g=this.objects.get(o.id);if(!g){g=this.obstacle(o);this.objects.set(o.id,g);this.scene.add(g);}g.position.set(o.lane*2.8,o.y,-o.d);if(o.type==='coin'||NaiwaCore.POWERS[o.type]){g.rotation.y=time*2;g.position.y+=Math.sin(time*3+o.id)*.12;}}
 for(const [id,g]of this.objects)if(!alive.has(id)){this.scene.remove(g);g.traverse(x=>{if(x.geometry&&x.geometry!==this.boxGeo&&x.geometry!==this.sphereGeo)x.geometry.dispose();});this.objects.delete(id);}
 for(const [id,g]of Object.entries(this.actors)){
 g.visible=playing?(id==='runner'||run.chase>0):id===this.actor;g.rotation.set(0,playing?0:Math.PI+.25,0);g.scale.setScalar(id==='dog'?1.05:1);
 if(playing){g.position.set(id==='runner'?run.x*2.8:id==='bull'?-1.7:1.7,id==='runner'?run.y:0,id==='runner'?0:3.7);if(id==='runner'&&run.slide>0){g.scale.y=.42;g.rotation.x=-.28;}}
 else{g.position.set(0,Math.sin(t*2)*.035,0);g.scale.multiplyScalar(1.3);}
 for(const b of g.userData.bones){b.quaternion.copy(b.userData.rest);if(/hip|arm/.test(b.name)){const phase=/R|right/.test(b.name)?Math.PI:0;b.rotateX(Math.sin(time*(playing?13:2)+phase)*(playing?.7:.06));}}
 }
 const player=this.actors.runner;this.bubble.visible=playing&&run.effects.shield>0;this.bubble.position.copy(player.position).y+=1.1;this.board.visible=playing&&run.effects.board>0;this.board.position.copy(player.position).y+=.12;
 this.jetpack.visible=playing&&run.effects.jet>0;this.jetpack.position.copy(player.position);this.shoes.visible=playing&&run.effects.boots>0;this.shoes.position.copy(player.position);
if(playing){const lift=run.effects.jet>0?run.y*.8:Math.max(0,run.y-2)*.4;this.camera.position.set(run.x*1.8,5.5+lift,this.camera.aspect<.7?13:10.5);this.camera.lookAt(run.x*.6,1.4+lift,-18);}else{this.camera.position.set(6,4.6,11);this.camera.lookAt(0,1.25,-3);}
 this.renderer.render(this.scene,this.camera);
 }
}
