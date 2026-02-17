export const waterVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWaveSpeed1;
  uniform float uWaveSpeed2;
  uniform float uWaveSpeed3;
  uniform float uWaveAmp1;
  uniform float uWaveAmp2;
  uniform float uWaveAmp3;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 pos = position;
    float t = uTime;

    // Wave displacement
    float wave1 = sin(pos.x * 0.3 + t * uWaveSpeed1) * uWaveAmp1;
    float wave2 = sin(pos.z * 0.4 + t * uWaveSpeed2) * uWaveAmp2;
    float wave3 = sin((pos.x + pos.z) * 0.2 + t * uWaveSpeed3) * uWaveAmp3;
    pos.y += wave1 + wave2 + wave3;

    // Analytical normal from partial derivatives
    float dx = cos(pos.x * 0.3 + t * uWaveSpeed1) * 0.3 * uWaveAmp1
             + cos((pos.x + pos.z) * 0.2 + t * uWaveSpeed3) * 0.2 * uWaveAmp3;
    float dz = cos(pos.z * 0.4 + t * uWaveSpeed2) * 0.4 * uWaveAmp2
             + cos((pos.x + pos.z) * 0.2 + t * uWaveSpeed3) * 0.2 * uWaveAmp3;
    vNormal = normalize(vec3(-dx, 1.0, -dz));

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

export const waterFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    // Simple directional lighting
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    float diffuse = max(dot(vNormal, lightDir), 0.0);
    float ambient = 0.3;

    vec3 color = uColor * (ambient + diffuse * 0.7);
    gl_FragColor = vec4(color, uOpacity);
  }
`
