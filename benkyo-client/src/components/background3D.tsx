import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Background3DProps {
    isDarkMode: boolean;
}

const Background3D: React.FC<Background3DProps> = ({ isDarkMode }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    // Refs to hold objects for theme updates
    const sceneRef = useRef<THREE.Scene | null>(null);
    const particlesMaterialRef = useRef<THREE.PointsMaterial | null>(null);
    const shapesMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        // --- SETUP ---
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const bgHex = isDarkMode ? 0x0f172a : 0xf8fafc;
        scene.background = new THREE.Color(bgHex);
        scene.fog = new THREE.FogExp2(bgHex, 0.05);

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
        camera.position.z = 10;
        camera.position.y = 2;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        container.appendChild(renderer.domElement);

        // --- PARTICLES ---
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 700;
        const posArray = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 40;
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.05,
            color: 0x6366f1,
            transparent: true,
            opacity: isDarkMode ? 0.9 : 0.6
        });
        particlesMaterialRef.current = particlesMaterial;
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // --- SHAPES ---
        const shapesGroup = new THREE.Group();
        scene.add(shapesGroup);
        const geometries = [
            new THREE.IcosahedronGeometry(0.5, 0),
            new THREE.OctahedronGeometry(0.5, 0),
            new THREE.TetrahedronGeometry(0.5, 0)
        ];
        const shapeMaterial = new THREE.MeshBasicMaterial({
            color: 0xec4899,
            wireframe: true,
            transparent: true,
            opacity: isDarkMode ? 0.3 : 0.15 // Set initial opacity based on prop
        });
        shapesMaterialRef.current = shapeMaterial;

        const shapes: { mesh: THREE.Mesh; speedRot: number; speedFly: number }[] = [];
        for (let i = 0; i < 15; i++) {
            const geo = geometries[Math.floor(Math.random() * geometries.length)];
            const mesh = new THREE.Mesh(geo, shapeMaterial);
            mesh.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10);
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            const scale = Math.random() * 0.5 + 0.5;
            mesh.scale.set(scale, scale, scale);
            shapesGroup.add(mesh);
            shapes.push({
                mesh,
                speedRot: (Math.random() - 0.5) * 0.01,
                speedFly: Math.random() * 0.005 + 0.001
            });
        }

        // --- EVENTS & ANIMATION ---
        let mouseX = 0;
        let mouseY = 0;
        const handleMouseMove = (event: MouseEvent) => {
            mouseX = event.clientX / window.innerWidth - 0.5;
            mouseY = event.clientY / window.innerHeight - 0.5;
        };

        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);

        const clock = new THREE.Clock();
        let animationId: number;
        let isMounted = true;

        const animate = () => {
            if (!isMounted) return;

            const elapsedTime = clock.getElapsedTime();
            camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
            camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;
            camera.lookAt(0, 0, 0);

            particlesMesh.rotation.y = elapsedTime * 0.05;
            particlesMesh.rotation.x = mouseY * 0.2;

            shapes.forEach((item) => {
                item.mesh.rotation.x += item.speedRot;
                item.mesh.rotation.y += item.speedRot;
                item.mesh.position.y += Math.sin(elapsedTime + item.mesh.position.x) * 0.002;
            });

            renderer.render(scene, camera);
            animationId = requestAnimationFrame(animate);
        };

        animate();

        // --- CLEANUP ---
        return () => {
            isMounted = false;
            cancelAnimationFrame(animationId);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);

            if (container && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }

            // Dispose Three.js resources
            geometries.forEach((g) => g.dispose());
            particlesGeometry.dispose();
            shapeMaterial.dispose();
            particlesMaterial.dispose();

            renderer.dispose();
        };
    }, []);

    // --- THEME UPDATE ---
    useEffect(() => {
        if (!sceneRef.current) return;

        const bgHex = isDarkMode ? 0x0f172a : 0xf8fafc;
        sceneRef.current.background = new THREE.Color(bgHex);
        sceneRef.current.fog = new THREE.FogExp2(bgHex, 0.05);

        if (particlesMaterialRef.current) {
            particlesMaterialRef.current.opacity = isDarkMode ? 0.9 : 0.6;
        }
        if (shapesMaterialRef.current) {
            shapesMaterialRef.current.opacity = isDarkMode ? 0.3 : 0.15;
        }
    }, [isDarkMode]);

    return <div ref={mountRef} className='fixed top-0 left-0 w-full h-full z-0 pointer-events-none' />;
};

export default Background3D;
