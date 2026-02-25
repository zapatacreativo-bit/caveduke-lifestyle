import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ----------------------------------------------------
// A truly spectacular, premium Golden Fireworks/Particle
// system leveraging custom shaders for smooth performance.
// ----------------------------------------------------

const particleVertexShader = `
uniform float u_time;
attribute float a_size;
attribute vec3 a_speed;
attribute float a_offset;
varying float v_alpha;

void main() {
    // Elegant floating physics
    vec3 pos = position;
    
    // Slow, organic movement
    float t = u_time * 0.2 + a_offset;
    pos.x += sin(t * a_speed.x) * 2.0;
    pos.y += cos(t * a_speed.y) * 2.5 + (u_time * 0.5 * a_speed.z); // slowly rise
    pos.z += sin(t * a_speed.z) * 1.5;

    // Wrap around height
    if (pos.y > 10.0) {
        pos.y -= 20.0;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Size attenuation based on depth and base size
    gl_PointSize = a_size * (30.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    // Twinkling alpha
    v_alpha = 0.3 + 0.7 * sin(t * 3.0);
}
`;

const particleFragmentShader = `
varying float v_alpha;

void main() {
    // Create a soft glowing circle (sparkle)
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if(ll > 0.5) discard;
    
    // Premium Gold color gradient
    vec3 colorOut = vec3(0.95, 0.8, 0.4); // #C9A96E base
    
    // Center is brighter
    float glow = exp(-ll * 4.0);
    
    gl_FragColor = vec4(colorOut * glow, v_alpha * glow * 1.5);
}
`;

const GoldenParticlesMesh = ({ count = 400 }) => {
    const pointsRef = useRef<THREE.Points>(null);

    const [positions, sizes, speeds, offsets] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const speeds = new Float32Array(count * 3);
        const offsets = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Spread widely
            positions[i * 3 + 0] = (Math.random() - 0.5) * 20; // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5; // z depth

            sizes[i] = Math.random() * 8.0 + 2.0; // varied sizes

            speeds[i * 3 + 0] = Math.random() * 2.0 + 0.5;
            speeds[i * 3 + 1] = Math.random() * 2.0 + 0.5;
            speeds[i * 3 + 2] = Math.random() * 1.0 + 0.2; // slight upward bias

            offsets[i] = Math.random() * 100.0;
        }

        return [positions, sizes, speeds, offsets];
    }, [count]);

    const uniforms = useMemo(() => ({
        u_time: { value: 0 }
    }), []);

    useFrame((state) => {
        if (pointsRef.current) {
            const mat = pointsRef.current.material as THREE.ShaderMaterial;
            mat.uniforms.u_time.value = state.clock.elapsedTime;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-a_size" count={count} array={sizes} itemSize={1} />
                <bufferAttribute attach="attributes-a_speed" count={count} array={speeds} itemSize={3} />
                <bufferAttribute attach="attributes-a_offset" count={count} array={offsets} itemSize={1} />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={particleVertexShader}
                fragmentShader={particleFragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};

export default function GoldenParticles({ className = "" }: { className?: string }) {
    return (
        <div className={`absolute inset-0 z-0 pointer-events-none ${className}`}>
            <Suspense fallback={null}>
                <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 2]}>
                    <GoldenParticlesMesh count={600} />
                </Canvas>
            </Suspense>
        </div>
    );
}
