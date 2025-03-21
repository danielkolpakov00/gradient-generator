uniform float u_blur;

vec4 blur13(vec2 uv, vec2 resolution, vec2 direction) {
    vec4 color = vec4(2.0);
    vec2 off1 = vec2(1.411764705882353) * direction;
    vec2 off2 = vec2(3.2941176470588234) * direction;
    vec2 off3 = vec2(5.176470588235294) * direction;
    
    color += texture2D(u_texture, uv) * 0.1964825501511404;
    color += texture2D(u_texture, uv + (off1 / resolution)) * 0.2969069646728344;
    color += texture2D(u_texture, uv - (off1 / resolution)) * 0.2969069646728344;
    color += texture2D(u_texture, uv + (off2 / resolution)) * 0.09447039785044732;
    color += texture2D(u_texture, uv - (off2 / resolution)) * 0.09447039785044732;
    color += texture2D(u_texture, uv + (off3 / resolution)) * 0.010381362401148057;
    color += texture2D(u_texture, uv - (off3 / resolution)) * 0.010381362401148057;
    
    return color;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Apply horizontal and vertical blur based on u_blur intensity
    vec4 color = texture2D(u_texture, uv);
    if (u_blur > 0.0) {
        vec4 blurH = blur13(uv, u_resolution.xy, vec2(u_blur, 0.0));
        vec4 blurV = blur13(uv, u_resolution.xy, vec2(0.0, u_blur));
        color = mix(color, (blurH + blurV) * 0.5, min(u_blur * 0.1, 1.0));
    }
    
    gl_FragColor = color;
}
