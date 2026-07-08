import { nativeImage } from 'electron'

// Colored gem for the Windows system tray (template images are macOS-only).
const WIN_18 =
  'iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAUElEQVR4nGNgGAVkA648m/+4MEmG1L5ZgRMTZRghQ4gyjFhD8BqGL0wIYayGKa5OJBoT9B7FhhBrGMlJgGJDcBlGliHohlFkCLJhFBtCdwAAZY/mjG+AO4EAAAAASUVORK5CYII='
const WIN_36 =
  'iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAj0lEQVR4nO3WwQmAMAyF4Z7dwj1cxgXcwH0EV3MHPQnBg5jmJXlCfsi1fFhCba2qqupnDct0aocK44a6D16PTT1wlAUDRyEwMBQSY0Z5YLpRlm2Cb18kRo0a99ltuq+NAuOJgq0+BQaJcns+KDAWVNgvCAVGgwrDfEGFY95QaRiJeoLSMBKV/mVkdKCqYuoC+u9KqmA1YjMAAAAASUVORK5CYII='

// Gem glyph matching the app logo, embedded so packaging needs no extra resources.
// Template image: macOS recolors it for the menu bar automatically. Solid faceted
// gem silhouette — reads clearly at menu-bar size, unlike a thin outline.
const ICON_18 =
  'iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAABmJLR0QA/wD/AP+gvaeTAAAA8klEQVQ4jeXSzypFURTH8Y8OmRgoU0MjZcYDeAGJEemSKA8g5SEMTHmDO/IGGJJCylyUlFsGUq4/x2Dvwe44Z585v1qTvdb69eu7Nn9WAzVvI5jFZMPOLY7x2ma0jQKLmKn0rtBFH3u5hIO4wwc6eEIZ6xkreMc9hnJGyw2LdcZLOaOzZLDEJXaxg/NK7yJdTBmNYV7g8yLAHMdN7E/hQTjGKL5whF5dojkB5DdWKwlKrEWDfpzNakFgcoDTxOQEh/jUwidVB2/YTIzW49tG3ULRYHSNR0wIPHrCFbsx6S/VfchUWxgWuBTYb5nPajrWf9UPFvVHH9v1lW8AAAAASUVORK5CYII='
const ICON_36 =
  'iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAABmJLR0QA/wD/AP+gvaeTAAAB+0lEQVRYhe3VT28NURjH8Y8/EVEWKggrooJEYkPSRCwkumglgp2EhsQLUAnCmlfAqm+AoLGX0IWdRGi9gYqkSKm2tKjKtZgz6TGduTf3zlUW80tOMueZc57nO8/8zgyVKlWqlKu9WI8R1JocI2HvnnYCDeEqdmCiCZhJ7MI1PGwXzE4s4Bd6cSzMG8Fk1y+gqx1Ad/z5xF2SbjUCumJpR2+XhdmIL5lCoxJP3K0DM4R1eJGJz2JTGaAbTRaMTXyvYO/1VmHWYLwgaU2+yWMTF+17j7WtAF2okzTPtM2Y/nwrQK8aJM2aPM/EReM1VuQVzQ1KjnpPTvxdSLg9ik3iUbg+hc7o3niosS0n12OMZYMrC4A+4WtOfBrPAlSqThwKI4aphbXTOXlmMVVQu1C7LTX1d8nTPtD4tdzHFsxl4h+wr1mYVPst9cRNSTcaAXXjViY2EXKW0gHJK4yNvAHDdWCeogMfo9gUDpaFSdWNmSj5APrqAPXicjSfxZF2waQ6LDF6DW8lH86XOTCj4d6bMJ/D0XbDpOrBt1DoXBhZoLPoD9c/cPxvwaQ6gXmLnRiLYOLOzYe1y6LT+Cnx0UAEdEnSkQWcWS6YVP14YvE0TUr+8sO42GrSVSWARrBa8rWfwfMA9RmDJfKWVh82YytO/kuQWB1hVKpU6b/XbwURGx4WFpPFAAAAAElFTkSuQmCC'

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
