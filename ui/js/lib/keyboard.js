'use strict'

// From https://github.com/atom/electron/blob/master/docs/api/accelerator.md
/* 
  Available modifiers
  
    Command (or Cmd for short)
    Control (or Ctrl for short)
    CommandOrControl (or CmdOrCtrl for short)
    Alt
    Shift
    Super (or Cmd or Windows)

  Available key codes

    0 to 9
    A to Z
    F1 to F24
    Punctuations like ~, !, @, #, $, etc.
    Plus
    Space
    Backspace
    Delete
    Insert
    Return (or Enter as alias)
    Up, Down, Left and Right
    Home and End
    PageUp and PageDown
    Escape (or Esc for short)
    VolumeUp, VolumeDown and VolumeMute
    MediaNextTrack, MediaPreviousTrack, MediaStop and MediaPlayPause
*/

// Taken partially from http://stackoverflow.com/questions/1772179/get-character-value-from-keycode-in-javascript-then-trim
// names of known key codes registrable on electron(0-255)
var map = new Map([
    [NaN, null]
  , [17, 'Ctrl']
  , [91, 'Super']
  , [18, 'Alt']
  , [16, 'Shift']
  , [9,  'Tab']
  , [48, '0']
  , [49, '1']
  , [50, '2']
  , [51, '3']
  , [52, '4']
  , [53, '5']
  , [54, '6']
  , [55, '7']
  , [56, '8']
  , [57, '9']
  , [65, 'A']
  , [66, 'B']
  , [67, 'C']
  , [68, 'D']
  , [69, 'E']
  , [70, 'F']
  , [71, 'G']
  , [72, 'H']
  , [73, 'I']
  , [74, 'J']
  , [75, 'K']
  , [76, 'L']
  , [77, 'M']
  , [78, 'N']
  , [79, 'O']
  , [80, 'P']
  , [81, 'Q']
  , [82, 'R']
  , [83, 'S']
  , [84, 'T']
  , [85, 'U']
  , [86, 'V']
  , [87, 'W']
  , [88, 'X']
  , [89, 'Y']
  , [90, 'Z']
  , [112, 'F1']
  , [113, 'F2']
  , [114, 'F3']
  , [115, 'F4']
  , [116, 'F5']
  , [117, 'F6']
  , [118, 'F7']
  , [119, 'F8']
  , [120, 'F9']
  , [121, 'F10']
  , [122, 'F11']
  , [123, 'F12']
  , [124, 'F13']
  , [125, 'F14']
  , [126, 'F15']
  , [127, 'F16']
  , [128, 'F17']
  , [129, 'F18']
  , [130, 'F19']
  , [131, 'F20']
  , [132, 'F21']
  , [133, 'F22']
  , [134, 'F23']
  , [135, 'F24']
  , [171, 'Plus']
  , [32, 'Space']
  , [8, 'Backspace']
  , [46, 'Delete']
  , [45, 'Insert']
  , [13, 'Enter']
  , [38, 'Up']
  , [40, 'Down']
  , [37, 'Left']
  , [39, 'Right']
  , [36, 'Home']
  , [35, 'End']
  , [33, 'PageUp']
  , [34, 'PageDown']
  , [27, 'Esc']
  , [183, 'VolumeUp']
  , [182, 'VolumeDown']
  , [181, 'VolumeMute']
  , [250, 'Play']
  , [19, 'Pause']
  , [58, ':']
  , [60, '<']
  , [62, '>']
  , [63, '?']
  , [64, '@']
  , [161, '!']
  , [162, '"']
  , [164, '$']
  , [165, '%']
  , [166, '&']
  , [167, '_']
  , [168, '(']
  , [169, ')']
  , [170, '*']
  , [171, '+']
  , [172, '|']
  , [174, '{']
  , [175, '}']
  , [176, '~']
  , [186, ';']
  , [187, '=']
  , [188, ',']
  , [189, '-']
  , [190, '.']
  , [191, '/']
  , [192, '`']
  , [219, '[']
  , [220, '\\']
  , [221, ']']
  , [222, '\'']
])
var no_metas = [
  48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66,
  67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 
  79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90
]

module.exports.getCharFromCode = function( code ){
  return (map.get( parseInt(code, 10) ) || null)
}

module.exports.isMeta = function( key ){
  // Key can be the positional code or it's key counterpart
  return (map.has( key )?(no_metas.indexOf( key ) !== -1):(no_metas.indexOf(Object.keys(map.values())[ key ])))
}