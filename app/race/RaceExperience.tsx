'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type StopId = 'projects' | 'writing' | 'books' | 'about';

const stops: Array<{
  id: StopId;
  title: string;
  copy: string;
  href: string;
  position: [number, number, number];
  color: number;
}> = [
  {
    id: 'projects',
    title: 'Project paddock',
    copy: 'The public build archive: building, live, paused, retired, and still moving.',
    href: '/projects',
    position: [-6, 0.08, -2.7],
    color: 0xffcf33,
  },
  {
    id: 'writing',
    title: 'Essay garage',
    copy: 'Longer thoughts while I learn to have clearer opinions.',
    href: '/essays/my-name-is-jack',
    position: [4.8, 0.08, -3.6],
    color: 0x50b4ff,
  },
  {
    id: 'books',
    title: 'Reading stand',
    copy: 'Books I am reading and the annual goal I am chasing.',
    href: '/books',
    position: [6.2, 0.08, 2.7],
    color: 0x3da35d,
  },
  {
    id: 'about',
    title: 'Driver notes',
    copy: 'NYC, Cleveland sports, F1, climbing, hiking, working out, and building on the web.',
    href: '/',
    position: [-3.8, 0.08, 3.8],
    color: 0xff6b4a,
  },
];

const checkpointPositions = [
  new THREE.Vector3(0, 0, -4.7),
  new THREE.Vector3(6.9, 0, 0),
  new THREE.Vector3(0, 0, 4.7),
  new THREE.Vector3(-6.9, 0, 0),
];

