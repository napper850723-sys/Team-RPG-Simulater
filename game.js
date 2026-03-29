class Character {
    constructor(id, name, team, hp, speed, attack, defense, skills = [], image = null) {
        this.id = id;
        this.name = name;
        this.team = team;
        this.maxHp = hp;
        this.currentHp = hp;
        this.baseSpeed = speed;
        this.baseAttack = attack;
        this.baseDefense = defense;
        this.speed = speed;
        this.attack = attack;
        this.defense = defense;
        this.skills = skills;
        this.image = image;
        this.alive = true;
        this.skillCooldowns = {};
        skills.forEach(skillId => {
            this.skillCooldowns[skillId] = 0;
        });
        this.auraApplied = {};
    }

    getHpPercentage() {
        return (this.currentHp / this.maxHp) * 100;
    }

    attackTarget(target, game) {
        const damage = Math.max(1, this.attack - target.defense);
        target.takeDamage(damage, game);
        return damage;
    }

    takeDamage(damage, game) {
        this.currentHp = Math.max(0, this.currentHp - damage);
        if (this.currentHp <= 0 && this.alive) {
            this.alive = false;
            game.triggerDeathSkills(this);
        }
        return damage;
    }
}

class Game {
    constructor() {
        this.characters = [];
        this.currentTurn = 0;
        this.turnOrder = [];
        this.gameStarted = false;
        this.autoTurnInterval = null;
        this.lastAttackedCharacter = null;
        this.gameMode = parseInt(localStorage.getItem('gameMode')) || 4;
        // 使用 skills.js 中的统一配置
        this.skills = SkillsConfig.getSkillsObject();
        this.init();
    }

    init() {
        this.loadCharacters();
        this.bindEvents();
        this.updateModeDisplay();
        // 先加载并渲染角色，但不开始游戏
        this.loadSelectedCharacters();
    }

    updateModeDisplay() {
        const modeIndicator = document.getElementById('mode-indicator');
        if (modeIndicator) {
            modeIndicator.textContent = `${this.gameMode}V${this.gameMode} 模式`;
        }
        
        // 动态调整角色网格布局
        let columns;
        if (this.gameMode === 1) {
            columns = 1;
        } else if (this.gameMode <= 4) {
            columns = 2;  // 4V4模式：2列×2行
        } else if (this.gameMode === 6) {
            columns = 2;  // 6V6模式：2列×3行
        } else {
            columns = 3;  // 9V9模式：3列×3行
        }
        const playerGrid = document.getElementById('player-grid');
        const enemyGrid = document.getElementById('enemy-grid');
        
        if (playerGrid) {
            playerGrid.style.gridTemplateColumns = `repeat(${columns}, minmax(180px, max-content))`;
        }
        if (enemyGrid) {
            enemyGrid.style.gridTemplateColumns = `repeat(${columns}, minmax(180px, max-content))`;
        }
    }

    loadSelectedCharacters() {
        // 从localStorage读取玩家选择的角色
        const selectedTeam = JSON.parse(localStorage.getItem('selectedTeam') || '[]');
        const selectedEnemies = JSON.parse(localStorage.getItem('selectedEnemies') || '[]');
        
        if (selectedTeam.length !== this.gameMode || selectedEnemies.length !== this.gameMode) {
            alert(`请先选择${this.gameMode}个我方角色和${this.gameMode}个敌方角色！`);
            window.location.href = 'index.html';
            return;
        }
        
        this.characters = [];
        
        // 使用玩家选择的我方角色
        selectedTeam.forEach((data, index) => {
            this.characters.push(new Character(
                `player-${index}`,
                data.name,
                'player',
                data.hp,
                data.speed,
                data.attack,
                data.defense,
                data.skills,
                data.image
            ));
        });
        
        // 使用玩家选择的敌方角色
        selectedEnemies.forEach((data, index) => {
            this.characters.push(new Character(
                `enemy-${index}`,
                data.name,
                'enemy',
                data.hp,
                data.speed,
                data.attack,
                data.defense,
                data.skills,
                data.image
            ));
        });
        
        this.renderCharacters();
    }
    
    startGame() {
        this.gameStarted = true;
        this.currentTurn = 0;
        this.log('游戏开始！');
        
        // 应用光环效果并显示日志
        this.applyAuraEffects();
        
        this.determineTurnOrder();
        
        document.getElementById('start-battle').disabled = true;
        document.getElementById('next-turn').disabled = false;
        document.getElementById('auto-turn').disabled = false;
    }

