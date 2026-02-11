// Haven - Creature Data: 184 creatures across 13 biomes + 4 seasonal sets
'use strict';

var CreatureData = {
    biomes: [
        { id: 'meadow',    name: 'Meadow',    icon: '\u{1F33E}' },
        { id: 'forest',    name: 'Forest',     icon: '\u{1F332}' },
        { id: 'ocean',     name: 'Ocean',      icon: '\u{1F30A}' },
        { id: 'mountain',  name: 'Mountain',   icon: '\u26F0\uFE0F' },
        { id: 'sky',       name: 'Sky',        icon: '\u2601\uFE0F' },
        { id: 'enchanted', name: 'Enchanted',  icon: '\u2728' },
        { id: 'desert',    name: 'Desert',     icon: '\u{1F3DC}\uFE0F' },
        { id: 'arctic',    name: 'Arctic',     icon: '\u2744\uFE0F' },
        { id: 'jungle',    name: 'Jungle',     icon: '\u{1F334}' },
        { id: 'swamp',     name: 'Swamp',      icon: '\u{1F344}' },
        { id: 'garden',    name: 'Garden',     icon: '\u{1F338}' },
        { id: 'celestial', name: 'Celestial',  icon: '\u{1F4AB}' },
        { id: 'spring',    name: 'Spring',     icon: '\u{1F331}' },
        { id: 'summer',    name: 'Summer',     icon: '\u{1F33B}' },
        { id: 'autumn',    name: 'Autumn',     icon: '\u{1F342}' },
        { id: 'winter',    name: 'Winter',     icon: '\u2744\uFE0F' }
    ],

    creatures: [
        // ─── MEADOW (16) ─────────────────────────────────────────
        { id: 'sparky',      name: 'Sparky',      species: 'Firefly',       emoji: '\u{1F41B}', rarity: 'common',    biome: 'meadow', desc: 'A tiny firefly whose light flickers with excitement.' },
        { id: 'nibbles',     name: 'Nibbles',     species: 'Rabbit',        emoji: '\u{1F430}', rarity: 'common',    biome: 'meadow', desc: 'A fluffy rabbit who collects tiny crystals in her burrow.' },
        { id: 'dusty',       name: 'Dusty',       species: 'Mouse',         emoji: '\u{1F42D}', rarity: 'common',    biome: 'meadow', desc: 'A curious mouse who maps the island\'s hidden tunnels.' },
        { id: 'chirp',       name: 'Chirp',       species: 'Cricket',       emoji: '\u{1F997}', rarity: 'common',    biome: 'meadow', desc: 'A musical cricket whose songs make flowers bloom faster.' },
        { id: 'clover',      name: 'Clover',      species: 'Ladybug',       emoji: '\u{1F41E}', rarity: 'common',    biome: 'meadow', desc: 'A lucky ladybug who brings good fortune wherever she lands.' },
        { id: 'daisy',       name: 'Daisy',       species: 'Butterfly',     emoji: '\u{1F98B}', rarity: 'common',    biome: 'meadow', desc: 'A delicate butterfly with wings that shimmer like petals.' },
        { id: 'tumble',      name: 'Tumble',      species: 'Hedgehog',      emoji: '\u{1F994}', rarity: 'common',    biome: 'meadow', desc: 'A playful hedgehog who rolls through wildflower fields.' },
        { id: 'sunny',       name: 'Sunny',       species: 'Honeybee',      emoji: '\u{1F41D}', rarity: 'common',    biome: 'meadow', desc: 'A busy bee whose honey has a hint of magic sparkle.' },
        { id: 'pip',         name: 'Pip',         species: 'Harvest Mouse', emoji: '\u{1F401}', rarity: 'uncommon',  biome: 'meadow', desc: 'A tiny mouse who weaves nests from golden wheat stalks.' },
        { id: 'meadowlark',  name: 'Lark',        species: 'Meadowlark',    emoji: '\u{1F426}', rarity: 'uncommon',  biome: 'meadow', desc: 'A songbird whose melodies carry on warm summer breezes.' },
        { id: 'bluebell',    name: 'Bluebell',    species: 'Butterfly',     emoji: '\u{1F98B}', rarity: 'uncommon',  biome: 'meadow', desc: 'A rare blue butterfly that only appears at dawn.' },
        { id: 'dandy',       name: 'Dandy',       species: 'Grasshopper',   emoji: '\u{1F997}', rarity: 'uncommon',  biome: 'meadow', desc: 'A dapper grasshopper who leaps over tall wildflowers.' },
        { id: 'bramble',     name: 'Bramble',     species: 'Hare',          emoji: '\u{1F407}', rarity: 'rare',      biome: 'meadow', desc: 'A swift hare with golden-tipped ears who outruns the wind.' },
        { id: 'solstice',    name: 'Solstice',    species: 'Sun Deer',      emoji: '\u{1F98C}', rarity: 'rare',      biome: 'meadow', desc: 'A gentle deer whose antlers glow at dawn and dusk.' },
        { id: 'aurora_m',    name: 'Aurora',       species: 'Meadow Spirit', emoji: '\u{1F985}', rarity: 'legendary', biome: 'meadow', desc: 'A radiant spirit that appears when the meadow is in full bloom.' },
        { id: 'harvest',     name: 'Harvest',      species: 'Golden Stag',   emoji: '\u{1F98C}', rarity: 'legendary', biome: 'meadow', desc: 'A magnificent stag wreathed in golden light and wheat.' },

        // ─── FOREST (16) ─────────────────────────────────────────
        { id: 'acorn',       name: 'Acorn',       species: 'Squirrel',      emoji: '\u{1F43F}\uFE0F', rarity: 'common',    biome: 'forest', desc: 'A bushy-tailed squirrel who hoards magical acorns.' },
        { id: 'mossy',       name: 'Mossy',       species: 'Turtle',        emoji: '\u{1F422}', rarity: 'common',    biome: 'forest', desc: 'A gentle turtle whose shell grows soft emerald moss.' },
        { id: 'twig',        name: 'Twig',        species: 'Stick Bug',     emoji: '\u{1FAB2}', rarity: 'common',    biome: 'forest', desc: 'A clever stick bug who hides in plain sight among branches.' },
        { id: 'fern',        name: 'Fern',        species: 'Snail',         emoji: '\u{1F40C}', rarity: 'common',    biome: 'forest', desc: 'A peaceful snail who leaves trails of tiny dewdrops.' },
        { id: 'rustle',      name: 'Rustle',      species: 'Chipmunk',      emoji: '\u{1F43F}\uFE0F', rarity: 'common',    biome: 'forest', desc: 'A chatty chipmunk who knows every tree by name.' },
        { id: 'hollow',      name: 'Hollow',      species: 'Woodpecker',    emoji: '\u{1F426}', rarity: 'common',    biome: 'forest', desc: 'A rhythmic woodpecker who drums messages through the trees.' },
        { id: 'maple',       name: 'Maple',       species: 'Raccoon',       emoji: '\u{1F99D}', rarity: 'common',    biome: 'forest', desc: 'A mischievous raccoon who collects shiny things in hollow logs.' },
        { id: 'bark',        name: 'Bark',        species: 'Badger',        emoji: '\u{1F9A1}', rarity: 'common',    biome: 'forest', desc: 'A sturdy badger who guards the ancient oak\'s roots.' },
        { id: 'thistle_f',   name: 'Thistle',     species: 'Hedgehog',      emoji: '\u{1F994}', rarity: 'uncommon',  biome: 'forest', desc: 'A woodland hedgehog whose spines glow at dusk.' },
        { id: 'whisper',     name: 'Whisper',     species: 'Deer',          emoji: '\u{1F98C}', rarity: 'uncommon',  biome: 'forest', desc: 'A gentle deer who walks without making a sound.' },
        { id: 'canopy',      name: 'Canopy',      species: 'Tree Frog',     emoji: '\u{1F438}', rarity: 'uncommon',  biome: 'forest', desc: 'A bright green frog who sings the forest to sleep.' },
        { id: 'oakhart',     name: 'Oakhart',     species: 'Bear',          emoji: '\u{1F43B}', rarity: 'uncommon',  biome: 'forest', desc: 'A wise old bear who remembers the forest\'s first spring.' },
        { id: 'dusk_f',      name: 'Dusk',        species: 'Panther',       emoji: '\u{1F408}\u200D\u2B1B', rarity: 'rare', biome: 'forest', desc: 'A shadow panther who walks between worlds at twilight.' },
        { id: 'elderwood',   name: 'Elderwood',   species: 'Treant',        emoji: '\u{1F333}', rarity: 'rare',      biome: 'forest', desc: 'An ancient treant whose roots stretch across the whole forest.' },
        { id: 'sylvan',      name: 'Sylvan',      species: 'Forest Spirit', emoji: '\u{1F343}', rarity: 'legendary', biome: 'forest', desc: 'A luminous spirit born from the oldest tree in the forest.' },
        { id: 'verdant',     name: 'Verdant',     species: 'Great Elk',     emoji: '\u{1F98C}', rarity: 'legendary', biome: 'forest', desc: 'A colossal elk with antlers that bloom with living flowers.' },

        // ─── OCEAN (16) ──────────────────────────────────────────
        { id: 'coral',       name: 'Coral',       species: 'Hermit Crab',   emoji: '\u{1F980}', rarity: 'common',    biome: 'ocean', desc: 'A tiny crab who decorates her shell with sea glass.' },
        { id: 'bubbles',     name: 'Bubbles',     species: 'Pufferfish',    emoji: '\u{1F421}', rarity: 'common',    biome: 'ocean', desc: 'A nervous pufferfish who inflates at the slightest surprise.' },
        { id: 'sandy',       name: 'Sandy',       species: 'Starfish',      emoji: '\u{1F31F}', rarity: 'common',    biome: 'ocean', desc: 'A cheerful starfish who waves at every passing fish.' },
        { id: 'drifter',     name: 'Drifter',     species: 'Jellyfish',     emoji: '\u{1FABC}', rarity: 'common',    biome: 'ocean', desc: 'A luminous jellyfish who drifts on warm ocean currents.' },
        { id: 'shelby',      name: 'Shelby',      species: 'Sea Turtle',    emoji: '\u{1F422}', rarity: 'common',    biome: 'ocean', desc: 'A wise turtle who navigates by the stars.' },
        { id: 'finley',      name: 'Finley',      species: 'Clownfish',     emoji: '\u{1F420}', rarity: 'common',    biome: 'ocean', desc: 'A playful clownfish who hides in colorful anemones.' },
        { id: 'pearl',       name: 'Pearl',       species: 'Seahorse',      emoji: '\u{1F41A}', rarity: 'common',    biome: 'ocean', desc: 'An elegant seahorse with a pearlescent shimmer.' },
        { id: 'current',     name: 'Current',     species: 'Manta Ray',     emoji: '\u{1F42C}', rarity: 'uncommon',  biome: 'ocean', desc: 'A graceful manta ray who glides through deep currents.' },
        { id: 'tide_o',      name: 'Tide',        species: 'Dolphin',       emoji: '\u{1F42C}', rarity: 'uncommon',  biome: 'ocean', desc: 'A luminous dolphin who navigates by starlight.' },
        { id: 'nautilus',    name: 'Nautilus',     species: 'Nautilus',      emoji: '\u{1F41A}', rarity: 'uncommon',  biome: 'ocean', desc: 'An ancient creature whose spiral shell holds secrets of the deep.' },
        { id: 'abyss',       name: 'Abyss',       species: 'Anglerfish',    emoji: '\u{1F41F}', rarity: 'uncommon',  biome: 'ocean', desc: 'A mysterious fish whose light illuminates the darkest depths.' },
        { id: 'riptide',     name: 'Riptide',     species: 'Shark',         emoji: '\u{1F988}', rarity: 'rare',      biome: 'ocean', desc: 'A swift shark with scales that shimmer like moonlight on waves.' },
        { id: 'lumina',      name: 'Lumina',       species: 'Seahorse',      emoji: '\u{1F41A}', rarity: 'rare',      biome: 'ocean', desc: 'A radiant seahorse who lights up the coral reefs at night.' },
        { id: 'tsunami',     name: 'Tsunami',      species: 'Whale',         emoji: '\u{1F40B}', rarity: 'rare',      biome: 'ocean', desc: 'A gentle giant whose songs travel across entire oceans.' },
        { id: 'leviathan',   name: 'Leviathan',    species: 'Sea Dragon',    emoji: '\u{1F409}', rarity: 'legendary', biome: 'ocean', desc: 'An ancient sea dragon who guards the deepest ocean trenches.' },
        { id: 'poseidon',    name: 'Poseidon',     species: 'Kraken',        emoji: '\u{1F419}', rarity: 'legendary', biome: 'ocean', desc: 'A wise kraken whose tentacles can calm the fiercest storms.' },

        // ─── MOUNTAIN (14) ───────────────────────────────────────
        { id: 'pebble',      name: 'Pebble',      species: 'Mountain Goat', emoji: '\u{1F410}', rarity: 'common',    biome: 'mountain', desc: 'A sure-footed goat who climbs the steepest cliffs.' },
        { id: 'echo',        name: 'Echo',        species: 'Mountain Lion', emoji: '\u{1F981}', rarity: 'common',    biome: 'mountain', desc: 'A sleek lion whose roar echoes through the valleys.' },
        { id: 'summit',      name: 'Summit',      species: 'Ibex',          emoji: '\u{1F410}', rarity: 'common',    biome: 'mountain', desc: 'A sturdy ibex with horns that catch the sunrise.' },
        { id: 'flint',       name: 'Flint',       species: 'Marmot',        emoji: '\u{1F9AB}', rarity: 'common',    biome: 'mountain', desc: 'A watchful marmot who whistles warnings to mountain friends.' },
        { id: 'ridge',       name: 'Ridge',       species: 'Mountain Hawk', emoji: '\u{1F985}', rarity: 'common',    biome: 'mountain', desc: 'A keen-eyed hawk who patrols the mountain ridges.' },
        { id: 'crag',        name: 'Crag',        species: 'Rock Python',   emoji: '\u{1F40D}', rarity: 'common',    biome: 'mountain', desc: 'A patient python who suns herself on warm stone ledges.' },
        { id: 'granite',     name: 'Granite',     species: 'Ram',           emoji: '\u{1F40F}', rarity: 'uncommon',  biome: 'mountain', desc: 'A powerful ram with horns as hard as the mountain itself.' },
        { id: 'avalanche',   name: 'Avalanche',   species: 'Snow Leopard',  emoji: '\u{1F406}', rarity: 'uncommon',  biome: 'mountain', desc: 'A silent leopard who moves like a whisper through the snow.' },
        { id: 'storm_m',     name: 'Storm',       species: 'Wolf',          emoji: '\u{1F43A}', rarity: 'uncommon',  biome: 'mountain', desc: 'A silver wolf whose howl commands mountain storms.' },
        { id: 'peak',        name: 'Peak',        species: 'Condor',        emoji: '\u{1F985}', rarity: 'rare',      biome: 'mountain', desc: 'A majestic condor with wings that span the mountain pass.' },
        { id: 'boulder_m',   name: 'Boulder',     species: 'Cave Bear',     emoji: '\u{1F43B}', rarity: 'rare',      biome: 'mountain', desc: 'A mighty bear who guards the crystal caves within the mountain.' },
        { id: 'titan',       name: 'Titan',       species: 'Stone Giant',   emoji: '\u{1FAA8}', rarity: 'rare',      biome: 'mountain', desc: 'An ancient stone giant who sleeps within the mountain peak.' },
        { id: 'everest',     name: 'Everest',     species: 'Mountain Dragon', emoji: '\u{1F409}', rarity: 'legendary', biome: 'mountain', desc: 'A fearsome dragon whose scales are veined with precious minerals.' },
        { id: 'monolith',    name: 'Monolith',    species: 'Earth Titan',   emoji: '\u{1FAA8}', rarity: 'legendary', biome: 'mountain', desc: 'A colossal titan who IS the mountain — every tremor is a breath.' },

        // ─── SKY (14) ────────────────────────────────────────────
        { id: 'breeze_s',    name: 'Breeze',      species: 'Hummingbird',   emoji: '\u{1F426}', rarity: 'common',    biome: 'sky', desc: 'A swift hummingbird who carries messages on the wind.' },
        { id: 'flutter',     name: 'Flutter',     species: 'Dragonfly',     emoji: '\u{1F41B}', rarity: 'common',    biome: 'sky', desc: 'A shimmering dragonfly whose wings catch every color of light.' },
        { id: 'wisp_s',      name: 'Wisp',        species: 'Moth',          emoji: '\u{1FAB6}', rarity: 'common',    biome: 'sky', desc: 'A gentle moth drawn to magical light in the clouds.' },
        { id: 'gust',        name: 'Gust',        species: 'Swallow',       emoji: '\u{1F426}', rarity: 'common',    biome: 'sky', desc: 'A swift swallow who races the wind across open skies.' },
        { id: 'nimbus',      name: 'Nimbus',      species: 'Cloud Bat',     emoji: '\u{1F987}', rarity: 'common',    biome: 'sky', desc: 'A fluffy bat who sleeps on clouds during the day.' },
        { id: 'plume',       name: 'Plume',       species: 'Cockatoo',      emoji: '\u{1F99C}', rarity: 'common',    biome: 'sky', desc: 'A colorful cockatoo who tells stories from far-off lands.' },
        { id: 'cirrus',      name: 'Cirrus',      species: 'Crane',         emoji: '\u{1FABF}', rarity: 'uncommon',  biome: 'sky', desc: 'An elegant crane who dances among the highest clouds.' },
        { id: 'stratton',    name: 'Stratton',    species: 'Albatross',     emoji: '\u{1F426}', rarity: 'uncommon',  biome: 'sky', desc: 'A wandering albatross who has circled the world thrice.' },
        { id: 'tempest_s',   name: 'Tempest',     species: 'Thunder Horse', emoji: '\u{1F40E}', rarity: 'uncommon',  biome: 'sky', desc: 'A magnificent horse wreathed in lightning who runs on clouds.' },
        { id: 'zephyr',      name: 'Zephyr',      species: 'Wind Eagle',    emoji: '\u{1F985}', rarity: 'rare',      biome: 'sky', desc: 'A golden eagle whose wingbeats create gentle warm breezes.' },
        { id: 'cumulus',     name: 'Cumulus',      species: 'Cloud Whale',   emoji: '\u{1F40B}', rarity: 'rare',      biome: 'sky', desc: 'A dreamy whale who swims through clouds instead of water.' },
        { id: 'thunderbird', name: 'Thunderbird',  species: 'Storm Raptor',  emoji: '\u{1F985}', rarity: 'rare',      biome: 'sky', desc: 'A legendary raptor whose wings crackle with electricity.' },
        { id: 'aether',      name: 'Aether',       species: 'Sky Dragon',    emoji: '\u{1F409}', rarity: 'legendary', biome: 'sky', desc: 'An invisible dragon who paints the sky at sunrise and sunset.' },
        { id: 'phoenix_s',   name: 'Phoenix',      species: 'Sun Phoenix',   emoji: '\u{1F525}', rarity: 'legendary', biome: 'sky', desc: 'A blazing phoenix reborn from sunlight each new dawn.' },

        // ─── ENCHANTED (15) ──────────────────────────────────────
        { id: 'pixie',       name: 'Pixie',       species: 'Fairy',         emoji: '\u{1F9DA}', rarity: 'common',    biome: 'enchanted', desc: 'A mischievous fairy who leaves trails of sparkle dust.' },
        { id: 'charm',       name: 'Charm',       species: 'Magic Cat',     emoji: '\u{1F431}', rarity: 'common',    biome: 'enchanted', desc: 'A cat whose purrs make flowers grow and wounds heal.' },
        { id: 'shimmer',     name: 'Shimmer',     species: 'Crystal Fox',   emoji: '\u{1F98A}', rarity: 'common',    biome: 'enchanted', desc: 'A fox whose fur is made of living crystal that chimes softly.' },
        { id: 'rune',        name: 'Rune',        species: 'Enchanted Owl', emoji: '\u{1F989}', rarity: 'common',    biome: 'enchanted', desc: 'A wise owl with ancient runes glowing in her feathers.' },
        { id: 'glimmer',     name: 'Glimmer',     species: 'Sprite',        emoji: '\u{1F9DA}', rarity: 'common',    biome: 'enchanted', desc: 'A playful sprite who hides in raindrops and dewdrops.' },
        { id: 'whisp',       name: 'Whisp',       species: 'Will-o-Wisp',   emoji: '\u{1F525}', rarity: 'common',    biome: 'enchanted', desc: 'A dancing flame that guides lost travelers to safety.' },
        { id: 'unicorn',     name: 'Starlight',   species: 'Unicorn',       emoji: '\u{1F984}', rarity: 'uncommon',  biome: 'enchanted', desc: 'A graceful unicorn whose horn heals with rainbow light.' },
        { id: 'griffin',     name: 'Griffin',      species: 'Griffin',       emoji: '\u{1F985}', rarity: 'uncommon',  biome: 'enchanted', desc: 'A noble creature, half eagle half lion, who guards magical vaults.' },
        { id: 'kelpie',      name: 'Kelpie',      species: 'Water Horse',   emoji: '\u{1F40E}', rarity: 'uncommon',  biome: 'enchanted', desc: 'A shape-shifting horse who lives in enchanted pools.' },
        { id: 'alchemist',   name: 'Alchemist',   species: 'Magic Hare',    emoji: '\u{1F407}', rarity: 'uncommon',  biome: 'enchanted', desc: 'A clever hare who brews potions from moonlit herbs.' },
        { id: 'basilisk',    name: 'Basilisk',    species: 'Basilisk',      emoji: '\u{1F40D}', rarity: 'rare',      biome: 'enchanted', desc: 'A serpent with eyes that turn stone to crystal.' },
        { id: 'phoenix_e',   name: 'Ember',       species: 'Phoenix',       emoji: '\u{1F525}', rarity: 'rare',      biome: 'enchanted', desc: 'A small phoenix whose tears can heal any wound.' },
        { id: 'sphinx',      name: 'Sphinx',      species: 'Sphinx',        emoji: '\u{1F981}', rarity: 'rare',      biome: 'enchanted', desc: 'A riddling sphinx who guards the gates of wisdom.' },
        { id: 'arcanum',     name: 'Arcanum',     species: 'Celestial Deer', emoji: '\u{1F98C}', rarity: 'legendary', biome: 'enchanted', desc: 'A deer made of pure starlight who walks between realms.' },
        { id: 'solaris',     name: 'Solaris',     species: 'Griffin',       emoji: '\u{1F985}', rarity: 'legendary', biome: 'enchanted', desc: 'A golden griffin born from sunlight and stone.' },

        // ─── DESERT (12) ─────────────────────────────────────────
        { id: 'dune',        name: 'Dune',        species: 'Fennec Fox',    emoji: '\u{1F98A}', rarity: 'common',    biome: 'desert', desc: 'A big-eared fox who can hear water beneath the sand.' },
        { id: 'scorch',      name: 'Scorch',      species: 'Scorpion',      emoji: '\u{1F982}', rarity: 'common',    biome: 'desert', desc: 'A glowing scorpion whose tail sparkles in the moonlight.' },
        { id: 'mirage',      name: 'Mirage',      species: 'Lizard',        emoji: '\u{1F98E}', rarity: 'common',    biome: 'desert', desc: 'A shimmering lizard who can vanish into the heat haze.' },
        { id: 'sahara',      name: 'Sahara',      species: 'Camel',         emoji: '\u{1F42A}', rarity: 'common',    biome: 'desert', desc: 'A patient camel who carries water in magical humps.' },
        { id: 'scarab',      name: 'Scarab',      species: 'Scarab Beetle', emoji: '\u{1FAB2}', rarity: 'common',    biome: 'desert', desc: 'A jeweled beetle whose shell holds ancient desert magic.' },
        { id: 'rattler',     name: 'Rattler',     species: 'Rattlesnake',   emoji: '\u{1F40D}', rarity: 'uncommon',  biome: 'desert', desc: 'A rhythmic snake whose rattle plays desert melodies.' },
        { id: 'oasis',       name: 'Oasis',       species: 'Desert Tortoise', emoji: '\u{1F422}', rarity: 'uncommon', biome: 'desert', desc: 'A magical tortoise who carries a tiny oasis on her shell.' },
        { id: 'sandstorm',   name: 'Sandstorm',   species: 'Sand Cat',      emoji: '\u{1F408}', rarity: 'uncommon',  biome: 'desert', desc: 'A fierce cat who dances within desert whirlwinds.' },
        { id: 'sphinx_d',    name: 'Riddle',      species: 'Desert Sphinx',  emoji: '\u{1F981}', rarity: 'rare',      biome: 'desert', desc: 'A mysterious sphinx carved from living sandstone.' },
        { id: 'pharaoh',     name: 'Pharaoh',     species: 'Golden Cobra',   emoji: '\u{1F40D}', rarity: 'rare',      biome: 'desert', desc: 'A cobra whose hood gleams with ancient golden runes.' },
        { id: 'anubis',      name: 'Anubis',      species: 'Jackal Spirit',  emoji: '\u{1F43A}', rarity: 'legendary', biome: 'desert', desc: 'A spectral jackal who guards treasures beneath the dunes.' },
        { id: 'sunfire',     name: 'Sunfire',     species: 'Desert Phoenix', emoji: '\u{1F525}', rarity: 'legendary', biome: 'desert', desc: 'A blazing bird born from the desert\'s hottest noon.' },

        // ─── ARCTIC (12) ─────────────────────────────────────────
        { id: 'frost_a',     name: 'Frost',       species: 'Snow Owl',      emoji: '\u{1F989}', rarity: 'common',    biome: 'arctic', desc: 'A wise owl with feathers like fresh snow.' },
        { id: 'waddle',      name: 'Waddle',      species: 'Penguin',       emoji: '\u{1F427}', rarity: 'common',    biome: 'arctic', desc: 'A cheerful penguin who slides on ice for fun.' },
        { id: 'flurry',      name: 'Flurry',      species: 'Arctic Fox',    emoji: '\u{1F98A}', rarity: 'common',    biome: 'arctic', desc: 'A white fox who plays in snowdrifts and catches snowflakes.' },
        { id: 'icicle',      name: 'Icicle',      species: 'Seal',          emoji: '\u{1F9AD}', rarity: 'common',    biome: 'arctic', desc: 'A playful seal who juggles ice balls on her nose.' },
        { id: 'blizzard',    name: 'Blizzard',    species: 'Arctic Hare',   emoji: '\u{1F407}', rarity: 'common',    biome: 'arctic', desc: 'A swift hare whose footprints make tiny ice crystals.' },
        { id: 'tundra',      name: 'Tundra',      species: 'Snowy Weasel',  emoji: '\u{1F9AB}', rarity: 'uncommon',  biome: 'arctic', desc: 'A quick weasel who tunnels through deep snow.' },
        { id: 'glacier',     name: 'Glacier',     species: 'Polar Bear',    emoji: '\u{1F43B}\u200D\u2744\uFE0F', rarity: 'uncommon', biome: 'arctic', desc: 'A gentle polar bear whose fur shimmers with frost crystals.' },
        { id: 'aurora_a',    name: 'Aurora',       species: 'Arctic Wolf',   emoji: '\u{1F43A}', rarity: 'uncommon',  biome: 'arctic', desc: 'A white wolf who howls the northern lights into being.' },
        { id: 'permafrost',  name: 'Permafrost',  species: 'Mammoth',       emoji: '\u{1F9A3}', rarity: 'rare',      biome: 'arctic', desc: 'An ancient mammoth preserved in magical ice, now awakened.' },
        { id: 'northern',    name: 'Northern',    species: 'Narwhal',       emoji: '\u{1F9AD}', rarity: 'rare',      biome: 'arctic', desc: 'A narwhal whose tusk focuses the aurora\'s magic.' },
        { id: 'frostbite',   name: 'Frostbite',   species: 'Ice Dragon',    emoji: '\u{1F409}', rarity: 'legendary', biome: 'arctic', desc: 'A dragon of living ice whose breath creates beautiful crystals.' },
        { id: 'polaris',     name: 'Polaris',     species: 'Star Bear',     emoji: '\u{1F43B}\u200D\u2744\uFE0F', rarity: 'legendary', biome: 'arctic', desc: 'A celestial bear whose constellation guides travelers home.' },

        // ─── JUNGLE (12) ─────────────────────────────────────────
        { id: 'mango',       name: 'Mango',       species: 'Parrot',        emoji: '\u{1F99C}', rarity: 'common',    biome: 'jungle', desc: 'A vibrant parrot who repeats magical incantations.' },
        { id: 'vine',        name: 'Vine',        species: 'Tree Snake',    emoji: '\u{1F40D}', rarity: 'common',    biome: 'jungle', desc: 'A green snake who swings between vines like a pendulum.' },
        { id: 'tropic',      name: 'Tropic',      species: 'Toucan',        emoji: '\u{1F426}', rarity: 'common',    biome: 'jungle', desc: 'A colorful toucan whose beak glows in different hues.' },
        { id: 'monkey',      name: 'Coco',        species: 'Capuchin',      emoji: '\u{1F412}', rarity: 'common',    biome: 'jungle', desc: 'A clever monkey who collects coconuts and tells jokes.' },
        { id: 'sloth',       name: 'Dozy',        species: 'Sloth',         emoji: '\u{1F9A5}', rarity: 'common',    biome: 'jungle', desc: 'A sleepy sloth who dreams of adventures while hanging upside down.' },
        { id: 'chameleon',   name: 'Prism',       species: 'Chameleon',     emoji: '\u{1F98E}', rarity: 'uncommon',  biome: 'jungle', desc: 'A color-shifting chameleon who can match any rainbow.' },
        { id: 'orchid',      name: 'Orchid',      species: 'Poison Frog',   emoji: '\u{1F438}', rarity: 'uncommon',  biome: 'jungle', desc: 'A tiny frog with jewel-toned skin and a surprisingly deep voice.' },
        { id: 'jaguar',      name: 'Shadow',      species: 'Jaguar',        emoji: '\u{1F406}', rarity: 'uncommon',  biome: 'jungle', desc: 'A powerful jaguar whose spots form ancient jungle runes.' },
        { id: 'anaconda',    name: 'Coil',        species: 'Anaconda',      emoji: '\u{1F40D}', rarity: 'rare',      biome: 'jungle', desc: 'A massive snake who protects the river from intruders.' },
        { id: 'quetzal',     name: 'Quetzal',     species: 'Resplendent Quetzal', emoji: '\u{1F99C}', rarity: 'rare', biome: 'jungle', desc: 'A sacred bird with tail feathers that trail like emerald streams.' },
        { id: 'kapok',       name: 'Kapok',       species: 'Jungle Titan',  emoji: '\u{1F333}', rarity: 'legendary', biome: 'jungle', desc: 'A living tree that walks through the jungle, nurturing all life.' },
        { id: 'emerald',     name: 'Emerald',     species: 'Jungle Dragon', emoji: '\u{1F409}', rarity: 'legendary', biome: 'jungle', desc: 'A serpentine dragon hidden in the deepest canopy, made of vines.' },

        // ─── SWAMP (11) ──────────────────────────────────────────
        { id: 'puddles_sw',  name: 'Puddles',     species: 'Frog',          emoji: '\u{1F438}', rarity: 'common',    biome: 'swamp', desc: 'A cheerful frog who splashes in magical puddles.' },
        { id: 'glow',        name: 'Glow',        species: 'Firefly',       emoji: '\u{1F41B}', rarity: 'common',    biome: 'swamp', desc: 'A firefly who lights up the misty swamp at night.' },
        { id: 'lily',        name: 'Lily',        species: 'Water Snake',   emoji: '\u{1F40D}', rarity: 'common',    biome: 'swamp', desc: 'A graceful snake who swims between lily pads.' },
        { id: 'mud',         name: 'Mud',         species: 'Mudskipper',    emoji: '\u{1F41F}', rarity: 'common',    biome: 'swamp', desc: 'A quirky fish who walks on land and tells soggy jokes.' },
        { id: 'croak',       name: 'Croak',       species: 'Toad',          emoji: '\u{1F438}', rarity: 'common',    biome: 'swamp', desc: 'A grumpy toad whose croaks make mushrooms grow.' },
        { id: 'moss',        name: 'Moss',        species: 'Salamander',    emoji: '\u{1F98E}', rarity: 'uncommon',  biome: 'swamp', desc: 'A salamander covered in glowing moss and tiny flowers.' },
        { id: 'heron',       name: 'Heron',       species: 'Blue Heron',    emoji: '\u{1FABF}', rarity: 'uncommon',  biome: 'swamp', desc: 'A patient heron who stands perfectly still for hours.' },
        { id: 'snapper',     name: 'Snapper',     species: 'Snapping Turtle', emoji: '\u{1F422}', rarity: 'uncommon', biome: 'swamp', desc: 'A grouchy turtle whose shell grows luminous mushrooms.' },
        { id: 'bogwitch',    name: 'Bogwitch',    species: 'Swamp Cat',     emoji: '\u{1F408}\u200D\u2B1B', rarity: 'rare', biome: 'swamp', desc: 'A dark cat who brews potions from swamp herbs.' },
        { id: 'willo',       name: 'Willo',       species: 'Wisp Spirit',   emoji: '\u{1F525}', rarity: 'rare',      biome: 'swamp', desc: 'A dancing spirit of blue flame that guides through the mist.' },
        { id: 'ancient_sw',  name: 'Murk',        species: 'Swamp Dragon',  emoji: '\u{1F409}', rarity: 'legendary', biome: 'swamp', desc: 'An ancient dragon who sleeps beneath the deepest bog.' },

        // ─── GARDEN (11) ─────────────────────────────────────────
        { id: 'whiskers',    name: 'Whiskers',    species: 'Tabby Cat',     emoji: '\u{1F431}', rarity: 'common',    biome: 'garden', desc: 'A cozy cat who naps in sunbeams and purrs at butterflies.' },
        { id: 'biscuit',     name: 'Biscuit',     species: 'Puppy',         emoji: '\u{1F436}', rarity: 'common',    biome: 'garden', desc: 'An eager puppy who digs up garden treasures with her paws.' },
        { id: 'nugget',      name: 'Nugget',      species: 'Hamster',       emoji: '\u{1F439}', rarity: 'common',    biome: 'garden', desc: 'A round hamster who stuffs his cheeks with flower petals.' },
        { id: 'feather',     name: 'Feather',     species: 'Canary',        emoji: '\u{1F426}', rarity: 'common',    biome: 'garden', desc: 'A singing canary whose melodies make the garden bloom.' },
        { id: 'claws',       name: 'Claws',       species: 'Kitten',        emoji: '\u{1F408}', rarity: 'common',    biome: 'garden', desc: 'A playful kitten who chases butterflies through the roses.' },
        { id: 'patches',     name: 'Patches',     species: 'Guinea Pig',    emoji: '\u{1F439}', rarity: 'uncommon',  biome: 'garden', desc: 'A spotted guinea pig who knows every flower by scent.' },
        { id: 'sage_g',      name: 'Sage',        species: 'Tortoise',      emoji: '\u{1F422}', rarity: 'uncommon',  biome: 'garden', desc: 'An ancient tortoise whose shell is a living garden.' },
        { id: 'rosie',       name: 'Rosie',       species: 'Bunny',         emoji: '\u{1F430}', rarity: 'uncommon',  biome: 'garden', desc: 'A pink-nosed bunny who tends the enchanted rose bushes.' },
        { id: 'monarch',     name: 'Monarch',     species: 'Monarch Butterfly', emoji: '\u{1F98B}', rarity: 'rare', biome: 'garden', desc: 'A majestic butterfly whose wings change with the seasons.' },
        { id: 'guardian_g',  name: 'Guardian',    species: 'Golden Retriever', emoji: '\u{1F415}', rarity: 'rare',   biome: 'garden', desc: 'A loyal dog who protects the garden from all harm.' },
        { id: 'eden_g',      name: 'Eden',        species: 'Garden Spirit', emoji: '\u{1F33A}', rarity: 'legendary', biome: 'garden', desc: 'A spirit of pure bloom who makes any garden paradise.' },

        // ─── CELESTIAL (11) ──────────────────────────────────────
        { id: 'nova',        name: 'Nova',        species: 'Star Cat',      emoji: '\u{1F431}', rarity: 'common',    biome: 'celestial', desc: 'A cosmic cat with fur that glitters like distant stars.' },
        { id: 'comet',       name: 'Comet',       species: 'Star Fox',      emoji: '\u{1F98A}', rarity: 'common',    biome: 'celestial', desc: 'A swift fox who races across the night sky trailing stardust.' },
        { id: 'luna',        name: 'Luna',        species: 'Moon Rabbit',   emoji: '\u{1F430}', rarity: 'common',    biome: 'celestial', desc: 'A silver rabbit who lives on the surface of the moon.' },
        { id: 'orbit',       name: 'Orbit',       species: 'Space Hamster', emoji: '\u{1F439}', rarity: 'common',    biome: 'celestial', desc: 'A hamster who runs on cosmic wheels that power the stars.' },
        { id: 'nebula_c',    name: 'Nebula',      species: 'Cosmic Cat',    emoji: '\u{1F431}', rarity: 'uncommon',  biome: 'celestial', desc: 'A mysterious cat with fur like the night sky. Stars swirl in her eyes.' },
        { id: 'eclipse',     name: 'Eclipse',     species: 'Shadow Bird',   emoji: '\u{1F426}\u200D\u2B1B', rarity: 'uncommon', biome: 'celestial', desc: 'A dark bird who creates eclipses by spreading her wings.' },
        { id: 'pulsar',      name: 'Pulsar',      species: 'Light Beetle',  emoji: '\u{1FAB2}', rarity: 'uncommon',  biome: 'celestial', desc: 'A beetle who pulses with rhythmic cosmic light.' },
        { id: 'constellation', name: 'Stella',    species: 'Star Deer',     emoji: '\u{1F98C}', rarity: 'rare',      biome: 'celestial', desc: 'A deer made of constellations who leaps between galaxies.' },
        { id: 'cosmos',      name: 'Cosmos',      species: 'Galaxy Wolf',   emoji: '\u{1F43A}', rarity: 'rare',      biome: 'celestial', desc: 'A wolf whose howl creates new nebulae in the night sky.' },
        { id: 'supernova',   name: 'Supernova',   species: 'Star Dragon',   emoji: '\u{1F409}', rarity: 'legendary', biome: 'celestial', desc: 'A dragon made of pure stellar energy, blinding and beautiful.' },
        { id: 'infinity_c',  name: 'Infinity',    species: 'Cosmic Serpent', emoji: '\u{1F40D}', rarity: 'legendary', biome: 'celestial', desc: 'An eternal serpent who encircles the universe.' },

        // ─── SPRING (6) ──────────────────────────────────────────
        { id: 'blossom',     name: 'Blossom',     species: 'Cherry Bunny',  emoji: '\u{1F430}', rarity: 'common',    biome: 'spring', desc: 'A pink bunny who hops among cherry blossoms.' },
        { id: 'sprout',      name: 'Sprout',      species: 'Seedling',      emoji: '\u{1F331}', rarity: 'common',    biome: 'spring', desc: 'A tiny living plant that toddles around on root-legs.' },
        { id: 'dewdrop',     name: 'Dewdrop',     species: 'Rain Frog',     emoji: '\u{1F438}', rarity: 'uncommon',  biome: 'spring', desc: 'A translucent frog filled with morning dew.' },
        { id: 'petal',       name: 'Petal',       species: 'Spring Fairy',  emoji: '\u{1F9DA}', rarity: 'uncommon',  biome: 'spring', desc: 'A fairy who wakes flowers from their winter sleep.' },
        { id: 'renewal',     name: 'Renewal',     species: 'Lamb',          emoji: '\u{1F411}', rarity: 'rare',      biome: 'spring', desc: 'A golden lamb whose presence makes everything grow.' },
        { id: 'equinox',     name: 'Equinox',     species: 'Spring Phoenix', emoji: '\u{1F338}', rarity: 'legendary', biome: 'spring', desc: 'A phoenix of cherry blossoms who heralds each new spring.' },

        // ─── SUMMER (6) ──────────────────────────────────────────
        { id: 'sunbeam',     name: 'Sunbeam',     species: 'Sun Lizard',    emoji: '\u{1F98E}', rarity: 'common',    biome: 'summer', desc: 'A warm lizard who basks in the longest days.' },
        { id: 'coral_su',    name: 'Coral',       species: 'Beach Crab',    emoji: '\u{1F980}', rarity: 'common',    biome: 'summer', desc: 'A crab who builds the most elaborate sandcastles.' },
        { id: 'haze',        name: 'Haze',        species: 'Heat Shimmer',  emoji: '\u{1F525}', rarity: 'uncommon',  biome: 'summer', desc: 'A living heat shimmer that dances above hot sands.' },
        { id: 'thunder_su',  name: 'Thunder',     species: 'Storm Bug',     emoji: '\u{1F41B}', rarity: 'uncommon',  biome: 'summer', desc: 'A beetle who creates tiny thunderstorms in summer fields.' },
        { id: 'solstice_su', name: 'Solstice',    species: 'Sun Bear',      emoji: '\u{1F43B}', rarity: 'rare',      biome: 'summer', desc: 'A bear whose golden fur radiates warmth on summer nights.' },
        { id: 'blaze',       name: 'Blaze',       species: 'Summer Dragon', emoji: '\u{1F409}', rarity: 'legendary', biome: 'summer', desc: 'A fire dragon who soars through summer thunderstorms.' },

        // ─── AUTUMN (6) ──────────────────────────────────────────
        { id: 'amber',       name: 'Amber',       species: 'Leaf Fox',      emoji: '\u{1F98A}', rarity: 'common',    biome: 'autumn', desc: 'A fox with a tail of swirling autumn leaves.' },
        { id: 'acorn_au',    name: 'Acorn',       species: 'Harvest Mouse', emoji: '\u{1F401}', rarity: 'common',    biome: 'autumn', desc: 'A mouse who gathers the last golden nuts before winter.' },
        { id: 'ember_au',    name: 'Ember',       species: 'Fire Owl',      emoji: '\u{1F989}', rarity: 'uncommon',  biome: 'autumn', desc: 'An owl whose feathers shift from orange to deep red.' },
        { id: 'harvest_au',  name: 'Harvest',     species: 'Pumpkin Cat',   emoji: '\u{1F383}', rarity: 'uncommon',  biome: 'autumn', desc: 'A cat who wears a tiny pumpkin hat and purrs like crackling leaves.' },
        { id: 'equinox_au',  name: 'Equinox',     species: 'Autumn Stag',   emoji: '\u{1F98C}', rarity: 'rare',      biome: 'autumn', desc: 'A stag whose antlers are branches of every autumn color.' },
        { id: 'decay',       name: 'Decay',       species: 'Mycelium Spirit', emoji: '\u{1F344}', rarity: 'legendary', biome: 'autumn', desc: 'A mushroom spirit who transforms fallen leaves into new life.' },

        // ─── WINTER (6) ──────────────────────────────────────────
        { id: 'snowflake',   name: 'Snowflake',   species: 'Ice Rabbit',    emoji: '\u{1F430}', rarity: 'common',    biome: 'winter', desc: 'A crystal rabbit made of living snowflakes.' },
        { id: 'holly',       name: 'Holly',       species: 'Robin',         emoji: '\u{1F426}', rarity: 'common',    biome: 'winter', desc: 'A cheerful robin who sings carols on frosty mornings.' },
        { id: 'tinsel',      name: 'Tinsel',      species: 'Silver Fox',    emoji: '\u{1F98A}', rarity: 'uncommon',  biome: 'winter', desc: 'A fox whose silver fur sparkles like holiday tinsel.' },
        { id: 'yule',        name: 'Yule',        species: 'Winter Elk',    emoji: '\u{1F98C}', rarity: 'uncommon',  biome: 'winter', desc: 'An elk who pulls the winter solstice across the sky.' },
        { id: 'crystal_w',   name: 'Crystal',     species: 'Ice Phoenix',   emoji: '\u{1F9CA}', rarity: 'rare',      biome: 'winter', desc: 'A phoenix made entirely of ice who brings the first frost.' },
        { id: 'hibernia',    name: 'Hibernia',    species: 'Dream Bear',    emoji: '\u{1F43B}', rarity: 'legendary', biome: 'winter', desc: 'A sleeping bear whose dreams create the winter wonderland.' }
    ]
};

