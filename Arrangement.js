function overlaps(first, second) {
  return first.x < second.x + second.width
    && first.x + first.width > second.x
    && first.y < second.y + second.height
    && first.y + first.height > second.y
}

function findRectangle(rectangles, name) {
  for (var i = 0; i < rectangles.length; i++)
    if (rectangles[i].name === name) return rectangles[i]
  return null
}

function positionIsClear(rectangles, moved, x, y) {
  var candidate = {
    x: x,
    y: y,
    width: moved.width,
    height: moved.height
  }
  for (var i = 0; i < rectangles.length; i++) {
    var other = rectangles[i]
    if (other.name !== moved.name && overlaps(candidate, other)) return false
  }
  return true
}

function appendUnique(values, value) {
  value = Math.round(value)
  if (values.indexOf(value) < 0) values.push(value)
}

function nearestClearPosition(rectangles, movedName, requestedX, requestedY, snapThreshold) {
  var moved = findRectangle(rectangles, movedName)
  var roundedX = Math.round(requestedX)
  var roundedY = Math.round(requestedY)
  if (!moved) return { x: roundedX, y: roundedY, snapped: false }

  if (snapThreshold === undefined) snapThreshold = 32

  var isClear = positionIsClear(rectangles, moved, roundedX, roundedY)

  if (isClear && rectangles.length > 1 && snapThreshold > 0) {
    var bestX = roundedX
    var bestY = roundedY
    var minDiffX = snapThreshold + 1
    var minDiffY = snapThreshold + 1

    for (var i = 0; i < rectangles.length; i++) {
      var other = rectangles[i]
      if (other.name === movedName) continue

      var candidatesX = [
        Math.round(other.x + other.width),
        Math.round(other.x - moved.width),
        Math.round(other.x),
        Math.round(other.x + other.width - moved.width)
      ]
      var candidatesY = [
        Math.round(other.y + other.height),
        Math.round(other.y - moved.height),
        Math.round(other.y),
        Math.round(other.y + other.height - moved.height)
      ]

      for (var cx = 0; cx < candidatesX.length; cx++) {
        var diffX = Math.abs(roundedX - candidatesX[cx])
        if (diffX <= snapThreshold && diffX < minDiffX) {
          if (positionIsClear(rectangles, moved, candidatesX[cx], roundedY)) {
            minDiffX = diffX
            bestX = candidatesX[cx]
          }
        }
      }

      for (var cy = 0; cy < candidatesY.length; cy++) {
        var diffY = Math.abs(roundedY - candidatesY[cy])
        if (diffY <= snapThreshold && diffY < minDiffY) {
          if (positionIsClear(rectangles, moved, bestX, candidatesY[cy])) {
            minDiffY = diffY
            bestY = candidatesY[cy]
          }
        }
      }
    }

    if (positionIsClear(rectangles, moved, bestX, bestY)) {
      return {
        x: bestX,
        y: bestY,
        snapped: (bestX !== roundedX || bestY !== roundedY)
      }
    }
  }

  if (isClear) return { x: roundedX, y: roundedY, snapped: false }

  var xOptions = [roundedX]
  var yOptions = [roundedY]
  for (var i = 0; i < rectangles.length; i++) {
    var other = rectangles[i]
    if (other.name === movedName) continue
    appendUnique(xOptions, Math.floor(other.x - moved.width))
    appendUnique(xOptions, Math.ceil(other.x + other.width))
    appendUnique(xOptions, Math.round(other.x))
    appendUnique(xOptions, Math.round(other.x + other.width - moved.width))
    appendUnique(yOptions, Math.floor(other.y - moved.height))
    appendUnique(yOptions, Math.ceil(other.y + other.height))
    appendUnique(yOptions, Math.round(other.y))
    appendUnique(yOptions, Math.round(other.y + other.height - moved.height))
  }

  var best = null
  var bestDistance = Number.MAX_VALUE
  for (var xIndex = 0; xIndex < xOptions.length; xIndex++) {
    for (var yIndex = 0; yIndex < yOptions.length; yIndex++) {
      var candidateX = xOptions[xIndex]
      var candidateY = yOptions[yIndex]
      if (!positionIsClear(rectangles, moved, candidateX, candidateY)) continue
      var deltaX = candidateX - roundedX
      var deltaY = candidateY - roundedY
      var distance = deltaX * deltaX + deltaY * deltaY
      if (distance < bestDistance) {
        best = { x: candidateX, y: candidateY, snapped: true }
        bestDistance = distance
      }
    }
  }

  return best || { x: moved.x, y: moved.y, snapped: true }
}
