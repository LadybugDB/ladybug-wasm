import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Ladybug Wasm",
  base: '/lbug-wasm/',
  description: "WebAssembly version of Ladybug database",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/what-is-lbug-wasm', activeMatch: '/guide/' },
    ],

    sidebar: {
      '/guide/': [
        {
          base: '/guide/',
          items: [
            {
              text: 'Introduction',
              collapsed: false,
              items: [
                { text: 'What is Ladybug Wasm?', link: 'what-is-lbug-wasm' },
                { text: 'Prerequisite', link: 'prerequisite' },
                { text: 'Getting Started', link: 'getting-started' },
              ]
            },
            {
              text: 'Data Ingestion',
              collapsed: false,
              items: [
                { text: 'Overview', link: 'data-ingestion-overview' },
                { text: 'Writing to File', link: 'writing-to-file' },
                { text: 'Fetch from network', link: 'fetch-from-network' },
                { text: 'Build with Docker', link: 'build-with-docker' },
              ]
            }
          ]
        }
      ]
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Dylan Shang'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/unswdb/lbug-wasm' }
    ]
  }
})