// ─── CREATURES MODULE ──────────────────────────────────────────────
// Wraps CreatureData with ability assignments, passive bonuses, and helper functions.

var Creatures = (function() {
    'use strict';

    var creatures = CreatureData.creatures;
    var biomes = CreatureData.biomes;

    // Ability distribution cycle (40% gem_bonus, 25% discovery, 20% energy_regen, 10% xp, 5% spawn)
    var ABILITY_CYCLE = [
        'gem_bonus', 'discovery_chance', 'gem_bonus', 'energy_regen', 'gem_bonus',
        'discovery_chance', 'xp_bonus', 'gem_bonus', 'energy_regen', 'discovery_chance',
        'gem_bonus', 'energy_regen', 'gem_bonus', 'discovery_chance', 'spawn_quality',
        'gem_bonus', 'energy_regen', 'discovery_chance', 'gem_bonus', 'xp_bonus'
    ];

    // Per-creature bonus magnitude by rarity
    var RARITY_BONUS = { common: 0.5, uncommon: 1.5, rare: 3, legendary: 7 };

    // Companion abilities for rare/legendary creatures
    var RARE_COMPANION_EFFECTS = ['auto_merge', 'free_spawn', 'energy_refund'];
    var LEGENDARY_COMPANION_EFFECTS = ['upgrade_item', 'double_reward', 'surge_boost'];

    var ABILITY_LABELS = {
        gem_bonus:        { icon: '\u{1F48E}', label: 'Gem Bonus',      unit: '%' },
        discovery_chance: { icon: '\u{1F50D}', label: 'Discovery Rate', unit: '%' },
        energy_regen:     { icon: '\u26A1',     label: 'Energy Regen',   unit: 's' },
        xp_bonus:         { icon: '\u{1F4CA}', label: 'Pass XP',        unit: '%' },
        spawn_quality:    { icon: '\u2728',     label: 'Spawn Quality',  unit: '%' }
    };

    var COMPANION_LABELS = {
        auto_merge:    { label: 'Auto Merge',    desc: 'Auto-merges a random matching pair',  trigger: 8 },
        free_spawn:    { label: 'Free Spawn',    desc: 'Spawns a free tier 2 item',           trigger: 8 },
        energy_refund: { label: 'Energy Refund', desc: 'Refunds 1 energy',                    trigger: 8 },
        upgrade_item:  { label: 'Upgrade',       desc: 'Upgrades a random item +1 tier',      trigger: 12 },
        double_reward: { label: 'Double Gems',   desc: 'Next merge gives 2x gems',            trigger: 12 },
        surge_boost:   { label: 'Surge Boost',   desc: 'Adds +40 to surge meter',             trigger: 12 }
    };

    // ─── Assign abilities to all creatures on load ──────────────────
    var rareIdx = 0, legendaryIdx = 0;
    for (var i = 0; i < creatures.length; i++) {
        var c = creatures[i];
        c.ability = ABILITY_CYCLE[i % ABILITY_CYCLE.length];
        c.abilityValue = RARITY_BONUS[c.rarity];

        if (c.rarity === 'rare') {
            c.companionAbility = RARE_COMPANION_EFFECTS[rareIdx++ % RARE_COMPANION_EFFECTS.length];
        } else if (c.rarity === 'legendary') {
            c.companionAbility = LEGENDARY_COMPANION_EFFECTS[legendaryIdx++ % LEGENDARY_COMPANION_EFFECTS.length];
        }
    }

    // ─── Lookup ─────────────────────────────────────────────────────
    var creatureMap = {};
    for (var j = 0; j < creatures.length; j++) {
        creatureMap[creatures[j].id] = creatures[j];
    }

    function getCreatureById(id) {
        return creatureMap[id] || null;
    }

    // ─── Passive Bonuses ────────────────────────────────────────────
    // Returns cumulative bonuses from all discovered creatures.
    // gem_bonus/discovery_chance/xp_bonus/spawn_quality = percentage increase
    // energy_regen = raw points (multiply by 250 to get ms reduction)
    function calculatePassiveBonuses(discoveredMap) {
        var bonuses = {
            gem_bonus: 0,
            discovery_chance: 0,
            energy_regen: 0,
            xp_bonus: 0,
            spawn_quality: 0
        };
        if (!discoveredMap) return bonuses;

        for (var k = 0; k < creatures.length; k++) {
            var cr = creatures[k];
            if (discoveredMap[cr.id]) {
                bonuses[cr.ability] += cr.abilityValue;
            }
        }
        return bonuses;
    }

    function getAbilityLabel(ability) {
        return ABILITY_LABELS[ability] || { icon: '', label: ability, unit: '' };
    }

    function getCompanionLabel(ability) {
        return COMPANION_LABELS[ability] || { label: ability, desc: '', trigger: 8 };
    }

    // ─── Format bonus for display ───────────────────────────────────
    function formatBonus(type, value) {
        if (type === 'energy_regen') {
            return '-' + (value * 0.25).toFixed(1) + 's';
        }
        return '+' + value.toFixed(1) + '%';
    }

    // ─── Companion State ────────────────────────────────────────────
    var companionState = { slot1: null, slot2: null };
    var doubleRewardActive = false; // flag for double_reward companion effect

    function initCompanions() {
        var state = Game.getState();
        if (state.companions) {
            companionState = state.companions;
        }
        if (state.doubleRewardActive) {
            doubleRewardActive = true;
        }
        renderCompanionBar();
    }

    function saveCompanionState() {
        var state = Game.getState();
        state.companions = companionState;
        state.doubleRewardActive = doubleRewardActive;
        Game.save();
    }

    function equipCompanion(slot, creatureId) {
        companionState[slot] = { creatureId: creatureId, mergeCount: 0 };
        saveCompanionState();
        renderCompanionBar();
    }

    function unequipCompanion(slot) {
        companionState[slot] = null;
        saveCompanionState();
        renderCompanionBar();
    }

    function getCompanions() {
        return companionState;
    }

    function isCreatureCompanion(creatureId) {
        return (companionState.slot1 && companionState.slot1.creatureId === creatureId) ||
               (companionState.slot2 && companionState.slot2.creatureId === creatureId);
    }

    function isDoubleRewardActive() {
        if (doubleRewardActive) {
            doubleRewardActive = false;
            saveCompanionState();
            return true;
        }
        return false;
    }

    function setDoubleReward() {
        doubleRewardActive = true;
        saveCompanionState();
    }

    // Called by Board after each merge — returns array of triggered effects
    function onCompanionMerge() {
        var triggered = [];
        var slots = ['slot1', 'slot2'];

        for (var s = 0; s < slots.length; s++) {
            var slot = slots[s];
            var comp = companionState[slot];
            if (!comp) continue;

            var creature = getCreatureById(comp.creatureId);
            if (!creature || !creature.companionAbility) continue;

            var info = COMPANION_LABELS[creature.companionAbility];
            if (!info) continue;

            comp.mergeCount++;

            if (comp.mergeCount >= info.trigger) {
                comp.mergeCount = 0;
                triggered.push({
                    slot: slot,
                    effect: creature.companionAbility,
                    creature: creature
                });
            }
        }

        saveCompanionState();
        renderCompanionBar();
        return triggered;
    }

    function renderCompanionBar() {
        var bar = document.getElementById('companion-bar');
        if (!bar) return;

        var hasAny = companionState.slot1 || companionState.slot2;
        bar.style.display = hasAny ? 'flex' : 'none';

        var slots = ['slot1', 'slot2'];
        for (var s = 0; s < slots.length; s++) {
            var slot = slots[s];
            var slotEl = bar.querySelector('[data-slot="' + slot + '"]');
            if (!slotEl) continue;

            var comp = companionState[slot];
            if (comp) {
                var creature = getCreatureById(comp.creatureId);
                if (!creature) continue;
                var info = COMPANION_LABELS[creature.companionAbility] || { trigger: 8 };
                var pct = Math.min(100, Math.round((comp.mergeCount / info.trigger) * 100));
                var circum = 2 * Math.PI * 18;
                var offset = ((100 - pct) / 100) * circum;

                slotEl.innerHTML =
                    '<span class="companion-emoji">' + creature.emoji + '</span>' +
                    '<svg class="companion-cooldown" viewBox="0 0 40 40">' +
                    '<circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>' +
                    '<circle cx="20" cy="20" r="18" fill="none" ' +
                    'stroke="' + (pct >= 100 ? '#ffd700' : 'rgba(255,215,0,0.4)') + '" ' +
                    'stroke-width="2" stroke-linecap="round" ' +
                    'stroke-dasharray="' + circum.toFixed(1) + '" ' +
                    'stroke-dashoffset="' + offset.toFixed(1) + '" ' +
                    'transform="rotate(-90 20 20)"/>' +
                    '</svg>';
                slotEl.className = 'companion-slot filled';
            } else {
                slotEl.innerHTML = '<span class="companion-plus">+</span>';
                slotEl.className = 'companion-slot empty';
            }
        }
    }

    function showCompanionModal(slot) {
        var modal = document.createElement('div');
        modal.id = 'companion-modal';
        modal.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:50;padding:16px;';

        var state = Game.getState();
        var discoveredMap = (state.hatchery && state.hatchery.discovered) || {};
        var currentComp = companionState[slot];

        // Get assigned IDs (workers + other companion slot)
        var workerIds = {};
        if (typeof Island !== 'undefined' && Island.getAssignedCreatureIds) {
            workerIds = Island.getAssignedCreatureIds();
        }
        var otherSlot = slot === 'slot1' ? 'slot2' : 'slot1';
        var otherCompId = companionState[otherSlot] ? companionState[otherSlot].creatureId : null;

        // Only rare+ creatures can be companions
        var available = [];
        for (var i = 0; i < creatures.length; i++) {
            var cr = creatures[i];
            if (!discoveredMap[cr.id]) continue;
            if (!cr.companionAbility) continue; // only rare/legendary
            if (workerIds[cr.id]) continue; // not assigned as worker
            if (otherCompId === cr.id) continue; // not in other slot
            available.push(cr);
        }

        var RARITY_COLORS = { common: '#8a9ab0', uncommon: '#5cb85c', rare: '#7b68ee', legendary: '#ffd700' };

        var html = '<div class="island-modal-card" style="max-height:85vh;">';
        html += '<h3>\u2694\uFE0F Equip Companion</h3>';
        html += '<p style="font-size:11px;color:var(--text-secondary);margin-bottom:12px;">Only rare & legendary creatures can be companions</p>';

        if (currentComp) {
            var curr = getCreatureById(currentComp.creatureId);
            if (curr) {
                var cl = COMPANION_LABELS[curr.companionAbility] || {};
                html += '<div style="background:rgba(123,104,238,0.1);border:1px solid rgba(123,104,238,0.2);border-radius:8px;padding:8px 12px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;">';
                html += '<span>' + curr.emoji + ' ' + curr.name + ' \u2014 ' + (cl.label || '') + '</span>';
                html += '<button class="comp-remove-btn" style="background:rgba(255,100,100,0.2);color:#ff6b6b;border:1px solid rgba(255,100,100,0.3);border-radius:12px;padding:3px 10px;font-size:11px;cursor:pointer;">Remove</button>';
                html += '</div>';
            }
        }

        if (available.length === 0) {
            html += '<p style="text-align:center;color:var(--text-secondary);font-size:12px;padding:20px 0;">No rare/legendary creatures available.</p>';
        } else {
            html += '<div style="max-height:40vh;overflow-y:auto;">';
            for (var j = 0; j < available.length; j++) {
                var ac = available[j];
                var cLabel = COMPANION_LABELS[ac.companionAbility] || {};
                var rarityLabel = ac.rarity.charAt(0).toUpperCase() + ac.rarity.slice(1);
                var isCurrent = currentComp && currentComp.creatureId === ac.id;
                html += '<div class="comp-option" data-creature="' + ac.id + '" style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:8px;cursor:pointer;margin-bottom:4px;' +
                    'background:' + (isCurrent ? 'rgba(123,104,238,0.1)' : 'rgba(255,255,255,0.03)') + ';border:1px solid ' + (isCurrent ? 'rgba(123,104,238,0.2)' : 'rgba(255,255,255,0.06)') + ';">';
                html += '<span style="font-size:24px;">' + ac.emoji + '</span>';
                html += '<div style="flex:1;"><div style="font-size:12px;font-weight:600;">' + ac.name + '</div>';
                html += '<div style="font-size:10px;color:' + RARITY_COLORS[ac.rarity] + ';">' + rarityLabel + ' \u2022 ' + (cLabel.label || '') + '</div>';
                html += '<div style="font-size:9px;color:var(--text-secondary);">' + (cLabel.desc || '') + ' (every ' + (cLabel.trigger || 8) + ' merges)</div></div>';
                html += '</div>';
            }
            html += '</div>';
        }

        html += '<button class="modal-close-btn" style="margin-top:12px;">Close</button>';
        html += '</div>';

        modal.innerHTML = html;
        document.getElementById('app').appendChild(modal);

        // Events
        modal.querySelector('.modal-close-btn').addEventListener('click', function() { modal.remove(); });
        modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });

        var removeBtn = modal.querySelector('.comp-remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                unequipCompanion(slot);
                modal.remove();
            });
        }

        var opts = modal.querySelectorAll('.comp-option');
        for (var k = 0; k < opts.length; k++) {
            (function(opt) {
                opt.addEventListener('click', function() {
                    equipCompanion(slot, opt.getAttribute('data-creature'));
                    modal.remove();
                    Sound.playCompanionEquip();
                });
            })(opts[k]);
        }
    }

    // ─── Public API ─────────────────────────────────────────────────
    return {
        getCreatureById: getCreatureById,
        calculatePassiveBonuses: calculatePassiveBonuses,
        getAbilityLabel: getAbilityLabel,
        getCompanionLabel: getCompanionLabel,
        formatBonus: formatBonus,
        initCompanions: initCompanions,
        equipCompanion: equipCompanion,
        unequipCompanion: unequipCompanion,
        getCompanions: getCompanions,
        isCreatureCompanion: isCreatureCompanion,
        onCompanionMerge: onCompanionMerge,
        isDoubleRewardActive: isDoubleRewardActive,
        setDoubleReward: setDoubleReward,
        renderCompanionBar: renderCompanionBar,
        showCompanionModal: showCompanionModal,
        creatures: creatures,
        biomes: biomes,
        ABILITY_LABELS: ABILITY_LABELS,
        COMPANION_LABELS: COMPANION_LABELS
    };
})();
