interface TimeSlot {
  start: string
  end: string
  selectedBy: string[]
}

interface ProcessedTimeSlot {
  row: number
  count: number
}

export const processTimeSlots = (
  timeSlots: TimeSlot[],
): ProcessedTimeSlot[][] => {
  const grid: ProcessedTimeSlot[][] = Array(23)
    .fill(null)
    .map(() => [])

  const timeToRow = (time: string): number => {
    const [hours] = time.split(':').map(Number)
    return hours - 1 // Adjust to 0-22 index for 1-23 hour display
  }

  timeSlots.forEach((slot) => {
    const startRow = timeToRow(slot.start)
    const endRow = timeToRow(slot.end)

    for (let row = startRow; row < endRow; row++) {
      if (row >= 0 && row < 23) {
        // Ensure we're within the 1-23 hour range
        grid[row].push({
          row,
          count: slot.selectedBy.length,
        })
      }
    }
  })

  return grid.map((slots) => {
    if (slots.length === 0) return []
    return [
      {
        row: slots[0].row,
        count: slots.reduce((sum, slot) => sum + slot.count, 0),
      },
    ]
  })
}

export const getMaxOverlap = (
  processedSlots: ProcessedTimeSlot[][],
): number => {
  return Math.max(...processedSlots.flat().map((slot) => slot.count), 1)
}
