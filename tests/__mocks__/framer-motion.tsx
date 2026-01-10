import React from 'react'

// Mock per Framer Motion
export const motion = {
  div: 'div',
  button: 'button',
  span: 'span',
  section: 'section',
  article: 'article',
  header: 'header',
  footer: 'footer',
  main: 'main',
  nav: 'nav',
  aside: 'aside',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  p: 'p',
  a: 'a',
  img: 'img',
  ul: 'ul',
  ol: 'ol',
  li: 'li',
  form: 'form',
  input: 'input',
  textarea: 'textarea',
  select: 'select',
  option: 'option',
  label: 'label',
  fieldset: 'fieldset',
  legend: 'legend',
  table: 'table',
  thead: 'thead',
  tbody: 'tbody',
  tr: 'tr',
  th: 'th',
  td: 'td',
  canvas: 'canvas',
  svg: 'svg',
  path: 'path',
  circle: 'circle',
  rect: 'rect',
  line: 'line',
  polyline: 'polyline',
  polygon: 'polygon',
  ellipse: 'ellipse',
  g: 'g',
  defs: 'defs',
  clipPath: 'clipPath',
  mask: 'mask',
  pattern: 'pattern',
  linearGradient: 'linearGradient',
  radialGradient: 'radialGradient',
  stop: 'stop',
  text: 'text',
  tspan: 'tspan',
  textPath: 'textPath',
  use: 'use',
  symbol: 'symbol',
  marker: 'marker',
  foreignObject: 'foreignObject',
  image: 'image',
  switch: 'switch',
  style: 'style',
  script: 'script',
  title: 'title',
  desc: 'desc',
  metadata: 'metadata',
}

export const AnimatePresence = ({ children }: { children: React.ReactNode }) => children

export const useAnimation = () => ({
  start: () => {},
  stop: () => {},
  set: () => {},
  get: () => ({}),
})

export function useMotionValue<T>(initialValue: T) {
  let currentValue = initialValue
  return {
    get: () => currentValue,
    set: (newValue: T) => {
      currentValue = newValue
    },
    onChange: () => {},
  }
}
export function useTransform<T, U>(
  value: T,
  inputRange: ReadonlyArray<number>,
  outputRange: ReadonlyArray<U>,
) {
  void inputRange
  void outputRange
  return value as unknown as U
}

export function useSpring<T>(value: T) {
  return value
}

export const useViewportScroll = () => ({
  scrollX: { current: 0 },
  scrollY: { current: 0 },
  scrollXProgress: { current: 0 },
  scrollYProgress: { current: 0 },
})

export const useElementScroll = () => ({
  scrollX: { current: 0 },
  scrollY: { current: 0 },
  scrollXProgress: { current: 0 },
  scrollYProgress: { current: 0 },
})

export const useDragControls = () => ({
  start: () => {},
  stop: () => {},
  drag: () => {},
})

export const useAnimationControls = () => ({
  start: () => {},
  stop: () => {},
  set: () => {},
  get: () => ({}),
})

export const usePresence = () => ({
  isPresent: true,
  isAnimating: false,
})

export const useReducedMotion = () => false

export const useInView = () => ({
  ref: () => {},
  inView: true,
  entry: null,
})

export const useIsomorphicLayoutEffect = (
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect
) as typeof React.useLayoutEffect