    loadCharacters() {
        const playerImageNames = ['hero', 'wizard', 'knight', 'archer', 'priest', 'assassin', 'warrior', 'witch', 'paladin'];
        const enemyImageNames = ['goblin', 'orc', 'skeleton', 'zombie', 'vampire', 'werewolf', 'gargoyle', 'lich', 'dragon'];
        
        const playerTemplates = [
            { name: "勇者", hp: 150, speed: 15, attack: 25, defense: 10, skills: ['fireball', 'shield'] },
            { name: "法师", hp: 100, speed: 18, attack: 30, defense: 5, skills: ['fireball', 'blessing'] },
            { name: "骑士", hp: 180, speed: 12, attack: 20, defense: 15, skills: ['shield', 'stoneSkin'] },
            { name: "弓箭手", hp: 120, speed: 20, attack: 22, defense: 8, skills: ['lifesteal', 'powerAura'] },
            { name: "牧师", hp: 110, speed: 16, attack: 15, defense: 7, skills: ['heal', 'blessing'] },
            { name: "刺客", hp: 90, speed: 22, attack: 28, defense: 6, skills: ['lifesteal', 'shadowStep'] },
            { name: "战士", hp: 160, speed: 14, attack: 23, defense: 12, skills: ['warCry', 'stoneSkin'] },
            { name: "巫师", hp: 95, speed: 17, attack: 27, defense: 4, skills: ['fireball', 'protectiveAura'] },
            { name: "圣骑士", hp: 150, speed: 13, attack: 19, defense: 14, skills: ['heal', 'reviveSkill'] }
        ];
        
        const enemyTemplates = [
            { name: "哥布林", hp: 80, speed: 16, attack: 18, defense: 3, skills: ['warCry', 'lifesteal'] },
            { name: "兽人", hp: 120, speed: 13, attack: 22, defense: 8, skills: ['stoneSkin', 'berserk'] },
            { name: "骷髅兵", hp: 90, speed: 15, attack: 16, defense: 5, skills: ['reform', 'reviveSkill'] },
            { name: "僵尸", hp: 110, speed: 10, attack: 19, defense: 6, skills: ['reform', 'stoneSkin'] },
            { name: "吸血鬼", hp: 100, speed: 19, attack: 21, defense: 4, skills: ['lifesteal', 'charm'] },
            { name: "狼人", hp: 115, speed: 17, attack: 23, defense: 7, skills: ['roar', 'berserk'] },
            { name: "石像鬼", hp: 130, speed: 12, attack: 17, defense: 10, skills: ['stoneSkin', 'fortress'] },
            { name: "巫妖", hp: 95, speed: 18, attack: 25, defense: 3, skills: ['fireball', 'charm'] },
            { name: "龙", hp: 150, speed: 14, attack: 28, defense: 12, skills: ['roar', 'powerAura'] }
        ];
        
        const allSkills = ['fireball', 'heal', 'shield', 'blessing', 'lifesteal', 'warCry', 'stoneSkin', 'powerAura', 'protectiveAura', 'berserk', 'roar', 'reform', 'charm', 'shadowStep', 'fortress'];
        
        this.playerPool = [];
        this.enemyPool = [];
        
        for (let i = 0; i < 18; i++) {
            const template = playerTemplates[i % playerTemplates.length];
            const imageName = playerImageNames[i % playerImageNames.length];
            const skill1 = allSkills[Math.floor(Math.random() * allSkills.length)];
            const skill2 = allSkills[Math.floor(Math.random() * allSkills.length)];
            
            this.playerPool.push({
                id: `player-${i}`,
                name: `${template.name}(${i + 1})`,
                team: 'player',
                hp: template.hp,
                speed: template.speed,
                attack: template.attack,
                defense: template.defense,
                skills: [skill1, skill2],
                image: `images/${imageName}.png`
            });
        }
        
        for (let i = 0; i < 18; i++) {
            const template = enemyTemplates[i % enemyTemplates.length];
            const imageName = enemyImageNames[i % enemyImageNames.length];
            const skill1 = allSkills[Math.floor(Math.random() * allSkills.length)];
            const skill2 = allSkills[Math.floor(Math.random() * allSkills.length)];
            
            this.enemyPool.push({
                id: `enemy-${i}`,
                name: `${template.name}(${i + 1})`,
                team: 'enemy',
                hp: template.hp,
                speed: template.speed,
                attack: template.attack,
                defense: template.defense,
                skills: [skill1, skill2],
                image: `images/${imageName}.png`
            });
        }
    }
    
