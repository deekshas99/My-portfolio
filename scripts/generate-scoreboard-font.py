"""Build the original 5×7 LED face used by the garden readout.

Run with FontTools installed. Each row is a five-bit mask, left to right.
"""
from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen


PATTERNS = {
    "A": "0E11111F111111", "B": "1E11111E11111E", "C": "0E11101010110E",
    "D": "1E11111111111E", "E": "1F10101E10101F", "F": "1F10101E101010",
    "G": "0E11101711110F", "H": "1111111F111111", "I": "0E04040404040E",
    "J": "0702020212120C", "K": "11121418141211", "L": "1010101010101F",
    "M": "111B1515111111", "N": "11191513111111", "O": "0E11111111110E",
    "P": "1E11111E101010", "Q": "0E11111115120D", "R": "1E11111E141211",
    "S": "0F10100E01011E", "T": "1F040404040404", "U": "1111111111110E",
    "V": "11111111110A04", "W": "11111115151B11", "X": "11110A040A1111",
    "Y": "11110A04040404", "Z": "1F01020408101F",
    "0": "0E11131519110E", "1": "040C040404040E", "2": "0E11010204081F",
    "3": "1E01010601011E", "4": "02060A121F0202", "5": "1F101E0101110E",
    "6": "0610101E11110E", "7": "1F010204080808", "8": "0E11110E11110E",
    "9": "0E11110F01010C", "%": "19190204081313", ".": "00000000000C0C",
    " ": "00000000000000",
}


def glyph(pattern):
    pen = TTGlyphPen(None)
    for row in range(7):
        bits = int(pattern[row * 2:row * 2 + 2], 16)
        for column in range(5):
            if bits & (1 << (4 - column)):
                x, y = 22 + column * 116, 42 + (6 - row) * 116
                # Chamfered LED packages keep a crisp edge at small sizes.
                corners = [(0, 12), (12, 0), (68, 0), (80, 12),
                           (80, 68), (68, 80), (12, 80), (0, 68)]
                pen.moveTo((x + corners[0][0], y + corners[0][1]))
                for dx, dy in corners[1:]:
                    pen.lineTo((x + dx, y + dy))
                pen.closePath()
    return pen.glyph()


def main():
    font = FontBuilder(1000, isTTF=True)
    mapping = {ord(char): f"uni{ord(char):04X}" for char in PATTERNS}
    glyphs = {".notdef": glyph(PATTERNS[" "])}
    glyphs.update({mapping[ord(char)]: glyph(pattern) for char, pattern in PATTERNS.items()})
    font.setupGlyphOrder(list(glyphs))
    font.setupCharacterMap(mapping)
    font.setupGlyf(glyphs)
    font.setupHorizontalMetrics({
        name: (696, item.xMin if item.numberOfContours else 0)
        for name, item in glyphs.items()
    })
    font.setupHorizontalHeader(ascent=855, descent=-145)
    font.setupNameTable({
        "familyName": "Stillworld LED", "styleName": "Regular",
        "uniqueFontIdentifier": "StillworldLED-Regular",
        "fullName": "Stillworld LED Regular", "psName": "StillworldLED-Regular",
    })
    font.setupOS2(sTypoAscender=855, sTypoDescender=-145, usWinAscent=855, usWinDescent=145)
    font.setupPost(isFixedPitch=1)
    font.font.flavor = "woff"
    output = Path(__file__).resolve().parents[1] / "public" / "stillworld-led.woff"
    font.save(output)


if __name__ == "__main__":
    main()
