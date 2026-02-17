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

// Planet material
export const PLANET_SEGMENTS = 32
export const PLANET_EMISSIVE_INTENSITY = 0.15
export const PLANET_ROUGHNESS = 0.3
export const PLANET_METALNESS = 0.7

// Planet Float animation
export const PLANET_FLOAT_SPEED = 0.5
export const PLANET_FLOAT_INTENSITY = 0.2
export const PLANET_FLOAT_ROTATION_INTENSITY = 0.1

// Planet label
export const LABEL_Y_OFFSET = 0.8
export const LABEL_NAME_FONT_SIZE = 0.5
export const LABEL_WEALTH_FONT_SIZE = 0.3
export const LABEL_OUTLINE_WIDTH = 0.02
export const LABEL_WEALTH_Y_OFFSET = -0.15

// Orbit frame-rate factor (delta * 60 normalizes to ~60fps)
export const ORBIT_FRAME_RATE = 60

// 2D Animation
export const DETAIL_PANEL_SLIDE_X = 400
export const SIDEBAR_SLIDE_X = -320
export const UI_SPRING_STIFFNESS = 200
export const UI_SPRING_DAMPING = 25

// Canvas config
export const CANVAS_NEAR = 0.1
export const CANVAS_FAR = 1000
export const DPR_RANGE: [number, number] = [1, 2]

// Mobile
export const MOBILE_BREAKPOINT_PX = 768

// ===== Comparison Engine =====

// ComparisonBar
export const COMPARISON_SLIDER_MAX = 10_000_000
export const COMPARISON_SLIDER_STEP = 1_000
export const COMPARISON_PRESETS = [
  { label: 'Median US Salary', value: 59_000, display: '$59K' },
  { label: 'Median US Household', value: 75_000, display: '$75K' },
  { label: 'Top 1%', value: 5_800_000, display: '$5.8M' },
] as const

// WealthRace
export const RACE_DURATION_SECONDS = 10

// FunFact
export const FUN_FACT_ROTATION_MS = 8_000

// UserParticle (3D)
export const USER_PARTICLE_MIN_RADIUS = 0.02
export const USER_PARTICLE_MAX_RADIUS = 0.15
export const USER_PARTICLE_OFFSET_X = 1.5
export const USER_PARTICLE_OFFSET_Y = 0.5
export const USER_PARTICLE_SPARKLE_COUNT = 20
export const USER_PARTICLE_SPARKLE_SIZE = 2
export const USER_PARTICLE_LABEL_FONT_SIZE = 0.25
export const USER_PARTICLE_SUB_LABEL_FONT_SIZE = 0.15
export const USER_PARTICLE_LABEL_OUTLINE = 0.015
export const USER_PARTICLE_SEGMENTS = 16

// TimeToEarn GSAP counter
export const TIME_TO_EARN_COUNTER_DURATION = 2

// ComparisonResults SVG ring
export const PERCENT_RING_RADIUS = 40
export const PERCENT_RING_SIZE = 100
export const PERCENT_RING_STROKE = 6
export const PERCENT_RING_MIN_DISPLAY = 0.5

// Conversion
export const FEET_PER_MILE = 5_280

// Fun fact reference data
export const MEDIAN_US_HOME_PRICE = 420_000
export const MEDIAN_US_SALARY = 59_000
export const MOON_DISTANCE_MILES = 238_900
export const PRIVATE_JET_PRICE = 70_000_000
export const MEGA_YACHT_PRICE = 600_000_000
export const GOLD_PRICE_PER_OUNCE = 2_000
export const OUNCES_PER_METRIC_TON = 32_150
export const GDP_COMPARISONS = [
  { country: 'Tuvalu', gdp: 60_000_000 },
  { country: 'Nauru', gdp: 150_000_000 },
  { country: 'Palau', gdp: 260_000_000 },
  { country: 'Iceland', gdp: 28_000_000_000 },
  { country: 'Luxembourg', gdp: 85_000_000_000 },
] as const

// UserParticle (3D) – additional
export const USER_PARTICLE_FALLBACK_RADIUS = 0.05
export const USER_PARTICLE_MATERIAL_COLOR = '#ffffff'
export const USER_PARTICLE_EMISSIVE_INTENSITY = 0.8
export const USER_PARTICLE_FLOAT_SPEED = 2
export const USER_PARTICLE_FLOAT_INTENSITY = 0.5
export const USER_PARTICLE_SPARKLE_SCALE = 0.5
export const USER_PARTICLE_LABEL_Y_GAP = 0.3
export const USER_PARTICLE_SUB_LABEL_Y_GAP = 0.25
export const USER_PARTICLE_SUB_LABEL_COLOR = '#00d4ff'
export const USER_PARTICLE_LINE_DASH_SIZE = 0.2
export const USER_PARTICLE_LINE_GAP_SIZE = 0.15
export const USER_PARTICLE_LINE_OPACITY = 0.4

