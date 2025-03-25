#version 300 es
precision highp float;

uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform vec2 direction;
uniform float blurAmount;
varying vec2 vUv;

out vec4 fragColor;

void main() {
    vec2 pixelSize = 1.0 / resolution;
    float strength = blurAmount * 2.0;
    
    vec4 sum = texture2D(tDiffuse, vUv) * 0.38774;
    
    vec2 blur = direction * pixelSize * strength;
    
    sum += texture2D(tDiffuse, vUv + blur * 0.325) * 0.32074;
    sum += texture2D(tDiffuse, vUv - blur * 0.325) * 0.32074;
    sum += texture2D(tDiffuse, vUv + blur * 0.875) * 0.15162;
    sum += texture2D(tDiffuse, vUv - blur * 0.875) * 0.15162;
    
    fragColor = sum;
}