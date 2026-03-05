declare module 'webpack-bundle-analyzer' {
  export class BundleAnalyzerPlugin {
    constructor(options?: Record<string, unknown>)
    apply(...args: unknown[]): void
  }
}
