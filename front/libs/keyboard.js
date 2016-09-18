'use strict';

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

// names of known key codes registrable on electron(0-255)
var map = {
    // Mods
      '17'  : 'Ctrl'
    , '91'  : 'Super'
    , '18'  : 'Alt'
    , '16'  : 'Shift'
    // Key codes
    , '9'   : 'Tab'
    , '48'  : '0'
    , '49'  : '1'
    , '50'  : '2'
    , '51'  : '3'
    , '52'  : '4'
    , '53'  : '5'
    , '54'  : '6'
    , '55'  : '7'
    , '56'  : '8'
    , '57'  : '9'
    , '65'  : 'A'
    , '66'  : 'B'
    , '67'  : 'C'
    , '68'  : 'D'
    , '69'  : 'E'
    , '70'  : 'F'
    , '71'  : 'G'
    , '72'  : 'H'
    , '73'  : 'I'
    , '74'  : 'J'
    , '75'  : 'K'
    , '76'  : 'L'
    , '77'  : 'M'
    , '78'  : 'N'
    , '79'  : 'O'
    , '80'  : 'P'
    , '81'  : 'Q'
    , '82'  : 'R'
    , '83'  : 'S'
    , '84'  : 'T'
    , '85'  : 'U'
    , '86'  : 'V'
    , '87'  : 'W'
    , '88'  : 'X'
    , '89'  : 'Y'
    , '90'  : 'Z'
    , '112' : 'F1'
    , '113' : 'F2'
    , '114' : 'F3'
    , '115' : 'F4'
    , '116' : 'F5'
    , '117' : 'F6'
    , '118' : 'F7'
    , '119' : 'F8'
    , '120' : 'F9'
    , '121' : 'F10'
    , '122' : 'F11'
    , '123' : 'F12'
    , '124' : 'F13'
    , '125' : 'F14'
    , '126' : 'F15'
    , '127' : 'F16'
    , '128' : 'F17'
    , '129' : 'F18'
    , '130' : 'F19'
    , '131' : 'F20'
    , '132' : 'F21'
    , '133' : 'F22'
    , '134' : 'F23'
    , '135' : 'F24'
    , '171' : 'Plus'
    , '32'  : 'Space'
    , '8'   : 'Backspace'
    , '46'  : 'Delete'
    , '45'  : 'Insert'
    , '13'  : 'Enter'
    , '38'  : 'Up'
    , '40'  : 'Down'
    , '37'  : 'Left'
    , '39'  : 'Right'
    , '36'  : 'Home'
    , '35'  : 'End'
    , '33'  : 'PageUp'
    , '34'  : 'PageDown'
    , '27'  : 'Esc'
    , '183' : 'VolumeUp'
    , '182' : 'VolumeDown'
    , '181' : 'VolumeMute'
    , '250' : 'Play'
    , '19'  : 'Pause'
    // Punctuation
    , '58'  : ':'   // Colon
    , '60'  : '<'   // LessThan
    , '62'  : '>'   // GreaterThan
    , '63'  : '?'   // QuestionMark
    , '64'  : '@'   // AT
    , '161' : '!'   // Exclamation
    , '162' : '"'   // Double_quote
    , '164' : '$'   // Dollar
    , '165' : '%'   // Percent
    , '166' : '&'   // Ampersand
    , '167' : '_'   // Underscore
    , '168' : '('   // Open_paren
    , '169' : ')'   // Close_paren
    , '170' : '*'   // Asterisk
    , '171' : '+'   // Plus
    , '172' : '|'   // Pipe
    , '174' : '{'   // O_curly_brace
    , '175' : '}'   // C_curly_brace
    , '176' : '~'   // Tilde
    , '186' : ';'   // Semicolon
    , '187' : '='   // Equals
    , '188' : ','   // Comma
    , '189' : '-'   // Minus
    , '190' : '.'   // Period
    , '191' : '/'   // Slash
    , '192' : '`'   // Back_quote
    , '219' : '['   // Open_bracket
    , '220' : '\\'  // Back_slash
    , '221' : ']'   // Close_bracket
    , '222' : '\''  // Quote
}

// Taken from http://stackoverflow.com/questions/1772179/get-character-value-from-keycode-in-javascript-then-trim

