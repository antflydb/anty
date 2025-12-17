# Anty Tamagotchi Action Matrix

## Visual Action Impact Chart

```
ACTION IMPACT MATRIX
═══════════════════════════════════════════════════════════════════════

Action               Energy  Happiness  Knowledge  IndexHealth  Cooldown
────────────────────────────────────────────────────────────────────────
🍔 Feed Data          +20      +10         0          +5         8s
🎮 Play Query Game    -10      +25        +5          0          10s
😴 Rest               +30       -5         0          0          6s
⚡ Optimize Index     -15       0         +10         +20        10s
🔍 Run Query          -5        0         +15         -5         5s
🔄 Reindex Database   -20      -10         0          +30        10s
🧠 Train Model        -15       +5        +25          0         8s
```

## Stat Recovery Guide

### When Energy is Low (<40)
**Recommended Actions:**
1. 😴 Rest (+30 energy, 6s cooldown) - BEST for emergency
2. 🍔 Feed Data (+20 energy, 8s cooldown) - Good all-around

**Avoid:**
- 🔄 Reindex Database (-20 energy)
- ⚡ Optimize Index (-15 energy)
- 🧠 Train Model (-15 energy)

### When Happiness is Low (<40)
**Recommended Actions:**
1. 🎮 Play Query Game (+25 happiness, 10s cooldown) - BEST
2. 🍔 Feed Data (+10 happiness, 8s cooldown) - Moderate boost
3. 🧠 Train Model (+5 happiness, 8s cooldown) - Small boost

**Avoid:**
- 🔄 Reindex Database (-10 happiness)
- 😴 Rest (-5 happiness)

### When Knowledge is Low (<40)
**Recommended Actions:**
1. 🧠 Train Model (+25 knowledge, 8s cooldown) - BEST
2. 🔍 Run Query (+15 knowledge, 5s cooldown) - Faster cooldown
3. ⚡ Optimize Index (+10 knowledge, 10s cooldown) - Bonus

**Avoid:**
- No actions decrease knowledge!

### When Index Health is Low (<40)
**Recommended Actions:**
1. 🔄 Reindex Database (+30 index health, 10s cooldown) - BEST but costly
2. ⚡ Optimize Index (+20 index health, 10s cooldown) - Good balance
3. 🍔 Feed Data (+5 index health, 8s cooldown) - Small boost

**Avoid:**
- 🔍 Run Query (-5 index health)

## Strategic Combinations

### Balanced Growth (All stats healthy)
```
1. 🍔 Feed Data        → +20 energy, +10 happiness, +5 index
2. Wait 8s
3. 🧠 Train Model      → +25 knowledge, +5 happiness, -15 energy
4. Wait 8s
5. 😴 Rest             → +30 energy, -5 happiness
6. Wait 6s
7. 🎮 Play Query Game  → +25 happiness, +5 knowledge, -10 energy
```

### Knowledge Focused
```
1. 🧠 Train Model      → +25 knowledge
2. Wait 5s
3. 🔍 Run Query        → +15 knowledge (fastest cooldown)
4. Wait 8s
5. 🧠 Train Model      → +25 knowledge
Total: +65 knowledge in 13s
```

### Emergency Recovery (All stats critical)
```
1. 😴 Rest             → +30 energy (priority: restore energy)
2. Wait 6s
3. 🍔 Feed Data        → +20 energy, +10 happiness, +5 index
4. Wait 8s
5. 🎮 Play Query Game  → +25 happiness, +5 knowledge
6. Wait 10s
7. ⚡ Optimize Index   → +20 index health, +10 knowledge
```

## Action Efficiency Analysis

### Best Energy/Time Ratio
1. 😴 Rest: 30 energy / 6s = 5.0 per second
2. 🍔 Feed Data: 20 energy / 8s = 2.5 per second

### Best Happiness/Time Ratio
1. 🎮 Play Query Game: 25 happiness / 10s = 2.5 per second
2. 🍔 Feed Data: 10 happiness / 8s = 1.25 per second

### Best Knowledge/Time Ratio
1. 🔍 Run Query: 15 knowledge / 5s = 3.0 per second
2. 🧠 Train Model: 25 knowledge / 8s = 3.125 per second ⭐ BEST

### Best Index Health/Time Ratio
1. 🔄 Reindex Database: 30 index / 10s = 3.0 per second ⭐ BEST
2. ⚡ Optimize Index: 20 index / 10s = 2.0 per second

## Action Type Categories

### Pure Gain (No negative effects)
- 🍔 Feed Data: All positive changes

### Energy Builders
- 😴 Rest: +30 energy
- 🍔 Feed Data: +20 energy

### Energy Consumers
- 🔄 Reindex Database: -20 energy
- ⚡ Optimize Index: -15 energy
- 🧠 Train Model: -15 energy
- 🎮 Play Query Game: -10 energy
- 🔍 Run Query: -5 energy

### Happiness Boosters
- 🎮 Play Query Game: +25 happiness
- 🍔 Feed Data: +10 happiness
- 🧠 Train Model: +5 happiness

### Knowledge Experts
- 🧠 Train Model: +25 knowledge
- 🔍 Run Query: +15 knowledge
- ⚡ Optimize Index: +10 knowledge
- 🎮 Play Query Game: +5 knowledge

### Index Healers
- 🔄 Reindex Database: +30 index health
- ⚡ Optimize Index: +20 index health
- 🍔 Feed Data: +5 index health

## Advanced Strategies

### Stat Juggling
When all stats are >60, you can safely use energy-consuming actions:
```
Energy: 80 → Use 🧠 Train Model → Energy: 65, Knowledge: +25
```

### Pre-emptive Care
Don't wait for stats to become critical:
```
Energy: 50 (warning) → Use 🍔 Feed Data → Energy: 70 (good)
Better than: Energy: 25 (critical) → Use 😴 Rest → Energy: 55 (warning)
```

### Cooldown Stacking
Use actions with different cooldowns efficiently:
```
0s:  🔍 Run Query (5s cooldown)
5s:  😴 Rest (6s cooldown)
11s: 🍔 Feed Data (8s cooldown)
19s: All actions ready again
```

## Total Possible Impact

### Maximum Stat Gain (Single Action)
- Energy: 30 (😴 Rest)
- Happiness: 25 (🎮 Play Query Game)
- Knowledge: 25 (🧠 Train Model)
- Index Health: 30 (🔄 Reindex Database)

### Maximum Total Impact (Single Action)
🍔 Feed Data: +35 total (+20 +10 +5)

### Minimum Total Impact (Single Action)
🔄 Reindex Database: 0 total (+30 -20 -10)