    selectRandomCharacters(pool, count) {
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    getRandomSkills() {
        const activeSkills = ['fireball', 'heal', 'shield', 'blessing', 'lifesteal', 'warCry', 'stoneSkin'];
        const auraSkills = ['powerAura', 'protectiveAura'];
        const deathSkills = ['reviveSkill'];
        
        const skills = [];
        
        skills.push(activeSkills[Math.floor(Math.random() * activeSkills.length)]);
        
        const secondSkillType = Math.random();
        if (secondSkillType < 0.6) {
            skills.push(activeSkills[Math.floor(Math.random() * activeSkills.length)]);
        } else if (secondSkillType < 0.8) {
            skills.push(auraSkills[Math.floor(Math.random() * auraSkills.length)]);
        } else {
            skills.push(deathSkills[Math.floor(Math.random() * deathSkills.length)]);
        }
        
        return skills;
    }

    bindEvents() {
        document.getElementById('start-battle').addEventListener('click', () => this.startGame());
        document.getElementById('next-turn').addEventListener('click', () => this.nextTurn());
        document.getElementById('auto-turn').addEventListener('click', () => this.toggleAutoTurn());
        
        const backHomeButton = document.getElementById('back-to-home');
        if (backHomeButton) {
            backHomeButton.addEventListener('click', () => {
                window.location.href = 'home.html';
            });
        }
        
        const backButton = document.getElementById('back-to-select');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    }

    renderCharacters() {
        const playerGrid = document.getElementById('player-grid');
        const enemyGrid = document.getElementById('enemy-grid');
        
        playerGrid.innerHTML = '';
        enemyGrid.innerHTML = '';
        
        this.characters.forEach(char => {
            const card = this.createCharacterCard(char);
            if (char.team === 'player') {
                playerGrid.appendChild(card);
            } else {
                enemyGrid.appendChild(card);
            }
        });
        
        if (this.lastAttackedCharacter && this.lastAttackedCharacter.alive) {
            const attackedCard = document.getElementById(this.lastAttackedCharacter.id);
            if (attackedCard) {
                attackedCard.classList.add('attacked');
            }
        }
        
        // 注意：光环效果现在只在startGame()中应用一次，不在每次渲染时应用
    }

    createCharacterCard(character) {
        const card = document.createElement('div');
        card.className = `character-card ${!character.alive ? 'dead' : ''}`;
        card.id = character.id;
        
        const skillsHtml = character.skills.map((skillId, index) => {
            const skill = this.skills[skillId];
            const cooldown = character.skillCooldowns[skillId] || 0;
            const cooldownClass = cooldown > 0 ? 'cooldown' : '';
            const rowClass = index === 0 ? 'skill-row-1' : '';
            const cooldownText = cooldown > 0 ? `(${cooldown}回合)` : '';
            return `<div class="skill-row ${rowClass} ${cooldownClass}" title="${skill.description}">${skill.name}${cooldownText}</div>`;
        }).join('');
        
        card.innerHTML = `
            <div class="character-left">
                <div class="character-image ${!character.alive ? 'dead' : ''}">
                    <img src="${character.image}" alt="${character.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/></svg>'">
                </div>
                <div class="character-name ${!character.alive ? 'dead' : ''}">${character.name}</div>
                <div class="character-hp ${!character.alive ? 'dead' : ''}">HP: ${character.currentHp}/${character.maxHp}</div>
                <div class="hp-bar ${!character.alive ? 'dead' : ''}">
                    <div class="hp-fill ${!character.alive ? 'dead' : ''}" style="width: ${character.getHpPercentage()}%"></div>
                </div>
            </div>
            <div class="character-divider ${!character.alive ? 'dead' : ''}"></div>
            <div class="character-right">
                <div class="character-stats ${!character.alive ? 'dead' : ''}">
                    <div><span class="stat-label ${!character.alive ? 'dead' : ''}">攻击</span> <span class="stat-value ${!character.alive ? 'dead' : ''}">${character.attack}</span></div>
                    <div><span class="stat-label ${!character.alive ? 'dead' : ''}">防御</span> <span class="stat-value ${!character.alive ? 'dead' : ''}">${character.defense}</span></div>
                    <div><span class="stat-label ${!character.alive ? 'dead' : ''}">速度</span> <span class="stat-value ${!character.alive ? 'dead' : ''}">${character.speed}</span></div>
                </div>
                <div class="character-skills ${!character.alive ? 'dead' : ''}">
                    ${skillsHtml}
                </div>
            </div>
        `;
        
        return card;
    }

    determineTurnOrder() {
        this.turnOrder = [...this.characters]
            .filter(char => char.alive)
            .sort((a, b) => b.speed - a.speed);
    }

    nextTurn() {
        if (!this.gameStarted) return;
        
        this.applyAuraEffects();
        
        const aliveCharacters = this.characters.filter(char => char.alive);
        if (aliveCharacters.length === 0) return;
        
        if (this.currentTurn >= this.turnOrder.length || !this.turnOrder[this.currentTurn].alive) {
            this.determineTurnOrder();
            this.currentTurn = 0;
        }
        
        if (this.turnOrder.length === 0) return;
        
        const currentCharacter = this.turnOrder[this.currentTurn];
        
        Object.keys(currentCharacter.skillCooldowns).forEach(skillId => {
            if (currentCharacter.skillCooldowns[skillId] > 0) {
                currentCharacter.skillCooldowns[skillId]--;
            }
        });
        
        this.lastAttackedCharacter = null;
        this.updateTurnIndicator(currentCharacter);
        
        this.characterAction(currentCharacter);
        
        this.currentTurn++;
        this.checkGameEnd();
        this.renderCharacters();
        
        this.highlightCurrentCharacter(currentCharacter);
    }

    applyAuraEffects() {
        this.characters.forEach(char => {
            char.skills.forEach(skillId => {
                const skill = this.skills[skillId];
                if (skill && skill.releaseType === 'aura' && char.alive) {
                    if (!char.auraApplied[skillId]) {
                        // 只在游戏开始后才显示光环效果的日志
                        this.applySkillEffect(char, char, skill, this.gameStarted);
                        char.auraApplied[skillId] = true;
                    }
                }
            });
        });
    }

    characterAction(character) {
        if (!character.alive) return;
        
        let availableSkills = character.skills
            .map(skillId => ({ id: skillId, skill: this.skills[skillId] }))
            .filter(({ skill }) => skill && skill.releaseType === 'active')
            .filter(({ id }) => (character.skillCooldowns[id] || 0) <= 0)
            .sort((a, b) => b.skill.priority - a.skill.priority);
        
        if (availableSkills.length > 0) {
            const { id: skillId, skill } = availableSkills[0];
            this.useSkill(character, skill, skillId);
        } else {
            this.log(`${character.name} 无法使用任何技能，跳过该次行动！`);
        }
    }

    useSkill(character, skill, skillId) {
        this.log(`${character.name} 使用了 ${skill.name}！`);
        switch(skill.targetType) {
            case 'single': this.useSingleTargetSkill(character, skill); break;
            case 'all': this.useAllTargetSkill(character, skill); break;
            case 'allyAll': this.useAllyAllSkill(character, skill); break;
            case 'enemyAll': this.useEnemyAllSkill(character, skill); break;
            case 'self': this.useSelfSkill(character, skill); break;
            default: this.attackRandomTarget(character);
        }
        if (skillId && skill.cooldown > 0) character.skillCooldowns[skillId] = skill.cooldown;
        this.renderCharacters();
    }
    
    useSingleTargetSkill(character, skill) {
        let targets = [];
        if (character.team === 'player') targets = this.characters.filter(char => char.team === 'enemy' && char.alive);
        else targets = this.characters.filter(char => char.team === 'player' && char.alive);
        if (targets.length > 0) {
            const target = targets[Math.floor(Math.random() * targets.length)];
            this.highlightAttackedCharacter(target);
            const damage = Math.floor(character.attack * skill.damageMultiplier);
            const actualDamage = target.takeDamage(damage, this);
            this.log(`${character.name} 对 ${target.name} 造成 ${actualDamage} 点伤害！`);
            this.updateCharacterDisplay(target);
            this.applySkillEffect(character, target, skill);
        }
    }
    
    useAllTargetSkill(character, skill) {
        let targets = [];
        if (character.team === 'player') targets = this.characters.filter(char => char.team === 'enemy' && char.alive);
        else targets = this.characters.filter(char => char.team === 'player' && char.alive);
        if (targets.length > 0) {
            targets.forEach(target => {
                this.highlightAttackedCharacter(target);
                const damage = Math.floor(character.attack * skill.damageMultiplier);
                const actualDamage = target.takeDamage(damage, this);
                this.log(`${character.name} 对 ${target.name} 造成 ${actualDamage} 点伤害！`);
                this.updateCharacterDisplay(target);
                this.applySkillEffect(character, target, skill);
            });
        }
    }
    
    useAllyAllSkill(character, skill) {
        const targets = this.characters.filter(char => char.team === character.team && char.alive);
        if (targets.length > 0) targets.forEach(target => this.applySkillEffect(character, target, skill));
    }
    
    useEnemyAllSkill(character, skill) {
        const targets = this.characters.filter(char => char.team !== character.team && char.alive);
        if (targets.length > 0) targets.forEach(target => this.applySkillEffect(character, target, skill));
    }
    
    useSelfSkill(character, skill) {
        this.applySkillEffect(character, character, skill);
    }
    
    applySkillEffect(character, target, skill, showLog = true) {
        if (!skill.effect) return;
        switch(skill.effect) {
            case 'reduceAttack': target.attack = Math.floor(target.attack * 0.9); if (showLog) this.log(`${target.name} 的攻击降低了！`); break;
            case 'reduceDefense': target.defense = Math.floor(target.defense * 0.9); if (showLog) this.log(`${target.name} 的防御降低了！`); break;
            case 'reduceSpeed': target.speed = Math.floor(target.speed * 0.9); if (showLog) this.log(`${target.name} 的速度降低了！`); break;
            case 'heal': const healAmount = Math.floor(target.maxHp * 0.1); target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount); if (showLog) this.log(`${target.name} 恢复了 ${healAmount} 点生命值！`); this.updateCharacterDisplay(target); break;
            case 'lifesteal': const stealAmount = Math.floor(character.attack * 0.2); character.currentHp = Math.min(character.maxHp, character.currentHp + stealAmount); if (showLog) this.log(`${character.name} 吸取了 ${stealAmount} 点生命值！`); this.updateCharacterDisplay(character); break;
            case 'blessing': target.attack = Math.floor(target.attack * 1.1); target.defense = Math.floor(target.defense * 1.1); if (showLog) this.log(`${target.name} 获得了祝福，攻击和防御提升了！`); break;
            case 'rally': target.attack = Math.floor(target.attack * 1.1); if (showLog) this.log(`${target.name} 获得了士气提升，攻击增加了！`); break;
            case 'stoneSkin': target.defense = Math.floor(target.defense * 1.2); if (showLog) this.log(`${target.name} 获得了石肤效果，防御大幅提升！`); break;
            case 'defend': target.defense = Math.floor(target.defense * 1.3); if (showLog) this.log(`${target.name} 进入防御姿态，防御提高了！`); break;
            case 'iceShield': target.defense = Math.floor(target.defense * 1.2); const iceHealAmount = Math.floor(target.maxHp * 0.05); target.currentHp = Math.min(target.maxHp, target.currentHp + iceHealAmount); if (showLog) this.log(`${target.name} 获得了冰盾，防御提高并恢复了 ${iceHealAmount} 点生命值！`); this.updateCharacterDisplay(target); break;
            case 'fortress': target.defense = Math.floor(target.defense * 1.4); if (showLog) this.log(`${target.name} 进入铁壁状态，防御大幅提高！`); break;
            case 'shadowStep': target.speed = Math.floor(target.speed * 1.15); target.attack = Math.floor(target.attack * 1.1); if (showLog) this.log(`${target.name} 使用了暗影步，速度和攻击提升了！`); break;
            case 'berserk': target.attack = Math.floor(target.attack * 1.25); target.defense = Math.floor(target.defense * 0.9); if (showLog) this.log(`${target.name} 进入狂暴状态，攻击大幅提升但防御降低了！`); break;
            case 'roar': target.attack = Math.floor(target.attack * 1.15); if (showLog) this.log(`${target.name} 发出战吼，攻击提升了！`); break;
            case 'reform': const reformHealAmount = Math.floor(target.maxHp * 0.15); target.currentHp = Math.min(target.maxHp, target.currentHp + reformHealAmount); if (showLog) this.log(`${target.name} 重组了身体，恢复了 ${reformHealAmount} 点生命值！`); this.updateCharacterDisplay(target); break;
            case 'charm': target.attack = Math.floor(target.attack * 0.8); if (showLog) this.log(`${target.name} 被魅惑了，攻击降低了！`); break;
        }
    }
    
