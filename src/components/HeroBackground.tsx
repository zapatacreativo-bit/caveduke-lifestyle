import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const fragmentShader = `
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 vUv;

// Noise function
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));
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
  
  // Create a slow, elegant fluid movement
  float time = u_time * 0.15;
  
  // Mouse interaction displacement
  float distToMouse = distance(uv, u_mouse);
  float mouseForce = exp(-distToMouse * 4.0) * 0.5;
  
  vec2 noisePos = uv * 2.0;
  noisePos.x += time * 0.1 + (u_mouse.x * mouseForce * 0.5);
  noisePos.y -= time * 0.2 + (u_mouse.y * mouseForce * 0.5);
  
  float noise1 = snoise(noisePos * 1.5);
  float noise2 = snoise(noisePos * 3.0 + time);
  float noise3 = snoise(noisePos * 6.0 - time * 0.5);
  
  // Combine noise for cloudy/smoky texture
  float finalNoise = noise1 * 0.5 + noise2 * 0.25 + noise3 * 0.125;
  finalNoise = finalNoise * 0.5 + 0.5; // normalize to 0-1
  
  // Colors (Noir, Bordeaux, Mist)
  vec3 colorNoir = vec3(0.04, 0.04, 0.04);
  vec3 colorMist = vec3(0.24, 0.17, 0.24); // #3D2B3D
  vec3 colorBordeaux = vec3(0.42, 0.11, 0.16); // #6B1D2A
  
  // Map noise to colors
  vec3 bg = mix(colorNoir, colorMist, finalNoise * 0.8);
  
  // Add highlight peaks of bordeaux
  float highlight = smoothstep(0.6, 0.9, finalNoise);
  vec3 color = mix(bg, colorBordeaux, highlight * 0.6);
  
  // Vignette effect
  float vignette = distance(uv, vec2(0.5));
  vignette = smoothstep(0.8, 0.2, vignette);
  
  gl_FragColor = vec4(color * vignette, 1.0);
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const FluidPlane = () => {
    const mesh = useRef<THREE.Mesh>(null);

    const uniforms = useMemo(() => ({
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2() },
        u_mouse: { value: new THREE.Vector2(0.5, 0.5) }
    }), []);

    useFrame((state) => {
        if (mesh.current) {
            const material = mesh.current.material as THREE.ShaderMaterial;
            material.uniforms.u_time.value = state.clock.elapsedTime;

            // Update resolution
            material.uniforms.u_resolution.value.set(
                state.size.width * state.viewport.dpr,
                state.size.height * state.viewport.dpr
            );

            // Smooth mouse un-normalization from [-1, 1] to [0, 1]
            // Invert Y because WebGL 0 is bottom
            const targetX = (state.pointer.x + 1) / 2;
            const targetY = (state.pointer.y + 1) / 2;

            material.uniforms.u_mouse.value.lerp(
                new THREE.Vector2(targetX, targetY),
                0.05 // lerp factor for smoothness
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

export default function HeroBackground() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas orthographic camera={{ position: [0, 0, 1] }} dpr={[1, 2]}>
                <FluidPlane />
            </Canvas>
        </div>
    );
}
