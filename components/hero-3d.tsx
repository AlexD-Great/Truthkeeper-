"use client"

import { Canvas, extend, useFrame, useThree } from "@react-three/fiber"
import { useAspect, useTexture } from "@react-three/drei"
import { useMemo, useRef, useState, useEffect } from "react"
import * as THREE from "three"
import type { Mesh } from "three"

const TEXTUREMAP = { src: "https://i.postimg.cc/XYwvXN8D/img-4.png" }
const DEPTHMAP = { src: "https://i.postimg.cc/2SHKQh2q/raw-4.webp" }

extend(THREE as any)

const PostProcessing = ({
  strength = 1,
  threshold = 1,
  fullScreenEffect = true,
}: {
  strength?: number
  threshold?: number
  fullScreenEffect?: boolean
}) => {
  const { gl, scene, camera } = useThree()
  const progressRef = useRef(0)

  useFrame(({ clock }) => {
    // Animate the scan line from top to bottom
    progressRef.current = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5
    gl.render(scene, camera)
  }, 1)

  return null
}

const WIDTH = 300
const HEIGHT = 300

const Scene = () => {
  const [rawMap, depthMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src])

  const meshRef = useRef<Mesh>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show image after textures load
    if (rawMap && depthMap) {
      setVisible(true)
    }
  }, [rawMap, depthMap])

  const { material, uniforms } = useMemo(() => {
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform sampler2D uDepthMap;
      uniform vec2 uPointer;
      uniform float uProgress;
      uniform float uTime;
      varying vec2 vUv;

      void main() {
        float depth = texture2D(uDepthMap, vUv).r;
        vec2 offset = depth * uPointer * 0.01;
        vec3 color = texture2D(uTexture, vUv + offset).rgb;
        
        // Add scanning effect
        float scanLine = abs(vUv.y - uProgress);
        float scan = smoothstep(0.0, 0.05, scanLine);
        vec3 redOverlay = vec3(1.0, 0.0, 0.0) * (1.0 - scan) * 0.4;
        
        // Add grid pattern
        vec2 grid = mod(vUv * 120.0, 2.0) - 1.0;
        float gridDist = length(grid);
        float dot = smoothstep(0.5, 0.49, gridDist);
        
        // Flow effect
        float flow = 1.0 - smoothstep(0.0, 0.02, abs(depth - uProgress));
        vec3 mask = vec3(dot * flow * 10.0, 0.0, 0.0);
        
        color = color + mask + redOverlay;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: rawMap },
        uDepthMap: { value: depthMap },
        uPointer: { value: new THREE.Vector2(0) },
        uProgress: { value: 0 },
        uTime: { value: 0 },
      },
      transparent: true,
    })

    return {
      material,
      uniforms: material.uniforms,
    }
  }, [rawMap, depthMap])

  const [w, h] = useAspect(WIDTH, HEIGHT)

  useFrame(({ clock, pointer }) => {
    if (uniforms) {
      uniforms.uProgress.value = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5
      uniforms.uPointer.value = pointer
      uniforms.uTime.value = clock.getElapsedTime()
    }

    // Smooth fade in
    if (meshRef.current && material) {
      material.opacity = THREE.MathUtils.lerp(material.opacity, visible ? 1 : 0, 0.07)
    }
  })

  const scaleFactor = 0.6
  return (
    <mesh ref={meshRef} scale={[w * scaleFactor, h * scaleFactor, 1]} material={material}>
      <planeGeometry />
    </mesh>
  )
}

export const Html = () => {
  const titleWords = "Neural Link".split(" ")
  const subtitle = "The future of human-computer interaction is here."
  const [visibleWords, setVisibleWords] = useState(0)
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const [delays, setDelays] = useState<number[]>([])
  const [subtitleDelay, setSubtitleDelay] = useState(0)

  useEffect(() => {
    // Only on client: generate random delays for glitch
    setDelays(titleWords.map(() => Math.random() * 0.07))
    setSubtitleDelay(Math.random() * 0.1)
  }, [titleWords.length])

  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timeout = setTimeout(() => setVisibleWords(visibleWords + 1), 600)
      return () => clearTimeout(timeout)
    } else {
      const timeout = setTimeout(() => setSubtitleVisible(true), 800)
      return () => clearTimeout(timeout)
    }
  }, [visibleWords, titleWords.length])

  return (
    <div className="h-svh bg-black relative w-full overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-50">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-black via-black/80 to-transparent"></div>
      </div>

      <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none"></div>

      <div className="h-svh uppercase items-center w-full absolute z-60 pointer-events-none px-10 flex justify-center flex-col">
        <div className="text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold">
          <div className="flex space-x-2 lg:space-x-6 overflow-hidden text-white drop-shadow-2xl">
            {titleWords.map((word, index) => (
              <div
                key={index}
                className={index < visibleWords ? "fade-in" : ""}
                style={{
                  animationDelay: `${index * 0.13 + (delays[index] || 0)}s`,
                  opacity: index < visibleWords ? undefined : 0,
                  textShadow: "0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 0, 0, 0.3)",
                }}
              >
                {word}
              </div>
            ))}
          </div>
        </div>
        <div className="text-lg md:text-xl mt-2 overflow-hidden text-white font-bold">
          <div
            className={`${subtitleVisible ? "fade-in-subtitle" : ""} max-w-4xl mx-auto text-center px-4`}
            style={{
              animationDelay: `${titleWords.length * 0.13 + 0.2 + subtitleDelay}s`,
              opacity: subtitleVisible ? undefined : 0,
              textShadow: "0 0 15px rgba(255, 255, 255, 0.3)",
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      <Canvas
        className="absolute inset-0 w-full h-full"
        style={{ background: "#000000" }}
        camera={{
          position: [0, 0, 1],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: false,
          preserveDrawingBuffer: true,
          clearColor: "#000000",
        }}
        dpr={[1, 2]}
      >
        <PostProcessing fullScreenEffect={true} />
        <Scene />
      </Canvas>
    </div>
  )
}

export default Html