    triggerDeathSkills(character) {
        if (!character.skills) return;
        character.skills.forEach(skillId => {
            const skill = this.skills[skillId];
            if (skill && skill.releaseType === 'death' && (character.skillCooldowns[skillId] || 0) <= 0) {
                this.log(`${character.name} 触发 ${skill.name}！`);
                this.applyDeathSkillEffect(character, skill, skillId);
            }
        });
    }
    
    applyDeathSkillEffect(character, skill, skillId) {
        switch(skill.effect) {
            case 'revive':
                const reviveHpPercent = skill.effectValue || 0.5;
                const reviveAmount = Math.max(1, Math.floor(character.maxHp * reviveHpPercent));
                character.currentHp = reviveAmount;
                character.alive = true;
                this.log(`${character.name} 复活了！恢复了 ${reviveAmount} 点生命值！`);
                if (skill.cooldown > 0) character.skillCooldowns[skillId] = skill.cooldown;
                this.renderCharacters();
                break;
        }
    }
    
    attackRandomTarget(character) {
        let targets = [];
        if (character.team === 'player') targets = this.characters.filter(char => char.team === 'enemy' && char.alive);
        else targets = this.characters.filter(char => char.team === 'player' && char.alive);
        if (targets.length > 0) {
            const target = targets[Math.floor(Math.random() * targets.length)];
            this.highlightAttackedCharacter(target);
            const damage = character.attackTarget(target, this);
            this.log(`${character.name} 攻击了 ${target.name}，造成 ${damage} 点伤害！`);
            this.updateCharacterDisplay(target);
        }
    }
    
