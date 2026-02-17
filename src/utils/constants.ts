// Scene defaults
export const DEFAULT_CAMERA_POSITION: [number, number, number] = [0, 15, 40]
export const DEFAULT_CAMERA_FOV = 60

// Planet scaling
export const PLANET_BASE_RADIUS = 0.3
export const PLANET_SCALE_FACTOR = 0.8
export const ORBIT_BASE_RADIUS = 8
export const ORBIT_SPACING = 3

// Sun
export const SUN_RADIUS = 5
export const SUN_SEGMENTS = 64

// Background
export const STAR_COUNT = 5000
export const STAR_RADIUS = 300
export const STAR_DEPTH = 100

// API
export const TOP_BILLIONAIRES_COUNT = 10
export const CACHE_TTL_MS = 1000 * 60 * 60 * 6 // 6 hours
export const CACHE_TTL_PROFILE_MS = 1000 * 60 * 60 * 24 // 24 hours

// Scene colors
export const SCENE_BG_COLOR = '#0a0a1a'
export const FOG_COLOR = '#0a0a2e'
export const FOG_NEAR = 80
export const FOG_FAR = 200

// Lighting
export const SUN_COLOR = '#FFE4B5'
export const SUN_INTENSITY = 2
export const AMBIENT_INTENSITY = 0.15

// Text labels
export const TEXT_COLOR = '#e2e8f0'
export const TEXT_OUTLINE_COLOR = '#000000'

// WealthSun
export const SUN_GLOW_COLOR = '#FFA500'
export const SUN_GLOW_OPACITY = 0.15
export const SUN_GLOW_SCALE = 1.02
export const SUN_CORONA_COLOR = '#FFD700'
export const SUN_CORONA_OUTER_COLOR = '#FF8C00'
export const SUN_CORONA_COUNT = 200
export const SUN_CORONA_OUTER_COUNT = 100
export const SUN_CORONA_SIZE = 8
export const SUN_CORONA_OUTER_SIZE = 4
export const SUN_CORONA_SCALE_FACTOR = 3
export const SUN_CORONA_OUTER_SCALE_FACTOR = 5
export const SUN_CORONA_SPEED = 0.4
export const SUN_CORONA_OUTER_SPEED = 0.2
export const SUN_CORONA_OPACITY = 0.6
export const SUN_CORONA_OUTER_OPACITY = 0.3
export const SUN_LIGHT_INTENSITY = 3
export const SUN_LIGHT_COLOR = '#FFE4B5'
export const SUN_LIGHT_DISTANCE = 200
export const SUN_LIGHT_DECAY = 2
export const SUN_PULSE_AMPLITUDE = 0.02
export const SUN_SHADER_INTENSITY = 3.0

// OrbitRing
export const ORBIT_RING_WIDTH = 0.02
export const ORBIT_RING_SEGMENTS = 128
export const ORBIT_RING_BRIGHTNESS = 0.3
export const ORBIT_RING_OPACITY = 0.15

// Planet hover
export const PLANET_HOVER_SCALE = 1.1
export const PLANET_DEFAULT_SCALE = 1.0
export const PLANET_HOVER_SPRING = { mass: 1, tension: 200, friction: 20 }
export const LABEL_SPRING = { mass: 1, tension: 170, friction: 26 }

// Camera
export const CAMERA_FLY_OFFSET = 6
export const CAMERA_FLY_HEIGHT = 4
export const CAMERA_SPRING = { mass: 1, tension: 170, friction: 26 }
export const EMPTY_SPACE_SPHERE_RADIUS = 500

// PostProcessing
export const BLOOM_THRESHOLD = 0.8
export const BLOOM_SMOOTHING = 0.9
export const BLOOM_INTENSITY = 0.8
export const VIGNETTE_OFFSET = 0.3
export const VIGNETTE_DARKNESS = 0.7
export const CHROMATIC_OFFSET = 0.0005

// Mobile
export const MOBILE_BREAKPOINT_PX = 768
