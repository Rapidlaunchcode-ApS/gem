import { nativeImage } from 'electron'

// Gem glyph matching the app logo, embedded so packaging needs no extra resources.
// Template image: macOS recolors it for the menu bar automatically.
const ICON_18 =
  'iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAARUlEQVR4nGNgGAWUgP84MMmGINO4xIgyhFg2QUOQxXCJ4zSEHEy0i8hWS4xhZAU42YZQ1SBcGkg2BJtGsg1BNoBiQ+gPAKIpLdPWb/EfAAAAAElFTkSuQmCC'
const ICON_36 =
  'iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAjElEQVR4nO2XUQrAIAxDvf+l3ddgH1NM0laFPJANSdOIbG6tGWPMfXRglIT5XlWdRB/cq1qKP9NRI0RLgTRm5iGQrWH0ECvFaKBVjVTEPFFQKOQ9o46cFRCkb1uZb3Qo2e+4QGEmgT4hZmXnWWZdinnpN1GULoTUQ5ThuECzplvCjJpvDfNS+pdhzHU8IQBeogANG5UAAAAASUVORK5CYII='

export function createTrayIcon(): Electron.NativeImage {
  const icon = nativeImage.createEmpty()
  icon.addRepresentation({
    scaleFactor: 1,
    dataURL: `data:image/png;base64,${ICON_18}`
  })
  icon.addRepresentation({
    scaleFactor: 2,
    dataURL: `data:image/png;base64,${ICON_36}`
  })
  icon.setTemplateImage(true)
  return icon
}
