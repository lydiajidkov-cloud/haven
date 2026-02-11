# Daily Login Calendar - Integration Notes

## What Changed

### Modified Files
- **`js/daily.js`** - Complete rewrite: replaced the old 30-day streak system with a 7-day rolling login calendar
- **`index.html`** - Added `<link rel="stylesheet" href="css/daily.css">` in the `<head>` (line 21)

### New Files
- **`css/daily.css`** - All styling for the 7-day calendar grid, streak banner, claim button, and reward fly animation

### No Other Changes Needed
- The HTML structure (`#daily-content` inside `#shop-tab-daily`) already exists and is used as-is
- `Daily.init()` is already called in the init block at the bottom of `index.html`
- `Daily.renderDaily()` is already called when the Daily tab is clicked (shop tab switching logic)
- No changes to `game.js`, `shop.js`, or any other JS file are required

## State Structure

The saved state under `state.daily.calendar` is:

```js
state.daily.calendar = {
    currentDay: 4,              // 1-7, the NEXT day to claim
    lastClaimDate: '2026-02-10', // YYYY-MM-DD of last successful claim
    streak: 4                   // total consecutive days claimed
}
```

Daily quests remain at `state.daily.quests` (unchanged from before).

## How the Logic Works

1. **On init:** `checkNewDay()` compares today's date string against `lastClaimDate`
2. **If gap = 0 days:** Already claimed today, button is hidden
3. **If gap = 1 day:** Consecutive day, player can claim `currentDay`
4. **If gap > 1 day:** Streak broken, resets `currentDay` to 1 and `streak` to 0
5. **On claim:** Grants rewards, increments `streak`, advances `currentDay` (wraps 7 -> 1), sets `lastClaimDate` to today
6. **Eggs:** Common Egg (day 6) and Rare Egg (day 7) use `Game.emit('shopSpawnRequest')` which is already wired up to navigate to the board and spawn

## Migration from Old System

The old 30-day `STREAK_REWARDS` array and the `streak`/`lastLoginDate`/`todayClaimed` flat state have been replaced. A migration check resets old state to the new calendar structure on first load.

## Reward Table

| Day | Reward |
|-----|--------|
| 1 | 25 gems |
| 2 | 3 energy + 15 gems |
| 3 | 50 gems |
| 4 | 5 energy + 25 gems |
| 5 | 100 gems + 1 star |
| 6 | Common Egg + 50 gems |
| 7 (JACKPOT) | 250 gems + 3 stars + Rare Egg |
