(() => {
'use strict';
try {
 const T=THREE, data=window.NaiwaModels, bytes=Uint8Array.from(atob(data.binary),c=>c.charCodeAt(0)), buffer=bytes.buffer;
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor(0,0);renderer.domElement.id='actors';
 Object.assign(renderer.domElement.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none'});
 document.getElementById('world').after(renderer.domElement);
 const scene=new T.Scene(),camera=new T.OrthographicCamera(0,390,844,0,.1,2000);
 camera.position.set(0,0,500);camera.lookAt(0,0,0);
 scene.add(new T.HemisphereLight(0xfffaf1,0x63785e,2.2));
 const light=new T.DirectionalLight(0xffffff,2.1);light.position.set(-100,250,300);scene.add(light);
 const actors={}, loader=new T.TextureLoader();
 for(const name of ['runner','bull','dog']){
  const d=data.manifest.characters[name].children[0],g=new T.BufferGeometry();
  for(const [field,key,size] of [['positions','position',3],['normals','normal',3],['uvs','uv',2],['skinWeights','skinWeight',4],['skinIndices','skinIndex',4]]){
   const spec=d[field];if(!spec)continue;const Type=spec.type==='Uint16Array'?Uint16Array:Float32Array;
   g.setAttribute(key,new T.BufferAttribute(new Type(buffer,spec.offset,spec.length),size));
  }
  const index=d.indices;g.setIndex(new T.BufferAttribute(new Uint16Array(buffer,index.offset,index.length),1));
  const texture=loader.load(data.textures[name]);texture.flipY=false;texture.colorSpace=T.SRGBColorSpace;
  const mat=new T.MeshStandardMaterial({map:texture,roughness:.9,metalness:0,side:T.DoubleSide});
  const mesh=new T.SkinnedMesh(g,mat),bones=d.rig.map(b=>{const bone=new T.Bone();bone.name=b.name;new T.Matrix4().fromArray(b.matrix).decompose(bone.position,bone.quaternion,bone.scale);return bone;});
  d.rig.forEach((b,i)=>{if(b.parent<0)mesh.add(bones[i]);else bones[b.parent].add(bones[i]);});
  mesh.bind(new T.Skeleton(bones));mesh.frustumCulled=false;
  const group=new T.Group();group.add(mesh);scene.add(group);
  actors[name]={group,mesh,bones,rest:bones.map(b=>b.quaternion.clone())};
 }
 let width=0,height=0,selected='runner';
 window.NaiwaActorView={
  select(name){if(actors[name])selected=name;},
  names:['runner','bull','dog'],
  draw({w,h,x,y,jump,slide,time,state,skin}){
   if(width!==w||height!==h){width=w;height=h;renderer.setSize(w,h,false);camera.right=w;camera.top=h;camera.updateProjectionMatrix();}
   const home=state==='menu', active=actors[home?selected:'runner'];
   for(const actor of Object.values(actors))actor.group.visible=actor===active;
   const scale=home?Math.min(w/390,1.25)*76:Math.min(w/390,1)*57;
   active.group.position.set(x,h-y+jump*57,0);
   active.group.scale.set(scale,scale*(slide>0?.48:1),scale);
   active.group.rotation.y=home?Math.PI+Math.sin(time*.55)*.22:0;
   if(state==='running')active.group.position.y+=Math.abs(Math.sin(time*11))*3;
   active.bones.forEach((bone,i)=>{bone.quaternion.copy(active.rest[i]);if(state==='running'&&slide<=0){let phase=bone.name.endsWith('_L')?0:Math.PI;if(/^(hip|arm)_/.test(bone.name))bone.rotateX(Math.sin(time*11+phase)*.35);}});
   active.mesh.material.color.set(skin===0?'#ffffff':['#ffffff','#ffdbdb','#dce1ff','#fff0cd'][skin]);
   renderer.render(scene,camera);
  }
 };
}catch(error){console.error('Model initialization failed',error);window.NaiwaModelError=String(error);}
})();