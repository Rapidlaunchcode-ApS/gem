import { nativeImage } from 'electron'

// Colored gem for the Windows system tray (template images are macOS-only).
const WIN_18 =
  'iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAUElEQVR4nGNgGAVkA648m/+4MEmG1L5ZgRMTZRghQ4gyjFhD8BqGL0wIYayGKa5OJBoT9B7FhhBrGMlJgGJDcBlGliHohlFkCLJhFBtCdwAAZY/mjG+AO4EAAAAASUVORK5CYII='
const WIN_36 =
  'iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAj0lEQVR4nO3WwQmAMAyF4Z7dwj1cxgXcwH0EV3MHPQnBg5jmJXlCfsi1fFhCba2qqupnDct0aocK44a6D16PTT1wlAUDRyEwMBQSY0Z5YLpRlm2Cb18kRo0a99ltuq+NAuOJgq0+BQaJcns+KDAWVNgvCAVGgwrDfEGFY95QaRiJeoLSMBKV/mVkdKCqYuoC+u9KqmA1YjMAAAAASUVORK5CYII='

// Gem glyph matching the app logo, embedded so packaging needs no extra resources.
// Template image: macOS recolors it for the menu bar automatically.
const ICON_18 =
  'iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAARUlEQVR4nGNgGAWUgP84MMmGINO4xIgyhFg2QUOQxXCJ4zSEHEy0i8hWS4xhZAU42YZQ1SBcGkg2BJtGsg1BNoBiQ+gPAKIpLdPWb/EfAAAAAElFTkSuQmCC'
const ICON_36 =
  'iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAjElEQVR4nO2XUQrAIAxDvf+l3ddgH1NM0laFPJANSdOIbG6tGWPMfXRglIT5XlWdRB/cq1qKP9NRI0RLgTRm5iGQrWH0ECvFaKBVjVTEPFFQKOQ9o46cFRCkb1uZb3Qo2e+4QGEmgT4hZmXnWWZdinnpN1GULoTUQ5ThuECzplvCjJpvDfNS+pdhzHU8IQBeogANG5UAAAAASUVORK5CYII='

export function createTrayIcon(): Electron.NativeImage {
  const mac = process.platform === 'darwin'
  const icon = nativeImage.createEmpty()
  icon.addRepresentation({
    scaleFactor: 1,
    dataURL: `data:image/png;base64,${mac ? ICON_18 : WIN_18}`
  })
  icon.addRepresentation({
    scaleFactor: 2,
    dataURL: `data:image/png;base64,${mac ? ICON_36 : WIN_36}`
  })
  if (mac) icon.setTemplateImage(true)
  return icon
}
