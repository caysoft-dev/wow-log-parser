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

const c = require('./constants')

const parseHex = (str) => {
  return parseInt(str.substring(2), 16)
}

const parse = {
  events: {}
};

function getPrefix(event) {
  const specialEvents = ['DAMAGE_SHIELD', 'SPELL_ABSORBED', 'DAMAGE_SPLIT', 'DAMAGE_SHIELD_MISSED', 'ENCHANT_APPLIED', 'ENCHANT_REMOVED', 'PARTY_KILL', 'UNIT_DIED', 'UNIT_DESTROYED', 'UNIT_DISSIPATES']
  if (specialEvents.includes(event))
    return 'SPECIAL'

  const prefixes = ['SWING', 'RANGE', 'SPELL_PERIODIC', 'SPELL_BUILDING', 'SPELL', 'ENVIRONMENTAL']
  for (let prefix of prefixes) {
    if (event.startsWith(prefix))
      return prefix
  }
  throw new Error(`unknown prefix for eventType ${event}`)
}

/**
 * parse spell school
 * @param  {Integer} school Integer representation of school
 * @return {String}         String representation of spell School
 */
parse.school = (school, line) => {
  if (typeof school !== 'number') {
    school = parseInt(school)
    if (school.isNaN) throw new TypeError('school has wrong format.')
  }

  if (school === 0)
    return 'none'

  if (school < 1 || school > c.schools.length || c.schools[school - 1] === '') {
    console.log(line)
    throw new TypeError('school #' + school + ' is not valid.')
  }
  return c.schools[school - 1]
}

/**
 * parse power type
 * @param  {Integer} power Integer representation of power
 * @return {String}         String representation of power type
 */
parse.power = (power) => {
  if (typeof power !== 'number') {
    power = parseInt(power)
    if (power.isNaN) throw new TypeError('power has wrong format.')
  }
  if (power < - 2 || power > c.powers.length - 3 || c.powers[power + 2] === '') {
    throw new TypeError('power ' + power + ' is not valid.')
  }
  return c.powers[power + 2]
}

parse.date = (d) => {
  let date = new Date()
  // including a date library for this would be overkill. works.
  d = d.split(' ')
  date.setMonth(d[0].split('/')[0] - 1)
  date.setDate(d[0].split('/')[1])
  date.setHours(d[1].split(':')[0])
  date.setMinutes(d[1].split(':')[1])
  date.setSeconds(d[1].split(':')[2].split('.')[0])
  date.setMilliseconds(d[1].split(':')[2].split('.')[1])

  return date
}

const parseCLChunk = (chunk) => {
  if (chunk === 'null')
    return null

  if (!chunk.includes('(') && !chunk.includes(')')) {
    const res = chunk.split(',')
    return res.filter(x => x !== '')
  }

  let depth = 0
  let parts = []
  let buffer = []
  for (let i = 0; i < chunk.length; ++i) {
    if (chunk[i] === '(') ++depth
    else if (chunk[i] === ')') --depth
    else buffer.push(chunk[i])

    if (depth === 0) {
      parts.push(buffer.join(''))
      buffer = []
    }
  }

  parts = parts.filter(x => x !== ',')

  if (parts.length === 1)
    return parseCLChunk(parts[0])

  return parts.map(x => {
    return parseCLChunk(x)
  })
}

parse.combatantInfo = (o, data) => {
  o.playerGUID = data.shift()
  o.faction = data.shift()
  o.strength = data.shift()
  o.agility = data.shift()
  o.stamina = data.shift()
  o.intelligence = data.shift()
  o.dodge = data.shift()
  o.parry = data.shift()
  o.block = data.shift()
  o.critMelee = data.shift()
  o.critRanged = data.shift()
  o.critSpell = data.shift()
  o.speed = data.shift()
  o.lifesteal = data.shift()
  o.hasteMelee = data.shift()
  o.hasteRanged = data.shift()
  o.hasteSpell = data.shift()
  o.avoidance = data.shift()
  o.mastery = data.shift()
  o.versatilityDamageDone = data.shift()
  o.versatilityHealingDone = data.shift()
  o.versatilityDamageTaken = data.shift()
  o.armor = data.shift()
  o.currentSpecID = data.shift()

  o.characterData = []

  const chrData = data.join(',')
      .split('[]')
      .join('[null]')
      .split(/[\[\]]/g)
      .filter(x => x !== ',')

  o.talents = parseCLChunk(chrData[0])
  o.items = parseCLChunk(chrData[1])

  const buffData = parseCLChunk(chrData[2]);
  o.buffs = buffData.map((x, i) => {
    if (x.startsWith('Player-')) {
      return {
        casterGUID: x,
        spellId: parseInt(buffData[i+1])
      }
    }
    return null
  }).filter(x => !!x)

  return o
}

