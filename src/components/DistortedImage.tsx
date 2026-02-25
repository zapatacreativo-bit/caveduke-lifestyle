import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

const vertexShader = `
uniform float u_time;
uniform float u_hoverState;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Gentle wave effect on hover
  float wave = sin(pos.x * 5.0 + u_time * 2.0) * 0.05 * u_hoverState;
  float wave2 = cos(pos.y * 3.0 + u_time * 1.5) * 0.05 * u_hoverState;
  
  pos.z += wave + wave2;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D u_image;
uniform float u_time;
uniform float u_hoverState;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  
  // Liquid distortion effect
  float distortX = sin(uv.y * 10.0 + u_time * 2.0) * 0.02 * u_hoverState;
  float distortY = cos(uv.x * 10.0 + u_time * 2.0) * 0.02 * u_hoverState;
  
  vec4 textureColor = texture2D(u_image, uv + vec2(distortX, distortY));
  
  // Slight color shift on hover
  vec3 finalColor = textureColor.rgb;
  if(u_hoverState > 0.0) {
    // Warm vintage tint 
    finalColor.r += 0.05 * u_hoverState;
    finalColor.b -= 0.05 * u_hoverState;
  }
  
  gl_FragColor = vec4(finalColor, textureColor.a);
}
`;

interface DistortedImageProps {
    url: string;
}

const ImageMesh = ({ url }: DistortedImageProps) => {
    const mesh = useRef<THREE.Mesh>(null);
    const texture = useTexture(url);
    const [hovered, setHover] = useState(false);

    // Need to ensure texture covers well
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;

    const uniforms = useMemo(() => ({
        u_image: { value: texture },
        u_time: { value: 0 },
        u_hoverState: { value: 0 }
    }), [texture]);

    useFrame((state) => {
        if (mesh.current) {
            const material = mesh.current.material as THREE.ShaderMaterial;
            material.uniforms.u_time.value = state.clock.elapsedTime;

            // Smoothly interpolate hover state
            material.uniforms.u_hoverState.value = THREE.MathUtils.lerp(
                material.uniforms.u_hoverState.value,
                hovered ? 1 : 0,
                0.05
            );
        }
    });

    return (
        <mesh
            ref={mesh}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            scale={[1, 1, 1]}
        >
            <planeGeometry args={[1, 1, 32, 32]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
            />
        </mesh>
    );
};

export default function DistortedImage({ url }: DistortedImageProps) {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas
                camera={{ position: [0, 0, 0.8], fov: 75 }}
                dpr={[1, 2]}
            >
                <ImageMesh url={url} />
            </Canvas>
        </div>
    );
}