/*var map = [
    "", // [0]
    "", // [1]
    "", // [2]
    "Cancel", // [3]
    "", // [4]
    "", // [5]
    "Help", // [6]
    "", // [7]
    "BackSpace", // [8]
    "Tab", // [9]
    "", // [10]
    "", // [11]
    "Clear", // [12]
    "Enter", // [13]
    "EnterSpecial", // [14]
    "", // [15]
    "Shift", // [16]
    "Ctrl", // [17]
    "Alt", // [18]
    "Pause", // [19]
    "CapsLock", // [20]
    "", // Kana [21]
    "", // Eisu [22]
    "", // Junja [23]
    "", // Final [24]
    "", // Hanja [25]
    "", // [26]
    "Esc", // [27]
    "", // Convert [28]
    "", // Nonconvert [29]
    "", // Accept [30]
    "", // Modechange [31]
    "Space", // [32]
    "PageUp", // [33]
    "PageDown", // [34]
    "End", // [35]
    "Home", // [36]
    "Left", // [37]
    "Up", // [38]
    "Right", // [39]
    "Down", // [40]
    "", // Select [41]
    "Print", // [42]
    "Execute", // [43]
    "Printscreen", // [44]
    "Insert", // [45]
    "Delete", // [46]
    "", // [47]
    "0", // [48]
    "1", // [49]
    "2", // [50]
    "3", // [51]
    "4", // [52]
    "5", // [53]
    "6", // [54]
    "7", // [55]
    "8", // [56]
    "9", // [57]
    "Colon", // [58]
    "Semicolon", // [59]
    "LessThan", // [60]
    "Equals", // [61]
    "GreaterThan", // [62]
    "QuestionMark", // [63]
    "AT", // [64]
    "A", // [65]
    "B", // [66]
    "C", // [67]
    "D", // [68]
    "E", // [69]
    "F", // [70]
    "G", // [71]
    "H", // [72]
    "I", // [73]
    "J", // [74]
    "K", // [75]
    "L", // [76]
    "M", // [77]
    "N", // [78]
    "O", // [79]
    "P", // [80]
    "Q", // [81]
    "R", // [82]
    "S", // [83]
    "T", // [84]
    "U", // [85]
    "V", // [86]
    "W", // [87]
    "X", // [88]
    "Y", // [89]
    "Z", // [90]
    "WinKey", // [91] Windows Key (Windows) or Command Key (Mac)
    "", // [92]
    "ContextMenu", // [93]
    "", // [94]
    "Sleep", // [95]
    "Numpad0", // [96]
    "Numpad1", // [97]
    "Numpad2", // [98]
    "Numpad3", // [99]
    "Numpad4", // [100]
    "Numpad5", // [101]
    "Numpad6", // [102]
    "Numpad7", // [103]
    "Numpad8", // [104]
    "Numpad9", // [105]
    "Multiply", // [106]
    "Add", // [107]
    "Separator", // [108]
    "Subtract", // [109]
    "Decimal", // [110]
    "Divide", // [111]
    "F1", // [112]
    "F2", // [113]
    "F3", // [114]
    "F4", // [115]
    "F5", // [116]
    "F6", // [117]
    "F7", // [118]
    "F8", // [119]
    "F9", // [120]
    "F10", // [121]
    "F11", // [122]
    "F12", // [123]
    "F13", // [124]
    "F14", // [125]
    "F15", // [126]
    "F16", // [127]
    "F17", // [128]
    "F18", // [129]
    "F19", // [130]
    "F20", // [131]
    "F21", // [132]
    "F22", // [133]
    "F23", // [134]
    "F24", // [135]
    "", // [136]
    "", // [137]
    "", // [138]
    "", // [139]
    "", // [140]
    "", // [141]
    "", // [142]
    "", // [143]
    "NumLock", // [144]
    "ScrollLock", // [145]
    "", // Win_oem_fj_jisho [146]
    "", // Win_oem_fj_masshou [147]
    "", // Win_oem_fj_touroku [148]
    "", // Win_oem_fj_loya [149]
    "", // Win_oem_fj_roya [150]
    "", // [151]
    "", // [152]
    "", // [153]
    "", // [154]
    "", // [155]
    "", // [156]
    "", // [157]
    "", // [158]
    "", // [159]
    "Circumflex", // [160]
    "Exclamation", // [161]
    "Double_quote", // [162]
    "Hash", // [163]
    "Dollar", // [164]
    "Percent", // [165]
    "Ampersand", // [166]
    "Underscore", // [167]
    "Open_paren", // [168]
    "Close_paren", // [169]
    "Asterisk", // [170]
    "Plus", // [171]
    "Pipe", // [172]
    "Hyphen_minus", // [173]
    "Open_curly_bracket", // [174]
    "Close_curly_bracket", // [175]
    "Tilde", // [176]
    "", // [177]
    "", // [178]
    "", // [179]
    "", // [180]
    "VolumeMute", // [181]
    "VolumeDown", // [182]
    "VolumeUp", // [183]
    "", // [184]
    "", // [185]
    "Semicolon", // [186]
    "Equals", // [187]
    "Comma", // [188]
    "Minus", // [189]
    "Period", // [190]
    "Slash", // [191]
    "Back_quote", // [192]
    "", // [193]
    "", // [194]
    "", // [195]
    "", // [196]
    "", // [197]
    "", // [198]
    "", // [199]
    "", // [200]
    "", // [201]
    "", // [202]
    "", // [203]
    "", // [204]
    "", // [205]
    "", // [206]
    "", // [207]
    "", // [208]
    "", // [209]
    "", // [210]
    "", // [211]
    "", // [212]
    "", // [213]
    "", // [214]
    "", // [215]
    "", // [216]
    "", // [217]
    "", // [218]
    "Open_bracket", // [219]
    "Back_slash", // [220]
    "Close_bracket", // [221]
    "Quote", // [222]
    "", // [223]
    "Meta", // [224]
    "Altgr", // [225]
    "", // [226]
    "", // Win_ico_help [227]
    "", // Win_ico_00 [228]
    "", // [229]
    "", // Win_ico_clear [230]
    "", // [231]
    "", // [232]
    "", // Win_oem_reset [233]
    "", // Win_oem_jump [234]
    "", // Win_oem_pa1 [235]
    "", // Win_oem_pa2 [236]
    "", // Win_oem_pa3 [237]
    "", // Win_oem_wsctrl [238]
    "", // Win_oem_cusel [239]
    "", // Win_oem_attn [240]
    "", // Win_oem_finish [241]
    "", // Win_oem_copy [242]
    "", // Win_oem_auto [243]
    "", // Win_oem_enlw [244]
    "", // Win_oem_backtab [245]
    "", // Attn [246]
    "", // Crsel [247]
    "", // Exsel [248]
    "", // Ereof [249]
    "", // Play [250]
    "", // Zoom [251]
    "", // [252]
    "", // Pa1 [253]
    "", // Win_oem_clear [254]
    "" // [255]
];*/

module.exports.getCharFromCode = function( code ){
    console.log('getCharFromCode', code, code.toString(), map[code.toString()]);
    return (map.hasOwnProperty(code.toString()))?map[ code.toString() ]:null
}