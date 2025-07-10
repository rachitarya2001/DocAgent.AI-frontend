import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './ThreeBackground.css';

const ThreeBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            alpha: true,
            antialias: true
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create animated particles
        const particlesCount = 150;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particlesCount * 3);
        const velocities = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i += 3) {
            // Position
            positions[i] = (Math.random() - 0.5) * 100;
            positions[i + 1] = (Math.random() - 0.5) * 100;
            positions[i + 2] = (Math.random() - 0.5) * 100;

            // Velocity
            velocities[i] = (Math.random() - 0.5) * 0.02;
            velocities[i + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i + 2] = (Math.random() - 0.5) * 0.02;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0x6366f1,
            size: 1.5,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // Create connection lines
        const lineGeometry = new THREE.BufferGeometry();
        const linePositions = new Float32Array(particlesCount * 6);
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x6366f1,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
        });

        const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(lines);

        camera.position.z = 50;

        // Store references
        sceneRef.current = scene;
        rendererRef.current = renderer;

        // Animation loop
        const animate = () => {
            const positionsArray = particles.geometry.attributes.position.array as Float32Array;
            const linePositionsArray = lines.geometry.attributes.position.array as Float32Array;

            let lineIndex = 0;

            for (let i = 0; i < particlesCount * 3; i += 3) {
                // Update particle positions
                positionsArray[i] += velocities[i];
                positionsArray[i + 1] += velocities[i + 1];
                positionsArray[i + 2] += velocities[i + 2];

                // Wrap around boundaries
                if (Math.abs(positionsArray[i]) > 50) velocities[i] *= -1;
                if (Math.abs(positionsArray[i + 1]) > 50) velocities[i + 1] *= -1;
                if (Math.abs(positionsArray[i + 2]) > 50) velocities[i + 2] *= -1;

                // Create connections between nearby particles
                for (let j = i + 3; j < particlesCount * 3; j += 3) {
                    const dx = positionsArray[i] - positionsArray[j];
                    const dy = positionsArray[i + 1] - positionsArray[j + 1];
                    const dz = positionsArray[i + 2] - positionsArray[j + 2];
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (distance < 15 && lineIndex < linePositionsArray.length - 6) {
                        linePositionsArray[lineIndex] = positionsArray[i];
                        linePositionsArray[lineIndex + 1] = positionsArray[i + 1];
                        linePositionsArray[lineIndex + 2] = positionsArray[i + 2];
                        linePositionsArray[lineIndex + 3] = positionsArray[j];
                        linePositionsArray[lineIndex + 4] = positionsArray[j + 1];
                        linePositionsArray[lineIndex + 5] = positionsArray[j + 2];
                        lineIndex += 6;
                    }
                }
            }

            // Update geometries
            particles.geometry.attributes.position.needsUpdate = true;
            lines.geometry.attributes.position.needsUpdate = true;
            lines.geometry.setDrawRange(0, lineIndex / 3);

            // Rotate scene slowly
            scene.rotation.y += 0.001;
            scene.rotation.x += 0.0005;

            renderer.render(scene, camera);
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
            if (sceneRef.current) {
                sceneRef.current.clear();
            }
        };
    }, []);

    return <canvas ref={canvasRef} className="three-background" />;
};

export default ThreeBackground;