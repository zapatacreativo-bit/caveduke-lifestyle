import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const fragmentShader = `
uniform float u_time;
uniform vec2 u_resolution;
varying vec2 vUv;

// Noise functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i); 
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy/u_resolution.xy;
  float t = u_time * 0.15; // Speed of the fluid
  
  // Distortion vectors for organic mesh feel
  vec2 p = uv;
  p.x += sin(t + p.y * 3.0) * 0.3;
  p.y += cos(t * 0.8 + p.x * 2.0) * 0.3;
  
  float n1 = snoise(p * 2.0 + t);
  float n2 = snoise(p * 4.0 - t * 0.5);
  
  // Combine noise to create flowing shapes
  float mask = (n1 + n2) * 0.5 + 0.5;
  
  // Premium dark brand colors
  vec3 colNoir = vec3(0.04, 0.04, 0.04);
  vec3 colWine = vec3(0.2, 0.05, 0.08); // Very deep bordeaux for mesh 
  vec3 colDeepTone = vec3(0.08, 0.05, 0.07);
  
  // Blending the colors softly for quiet luxury
  vec3 color = mix(colNoir, colWine, mask);
  color = mix(color, colDeepTone, smoothstep(0.4, 0.9, mask) * 0.5);
  
  gl_FragColor = vec4(color, 1.0);
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const GradientPlane = () => {
    const mesh = useRef<THREE.Mesh>(null);

    const uniforms = useMemo(() => ({
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2() },
    }), []);

    useFrame((state) => {
        if (mesh.current) {
            const material = mesh.current.material as THREE.ShaderMaterial;
            material.uniforms.u_time.value = state.clock.elapsedTime;

            // Maintain stable resolution
            material.uniforms.u_resolution.value.set(
                state.size.width * state.viewport.dpr,
                state.size.height * state.viewport.dpr
            );
        }
    });

    return (
        <mesh ref={mesh}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                depthWrite={false}
                depthTest={false}
            />
        </mesh>
    );
};

export default function MeshGradient() {
    return (
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
            <Suspense fallback={<div className="w-full h-full bg-[var(--color-noir)]"></div>}>
                <Canvas orthographic camera={{ position: [0, 0, 1] }} dpr={[1, 1.5]}>
                    <GradientPlane />
                </Canvas>
            </Suspense>
        </div>
    );
}