// PercentRing SVG
export const PERCENT_RING_BG_STROKE = 'rgba(255,255,255,0.1)'
export const PERCENT_RING_FG_STROKE = '#00d4ff'

// FunFactCard shimmer
export const FUN_FACT_SHIMMER_GRADIENT =
  'linear-gradient(135deg, #00d4ff 0%, #ffd700 25%, #ff44aa 50%, #00ff88 75%, #00d4ff 100%)'

// Panel animation timings
export const COMPARISON_BAR_SPRING = { stiffness: 300, damping: 30 }
export const COMPARISON_RESULTS_STAGGER_DELAY = 0.12
export const TIME_TO_EARN_SLIDE_DELAY = 0.3
export const WEALTH_RACE_SLIDE_DELAY = 0.5
export const FUN_FACT_SLIDE_DELAY = 0.6

// ===== Phase 4: Visualization Modes =====

// Camera defaults per mode
export const COSMOS_CAMERA_POSITION: [number, number, number] = [0, 15, 40]
export const COSMOS_CAMERA_TARGET: [number, number, number] = [0, 0, 0]
export const TOWERS_CAMERA_POSITION: [number, number, number] = [0, 8, 25]
export const TOWERS_CAMERA_TARGET: [number, number, number] = [0, 8, 0]
export const OCEAN_CAMERA_POSITION: [number, number, number] = [0, 0, 15]
export const OCEAN_CAMERA_TARGET: [number, number, number] = [0, -5, 0]
export const TIMELINE_CAMERA_POSITION: [number, number, number] = [0, 2, 0]
export const TIMELINE_CAMERA_TARGET: [number, number, number] = [0, 2, 10]

// Towers mode
export const TOWER_SPACING = 4
export const TOWER_WIDTH = 2
export const TOWER_DEPTH = 2
export const TOWER_TRANSMISSION = 0.3
export const TOWER_ROUGHNESS = 0.1
export const TOWER_METALNESS = 0.1
export const TOWER_OPACITY = 0.9
export const TOWER_EMISSIVE_BASE = 0.2
export const TOWER_EMISSIVE_PULSE = 0.05
export const TOWER_PULSE_SPEED = 1.5
export const TOWER_MAX_PARTICLES = 30
export const TOWER_PARTICLE_BASE_COUNT = 2
export const TOWER_PARTICLE_SCALE_FACTOR = 500
export const TOWER_PARTICLE_SIZE = 0.08
export const TOWER_PARTICLE_FADE_ZONE = 0.8
export const TOWER_POSITIVE_COLOR = '#00ff88'
export const TOWER_NEGATIVE_COLOR = '#ff4466'
export const TOWER_LABEL_OFFSET_X = 2.2
export const TOWER_LABEL_HEIGHT_FACTOR = 0.75
export const TOWER_FOG_COLOR = '#000000'
export const TOWER_FOG_NEAR = 20
export const TOWER_FOG_FAR = 80
export const TOWER_AMBIENT_INTENSITY = 0.1
export const TOWER_DIR_LIGHT_INTENSITY = 1.5
export const TOWER_GROUND_COLOR = '#050505'
export const TOWER_GROUND_SIZE = 200
export const TOWER_GRID_CELL_SIZE = 4
export const TOWER_GRID_SECTION_SIZE = 20
export const TOWER_GRID_CELL_COLOR = '#1a1a3a'
export const TOWER_GRID_SECTION_COLOR = '#2a2a5a'
export const TOWER_GRID_FADE_DISTANCE = 60
export const TOWER_ORBIT_TARGET: [number, number, number] = [0, 8, 0]
export const TOWER_ORBIT_MIN_DISTANCE = 5
export const TOWER_ORBIT_MAX_DISTANCE = 60

