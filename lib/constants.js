'use strict';
/*
 *    wow-log-parser - Parse World of Warcraft combat logs
 *   Copyright (C) 2017   Jan Koppe <post@jankoppe.de>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// starts at 1
module.exports.schools = ['Physical', 'Holy', 'Holystrike', 'Fire',
    'Flamestrike', 'Holyfire', '', 'Nature',
    'Stormstrike', 'Holystorm', '', 'Firestorm',
    '', '', '', 'Frost',
    'Froststrike', 'Holyfrost', '', 'Frostfire',
    '', '', '', 'Froststorm',
    '', '', '', 'Elemental',
    '', '', '', 'Shadow',
    'Shadowstrike', 'Twilight', '', 'Shadowflame',
    '', '', '', 'Plague',
    '', '', '', '',
    '', '', '', 'Shadowfrost',
    '', '', '', '',
    '', '', '', '',
    '', '', '', '',
    '', '', '', 'Arcane',
    'Spellstrike', 'Divine', '', 'Spellfire',
    '', '', '', 'Astral',
    '', '', '', '',
    '', '', '', 'Spellfrost',
    '', '', '', '',
    '', '', '', '',
    '', '', '', '',
    '', '', '', 'Spellshadow',
    '', '', '', '',
    '', '', '', '',
    '', '', '', '',
    '', '', '', '',
    '', '', '', '',
    '', '', '', '',
    '', '', '', 'Chromatic (Chaos)',
    '', 'Magic', 'Chaos'
]

// starts at -2
module.exports.powers = ['Health', '', 'Mana', 'Rage', 'Focus', 'Energy', '', 'Runes', 'Runic Power', 'SoulShards', 'LunarPower', 'HolyPower', 'Alternate']

module.exports.unitFlags = {
    UNIT_FLAG_AFFILIATION_MINE: 0x00000001,
    UNIT_FLAG_AFFILIATION_PARTY: 0x00000002,
    UNIT_FLAG_AFFILIATION_RAID: 0x00000004,
    UNIT_FLAG_AFFILIATION_OUTSIDER: 0x00000008,
    UNIT_FLAG_AFFILIATION_MASK: 0x0000000F,
    UNIT_FLAG_REACTION_FRIENDLY: 0x00000010,
    UNIT_FLAG_REACTION_NEUTRAL: 0x00000020,
    UNIT_FLAG_REACTION_HOSTILE: 0x00000040,
    UNIT_FLAG_REACTION_MASK: 0x000000F0,
    UNIT_FLAG_CONTROL_PLAYER: 0x00000100,
    UNIT_FLAG_CONTROL_NPC: 0x00000200,
    UNIT_FLAG_CONTROL_MASK: 0x00000300,
    UNIT_FLAG_TYPE_PLAYER: 0x00000400,
    UNIT_FLAG_TYPE_NPC: 0x00000800,
    UNIT_FLAG_TYPE_PET: 0x00001000,
    UNIT_FLAG_TYPE_GUARDIAN: 0x00002000,
    UNIT_FLAG_TYPE_OBJECT: 0x00004000,
    UNIT_FLAG_TYPE_MASK: 0x0000FC00,
}

module.exports.unitFlagsMap = {
    0x00000001: 'UNIT_FLAG_AFFILIATION_MINE',
    0x00000002: 'UNIT_FLAG_AFFILIATION_PARTY',
    0x00000004: 'UNIT_FLAG_AFFILIATION_RAID',
    0x00000008: 'UNIT_FLAG_AFFILIATION_OUTSIDER',
    0x0000000F: 'UNIT_FLAG_AFFILIATION_MASK',
    0x00000010: 'UNIT_FLAG_REACTION_FRIENDLY',
    0x00000020: 'UNIT_FLAG_REACTION_NEUTRAL',
    0x00000040: 'UNIT_FLAG_REACTION_HOSTILE',
    0x000000F0: 'UNIT_FLAG_REACTION_MASK',
    0x00000100: 'UNIT_FLAG_CONTROL_PLAYER',
    0x00000200: 'UNIT_FLAG_CONTROL_NPC',
    0x00000300: 'UNIT_FLAG_CONTROL_MASK',
    0x00000400: 'UNIT_FLAG_TYPE_PLAYER',
    0x00000800: 'UNIT_FLAG_TYPE_NPC',
    0x00001000: 'UNIT_FLAG_TYPE_PET',
    0x00002000: 'UNIT_FLAG_TYPE_GUARDIAN',
    0x00004000: 'UNIT_FLAG_TYPE_OBJECT',
    0x0000FC00: 'UNIT_FLAG_TYPE_MASK',
}