export default function RaceExperience() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const keysRef = useRef(new Set<string>());
  const [activeStop, setActiveStop] = useState<(typeof stops)[number] | null>(null);
  const [lap, setLap] = useState(0);
  const [checkpoint, setCheckpoint] = useState(0);
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f5ee);

    const camera = new THREE.OrthographicCamera(-9, 9, 6, -6, 0.1, 100);
    camera.position.set(0, 10, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xffffff, 0x443322, 2.8);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 2.5);
    sun.position.set(4, 8, 3);
    sun.castShadow = true;
    scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 20),
      new THREE.MeshStandardMaterial({ color: 0xf8f5ee, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const track = new THREE.Mesh(
      new THREE.CircleGeometry(1, 128),
      new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.72 })
    );
    track.scale.set(8.5, 5.6, 1);
    track.rotation.x = -Math.PI / 2;
    track.position.y = 0.03;
    track.receiveShadow = true;
    scene.add(track);

    const inner = new THREE.Mesh(
      new THREE.CircleGeometry(1, 80),
      new THREE.MeshStandardMaterial({ color: 0xffcf33, roughness: 0.8 })
    );
    inner.scale.set(4.3, 2.05, 1);
    inner.rotation.x = -Math.PI / 2;
    inner.position.y = 0.06;
    scene.add(inner);

    const stripeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    for (let i = 0; i < 28; i += 1) {
      const angle = (i / 28) * Math.PI * 2;
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.75), stripeMaterial);
      stripe.position.set(Math.cos(angle) * 6.5, 0.04, Math.sin(angle) * 3.9);
      stripe.rotation.y = -angle;
      scene.add(stripe);
    }

    const car = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.28, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xff3f28, roughness: 0.45 })
    );
    body.castShadow = true;
    body.position.y = 0.24;
    car.add(body);

    const cockpit = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.22, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.35 })
    );
    cockpit.position.set(0, 0.48, -0.1);
    car.add(cockpit);

    car.position.set(0, 0, 4.15);
    car.rotation.y = Math.PI / 2;
    scene.add(car);

    stops.forEach((stop) => {
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(1.55, 0.14, 1.15),
        new THREE.MeshStandardMaterial({ color: stop.color, roughness: 0.5 })
      );
      pad.position.set(...stop.position);
      pad.castShadow = true;
      scene.add(pad);

      const pole = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 1.4, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x171717 })
      );
      pole.position.set(stop.position[0] - 0.72, 0.72, stop.position[2] - 0.42);
      scene.add(pole);
    });

    checkpointPositions.forEach((position, index) => {
      const marker = new THREE.Mesh(
        new THREE.TorusGeometry(0.35, 0.055, 8, 28),
        new THREE.MeshStandardMaterial({ color: index === 0 ? 0xff6b4a : 0x50b4ff })
      );
      marker.position.copy(position);
      marker.position.y = 0.12;
      marker.rotation.x = Math.PI / 2;
      scene.add(marker);
    });

    const velocity = { current: 0 };
    let heading = Math.PI / 2;
    let currentCheckpoint = 0;
    let animationId = 0;
    let lastTime = performance.now();

    function resize() {
      const rect = mount.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      const aspect = rect.width / Math.max(rect.height, 1);
      if (aspect < 0.8) {
        camera.left = -9;
        camera.right = 9;
        camera.top = 9 / aspect;
        camera.bottom = -9 / aspect;
      } else {
        camera.left = -7.2 * aspect;
        camera.right = 7.2 * aspect;
        camera.top = 7.2;
        camera.bottom = -7.2;
      }
      camera.updateProjectionMatrix();
    }

    function onKeyDown(event: KeyboardEvent) {
      keysRef.current.add(event.key.toLowerCase());
    }

    function onKeyUp(event: KeyboardEvent) {
      keysRef.current.delete(event.key.toLowerCase());
    }

    function updateCar(delta: number) {
      const keys = keysRef.current;
      const accelerating = keys.has('arrowup') || keys.has('w');
      const braking = keys.has('arrowdown') || keys.has('s');
      const left = keys.has('arrowleft') || keys.has('a');
      const right = keys.has('arrowright') || keys.has('d');

      if (accelerating) velocity.current += 5.2 * delta;
      if (braking) velocity.current -= 4.8 * delta;
      velocity.current *= 0.982;
      velocity.current = THREE.MathUtils.clamp(velocity.current, -2.2, 5.4);

      const turnPower = THREE.MathUtils.clamp(Math.abs(velocity.current) / 3, 0.35, 1);
      if (left) heading += 2.7 * turnPower * delta;
      if (right) heading -= 2.7 * turnPower * delta;

      car.position.x += Math.sin(heading) * velocity.current * delta;
      car.position.z += Math.cos(heading) * velocity.current * delta;
      car.rotation.y = heading;

      const outer = (car.position.x / 8.6) ** 2 + (car.position.z / 5.7) ** 2;
      const innerBoundary = (car.position.x / 4.5) ** 2 + (car.position.z / 2.25) ** 2;
      if (outer > 1 || innerBoundary < 1) {
        velocity.current *= -0.28;
        car.position.x -= Math.sin(heading) * 0.22;
        car.position.z -= Math.cos(heading) * 0.22;
      }

      camera.position.x = car.position.x * 0.22;
      camera.position.z = 8 + car.position.z * 0.22;
      camera.lookAt(car.position.x * 0.18, 0, car.position.z * 0.18);

      const expected = checkpointPositions[currentCheckpoint];
      if (car.position.distanceTo(expected) < 1.25) {
        currentCheckpoint = (currentCheckpoint + 1) % checkpointPositions.length;
        setCheckpoint(currentCheckpoint);
        if (currentCheckpoint === 0) setLap((value) => value + 1);
      }

      const stop = stops.find((candidate) => {
        const position = new THREE.Vector3(...candidate.position);
        return car.position.distanceTo(position) < 1.25 && Math.abs(velocity.current) < 0.65;
      });
      setActiveStop((current) => (current?.id === stop?.id ? current : stop || null));
      setSpeed(Math.round(Math.abs(velocity.current) * 28));
    }

    function animate(time: number) {
      const delta = Math.min((time - lastTime) / 1000, 0.04);
      lastTime = time;
      updateCar(delta);
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <section className="race-stage">
      <div ref={mountRef} className="race-canvas" />
      <div className="race-hud">
        <div><span>Lap</span><strong>{lap}</strong></div>
        <div><span>Checkpoint</span><strong>{checkpoint + 1}/4</strong></div>
        <div><span>Speed</span><strong>{speed}</strong></div>
      </div>
      {activeStop && (
        <div className="pit-panel">
          <span>Pit stop</span>
          <h2>{activeStop.title}</h2>
          <p>{activeStop.copy}</p>
          <a href={activeStop.href}>Open</a>
        </div>
      )}
    </section>
  );
}