// Ocean mode
export const OCEAN_BG_COLOR = '#001122'
export const OCEAN_FOG_COLOR = '#000811'
export const OCEAN_FOG_NEAR = 5
export const OCEAN_FOG_FAR = 40
export const OCEAN_WATER_COLOR = '#0066aa'
export const OCEAN_WATER_OPACITY = 0.35
export const OCEAN_WATER_SIZE = 100
export const OCEAN_WATER_SEGMENTS = 64
export const OCEAN_WAVE_SPEED_1 = 0.8
export const OCEAN_WAVE_SPEED_2 = 0.6
export const OCEAN_WAVE_SPEED_3 = 1.2
export const OCEAN_WAVE_AMP_1 = 0.15
export const OCEAN_WAVE_AMP_2 = 0.1
export const OCEAN_WAVE_AMP_3 = 0.08
export const OCEAN_CREATURE_TENTACLE_COUNT = 8
export const OCEAN_CREATURE_BOB_SPEED = 0.5
export const OCEAN_CREATURE_BOB_AMP = 0.3
export const OCEAN_CREATURE_TENTACLE_SWAY_X = 0.3
export const OCEAN_CREATURE_TENTACLE_SWAY_Z = 0.2
export const OCEAN_CREATURE_EMISSIVE_INTENSITY = 1.5
export const OCEAN_CREATURE_TRANSMISSION = 0.6
export const OCEAN_CREATURE_OPACITY = 0.7
export const OCEAN_DEPTH_MARKERS = [
  100_000, 200_000, 300_000, 400_000, 500_000, 600_000, 700_000,
]
export const OCEAN_DEPTH_MARKER_COLOR = '#4488cc'
export const OCEAN_DEPTH_LINE_COLOR = '#224466'
export const OCEAN_CAUSTIC_DIR_INTENSITY = 0.8
export const OCEAN_CAUSTIC_DIR_COLOR = '#aaddff'
export const OCEAN_CAUSTIC_SPOT1_INTENSITY = 2
export const OCEAN_CAUSTIC_SPOT1_COLOR = '#88ccff'
export const OCEAN_CAUSTIC_SPOT2_INTENSITY = 1.5
export const OCEAN_CAUSTIC_SPOT2_COLOR = '#66aadd'
export const OCEAN_AMBIENT_INTENSITY = 0.05
export const OCEAN_AMBIENT_COLOR = '#223344'
export const OCEAN_ORBIT_TARGET: [number, number, number] = [0, -5, 0]
export const OCEAN_ORBIT_MIN_DISTANCE = 3
export const OCEAN_ORBIT_MAX_DISTANCE = 40
export const OCEAN_SPREAD_RADIUS_BASE = 6
export const OCEAN_SPREAD_RADIUS_RAND = 4

// Timeline mode
export const TIMELINE_Z_SCALE = 2
export const TIMELINE_SCROLL_SPEED = 0.3
export const TIMELINE_TUNNEL_RADIUS = 8
export const TIMELINE_TUNNEL_SEGMENTS = 128
export const TIMELINE_TUNNEL_COLOR = '#0a0a2e'
export const TIMELINE_TUNNEL_OPACITY = 0.15
export const TIMELINE_BG_COLOR = '#050510'
export const TIMELINE_FOG_NEAR = 5
export const TIMELINE_FOG_FAR = 60
export const TIMELINE_AMBIENT_INTENSITY = 0.3
export const TIMELINE_SPOTLIGHT_INTENSITY = 1
export const TIMELINE_BAND_HEIGHT = 0.4
export const TIMELINE_BAND_GAP = 0.05
export const TIMELINE_MAX_BAND_WIDTH = 3
export const TIMELINE_MAX_NETWORTH_FOR_SCALE = 800_000
export const TIMELINE_BAND_OPACITY = 0.7
export const TIMELINE_DATE_MARKER_COLOR = '#334466'
export const TIMELINE_DATE_LINE_COLOR = '#1a2a44'
export const TIMELINE_DATE_LINE_OPACITY = 0.4
export const TIMELINE_EVENT_VISIBILITY_RANGE = 15
export const TIMELINE_CAMERA_LERP_FACTOR = 0.05
export const TIMELINE_CAMERA_Y = 2
export const TIMELINE_CAMERA_LOOK_AHEAD = 10
export const TIMELINE_TUNNEL_PADDING = 5

// Transition system
export const TRANSITION_COLLAPSE_SPRING = {
  mass: 1,
  tension: 280,
  friction: 24,
}
export const TRANSITION_EXPAND_SPRING = {
  mass: 1.2,
  tension: 170,
  friction: 28,
}

// ModeTabs
export const MODE_TAB_SPRING = { stiffness: 400, damping: 30 }

// Cache
export const CACHE_TTL_TOP10_MS = 1000 * 60 * 60 * 24 // 24 hours
