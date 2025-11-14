export const sanitizeAnimationOverrides = (svgContent: string): string => {
  try {
    // Remove universal selector blocks that force animations off
    // Example: * { animation-duration: 0s !important; animation-delay: 0s !important; }
    let out = svgContent;

    // Remove any universal block that sets animation-duration or animation-delay to 0s
    const universalAnimBlock = /\*\s*\{[^}]*\b(animation-duration\s*:\s*0s[^;]*;|animation-delay\s*:\s*0s[^;]*;)[^}]*\}/gim;
    out = out.replace(universalAnimBlock, (block) => {
      // Option 1: drop entire block
      return '';
    });

    // Also remove direct properties inside any style if they still linger
    // Safely target 0s values for animation-duration/delay
    const durationZero = /animation-duration\s*:\s*0s[^;]*;?/gim;
    const delayZero = /animation-delay\s*:\s*0s[^;]*;?/gim;
    out = out.replace(durationZero, '');
    out = out.replace(delayZero, '');

    // Remove animation shorthand that explicitly sets duration to 0s
    // e.g., animation: fadeIn 0s ease ...
    const shorthandZero = /animation\s*:\s*([^;}]*)\b0s\b([^;}]*)[;]?/gim;
    out = out.replace(shorthandZero, (m) => {
      // Drop the whole shorthand if it contains 0s
      return '';
    });

    return out;
  } catch {
    return svgContent;
  }
};
