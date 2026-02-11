// Haven - Item Definitions, Merge Chains, Cross-Chain Recipes
'use strict';

const Items = (() => {
    const chains = {
        wood: {
            name: 'Wood',
            icon: '\u{1F332}',
            nodeColor: '#8B6914',
            tiers: [
                { name: 'Twig',        bg: ['#A0845C', '#7A6340'], glow: '#C4A46C', symbol: '\u2572' },
                { name: 'Branch',      bg: ['#9B7424', '#7B5F1C'], glow: '#BDA04C', symbol: '\u03C8' },
                { name: 'Log',         bg: ['#8B6914', '#6B4F12'], glow: '#B89040', symbol: '\u25CE' },
                { name: 'Plank',       bg: ['#C4994C', '#A67C30'], glow: '#DDB86C', symbol: '\u25AC' },
                { name: 'Beam',        bg: ['#D4A95C', '#B8923F'], glow: '#ECC87C', symbol: '\u256C' },
                { name: 'Frame',       bg: ['#E8C476', '#D4A95C'], glow: '#FFE0A0', symbol: '\u229E' },
                { name: 'Cabin',       bg: ['#FFD700', '#E8B800'], glow: '#FFF0AA', symbol: '\u2302' },
                { name: 'Workshop',    bg: ['#FFE040', '#F0C800'], glow: '#FFF4C0', symbol: '\u2692' },
                { name: 'Lumber Mill', bg: ['#FFE870', '#FFD700'], glow: '#FFF8D0', symbol: '\u2699' },
                { name: 'Treehouse',   bg: ['#FFF0A0', '#FFE870'], glow: '#FFFCE0', symbol: '\u25B3' },
            ]
        },
        stone: {
            name: 'Stone',
            icon: '\u26F0\uFE0F',
            nodeColor: '#708090',
            tiers: [
                { name: 'Pebble',      bg: ['#8E99A4', '#6C7680'], glow: '#A8B4BF', symbol: '\u2022' },
                { name: 'Rock',        bg: ['#7A8791', '#5A6670'], glow: '#94A0AB', symbol: '\u25C6' },
                { name: 'Boulder',     bg: ['#667380', '#4A5561'], glow: '#808D9A', symbol: '\u2B22' },
                { name: 'Slab',        bg: ['#8696A6', '#6A7B8C'], glow: '#A0B0C0', symbol: '\u25A3' },
                { name: 'Block',       bg: ['#96A8B8', '#7A8EA0'], glow: '#B0C2D2', symbol: '\u25A7' },
                { name: 'Pillar',      bg: ['#B0C0D0', '#96A8B8'], glow: '#C8D8E8', symbol: '\u2225' },
                { name: 'Monument',    bg: ['#C8D8E8', '#B0C0D0'], glow: '#E0F0FF', symbol: '\u2660' },
                { name: 'Arch',        bg: ['#D0E0F0', '#C0D0E0'], glow: '#E8F4FF', symbol: '\u2229' },
                { name: 'Watchtower',  bg: ['#D8E8F8', '#C8D8E8'], glow: '#F0F8FF', symbol: '\u2656' },
                { name: 'Fortress',    bg: ['#E4F0FF', '#D8E8F8'], glow: '#F8FCFF', symbol: '\u265C' },
            ]
        },
        flora: {
            name: 'Flora',
            icon: '\u{1F338}',
            nodeColor: '#5CB85C',
            tiers: [
                { name: 'Seed',    bg: ['#6B8E23', '#4F6B1A'], glow: '#8BB040', symbol: '\u25CF' },
                { name: 'Sprout',  bg: ['#78A030', '#5C8024'], glow: '#98C050', symbol: '\u2191' },
                { name: 'Bud',     bg: ['#88B840', '#6C9830'], glow: '#A8D860', symbol: '\u273A' },
                { name: 'Flower',  bg: ['#DB7093', '#C4607C'], glow: '#F090B3', symbol: '\u273F' },
                { name: 'Bouquet', bg: ['#E8829E', '#D26B88'], glow: '#FFA0BE', symbol: '\u2740' },
                { name: 'Garden',  bg: ['#FF97B5', '#E882A0'], glow: '#FFB8D0', symbol: '\u273E' },
                { name: 'Grove',   bg: ['#FFB0CC', '#FF97B5'], glow: '#FFD0E4', symbol: '\u2663' },
                { name: 'Meadow',  bg: ['#FFC4DC', '#FFB0CC'], glow: '#FFE0F0', symbol: '\u2766' },
                { name: 'Jungle',  bg: ['#FFD4E8', '#FFC4DC'], glow: '#FFECF4', symbol: '\u2698' },
                { name: 'Eden',    bg: ['#FFE4F2', '#FFD4E8'], glow: '#FFF4FA', symbol: '\u2600' },
            ]
        },
        crystal: {
            name: 'Crystal',
            icon: '\u{1F48E}',
            nodeColor: '#7B68EE',
            tiers: [
                { name: 'Shard',    bg: ['#6A9EC8', '#4E80AA'], glow: '#88BCF0', symbol: '\u25C7' },
                { name: 'Fragment', bg: ['#5E90C0', '#4878A8'], glow: '#7EB0E8', symbol: '\u25C8' },
                { name: 'Gem',      bg: ['#5080B8', '#3C6CA0'], glow: '#70A0E0', symbol: '\u2666' },
                { name: 'Crystal',  bg: ['#7B68EE', '#6050D0'], glow: '#9B88FF', symbol: '\u2756' },
                { name: 'Prism',    bg: ['#8B78FF', '#7060E8'], glow: '#AB98FF', symbol: '\u2726' },
                { name: 'Beacon',   bg: ['#9B88FF', '#8570F0'], glow: '#BBA8FF', symbol: '\u2727' },
                { name: 'Obelisk',  bg: ['#B0A0FF', '#9B88FF'], glow: '#D0C0FF', symbol: '\u2605' },
                { name: 'Nexus',    bg: ['#C0B0FF', '#B0A0FF'], glow: '#E0D4FF', symbol: '\u2734' },
                { name: 'Starfall', bg: ['#D0C4FF', '#C0B0FF'], glow: '#ECE4FF', symbol: '\u2736' },
                { name: 'Infinity', bg: ['#E8E0FF', '#D0C4FF'], glow: '#F8F4FF', symbol: '\u221E' },
            ]
        },
        creature: {
            name: 'Creature',
            icon: '\u{1F95A}',
            nodeColor: '#DAA520',
            tiers: [
                { name: 'Egg',       bg: ['#F5E6D0', '#E8D4B8'], glow: '#FFF0DD', symbol: '\u25CB' },
                { name: 'Hatchling', bg: ['#FFD700', '#E8C000'], glow: '#FFE860', symbol: '\u25D4' },
                { name: 'Fledgling', bg: ['#FFA500', '#E89000'], glow: '#FFC040', symbol: '\u25D1' },
                { name: 'Juvenile',  bg: ['#FF8C00', '#E87800'], glow: '#FFA830', symbol: '\u25D5' },
                { name: 'Adult',     bg: ['#FF6347', '#E84E32'], glow: '#FF8870', symbol: '\u2605' },
                { name: 'Elder',     bg: ['#E83020', '#CC2010'], glow: '#FF5040', symbol: '\u25C9' },
                { name: 'Mythic',    bg: ['#D02060', '#B81050'], glow: '#F04080', symbol: '\u272A' },
                { name: 'Dragon',    bg: ['#B010A0', '#900880'], glow: '#D830C0', symbol: '\u269C' },
            ]
        },

        // ─── HYBRID CHAINS (from cross-chain recipes) ────────────

        living: {
            name: 'Living',
            icon: '\u{1F33F}',
            hybrid: true,
            tiers: [
                { name: 'Vine',        bg: ['#7A9E40', '#5C8028'], glow: '#9AC060', symbol: '\u2248' },
                { name: 'Sapling',     bg: ['#8AAE50', '#6C9038'], glow: '#AAD070', symbol: '\u2295' },
                { name: 'Treant',      bg: ['#5E8830', '#467020'], glow: '#80AA50', symbol: '\u2297' },
                { name: 'Ancient Oak', bg: ['#90C060', '#70A040'], glow: '#B0E080', symbol: '\u2299' },
                { name: 'World Tree',  bg: ['#C8E890', '#A0D060'], glow: '#E0FFB0', symbol: '\u274B' },
            ]
        },
        arcane: {
            name: 'Arcane',
            icon: '\u{1F52E}',
            hybrid: true,
            tiers: [
                { name: 'Runestone',         bg: ['#6060A0', '#484888'], glow: '#8080C0', symbol: '\u22A1' },
                { name: 'Glyph',             bg: ['#7070B0', '#585898'], glow: '#9090D0', symbol: '\u22A0' },
                { name: 'Mana Well',         bg: ['#5080D0', '#3868B8'], glow: '#70A0F0', symbol: '\u263D' },
                { name: 'Arcane Gate',       bg: ['#8060E0', '#6848C8'], glow: '#A080FF', symbol: '\u2748' },
                { name: "Philosopher\u2019s Stone", bg: ['#C0A0FF', '#A080E0'], glow: '#E0D0FF', symbol: '\u262F' },
            ]
        },
        shelter: {
            name: 'Shelter',
            icon: '\u{1F3E0}',
            hybrid: true,
            tiers: [
                { name: 'Scaffold', bg: ['#C0A080', '#A88868'], glow: '#D8B898', symbol: '\u2293' },
                { name: 'Hut',      bg: ['#D0B090', '#B89878'], glow: '#E8C8A8', symbol: '\u2294' },
                { name: 'House',    bg: ['#E0C0A0', '#C8A888'], glow: '#F0D8C0', symbol: '\u25A5' },
                { name: 'Castle',   bg: ['#F0D8B0', '#D8C098'], glow: '#FFF0D8', symbol: '\u2654' },
                { name: 'Citadel',  bg: ['#FFF0D0', '#F0D8B0'], glow: '#FFFCE8', symbol: '\u265B' },
            ]
        },
        mystic: {
            name: 'Mystic',
            icon: '\u2728',
            hybrid: true,
            tiers: [
                { name: 'Fairy Dust',       bg: ['#C080D0', '#A868B8'], glow: '#D898E0', symbol: '\u2217' },
                { name: 'Wand',             bg: ['#D090E0', '#B878C8'], glow: '#E8A8F0', symbol: '\u2742' },
                { name: 'Enchanted Bloom',  bg: ['#E0A0F0', '#C888D8'], glow: '#F0C0FF', symbol: '\u2724' },
                { name: 'Oracle',           bg: ['#F0B0FF', '#D898E8'], glow: '#F8D0FF', symbol: '\u2609' },
                { name: 'Celestial',        bg: ['#F8D0FF', '#F0B0FF'], glow: '#FFF0FF', symbol: '\u2606' },
            ]
        }
    };

    // Cross-chain recipe pairs: sorted chain names → hybrid chain
    const recipePairs = {
        'flora+wood':    'living',
        'crystal+stone': 'arcane',
        'stone+wood':    'shelter',
        'crystal+flora': 'mystic'
    };

    // Rarity weights for spawning (only tiers 0-3 can spawn from nodes)
    const spawnWeights = [60, 25, 12, 3];

    let nextId = 1;

    function createItem(chain, tier) {
        return {
            id: nextId++,
            chain: chain,
            tier: tier
        };
    }

    function getItemDef(chain, tier) {
        const c = chains[chain];
        if (!c) return null;
        if (tier < 0 || tier >= c.tiers.length) return null;
        return { ...c.tiers[tier], chain: chain, tier: tier, chainName: c.name };
    }

    function getRandomSpawnTier() {
        const total = spawnWeights.reduce((a, b) => a + b, 0);
        let roll = Math.random() * total;
        for (let i = 0; i < spawnWeights.length; i++) {
            roll -= spawnWeights[i];
            if (roll <= 0) return i;
        }
        return 0;
    }

    function spawnRandomItem(chain) {
        const maxSpawnTier = Math.min(3, chains[chain].tiers.length - 1);
        let tier = getRandomSpawnTier();
        tier = Math.min(tier, maxSpawnTier);
        return createItem(chain, tier);
    }

    function canMerge(a, b) {
        return a && b && a.chain === b.chain && a.tier === b.tier;
    }

    // Cross-chain recipe: two items from different chains at the same tier
    function getCrossChainResult(a, b) {
        if (!a || !b) return null;
        if (a.chain === b.chain) return null;
        if (a.tier !== b.tier) return null;
        if (a.tier < 1) return null; // tier 0 can't be used in recipes

        // Don't allow hybrid chains as recipe inputs
        if (chains[a.chain].hybrid || chains[b.chain].hybrid) return null;

        var pair = [a.chain, b.chain].sort().join('+');
        var hybridChain = recipePairs[pair];
        if (!hybridChain) return null;

        var resultTier = a.tier - 1;
        // Cap at max tier of the hybrid chain
        var maxTier = getMaxTier(hybridChain);
        resultTier = Math.min(resultTier, maxTier);

        return { chain: hybridChain, tier: resultTier };
    }

    function getMaxTier(chain) {
        return chains[chain].tiers.length - 1;
    }

    function hasNextTier(chain, tier) {
        return tier < getMaxTier(chain);
    }

    function getChainNames() {
        return Object.keys(chains);
    }

    return {
        chains,
        createItem,
        getItemDef,
        spawnRandomItem,
        canMerge,
        getCrossChainResult,
        getMaxTier,
        hasNextTier,
        getChainNames,
        setNextId(id) { nextId = id; }
    };
})();
