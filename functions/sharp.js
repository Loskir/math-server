const sharp = require('sharp')

const svgSharp = (svg) => sharp(Buffer.from(svg), {density: 500})

const svgToExtendedPng = async (svg) => {
  return svgSharp(svg)
    .extend({
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
      background: '#00000000',
    })
    .toFormat('png')
    .toBuffer()
}

const flattenPng = (png) => {
  return sharp(png).flatten({background: '#ffffff'}).toBuffer()
}

const getImageForImg = (svg) => {
  return svgToExtendedPng(svg)
    .then(flattenPng)
}

const getImageForSocialPreview = async (svg) => {
  const extendedPng = await svgToExtendedPng(svg)
  return sharp(extendedPng)
    .metadata()
    .then(({width, height}) => {
      let desiredWidth = width
      let desiredHeight = height
      const ratio = desiredWidth / desiredHeight
      const minRatio = 1 / 3
      const maxRatio = 3
      if (ratio > maxRatio) {
        desiredHeight = Math.round(desiredWidth / maxRatio)
      }
      if (ratio < minRatio) {
        desiredWidth = Math.round(desiredHeight * minRatio)
      }
      console.log(width, height, desiredWidth, desiredHeight)
      return sharp(extendedPng)
        .resize({
          height: desiredHeight,
          width: desiredWidth,
          fit: 'contain',
          background: '#00000000',
        })
        .toFormat('png')
        .toBuffer()
    })
    .then(flattenPng)
}

module.exports = {
  getImageForImg,
  getImageForSocialPreview,
}
