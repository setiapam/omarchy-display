import QtQuick
import QtTest
import "../Arrangement.js" as Arrangement

TestCase {
  name: "DisplayArrangement"

  readonly property var displays: [
    { name: "internal", x: 0, y: 0, width: 1440, height: 900 },
    { name: "external", x: 1440, y: 0, width: 1920, height: 1080 }
  ]

  function test_clear_position_is_unchanged() {
    var result = Arrangement.nearestClearPosition(displays, "external", 1440, 120)
    compare(result.x, 1440)
    compare(result.y, 120)
    compare(result.snapped, false)
  }

  function test_overlap_snaps_to_clear_edge() {
    var result = Arrangement.nearestClearPosition(displays, "external", 500, 100)
    verify(result.snapped)
    verify(result.x >= 1440 || result.x + 1920 <= 0
      || result.y >= 900 || result.y + 1080 <= 0)
  }

  function test_touching_edges_do_not_overlap() {
    verify(!Arrangement.overlaps(
      { x: 0, y: 0, width: 1440, height: 900 },
      { x: 1440, y: 0, width: 1920, height: 1080 }))
  }

  function test_near_gap_snaps_to_touching_edge() {
    var stacked = [
      { name: "HDMI-A-1", x: 0, y: 0, width: 1536, height: 864 },
      { name: "eDP-1", x: 0, y: 864, width: 1536, height: 864 }
    ]
    var result = Arrangement.nearestClearPosition(stacked, "eDP-1", 0, 866)
    compare(result.x, 0)
    compare(result.y, 864)
    verify(result.snapped)
  }
}