    updateCharacterDisplay(character) {
        const card = document.getElementById(character.id);
        if (card) {
            card.querySelector('.character-hp').textContent = `HP: ${character.currentHp}/${character.maxHp}`;
            card.querySelector('.hp-fill').style.width = `${character.getHpPercentage()}%`;
            if (!character.alive) {
                card.style.opacity = '0.5';
                card.style.backgroundColor = '#e74c3c';
            }
        }
    }
    
    highlightCurrentCharacter(character) {
        document.querySelectorAll('.character-card').forEach(card => card.classList.remove('active'));
        const card = document.getElementById(character.id);
        if (card) card.classList.add('active');
    }
    
    highlightAttackedCharacter(character) {
        this.lastAttackedCharacter = character;
        const card = document.getElementById(character.id);
        if (card) {
            card.classList.remove('attacked');
            void card.offsetWidth;
            card.classList.add('attacked');
        }
    }
    
    updateTurnIndicator(character) {
        document.getElementById('current-turn').textContent = `${character.name} 的回合`;
    }
    
    log(message) {
        const logList = document.getElementById('log-list');
        const li = document.createElement('li');
        li.textContent = message;
        logList.appendChild(li);
        logList.scrollTop = logList.scrollHeight;
    }
    
    checkGameEnd() {
        const alivePlayers = this.characters.filter(char => char.team === 'player' && char.alive).length;
        const aliveEnemies = this.characters.filter(char => char.team === 'enemy' && char.alive).length;
        if (alivePlayers === 0) {
            this.log('游戏结束！敌方胜利！');
            document.getElementById('next-turn').disabled = true;
            document.getElementById('auto-turn').disabled = true;
            this.stopAutoTurn();
        } else if (aliveEnemies === 0) {
            this.log('游戏结束！我方胜利！');
            document.getElementById('next-turn').disabled = true;
            document.getElementById('auto-turn').disabled = true;
            this.stopAutoTurn();
        }
    }
    
    toggleAutoTurn() {
        if (this.autoTurnInterval) this.stopAutoTurn();
        else this.startAutoTurn();
    }
    
    startAutoTurn() {
        this.autoTurnInterval = setInterval(() => this.nextTurn(), 1500);
        document.getElementById('auto-turn').textContent = '停止自动';
        this.log('开始自动执行回合！');
    }
    
    stopAutoTurn() {
        if (this.autoTurnInterval) {
            clearInterval(this.autoTurnInterval);
            this.autoTurnInterval = null;
            document.getElementById('auto-turn').textContent = '自动执行';
            this.log('停止自动执行回合！');
        }
    }
}

const game = new Game();
