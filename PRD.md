# Haven — Feature Integration PRD

> Each task has a corresponding `*-integration.md` guide in the project folder.
> Read the integration guide FIRST, then follow its exact instructions.
> All JS and CSS files already exist — you are wiring them into `index.html` and making any code changes specified in the guide.

## Rules

- Do ONE task per iteration, then stop
- Read the integration guide completely before making any changes
- Test that the game still loads after your changes (open index.html, check browser console for errors)
- Commit after each task with a descriptive message
- Update progress.txt with what you did

## Tasks

- [ ] **1. Tiles visual overhaul** — Follow `css/tiles-integration.md`. Add `css/tiles.css` link to index.html and update `board.js` renderCell() as specified.
- [ ] **2. Tutorial system** — Follow `tutorial-integration.md`. Add `css/tutorial.css` link to index.html. The JS file and init call already exist.
- [ ] **3. Combo display** — Follow `combo-integration.md`. Add `css/combo.css` and `js/combo.js` to index.html, add Combo init call in startup block.
- [ ] **4. Sound improvements** — Follow `sound-integration.md`. Wire new sound functions into the correct locations in shop.js and other files as specified.
- [ ] **5. Achievements system** — Follow `achievements-integration.md`. Add `css/achievements.css` and trophy button to top bar, add script tag and init call.
- [ ] **6. Recipe book** — Follow `recipes-integration.md`. Add `css/recipes.css` and `js/recipes.js` to index.html, add Recipes init call.
- [ ] **7. Events system** — Follow `events-integration.md`. Add `css/events.css` and `js/events.js` to index.html, add Events init call. Script must load after game.js but before systems that check event modifiers.
- [ ] **8. Welcome back screen** — Follow `welcome-integration.md`. Add `css/welcome.css` and `js/welcome.js` to index.html, add Welcome.init() call. Must load after creatures.js.
- [ ] **9. Daily login calendar** — Follow `daily-integration.md`. Add `css/daily.css` link to index.html. JS changes are already done (daily.js was rewritten).