/**
 * parse a single line and return it as Object
 * @param  {String} line    line from the WoWCombatLog.txt
 * @param  {Integer} version Log version. Ignored for now.
 * @param  {Boolean} advanced Advanced Combat Log?
 * @return {Object}         Object representation of line
 */
parse.line = (line, version, advanced) => {
  let o = {}
  let l = line.split('  ')
  o._line = line
  o.date = parse.date(l[0])

  l = l[1].split(',')

  o.event = l.shift()

  switch (o.event) {
    case 'ZONE_CHANGE':
      o.instanceID = l.shift()
      o.zoneName = l.shift()
      o.difficultyID = l.shift()
      break
    case 'MAP_CHANGE':
      o.uiMapID = l.shift()
      o.uiMapName = l.shift()
      o.x0 = l.shift()
      o.x1 = l.shift()
      o.y0 = l.shift()
      o.y1 = l.shift()
      break
    case 'COMBAT_LOG_VERSION':
      o.version = parseInt(l[0])
      o.advancedLogEnabled = l[2] === '1'
      o.buildVersion = l[4]
      o.projectId = l[6]
      return o
    case 'ENCOUNTER_START':
      o.encounterID = parseInt(l.shift())
      o.encounterName = l.shift()
      o.difficultyID = parseInt(l.shift())
      o.groupSize = parseInt(l.shift())
      o.instanceID = parseInt(l.shift())
      return o
    case 'ENCOUNTER_END':
      o.encounterID = parseInt(l.shift())
      o.encounterName = l.shift()
      o.difficultyID = parseInt(l.shift())
      o.groupSize = parseInt(l.shift())
      o.success = l.shift() === '1'
      return o
    case 'COMBATANT_INFO':
      return parse.combatantInfo(o, l)
    case 'EMOTE':
      o.data = l
      return o

    default: {
      parse.events[o.event] = o.event
      o.source = {
        guid: l.shift(),
        name: l.shift().replace(/"/g,''),
        flags: parseHex(l.shift()),
        raidflags: parseHex(l.shift())
      }
      o.target = {
        guid: l.shift(),
        name: l.shift().replace(/"/g, ''),
        flags: parseHex(l.shift()),
        raidflags: parseHex(l.shift())
      }

      const getFlagsInfo = (flags) => {
        const result = []
        const unitFlags = Object.entries(c.unitFlags)
        for (let unitFlag of unitFlags) {
          if ((flags & unitFlag[1]) !== 0)
            result.push(unitFlag[0])
        }
        return result
      }

      o.source.flagsInfo = getFlagsInfo(o.source.flags)
      o.target.flagsInfo = getFlagsInfo(o.target.flags)

      if (o.target.name === undefined) o.target = undefined

      switch(o.event) {
        case 'ENCHANT_APPLIED':
        case 'ENCHANT_REMOVED':
        case 'PARTY_KILL':
        case 'UNIT_DIED':
        case 'UNIT_DESTROYED':
        case 'UNIT_DISSIPATES':
          return o
      }

      o.eventPrefix = getPrefix(o.event)
      switch(o.eventPrefix) {
        case 'SWING':
          break
        case 'SPELL':
        case 'RANGE':
        case 'SPELL_PERIODIC':
        case 'SPELL_BUILDING':
          o.spell = {
            id: parseInt(l.shift()),
            name: l.shift().replace(/"/g,''),
            school: parse.school(parseHex(l.shift()), line)
          }
          break
        case 'ENVIRONMENTAL':
          o.environmentalType = l.shift()
          break
      }

      if (o.eventPrefix === 'SPECIAL') {
        o.eventSuffix = o.event
      } else {
        o.eventSuffix = o.event.replace(o.eventPrefix+'_', '').trim()
      }

      if (advanced && l.length >= 17) {
        o.advanced = {
          unitGUID: l.shift(),
          ownerGUID: l.shift(),
          currentHp: l.shift(),
          maxHp: l.shift(),
          attackPower: l.shift(),
          spellPower: l.shift(),
          armor: l.shift(),
          powerType: l.shift(),
          currentPower: l.shift(),
          maxPower: l.shift(),
          powerCost: l.shift(),
          positionX: l.shift(),
          positionY: l.shift(),
          uiMapID: l.shift(),
          facing: l.shift(),
          levelOrItemLevel: l.shift()
        }
      }

      switch (o.eventSuffix) {
        case 'DAMAGE':
        case 'DAMAGE_SHIELD':
        case 'DAMAGE_SPLIT':
          o.amount = parseInt(l.shift())
          o.overkill = parseInt(l.shift())
          o.school = parseInt(l.shift())
          o.resisted = parseInt(l.shift())
          break
        case 'DAMAGE_LANDED':
          o.amount = l.shift()
          o.overkill = l.shift()
          o.school = l.shift()
          o.resisted = l.shift()
          o.blocked = l.shift()
          o.absorbed = l.shift()
          o.critical = l.shift()
          o.glancing = l.shift()
          o.crushing = l.shift()
          o.isOffHand = l.shift()
          break;
        case 'MISSED':
        case 'DAMAGE_SHIELD_MISSED':
          o.missType = parseInt(l.shift())
          o.isOffhand = l.shift()
          o.amountMissed = parseInt(l.shift())
          break
        case 'HEAL':
          o.amount = parseInt(l.shift())
          o.overheal = parseInt(l.shift())
          o.absorbed = parseInt(l.shift())
          o.critical = parseInt(l.shift())
          break
        case 'ENERGIZE':
          o.amount = parseInt(l.shift())
          o.overEnergize = parseInt(l.shift())
          o.powerType = parse.power(parseHex(l.shift()))
          o.currentPower = parseInt(l.shift())
          break
        case 'LEECH':
        case 'DRAIN':
          o.amount = parseInt(l.shift())
          o.powerType = parse.power(parseHex(l.shift()))
          o.extraAmount = parseInt(l.shift())
          break
        case 'INTERRUPT':
        case 'DISPEL_FAILED':
          o.extraSpellId = parseInt(l.shift())
          o.extraSpellName = l.shift().replace(/"/g,'')
          o.extraSchool = parse.school(parseHex(l.shift()), line)
          break
        case 'DISPEL':
        case 'STOLEN':
        case 'AURA_BROKEN_SPELL':
          o.extraSpellId = parseInt(l.shift())
          o.extraSpellName = l.shift().replace(/"/g,'')
          o.extraSchool = parse.school(parseHex(l.shift()), line)
          o.auraType = l.shift().replace(/"/g,'')
        case 'EXTRA_ATTACKS':
          o.amount = parseInt(l.shift())
          break
        case 'AURA_APPLIED':
        case 'AURA_REMOVED':
        case 'AURA_APPLIED_DOSE':
        case 'AURA_REMOVED_DOSE':
        case 'AURA_REFRESH':
          o.auraType = l.shift().replace(/"/g,'')
          o.amount = parseInt(l.shift())
          break
        case 'AURA_BROKEN':
          o.auraType = l.shift().replace(/"/g,'')
          break
        case 'CAST_FAILED':
          o.failedType = l.shift().replace(/"/g,'')
          break
        case 'SPELL_ABSORBED':
          const isMagic = l.length === 12;
          if (isMagic) {
            o.damageSpell = {
              id: parseInt(l.shift()),
              name: l.shift().replace(/"/g,''),
              school: parse.school(parseHex(l.shift()), line)
            }
          }
          o.originGUID = l.shift()
          o.originName = l.shift()
          o.originFlags = l.shift()
          o.originRaidFlags = l.shift()

          o.spell = {
            id: parseInt(l.shift()),
            name: l.shift().replace(/"/g,''),
            school: parse.school(parseHex(l.shift()), line)
          }

          o.amount = l.shift()
          o.amount2 = l.shift()
          break
        case 'ENCHANT_APPLIED':
        case 'ENCHANT_REMOVED':
        case 'PARTY_KILL':
        case 'UNIT_DIED':
        case 'UNIT_DESTROYED':
        case 'UNIT_DISSIPATES':
        case 'CAST_START':
        case 'CAST_SUCCESS':
        case 'INSTAKILL':
        case 'DURABILITY_DAMAGE':
        case 'DURABILITY_DAMAGE_ALL':
        case 'CREATE':
        case 'SUMMON':
        case 'RESURRECT':
          break
        default:
          throw new Error('unrecognized event suffix ' + o.eventSuffix)
          break
      }
    }
  }

  return o
}

module.exports = parse
