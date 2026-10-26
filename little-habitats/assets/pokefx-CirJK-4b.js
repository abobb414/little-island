import{Bn as e,O as t,U as n,V as r,gt as i,m as a,rt as o,vn as s,zn as c}from"./three.core-5PtfHpMM.js";var l={uTime:{value:0},uWindDir:{value:new c(.92,.38)},uWindStrength:{value:.6},uSnow:{value:0},uAutumn:{value:0},uBloom:{value:1},uDaylight:{value:1},uYear:{value:0},uSunDir:{value:new e(.5,.8,.3).normalize()}},u=`
uniform float uTime;
uniform vec2 uWindDir;
uniform float uWindStrength;
uniform float uSnow;
uniform float uAutumn;
uniform float uBloom;
uniform float uDaylight;
uniform float uYear;
uniform vec3 uSunDir;
varying vec3 vScWorldPos;
varying vec3 vScWorldNormal;
`,d=`
float sc_hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float sc_noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(sc_hash(i), sc_hash(i + vec2(1.0, 0.0)), u.x), mix(sc_hash(i + vec2(0.0, 1.0)), sc_hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
`,f=0;function p(e,t={}){let n=t.snow??0,r=t.wind,i=`sc${f++}|${n}|${r?`${r.amount},${r.height},${r.frequency??1}`:`-`}|${t.cacheKey??``}|${(t.vertexHeader??``)+(t.vertex??``)+(t.fragmentHeader??``)+(t.fragment??``)}`,a=e.onBeforeCompile;return e.onBeforeCompile=(i,o)=>{a?.call(e,i,o),Object.assign(i.uniforms,l,t.uniforms??{}),i.uniforms.uScSnowAmount={value:n},i.uniforms.uScWindAmount={value:r?.amount??0},i.uniforms.uScWindInvHeight={value:r?1/Math.max(1e-4,r.height):0},i.uniforms.uScWindFreq={value:r?.frequency??1},i.vertexShader=u+`uniform float uScWindAmount; uniform float uScWindInvHeight; uniform float uScWindFreq;
`+(t.vertexHeader??``)+`
`+i.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
#ifdef USE_INSTANCING
  mat4 sc_model = modelMatrix * instanceMatrix;
#else
  mat4 sc_model = modelMatrix;
#endif
  vec3 sc_origin = (sc_model * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  ${r?`{
    float sc_h = max(0.0, transformed.y) * uScWindInvHeight;
    float sc_phase = dot(sc_origin.xz, vec2(0.37, 0.53)) + uTime * 1.7 * uScWindFreq;
    float sc_gust = sin(sc_phase) * 0.55 + sin(sc_phase * 2.31 + 1.7) * 0.25 + 0.45;
    vec3 sc_wd = transpose(mat3(sc_model)) * vec3(uWindDir.x, 0.0, uWindDir.y);
    sc_wd = normalize(sc_wd + vec3(1e-5));
    transformed += sc_wd * sc_gust * uWindStrength * uScWindAmount * sc_h * sc_h;
  }`:``}
  ${t.vertex??``}
  vScWorldNormal = normalize(mat3(sc_model) * objectNormal);
  vScWorldPos = (sc_model * vec4(transformed, 1.0)).xyz;`),i.fragmentShader=u+`uniform float uScSnowAmount;
`+d+(t.fragmentHeader??``)+`
`+i.fragmentShader.replace(`#include <color_fragment>`,`#include <color_fragment>
  ${t.fragment??``}
  if (uScSnowAmount > 0.0 && uSnow > 0.0) {
    float sc_up = smoothstep(0.35, 0.8, normalize(vScWorldNormal).y);
    float sc_edge = sc_noise(vScWorldPos.xz * 3.1) * 0.35;
    float sc_s = smoothstep(0.0, 0.3, uSnow * uScSnowAmount * 1.15 - sc_edge) * sc_up;
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.95, 0.99), clamp(sc_s, 0.0, 1.0));
  }`)},e.customProgramCacheKey=()=>i,e.needsUpdate=!0,e}var m=192,h=`
attribute vec4 aA; // x y z birth
attribute vec4 aB; // vx vy vz life
attribute vec4 aC; // size shape gravity drag
uniform float uTime;
varying vec2 vUv;
varying float vLife;
varying float vShape;
varying vec3 vCol;
varying float vSeed;
void main() {
  float age = uTime - aA.w;
  float l = age / aB.w;
  vLife = l;
  vShape = aC.y;
  vUv = uv * 2.0 - 1.0;
  vSeed = fract(sin(aA.w * 91.7 + aA.x * 12.9) * 43758.5);
  #ifdef USE_INSTANCING_COLOR
    vCol = instanceColor;
  #else
    vCol = vec3(1.0);
  #endif
  if (l < 0.0 || l > 1.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
  float k = max(0.0001, aC.w);
  float T = (1.0 - exp(-k * age)) / k;
  vec3 p = aA.xyz + aB.xyz * T;
  p.y -= 0.5 * aC.z * age * age;
  float pop = min(1.0, l * 7.0);
  float grow = (1.0 - pow(1.0 - pop, 3.0)) * (1.0 + sin(pop * 3.14159) * 0.28);
  if (aC.y > 3.5 && aC.y < 4.5) grow = mix(0.4, 1.3, 1.0 - pow(1.0 - l, 2.0)); // puffs expand
  float shrink = 1.0 - smoothstep(0.72, 1.0, l) * 0.55;
  vec4 mv = viewMatrix * vec4(p, 1.0);
  float ang = (vSeed - 0.5) * 0.5 + (aC.y > 1.5 && aC.y < 2.5 ? age * (vSeed - 0.5) * 6.0 : 0.0);
  float ca = cos(ang), sa = sin(ang);
  vec2 q = vec2(ca * position.x - sa * position.y, sa * position.x + ca * position.y);
  mv.xy += q * aC.x * grow * shrink;
  gl_Position = projectionMatrix * mv;
}`,g=`
uniform float uDaylight;
varying vec2 vUv;
varying float vLife;
varying float vShape;
varying vec3 vCol;
varying float vSeed;
float sdEllipse(vec2 p, vec2 r) { return (length(p / r) - 1.0) * min(r.x, r.y); }
void main() {
  float l = clamp(vLife, 0.0, 1.0);
  vec2 p = vUv;
  float r = length(p);
  float a = 0.0;
  vec3 c = vCol;
  float fade = smoothstep(0.0, 0.08, l) * (1.0 - smoothstep(0.6, 1.0, l));
  if (vShape < 0.5) {
    a = smoothstep(1.0, 0.55, r);
    c *= 0.85 + 0.3 * smoothstep(0.9, 0.0, r);
  } else if (vShape < 1.5) {
    // heart
    vec2 h = vec2(p.x * 1.22, p.y * 1.22 + 0.16);
    float f = pow(h.x * h.x + h.y * h.y - 1.0, 3.0) - h.x * h.x * h.y * h.y * h.y;
    a = smoothstep(0.05, -0.02, f);
    float hi = smoothstep(0.35, 0.0, length(p - vec2(-0.38, 0.4)));
    c = mix(c, vec3(1.0, 0.93, 0.95), hi * 0.6);
    c *= 0.9 + 0.12 * p.y;
  } else if (vShape < 2.5) {
    // 4-point sparkle
    vec2 s = abs(p);
    float star = pow(s.x, 0.55) + pow(s.y, 0.55);
    a = smoothstep(1.0, 0.7, star);
    a = max(a, smoothstep(0.32, 0.0, r) * 0.9);
    c = mix(c, vec3(1.0, 0.98, 0.9), smoothstep(0.5, 0.0, r));
  } else if (vShape < 3.5) {
    // eighth note: head + stem + flag
    float head = sdEllipse((p - vec2(-0.3, -0.55)) * mat2(0.94, 0.34, -0.34, 0.94), vec2(0.36, 0.26));
    float stem = max(abs(p.x - 0.02) - 0.085, max(p.y - 0.78, -0.5 - p.y));
    vec2 fl = p - vec2(0.36, 0.5);
    float flag = max(sdEllipse(fl * mat2(0.8, -0.6, 0.6, 0.8), vec2(0.34, 0.16)), -(p.x - 0.04));
    float d = min(min(head, stem), flag);
    a = smoothstep(0.05, -0.03, d);
  } else if (vShape < 4.5) {
    // soft dust puff
    float n = 0.85 + 0.3 * fract(sin(dot(floor(p * 3.0 + vSeed * 9.0), vec2(12.9, 78.2))) * 43758.5);
    a = smoothstep(1.0, 0.15, r * n) * 0.85;
    c *= mix(0.8, 1.0, uDaylight);
    fade = smoothstep(0.0, 0.12, l) * pow(1.0 - l, 1.4);
  } else if (vShape < 5.5) {
    // water droplet: circle with a bright highlight
    a = smoothstep(1.0, 0.8, r);
    c = mix(c, vec3(1.0), smoothstep(0.5, 0.0, length(p - vec2(-0.3, 0.35))) * 0.85);
    c *= 0.92;
  } else {
    // five-point star
    float ang = atan(p.x, p.y);
    float k = 0.5 + 0.5 * cos(5.0 * ang);
    float rad = mix(0.42, 1.0, pow(k, 1.6));
    a = smoothstep(rad, rad - 0.16, r);
    c = mix(c, vec3(1.0, 0.98, 0.85), smoothstep(0.6, 0.0, r) * 0.8);
  }
  a *= fade;
  if (a < 0.01) discard;
  gl_FragColor = vec4(c, a);
  #include <colorspace_fragment>
}`,_=new a,v=class{mesh;aA;aB;aC;next=0;dirty=!1;constructor(e){let a=new i(2,2);this.aA=new r(new Float32Array(768),4).setUsage(t),this.aB=new r(new Float32Array(768),4).setUsage(t),this.aC=new r(new Float32Array(768),4).setUsage(t);for(let e=0;e<m;e++)this.aA.setXYZW(e,0,-1e5,0,-1e5),this.aB.setXYZW(e,0,0,0,1),this.aC.setXYZW(e,.1,0,0,1);a.setAttribute(`aA`,this.aA),a.setAttribute(`aB`,this.aB),a.setAttribute(`aC`,this.aC);let c=new s({vertexShader:h,fragmentShader:g,uniforms:{uTime:l.uTime,uDaylight:l.uDaylight},transparent:!0,depthWrite:!1});this.mesh=new n(a,c,m),this.mesh.name=`poke-fx`,this.mesh.frustumCulled=!1,this.mesh.renderOrder=10;let u=new o;for(let e=0;e<m;e++)this.mesh.setMatrixAt(e,u),this.mesh.setColorAt(e,_.setRGB(1,1,1));e.add(this.mesh)}emit(e,t,n,r,i,a,o,s,c,u,d=0,f=1.2,p=0){let h=this.next;this.next=(this.next+1)%m,this.aA.setXYZW(h,t,n,r,l.uTime.value+p),this.aB.setXYZW(h,i,a,o,s),this.aC.setXYZW(h,c,e,d,f),this.mesh.setColorAt(h,_.set(u)),this.aA.needsUpdate=this.aB.needsUpdate=this.aC.needsUpdate=!0,this.mesh.instanceColor&&(this.mesh.instanceColor.needsUpdate=!0)}hearts(e,t,n,r=3,i=.18,a=.055){for(let o=0;o<r;o++){let s=o/Math.max(1,r)*6.283+Math.random()*1.2,c=i*(.6+Math.random()*.6);this.emit(1,e,t,n,Math.cos(s)*c,.28+Math.random()*.14,Math.sin(s)*c,1.5+Math.random()*.4,a*(.85+Math.random()*.3),o%2?`#f58fa6`:`#ff7a95`,-.05,1.6,o*.09)}}sparkles(e,t,n,r=6,i=.35,a=.04,o=`#fff3b0`){for(let s=0;s<r;s++){let r=Math.random()*6.283,s=Math.random()*1.2-.2,c=i*(.5+Math.random());this.emit(2,e,t,n,Math.cos(r)*c,.15+s*.3,Math.sin(r)*c,.8+Math.random()*.5,a*(.7+Math.random()*.6),o,.15,2.4,Math.random()*.12)}}notes(e,t,n,r=2,i=`#4a3b2f`){for(let a=0;a<r;a++){let r=(a%2?1:-1)*(.06+Math.random()*.06);this.emit(3,e,t,n,r,.3+Math.random()*.1,Math.random()*.1-.05,1.5+Math.random()*.3,.06,i,-.02,1.4,a*.22)}}puff(e,t,n,r=3,i=.07,a=`#efe4c8`){for(let o=0;o<r;o++){let s=o/r*6.283+Math.random();this.emit(4,e,t+.01,n,Math.cos(s)*.16,.05+Math.random()*.05,Math.sin(s)*.16,.55+Math.random()*.25,i*(.8+Math.random()*.5),a,-.1,3.2)}}drops(e,t,n,r=6,i=1,a=`#dff6f6`){for(let o=0;o<r;o++){let r=Math.random()*6.283,o=(.2+Math.random()*.35)*i;this.emit(5,e,t,n,Math.cos(r)*o,(.9+Math.random()*.9)*i,Math.sin(r)*o,.55+Math.random()*.25,.017+Math.random()*.011,a,5.2,.4)}}stars(e,t,n,r=4,i=.05,a=`#ffd86b`){for(let o=0;o<r;o++){let s=o/r*6.283+Math.random()*.6;this.emit(6,e,t,n,Math.cos(s)*.35,.25+Math.random()*.2,Math.sin(s)*.35,1+Math.random()*.3,i,a,.5,1.8)}}},y=new WeakMap;function b(e){let t=y.get(e);return t||(t=new v(e.fauna?.object??e.scene),y.set(e,t)),t}export{p as n,l as r,b as t};