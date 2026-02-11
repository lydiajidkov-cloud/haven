// Haven - Item Definitions & Merge Chain Data
'use strict';

const Items = (() => {
    const chains = {
        wood: {
            name: 'Wood',
            icon: '\u{1F332}',
            nodeColor: '#8B6914',
            tiers: [
                { name: 'Twig',   bg: ['#A0845C', '#7A6340'], glow: '#C4A46C', symbol: '\u2572' },
                { name: 'Branch', bg: ['#9B7424', '#7B5F1C'], glow: '#BDA04C', symbol: '\u03C8' },
                { name: 'Log',    bg: ['#8B6914', '#6B4F12'], glow: '#B89040', symbol: '\u25CE' },
                { name: 'Plank',  bg: ['#C4994C', '#A67C30'], glow: '#DDB86C', symbol: '\u25AC' },
                { name: 'Beam',   bg: ['#D4A95C', '#B8923F'], glow: '#ECC87C', symbol: '\u256C' },
                { name: 'Frame',  bg: ['#E8C476', '#D4A95C'], glow: '#FFE0A0', symbol: '\u229E' },
                { name: 'Cabin',  bg: ['#FFD700', '#E8B800'], glow: '#FFF0AA', symbol: '\u2302' },
            ]
        },
        stone: {
            name: 'Stone',
            icon: '\u26F0\uFE0F',
            nodeColor: '#708090',
            tiers: [
                { name: 'Pebble',   bg: ['#8E99A4', '#6C7680'], glow: '#A8B4BF', symbol: '\u2022' },
                { name: 'Rock',     bg: ['#7A8791', '#5A6670'], glow: '#94A0AB', symbol: '\u25C6' },
                { name: 'Boulder',  bg: ['#667380', '#4A5561'], glow: '#808D9A', symbol: '\u2B22' },
                { name: 'Slab',     bg: ['#8696A6', '#6A7B8C'], glow: '#A0B0C0', symbol: '\u25A3' },
                { name: 'Block',    bg: ['#96A8B8', '#7A8EA0'], glow: '#B0C2D2', symbol: '\u25A7' },
                { name: 'Pillar',   bg: ['#B0C0D0', '#96A8B8'], glow: '#C8D8E8', symbol: '\u2225' },
                { name: 'Monument', bg: ['#C8D8E8', '#B0C0D0'], glow: '#E0F0FF', symbol: '\u2660' },
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
            ]
        }
    };

    // Rarity weights for spawning (only tiers 0-3 can spawn)
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
        getMaxTier,
        hasNextTier,
        getChainNames,
        setNextId(id) { nextId = id; }
    };
})();
