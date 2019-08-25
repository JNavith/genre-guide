export function fadeSlide(
  node,
  {
    delay = 0,
    opacityDuration = 500,
    opacityEasing = t => t,
    translateXPercent = 0,
    translateYPercent = 100,
    transformDuration = 500,
    transformEasing = t => t
  }
) {
  const opacity = +getComputedStyle(node).opacity;

  const maxDuration = Math.max(opacityDuration, transformDuration);

  return {
    delay,
    duration: maxDuration,
    css: t => {
      const opacityTime = Math.min(t * (maxDuration / opacityDuration), 1);
      const opacityTimeEased = opacityEasing(opacityTime);

      const transformTime = Math.min(t * (maxDuration / transformDuration), 1);
      const transformTimeEased = transformEasing(transformTime);

      return `opacity: ${opacityTimeEased * opacity};
              transform: translate(${translateXPercent *
                (1 - transformTimeEased)}%, ${translateYPercent * (1 - transformTimeEased)}%)`;
    }
  };
}
