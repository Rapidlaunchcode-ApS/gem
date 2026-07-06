import { nativeImage } from 'electron'

// Clipboard glyph, embedded so packaging needs no extra resources.
// Template image: macOS recolors it for the menu bar automatically.
const ICON_18 =
  'iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAKUlEQVR4nGNgoBP4j4YpMggbmyxX4MIkuYISNaMGjRo0jA2iSl4bWAAAuXQv0ac/NYAAAAAASUVORK5CYII='
const ICON_36 =
  'iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAWElEQVR4nO3XwQkAIAwEwfTftFYgQTjPaPbA77jgywh2biM5BK0u7heUPc3O+TvotiHFCHIYUowghyHFCHIYUowghyHFCHIYUowghyHFegSV+3WUCWLsqU1E/rdJnw0sqQAAAABJRU5ErkJggg=='

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
