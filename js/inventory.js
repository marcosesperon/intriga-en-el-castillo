// ─────────────────────────────────────────────────
// INVENTORY SYSTEM
// ─────────────────────────────────────────────────

const Inventory = {

    // ═══════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════

    getItemDef(itemId) {
        return ITEMS.find(it => it.id === itemId) || null;
    },

    playerHasItem(playerId, itemId) {
        const p = GameState.players[playerId];
        return p && p.inventory.some(it => it.id === itemId);
    },

    getPlayerInventory(playerId) {
        const p = GameState.players[playerId];
        return p ? p.inventory : [];
    },

    // ═══════════════════════════════════════════
    // PICKUP
    // ═══════════════════════════════════════════

    /**
     * Try to pick up an item after a room action.
     * Returns { itemDef, inventoryFull } or null if no pickup.
     */
    tryPickup(playerId, roomIndex) {
        // Probability check (madrugada bonus)
        let prob = ITEM_PICKUP_PROB;
        if (GameState.getTimePeriod() === 'madrugada') prob *= 1.3;
        if (Math.random() >= prob) return null;

        // Get pool for this room
        const pool = getRoomItemPool(roomIndex);
        if (!pool || pool.length === 0) return null;

        // Weighted random selection by rarity
        const weighted = [];
        for (const itemId of pool) {
            const def = this.getItemDef(itemId);
            if (!def) continue;
            const w = ITEM_RARITY_WEIGHTS[def.rarity] || 0;
            weighted.push({ id: itemId, weight: w });
        }
        if (weighted.length === 0) return null;

        const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
        let roll = Math.random() * totalWeight;
        let picked = weighted[0].id;
        for (const w of weighted) {
            roll -= w.weight;
            if (roll <= 0) { picked = w.id; break; }
        }

        const itemDef = this.getItemDef(picked);
        if (!itemDef) return null;

        const player = GameState.players[playerId];
        const inventoryFull = player.inventory.length >= MAX_INVENTORY;

        if (!inventoryFull) {
            player.inventory.push({ id: itemDef.id, durability: itemDef.durability });
        }

        return { itemDef, inventoryFull };
    },

    /**
     * Add an item directly to a player's inventory (for swap/forced pickup).
     */
    addItem(playerId, itemId) {
        const player = GameState.players[playerId];
        const def = this.getItemDef(itemId);
        if (!player || !def) return false;
        if (player.inventory.length >= MAX_INVENTORY) return false;
        player.inventory.push({ id: def.id, durability: def.durability });
        return true;
    },

    // ═══════════════════════════════════════════
    // REMOVE
    // ═══════════════════════════════════════════

    removeItem(playerId, itemId) {
        const player = GameState.players[playerId];
        if (!player) return false;
        const idx = player.inventory.findIndex(it => it.id === itemId);
        if (idx === -1) return false;
        player.inventory.splice(idx, 1);
        return true;
    },

    // ═══════════════════════════════════════════
    // USE ITEM
    // ═══════════════════════════════════════════

    /**
     * Use an item. Returns { success, logKey, params, revealedCard?, evidence? }
     */
    useItem(playerId, itemId, targetId) {
        const player = GameState.players[playerId];
        if (!player) return { success: false };

        const invItem = player.inventory.find(it => it.id === itemId);
        if (!invItem) return { success: false };

        const def = this.getItemDef(itemId);
        if (!def) return { success: false };

        // Passive items cannot be "used" explicitly
        if (ITEM_PASSIVE.has(itemId)) return { success: false };

        let result = { success: true, logKey: 'log.usedItem', params: { name: player.name, item: '' } };

        switch (itemId) {
            case 'lupa_ancestral': {
                // Generate evidence clue (like Torre room action)
                const clue = GameState.generateEvidence();
                GameState.applyClueToNotebook(playerId, clue);
                GameState.addClue(playerId, clue);
                result.logKey = 'log.itemLupa';
                result.params = { name: player.name };
                result.evidence = clue;
                this._decrementDurability(player, invItem, def);
                break;
            }

            case 'pergamino_sellado': {
                // Reveal 1 card from the solution (random category)
                const cats = ['conspirador', 'metodo', 'lugar', 'motivo'];
                // Pick a category where player doesn't already know the solution
                const unknown = cats.filter(c => {
                    const sol = GameState.solution[c];
                    return player.notebook[sol] !== 'X' && player.notebook[sol] !== 'O';
                });
                const cat = unknown.length > 0 ? unknown[Math.floor(Math.random() * unknown.length)] : cats[Math.floor(Math.random() * cats.length)];
                const card = GameState.solution[cat];
                GameState.markCardSeen(playerId, card, true);
                result.logKey = 'log.itemPergamino';
                result.params = { name: player.name, card: tc(card) };
                result.revealedCard = card;
                this._decrementDurability(player, invItem, def);
                break;
            }

            case 'mapa_secreto': {
                player.mapSecretoActive = true;
                result.logKey = 'log.itemMapa';
                result.params = { name: player.name };
                this._decrementDurability(player, invItem, def);
                break;
            }

            case 'cristal_revelador': {
                if (targetId == null) return { success: false };
                const target = GameState.players[targetId];
                if (!target || target.isEliminated || target.cards.length === 0) return { success: false };
                if (target.cloakActive) {
                    result.logKey = 'log.itemCristalBlocked';
                    result.params = { name: player.name, target: target.name };
                    // Still uses durability
                    this._decrementDurability(player, invItem, def);
                    break;
                }
                const card = target.cards[Math.floor(Math.random() * target.cards.length)];
                GameState.markCardSeen(playerId, card);
                result.logKey = 'log.itemCristal';
                result.params = { name: player.name, target: target.name };
                result.revealedCard = card;
                this._decrementDurability(player, invItem, def);
                break;
            }

            case 'botas_sigilo': {
                player.bootsBonusActive = true;
                result.logKey = 'log.itemBotas';
                result.params = { name: player.name };
                this._decrementDurability(player, invItem, def);
                break;
            }

            case 'capa_invisibilidad': {
                player.cloakActive = true;
                result.logKey = 'log.itemCapa';
                result.params = { name: player.name };
                this._decrementDurability(player, invItem, def);
                break;
            }

            case 'sello_real': {
                Reputation.change(playerId, 1);
                result.logKey = 'log.itemSello';
                result.params = { name: player.name };
                this._decrementDurability(player, invItem, def);
                break;
            }

            case 'mascara_cortesana': {
                player.mascaraActive = true;
                result.logKey = 'log.itemMascara';
                result.params = { name: player.name };
                this._decrementDurability(player, invItem, def);
                break;
            }

            case 'carta_recomendacion': {
                if (targetId == null) return { success: false };
                const target = GameState.players[targetId];
                if (!target || target.isEliminated || target.cards.length === 0) return { success: false };
                if (target.cloakActive) {
                    result.logKey = 'log.itemCartaBlocked';
                    result.params = { name: player.name, target: target.name };
                    this._decrementDurability(player, invItem, def);
                    break;
                }
                const card = target.cards[Math.floor(Math.random() * target.cards.length)];
                GameState.markCardSeen(playerId, card);
                result.logKey = 'log.itemCarta';
                result.params = { name: player.name, target: target.name };
                result.revealedCard = card;
                this._decrementDurability(player, invItem, def);
                break;
            }

            case 'veneno_lento': {
                if (targetId == null) return { success: false };
                const target = GameState.players[targetId];
                if (!target || target.isEliminated) return { success: false };
                Reputation.change(targetId, -1);
                result.logKey = 'log.itemVeneno';
                result.params = { name: player.name, target: target.name };
                this._decrementDurability(player, invItem, def);
                break;
            }

            case 'trampa_sala': {
                GameState.roomTraps[player.roomIndex] = playerId;
                result.logKey = 'log.itemTrampa';
                result.params = { name: player.name, room: tr(player.roomIndex) };
                this._decrementDurability(player, invItem, def);
                break;
            }

            case 'polvo_cegador': {
                if (targetId == null) return { success: false };
                const target = GameState.players[targetId];
                if (!target || target.isEliminated) return { success: false };
                target.itemBlindedBy = playerId;
                result.logKey = 'log.itemPolvo';
                result.params = { name: player.name, target: target.name };
                this._decrementDurability(player, invItem, def);
                break;
            }

            case 'anillo_poder': {
                player.itemAnilloPowerTurns = 1;
                result.logKey = 'log.itemAnillo';
                result.params = { name: player.name };
                this._decrementDurability(player, invItem, def);
                break;
            }

            case 'dado_trucado': {
                player.dadoTrucadoActive = true;
                result.logKey = 'log.itemDado';
                result.params = { name: player.name };
                this._decrementDurability(player, invItem, def);
                break;
            }

            default:
                return { success: false };
        }

        return result;
    },

    // ═══════════════════════════════════════════
    // EXCHANGE & STEAL
    // ═══════════════════════════════════════════

    exchange(playerAId, playerBId, itemIdA, itemIdB) {
        const pA = GameState.players[playerAId];
        const pB = GameState.players[playerBId];
        if (!pA || !pB) return false;

        const idxA = pA.inventory.findIndex(it => it.id === itemIdA);
        const idxB = pB.inventory.findIndex(it => it.id === itemIdB);
        if (idxA === -1 || idxB === -1) return false;

        const itemA = pA.inventory[idxA];
        const itemB = pB.inventory[idxB];
        pA.inventory[idxA] = itemB;
        pB.inventory[idxB] = itemA;
        return true;
    },

    steal(thiefId, victimId) {
        const thief = GameState.players[thiefId];
        const victim = GameState.players[victimId];
        if (!thief || !victim || victim.inventory.length === 0) {
            return { success: false, logKey: 'log.stealFail', params: { name: thief ? thief.name : '' } };
        }

        // Cloak blocks steal
        if (victim.cloakActive) {
            return { success: false, logKey: 'log.stealBlockedCloak', params: { name: thief.name, target: victim.name } };
        }

        // 50% success rate
        if (Math.random() < 0.5) {
            const idx = Math.floor(Math.random() * victim.inventory.length);
            const stolen = victim.inventory.splice(idx, 1)[0];
            if (thief.inventory.length < MAX_INVENTORY) {
                thief.inventory.push(stolen);
            }
            return { success: true, logKey: 'log.stealSuccess', params: { name: thief.name, target: victim.name, item: '' } };
        } else {
            // Failed: -1 rep
            Reputation.change(thiefId, -1);
            return { success: false, logKey: 'log.stealFail', params: { name: thief.name, target: victim.name } };
        }
    },

    // ═══════════════════════════════════════════
    // INTERNAL HELPERS
    // ═══════════════════════════════════════════

    _decrementDurability(player, invItem, def) {
        if (def.durability === 0) return; // Infinite durability (reliquia)
        invItem.durability--;
        if (invItem.durability <= 0) {
            const idx = player.inventory.indexOf(invItem);
            if (idx !== -1) player.inventory.splice(idx, 1);
            GameState.addLog(t('log.itemBroke', { item: t('item.' + def.id + '.name') }));
        }
    }
};
