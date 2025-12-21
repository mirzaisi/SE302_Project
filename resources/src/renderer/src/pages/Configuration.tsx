import { useEffect, useState } from 'react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

// shut up tslint
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Configuration() {
  const [config, setConfig] = useState({
    numDays: 5,
    slotsPerDay: 3
  })

  const [timeSlots, setTimeSlots] = useState<
    Array<{
      day_number: number
      slot_number: number
      display_name: string
      start_time: string
      end_time: string
    }>
  >([])

  const [optimization, setOptimization] = useState({
    balance_across_days: true,
    minimize_days_used: false,
    minimize_rooms_used: false,
    place_difficult_early: false,
    place_difficult_late: false
  })

  const [relaxations, setRelaxations] = useState({
    allow_consecutive_slots: false,
    max_consecutive_violations: 0,
    allow_three_per_day: false,
    max_three_per_day_violations: 0,
    allow_capacity_overflow: false,
    max_capacity_overflow_percent: 10
  })

  useEffect(() => {
    const loadConfiguration = async (): Promise<void> => {
      try {
        const configResult = await window.api.db.get(
          'SELECT * FROM exam_period_config WHERE id = 1',
          []
        )
        const optResult = await window.api.db.get(
          'SELECT * FROM optimization_settings WHERE id = 1',
          []
        )
        const relaxResult = await window.api.db.get(
          'SELECT * FROM constraint_relaxations WHERE id = 1',
          []
        )
        const slotsResult = await window.api.db.query(
          'SELECT * FROM time_slots ORDER BY day_number, slot_number',
          []
        )

        if (configResult) {
          const config = configResult as { num_days: number; slots_per_day: number }
          setConfig({ numDays: config.num_days, slotsPerDay: config.slots_per_day })
        }
        if (optResult) {
          const opt = optResult as {
            balance_across_days: number
            minimize_days_used: number
            minimize_rooms_used: number
            place_difficult_early: number
            place_difficult_late: number
          }
          setOptimization({
            balance_across_days: !!opt.balance_across_days,
            minimize_days_used: !!opt.minimize_days_used,
            minimize_rooms_used: !!opt.minimize_rooms_used,
            place_difficult_early: !!opt.place_difficult_early,
            place_difficult_late: !!opt.place_difficult_late
          })
        }
        if (relaxResult) {
          const relax = relaxResult as {
            allow_consecutive_slots: number
            max_consecutive_violations: number
            allow_three_per_day: number
            max_three_per_day_violations: number
            allow_capacity_overflow: number
            max_capacity_overflow_percent: number
          }
          setRelaxations({
            allow_consecutive_slots: !!relax.allow_consecutive_slots,
            max_consecutive_violations: relax.max_consecutive_violations || 0,
            allow_three_per_day: !!relax.allow_three_per_day,
            max_three_per_day_violations: relax.max_three_per_day_violations || 0,
            allow_capacity_overflow: !!relax.allow_capacity_overflow,
            max_capacity_overflow_percent: relax.max_capacity_overflow_percent || 10
          })
        }

        // Generate time slots if they don't exist
        if (configResult) {
          const config = configResult as { num_days: number; slots_per_day: number }
          if (slotsResult.length === 0) {
            generateDefaultTimeSlots(config.num_days, config.slots_per_day)
          } else {
            const slots = slotsResult as Array<{
              day_number: number
              slot_number: number
              display_name: string
              start_time: string
              end_time: string
            }>
            setTimeSlots(slots)
          }
        }
      } catch (error) {
        console.error('Failed to load configuration:', error)
      }
    }
    loadConfiguration()
  }, [])

  const loadConfiguration = async (): Promise<void> => {
    try {
      const configResult = await window.api.db.get(
        'SELECT * FROM exam_period_config WHERE id = 1',
        []
      )
      const optResult = await window.api.db.get(
        'SELECT * FROM optimization_settings WHERE id = 1',
        []
      )
      const relaxResult = await window.api.db.get(
        'SELECT * FROM constraint_relaxations WHERE id = 1',
        []
      )
      const slotsResult = await window.api.db.query(
        'SELECT * FROM time_slots ORDER BY day_number, slot_number',
        []
      )

      if (configResult) {
        const config = configResult as { num_days: number; slots_per_day: number }
        setConfig({ numDays: config.num_days, slotsPerDay: config.slots_per_day })
      }
      if (optResult) {
        const opt = optResult as {
          balance_across_days: number
          minimize_days_used: number
          minimize_rooms_used: number
          place_difficult_early: number
          place_difficult_late: number
        }
        setOptimization({
          balance_across_days: !!opt.balance_across_days,
          minimize_days_used: !!opt.minimize_days_used,
          minimize_rooms_used: !!opt.minimize_rooms_used,
          place_difficult_early: !!opt.place_difficult_early,
          place_difficult_late: !!opt.place_difficult_late
        })
      }
      if (relaxResult) {
        const relax = relaxResult as {
          allow_consecutive_slots: number
          max_consecutive_violations: number
          allow_three_per_day: number
          max_three_per_day_violations: number
          allow_capacity_overflow: number
          max_capacity_overflow_percent: number
        }
        setRelaxations({
          allow_consecutive_slots: !!relax.allow_consecutive_slots,
          max_consecutive_violations: relax.max_consecutive_violations || 0,
          allow_three_per_day: !!relax.allow_three_per_day,
          max_three_per_day_violations: relax.max_three_per_day_violations || 0,
          allow_capacity_overflow: !!relax.allow_capacity_overflow,
          max_capacity_overflow_percent: relax.max_capacity_overflow_percent || 10
        })
      }

      // Generate time slots if they don't exist
      if (configResult) {
        const config = configResult as { num_days: number; slots_per_day: number }
        if (slotsResult.length === 0) {
          generateDefaultTimeSlots(config.num_days, config.slots_per_day)
        } else {
          const slots = slotsResult as Array<{
            day_number: number
            slot_number: number
            display_name: string
            start_time: string
            end_time: string
          }>
          setTimeSlots(slots)
        }
      }
    } catch (error) {
      console.error('Failed to load configuration:', error)
    }
  }

  const generateDefaultTimeSlots = async (numDays: number, slotsPerDay: number): Promise<void> => {
    const defaultTimes = [
      { start: '09:00', end: '11:00' },
      { start: '11:30', end: '13:30' },
      { start: '14:00', end: '16:00' },
      { start: '16:30', end: '18:30' }
    ]

    // First, clear all existing time slots
    await window.api.db.run('DELETE FROM time_slots', [])

    const slots: Array<{
      day_number: number
      slot_number: number
      display_name: string
      start_time: string
      end_time: string
    }> = []
    for (let day = 1; day <= numDays; day++) {
      for (let slot = 1; slot <= slotsPerDay; slot++) {
        const timeInfo = defaultTimes[slot - 1] || { start: '09:00', end: '11:00' }
        const slotData = {
          day_number: day,
          slot_number: slot,
          display_name: `Day ${day}, Slot ${slot}`,
          start_time: timeInfo.start,
          end_time: timeInfo.end
        }
        slots.push(slotData)

        // Insert into database
        await window.api.db.run(
          'INSERT INTO time_slots (day_number, slot_number, display_name, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
          [
            slotData.day_number,
            slotData.slot_number,
            slotData.display_name,
            slotData.start_time,
            slotData.end_time
          ]
        )
      }
    }
    setTimeSlots(slots)
  }

  const updateTimeSlot = (dayNum: number, slotNum: number, field: string, value: string): void => {
    setTimeSlots((prev) =>
      prev.map((slot) =>
        slot.day_number === dayNum && slot.slot_number === slotNum
          ? { ...slot, [field]: value }
          : slot
      )
    )
  }

  const saveConfiguration = async (): Promise<void> => {
    try {
      // Validate that time slots match the configuration
      const expectedSlots = config.numDays * config.slotsPerDay
      if (timeSlots.length !== expectedSlots) {
        alert(
          `Warning: You have ${timeSlots.length} time slots but should have ${expectedSlots} (${config.numDays} days × ${config.slotsPerDay} slots). Click "Regenerate Time Slots" to fix this.`
        )
        return
      }

      // Update exam period configuration
      await window.api.db.run(
        'UPDATE exam_period_config SET num_days = ?, slots_per_day = ? WHERE id = 1',
        [config.numDays, config.slotsPerDay]
      )

      // Update optimization settings
      await window.api.db.run(
        `UPDATE optimization_settings SET
          balance_across_days = ?, minimize_days_used = ?, minimize_rooms_used = ?,
          place_difficult_early = ?, place_difficult_late = ? WHERE id = 1`,
        [
          optimization.balance_across_days ? 1 : 0,
          optimization.minimize_days_used ? 1 : 0,
          optimization.minimize_rooms_used ? 1 : 0,
          optimization.place_difficult_early ? 1 : 0,
          optimization.place_difficult_late ? 1 : 0
        ]
      )

      // Update constraint relaxations
      await window.api.db.run(
        `UPDATE constraint_relaxations SET
          allow_consecutive_slots = ?, max_consecutive_violations = ?,
          allow_three_per_day = ?, max_three_per_day_violations = ?,
          allow_capacity_overflow = ?, max_capacity_overflow_percent = ? WHERE id = 1`,
        [
          relaxations.allow_consecutive_slots ? 1 : 0,
          relaxations.max_consecutive_violations || 0,
          relaxations.allow_three_per_day ? 1 : 0,
          relaxations.max_three_per_day_violations || 0,
          relaxations.allow_capacity_overflow ? 1 : 0,
          relaxations.max_capacity_overflow_percent || 10
        ]
      )

      // Clear and save time slots
      await window.api.db.run('DELETE FROM time_slots', [])
      for (const slot of timeSlots) {
        await window.api.db.run(
          'INSERT INTO time_slots (day_number, slot_number, display_name, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
          [slot.day_number, slot.slot_number, slot.display_name, slot.start_time, slot.end_time]
        )
      }

      alert('Configuration saved successfully!')

      // Reload to verify
      await loadConfiguration()
    } catch (error) {
      console.error('Failed to save configuration:', error)
      alert('Failed to save configuration: ' + error)
    }
  }

  const handleDaysOrSlotsChange = async (): Promise<void> => {
    // Regenerate time slots when days or slots change
    await generateDefaultTimeSlots(config.numDays, config.slotsPerDay)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Configuration</h1>
        <p className="text-gray-600 mt-2">
          Configure exam period, optimization goals, and constraint relaxations
        </p>
      </div>

      {/* Exam Period Configuration */}
      <Card className="p-6 bg-white border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Exam Period</h2>
        {timeSlots.length !== config.numDays * config.slotsPerDay && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Warning: Time slots ({timeSlots.length}) don&apos;t match configuration (
              {config.numDays} days × {config.slotsPerDay} slots ={' '}
              {config.numDays * config.slotsPerDay}). Click &quot;Regenerate Time Slots&quot; to
              update.
            </p>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Exam Days
            </label>
            <Input
              type="number"
              value={config.numDays}
              onChange={(e) => setConfig({ ...config, numDays: parseInt(e.target.value) })}
              className="w-32"
              min="1"
              max="30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Slots Per Day
            </label>
            <Input
              type="number"
              value={config.slotsPerDay}
              onChange={(e) => setConfig({ ...config, slotsPerDay: parseInt(e.target.value) })}
              className="w-32"
              min="1"
              max="10"
            />
          </div>
          <div>
            <Button onClick={handleDaysOrSlotsChange} className="bg-indigo-500 hover:bg-indigo-600">
              Regenerate Time Slots
            </Button>
          </div>
        </div>
      </Card>

      {/* Time Slots Configuration */}
      <Card className="p-6 bg-white">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Time Slot Configuration</h2>
        <div className="space-y-4 max-h-96 overflow-auto">
          {timeSlots.map((slot) => (
            <div key={`${slot.day_number}-${slot.slot_number}`} className="border-b pb-3">
              <div className="flex items-center space-x-4">
                <div className="w-32 text-sm font-medium text-gray-700">
                  Day {slot.day_number}, Slot {slot.slot_number}
                </div>
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Display Name</label>
                    <Input
                      value={slot.display_name}
                      onChange={(e) =>
                        updateTimeSlot(
                          slot.day_number,
                          slot.slot_number,
                          'display_name',
                          e.target.value
                        )
                      }
                      placeholder="e.g., Morning Session"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                    <Input
                      type="time"
                      value={slot.start_time}
                      onChange={(e) =>
                        updateTimeSlot(
                          slot.day_number,
                          slot.slot_number,
                          'start_time',
                          e.target.value
                        )
                      }
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Time</label>
                    <Input
                      type="time"
                      value={slot.end_time}
                      onChange={(e) =>
                        updateTimeSlot(
                          slot.day_number,
                          slot.slot_number,
                          'end_time',
                          e.target.value
                        )
                      }
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Optimization Goals */}
      <Card className="p-6 bg-white">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Optimization Goals</h2>
        <div className="space-y-3">
          {[
            { key: 'balance_across_days', label: 'Balance exams across days' },
            { key: 'minimize_days_used', label: 'Minimize number of days used' },
            { key: 'minimize_rooms_used', label: 'Minimize number of rooms used' },
            { key: 'place_difficult_early', label: 'Place difficult courses early' },
            { key: 'place_difficult_late', label: 'Place difficult courses late' }
          ].map((item) => (
            <label key={item.key} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={optimization[item.key]}
                onChange={(e) => setOptimization({ ...optimization, [item.key]: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Constraint Relaxations */}
      <Card className="p-6 bg-white">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Constraint Relaxations</h2>
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-3 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={relaxations.allow_consecutive_slots}
                onChange={(e) =>
                  setRelaxations({ ...relaxations, allow_consecutive_slots: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-gray-700">Allow consecutive exam slots for same student</span>
            </label>
            {relaxations.allow_consecutive_slots && (
              <div className="ml-7">
                <label className="block text-sm text-gray-600 mb-1">Max violations:</label>
                <Input
                  type="number"
                  value={relaxations.max_consecutive_violations}
                  onChange={(e) =>
                    setRelaxations({
                      ...relaxations,
                      max_consecutive_violations: parseInt(e.target.value)
                    })
                  }
                  className="w-32"
                  min="0"
                />
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-3 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={relaxations.allow_three_per_day}
                onChange={(e) =>
                  setRelaxations({ ...relaxations, allow_three_per_day: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-gray-700">Allow three exams per day for same student</span>
            </label>
            {relaxations.allow_three_per_day && (
              <div className="ml-7">
                <label className="block text-sm text-gray-600 mb-1">Max violations:</label>
                <Input
                  type="number"
                  value={relaxations.max_three_per_day_violations}
                  onChange={(e) =>
                    setRelaxations({
                      ...relaxations,
                      max_three_per_day_violations: parseInt(e.target.value)
                    })
                  }
                  className="w-32"
                  min="0"
                />
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-3 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={relaxations.allow_capacity_overflow}
                onChange={(e) =>
                  setRelaxations({ ...relaxations, allow_capacity_overflow: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-gray-700">Allow classroom capacity overflow</span>
            </label>
            {relaxations.allow_capacity_overflow && (
              <div className="ml-7">
                <label className="block text-sm text-gray-600 mb-1">Max overflow (%):</label>
                <Input
                  type="number"
                  value={relaxations.max_capacity_overflow_percent}
                  onChange={(e) =>
                    setRelaxations({
                      ...relaxations,
                      max_capacity_overflow_percent: parseInt(e.target.value)
                    })
                  }
                  className="w-32"
                  min="0"
                  max="50"
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveConfiguration} className="bg-blue-600 hover:bg-blue-700">
          Save Configuration
        </Button>
      </div>
    </div>
  )
}
