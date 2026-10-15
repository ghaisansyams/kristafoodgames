import { Canvas } from '@react-three/fiber';
import { Float, Torus } from '@react-three/drei';

/**
 * A small real WebGL scene — glossy floating orbs plus a translucent wireframe ring — echoing
 * the look of the ghaisansyams.vercel.app 3D portfolio hero, but recolored to the kiosk's own
 * indigo/violet/teal/pink glass palette instead of that site's own colors. Purely decorative
 * and non-interactive: no orbit controls, no pointer events, so it never competes with the
 * touch UI sitting in front of it.
 */
export default function HologramScene({ className = '' }: { className?: string }) {
    return (
        <div className={`pointer-events-none ${className}`}>
            <Canvas
                dpr={[1, 1.5]}
                gl={{ alpha: true, antialias: true }}
                camera={{ position: [0, 0, 9], fov: 40 }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.7} />
                <pointLight position={[5, 5, 5]} intensity={60} color="#ffffff" />
                <pointLight position={[-5, -3, 4]} intensity={30} color="#c4b5fd" />

                <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
                    <mesh position={[-1.6, 2.1, -1]}>
                        <sphereGeometry args={[0.85, 48, 48]} />
                        <meshPhysicalMaterial color="#fbbf24" roughness={0.25} metalness={0.1} clearcoat={1} clearcoatRoughness={0.1} />
                    </mesh>
                </Float>

                <Float speed={1.1} rotationIntensity={0.5} floatIntensity={1.4}>
                    <mesh position={[1.7, 1.4, -0.5]}>
                        <sphereGeometry args={[1.05, 48, 48]} />
                        <meshPhysicalMaterial color="#5eead4" roughness={0.2} metalness={0.1} clearcoat={1} clearcoatRoughness={0.1} />
                    </mesh>
                </Float>

                <Float speed={1.3} rotationIntensity={0.4} floatIntensity={1.1}>
                    <mesh position={[1.9, -1.6, 0.3]}>
                        <sphereGeometry args={[0.75, 48, 48]} />
                        <meshPhysicalMaterial color="#c084fc" roughness={0.25} metalness={0.1} clearcoat={1} clearcoatRoughness={0.1} />
                    </mesh>
                </Float>

                <Float speed={0.9} rotationIntensity={0.3} floatIntensity={1} floatingRange={[-0.3, 0.3]}>
                    <mesh position={[-0.6, -2, 0.6]}>
                        <sphereGeometry args={[1.3, 48, 48]} />
                        <meshPhysicalMaterial color="#6366f1" roughness={0.2} metalness={0.15} clearcoat={1} clearcoatRoughness={0.1} />
                    </mesh>
                </Float>

                <Float speed={0.6} rotationIntensity={1} floatIntensity={0.6}>
                    <Torus args={[2.15, 0.22, 24, 120]} rotation={[0.5, 0.3, 0]}>
                        <meshStandardMaterial color="#34d399" wireframe transparent opacity={0.55} />
                    </Torus>
                </Float>
            </Canvas>
        </div>
    );
}
