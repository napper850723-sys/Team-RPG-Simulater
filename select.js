class CharacterSelect {
    constructor() {
        this.playerPool = [];
        this.enemyPool = [];
        this.selectedPlayers = [];
        this.selectedEnemies = [];
        this.gameMode = parseInt(localStorage.getItem('gameMode')) || 4;
        this.maxSelection = this.gameMode;
        this.init();
    }

    init() {
        this.updateModeDisplay();
        this.initEmptySlots();
        this.initCountDisplay();
        this.generatePools();
        this.renderPools();
        this.bindEvents();
    }

    initCountDisplay() {
        // 初始化计数显示
        const playerCountEl = document.getElementById('player-selected-count');
        const enemyCountEl = document.getElementById('enemy-selected-count');
        
        if (playerCountEl) {
            playerCountEl.textContent = `我方: 0/${this.maxSelection}`;
        }
        if (enemyCountEl) {
            enemyCountEl.textContent = `敌方: 0/${this.maxSelection}`;
        }
    }

    initEmptySlots() {
        // 初始化我方空位
        const playerSlotsContainer = document.getElementById('player-selected-slots');
        if (playerSlotsContainer) {
            playerSlotsContainer.innerHTML = '';
            let columns;
            if (this.gameMode === 1) {
                columns = 1;
            } else if (this.gameMode <= 4) {
                columns = 4;
            } else if (this.gameMode <= 6) {
                columns = 3;
            } else {
                columns = 3;
            }
            playerSlotsContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
            
            for (let i = 0; i < this.maxSelection; i++) {
                const slot = document.createElement('div');
                slot.className = 'slot';
                slot.dataset.index = i;
                slot.textContent = `空位 ${i + 1}`;
                playerSlotsContainer.appendChild(slot);
            }
        }

        // 初始化敌方空位
        const enemySlotsContainer = document.getElementById('enemy-selected-slots');
        if (enemySlotsContainer) {
            enemySlotsContainer.innerHTML = '';
            let columns;
            if (this.gameMode === 1) {
                columns = 1;
            } else if (this.gameMode <= 4) {
                columns = 4;
            } else if (this.gameMode <= 6) {
                columns = 3;
            } else {
                columns = 3;
            }
            enemySlotsContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
            
            for (let i = 0; i < this.maxSelection; i++) {
                const slot = document.createElement('div');
                slot.className = 'slot enemy';
                slot.dataset.index = i;
                slot.textContent = `空位 ${i + 1}`;
                enemySlotsContainer.appendChild(slot);
            }
        }
    }

    updateModeDisplay() {
        const subtitle = document.getElementById('mode-subtitle');
        if (subtitle) {
            subtitle.textContent = `从角色池中选择${this.gameMode}个我方角色和${this.gameMode}个敌方角色`;
        }
    }

    generatePools() {
        const playerImageNames = ['hero', 'wizard', 'knight', 'archer', 'priest', 'assassin', 'warrior', 'witch', 'paladin'];
        const enemyImageNames = ['goblin', 'orc', 'skeleton', 'zombie', 'vampire', 'werewolf', 'gargoyle', 'lich', 'dragon'];
        
        // 使用 skills.js 中的统一配置
        const skillList = SkillsConfig.getSkillList();
        this.skills = SkillsConfig.getSkillsObject();
        
        // ============================================
        // 我方角色配置
        // 每个角色包含：name(名称), hp(生命), speed(速度), attack(攻击), defense(防御), skills(技能ID数组[技能1, 技能2])
        // ============================================
        const playerTemplates = [
            { name: "勇者", hp: 150, speed: 15, attack: 25, defense: 10, skills: ['fireball', 'shield'] },
            { name: "法师", hp: 100, speed: 18, attack: 30, defense: 5, skills: ['fireball', 'blessing'] },
            { name: "骑士", hp: 180, speed: 12, attack: 20, defense: 15, skills: ['shield', 'stoneSkin'] },
            { name: "弓箭手", hp: 120, speed: 20, attack: 22, defense: 8, skills: ['lifesteal', 'powerAura'] },
            { name: "牧师", hp: 110, speed: 16, attack: 15, defense: 7, skills: ['heal', 'blessing'] },
            { name: "刺客", hp: 90, speed: 22, attack: 28, defense: 6, skills: ['lifesteal', 'shadowStep'] },
            { name: "战士", hp: 160, speed: 14, attack: 23, defense: 12, skills: ['warCry', 'stoneSkin'] },
            { name: "巫师", hp: 95, speed: 17, attack: 27, defense: 4, skills: ['fireball', 'protectiveAura'] },
            { name: "圣骑士", hp: 150, speed: 13, attack: 19, defense: 14, skills: ['heal', 'reviveSkill'] },
            { name: "游侠", hp: 115, speed: 19, attack: 24, defense: 7, skills: ['lifesteal', 'roar'] },
            { name: "贤者", hp: 105, speed: 15, attack: 20, defense: 9, skills: ['blessing', 'stoneSkin'] },
            { name: "暗杀者", hp: 85, speed: 23, attack: 29, defense: 5, skills: ['shadowStep', 'berserk'] },
            { name: "狂战士", hp: 170, speed: 11, attack: 26, defense: 11, skills: ['berserk', 'warCry'] },
            { name: "召唤师", hp: 90, speed: 16, attack: 21, defense: 6, skills: ['fireball', 'powerAura'] },
            { name: "守护者", hp: 190, speed: 10, attack: 18, defense: 16, skills: ['fortress', 'shield'] },
            { name: "神官", hp: 115, speed: 14, attack: 16, defense: 8, skills: ['heal', 'protectiveAura'] },
            { name: "猎人", hp: 110, speed: 21, attack: 23, defense: 7, skills: ['lifesteal', 'fireball'] },
            { name: "剑客", hp: 140, speed: 16, attack: 25, defense: 9, skills: ['shield', 'shadowStep'] },
            { name: "德鲁伊", hp: 125, speed: 15, attack: 20, defense: 11, skills: ['stoneSkin', 'blessing'] },
            { name: "武僧", hp: 130, speed: 17, attack: 22, defense: 10, skills: ['warCry', 'lifesteal'] },
            { name: "元素师", hp: 88, speed: 19, attack: 29, defense: 4, skills: ['fireball', 'powerAura'] },
            { name: "圣殿骑士", hp: 165, speed: 12, attack: 21, defense: 14, skills: ['stoneSkin', 'reviveSkill'] },
            { name: "暗行者", hp: 92, speed: 24, attack: 27, defense: 5, skills: ['shadowStep', 'charm'] },
            { name: "战争领主", hp: 175, speed: 11, attack: 28, defense: 13, skills: ['roar', 'berserk'] }
        ];

        // ============================================
        // 敌方角色配置
        // ============================================
        const enemyTemplates = [
            { name: "哥布林", hp: 80, speed: 16, attack: 18, defense: 3, skills: ['warCry', 'lifesteal'] },
            { name: "兽人", hp: 120, speed: 13, attack: 22, defense: 8, skills: ['stoneSkin', 'berserk'] },
            { name: "骷髅兵", hp: 90, speed: 15, attack: 16, defense: 5, skills: ['reform', 'reviveSkill'] },
            { name: "僵尸", hp: 110, speed: 10, attack: 19, defense: 6, skills: ['reform', 'stoneSkin'] },
            { name: "吸血鬼", hp: 100, speed: 19, attack: 21, defense: 4, skills: ['lifesteal', 'charm'] },
            { name: "狼人", hp: 115, speed: 17, attack: 23, defense: 7, skills: ['roar', 'berserk'] },
            { name: "石像鬼", hp: 130, speed: 12, attack: 17, defense: 10, skills: ['stoneSkin', 'fortress'] },
            { name: "巫妖", hp: 95, speed: 18, attack: 25, defense: 3, skills: ['fireball', 'charm'] },
            { name: "龙", hp: 150, speed: 14, attack: 28, defense: 12, skills: ['roar', 'powerAura'] },
            { name: "暗影刺客", hp: 85, speed: 22, attack: 26, defense: 4, skills: ['lifesteal', 'shadowStep'] },
            { name: "恶魔领主", hp: 140, speed: 11, attack: 30, defense: 11, skills: ['berserk', 'fireball'] },
            { name: "死灵法师", hp: 100, speed: 15, attack: 22, defense: 6, skills: ['heal', 'reviveSkill'] },
            { name: "地狱犬", hp: 95, speed: 19, attack: 24, defense: 5, skills: ['fireball', 'lifesteal'] },
            { name: "骷髅法师", hp: 88, speed: 17, attack: 23, defense: 4, skills: ['fireball', 'protectiveAura'] },
            { name: "巨型蜘蛛", hp: 110, speed: 14, attack: 20, defense: 9, skills: ['charm', 'stoneSkin'] },
            { name: "幽灵", hp: 75, speed: 21, attack: 19, defense: 2, skills: ['shadowStep', 'lifesteal'] },
            { name: "巨魔", hp: 160, speed: 9, attack: 25, defense: 13, skills: ['reform', 'stoneSkin'] },
            { name: "火焰元素", hp: 90, speed: 18, attack: 27, defense: 3, skills: ['fireball', 'powerAura'] },
            { name: "暗黑骑士", hp: 145, speed: 13, attack: 24, defense: 12, skills: ['stoneSkin', 'charm'] },
            { name: "血魔", hp: 95, speed: 20, attack: 26, defense: 5, skills: ['lifesteal', 'berserk'] },
            { name: "骨龙", hp: 155, speed: 12, attack: 29, defense: 11, skills: ['roar', 'reform'] },
            { name: "地狱使者", hp: 125, speed: 16, attack: 25, defense: 7, skills: ['fireball', 'berserk'] },
            { name: "巫妖领主", hp: 105, speed: 15, attack: 27, defense: 6, skills: ['charm', 'reviveSkill'] },
            { name: "熔岩巨人", hp: 170, speed: 8, attack: 31, defense: 14, skills: ['stoneSkin', 'powerAura'] }
        ];

        // 生成我方角色池 - 根据模板数量动态生成
        for (let i = 0; i < playerTemplates.length; i++) {
            const template = playerTemplates[i];
            const imageName = playerImageNames[i % playerImageNames.length];

            this.playerPool.push({
                id: `player-${i}`,
                name: `${template.name}(${i + 1})`,
                team: 'player',
                hp: template.hp,
                speed: template.speed,
                attack: template.attack,
                defense: template.defense,
                skills: template.skills,  // 直接使用技能ID数组
                image: `images/${imageName}.png`
            });
        }

        // 生成敌方角色池 - 根据模板数量动态生成
        for (let i = 0; i < enemyTemplates.length; i++) {
            const template = enemyTemplates[i];
            const imageName = enemyImageNames[i % enemyImageNames.length];

            this.enemyPool.push({
                id: `enemy-${i}`,
                name: `${template.name}(${i + 1})`,
                team: 'enemy',
                hp: template.hp,
                speed: template.speed,
                attack: template.attack,
                defense: template.defense,
                skills: template.skills,  // 直接使用技能ID数组
                image: `images/${imageName}.png`
            });
        }
    }

    renderPools() {
        // 渲染我方角色池
        const playerPoolContainer = document.getElementById('player-pool');
        playerPoolContainer.innerHTML = '';
        this.playerPool.forEach((char, index) => {
            const card = this.createCharacterCard(char, index, 'player');
            playerPoolContainer.appendChild(card);
        });

        // 渲染敌方角色池
        const enemyPoolContainer = document.getElementById('enemy-pool');
        enemyPoolContainer.innerHTML = '';
        this.enemyPool.forEach((char, index) => {
            const card = this.createCharacterCard(char, index, 'enemy');
            enemyPoolContainer.appendChild(card);
        });
    }

    createCharacterCard(character, index, type) {
        const card = document.createElement('div');
        card.className = `character-card ${type}`;
        card.dataset.index = index;
        card.dataset.type = type;

        const skill1 = this.skills[character.skills[0]];
        const skill2 = this.skills[character.skills[1]];

        card.innerHTML = `
            <div class="character-left">
                <div class="character-image">
                    <img src="${character.image}" alt="${character.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/></svg>'">
                </div>
                <div class="character-name">${character.name}</div>
                <div class="character-hp">HP: ${character.hp}/${character.hp}</div>
                <div class="hp-bar">
                    <div class="hp-fill" style="width: 100%"></div>
                </div>
            </div>
            <div class="character-divider"></div>
            <div class="character-right">
                <div class="character-stats">
                    <div><span class="stat-label">攻击</span> <span class="stat-value">${character.attack}</span></div>
                    <div><span class="stat-label">防御</span> <span class="stat-value">${character.defense}</span></div>
                    <div><span class="stat-label">速度</span> <span class="stat-value">${character.speed}</span></div>
                </div>
                <div class="character-skills">
                    <div class="skill-row" title="${skill1.description}">${skill1.name}</div>
                    <div class="skill-row" title="${skill2.description}">${skill2.name}</div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => this.toggleSelection(index, type));

        return card;
    }

    toggleSelection(index, type) {
        try {
            const pool = type === 'player' ? this.playerPool : this.enemyPool;
            const selectedList = type === 'player' ? this.selectedPlayers : this.selectedEnemies;
            const char = pool[index];
            
            if (!char) return;
            
            const selectedIndex = selectedList.findIndex(c => c.id === char.id);

            if (selectedIndex > -1) {
                selectedList.splice(selectedIndex, 1);
            } else {
                if (selectedList.length >= this.maxSelection) {
                    alert(`${type === 'player' ? '我方' : '敌方'}最多只能选择${this.maxSelection}个角色！`);
                    return;
                }
                selectedList.push(char);
            }

            this.updateUI();
        } catch (e) {
            console.error('toggleSelection error:', e);
        }
    }

    updateUI() {
        // 更新我方角色池显示
        const playerPoolCards = document.querySelectorAll('#player-pool .character-card');
        playerPoolCards.forEach((card, index) => {
            const char = this.playerPool[index];
            const isSelected = this.selectedPlayers.some(c => c.id === char.id);
            const isDisabled = !isSelected && this.selectedPlayers.length >= this.maxSelection;

            card.classList.toggle('selected', isSelected);
            card.classList.toggle('disabled', isDisabled);
        });

        // 更新敌方角色池显示
        const enemyPoolCards = document.querySelectorAll('#enemy-pool .character-card');
        enemyPoolCards.forEach((card, index) => {
            const char = this.enemyPool[index];
            const isSelected = this.selectedEnemies.some(c => c.id === char.id);
            const isDisabled = !isSelected && this.selectedEnemies.length >= this.maxSelection;

            card.classList.toggle('selected', isSelected);
            card.classList.toggle('disabled', isDisabled);
        });

        // 更新我方已选队伍显示
        const playerSlotsContainer = document.getElementById('player-selected-slots');
        if (playerSlotsContainer) {
            // 只更新内容，不重新创建元素（grid布局已在initEmptySlots中设置）
            const slots = playerSlotsContainer.querySelectorAll('.slot');
            slots.forEach((slot, i) => {
                if (i < this.selectedPlayers.length) {
                    const char = this.selectedPlayers[i];
                    const skill1 = this.skills[char.skills[0]];
                    const skill2 = this.skills[char.skills[1]];
                    slot.className = 'slot filled';
                    slot.innerHTML = `
                        <div class="selected-char">
                            <div class="selected-char-image">
                                <img src="${char.image}" alt="${char.name}">
                            </div>
                            <div class="selected-char-name">${char.name}</div>
                            <div class="selected-char-hp">HP: ${char.hp}/${char.hp}</div>
                            <div class="selected-char-stats">攻:${char.attack} 防:${char.defense} 速:${char.speed}</div>
                            <div class="selected-char-skills">
                                <span class="selected-skill" title="${skill1.description}">${skill1.name}</span>
                                <span class="selected-skill" title="${skill2.description}">${skill2.name}</span>
                            </div>
                        </div>
                    `;
                } else {
                    slot.className = 'slot';
                    slot.textContent = `空位 ${i + 1}`;
                }
            });
        }

        // 更新敌方已选队伍显示
        const enemySlotsContainer = document.getElementById('enemy-selected-slots');
        if (enemySlotsContainer) {
            // 只更新内容，不重新创建元素（grid布局已在initEmptySlots中设置）
            const slots = enemySlotsContainer.querySelectorAll('.slot');
            slots.forEach((slot, i) => {
                if (i < this.selectedEnemies.length) {
                    const char = this.selectedEnemies[i];
                    const skill1 = this.skills[char.skills[0]];
                    const skill2 = this.skills[char.skills[1]];
                    slot.className = 'slot enemy filled';
                    slot.innerHTML = `
                        <div class="selected-char">
                            <div class="selected-char-image">
                                <img src="${char.image}" alt="${char.name}">
                            </div>
                            <div class="selected-char-name">${char.name}</div>
                            <div class="selected-char-hp">HP: ${char.hp}/${char.hp}</div>
                            <div class="selected-char-stats">攻:${char.attack} 防:${char.defense} 速:${char.speed}</div>
                            <div class="selected-char-skills">
                                <span class="selected-skill enemy" title="${skill1.description}">${skill1.name}</span>
                                <span class="selected-skill enemy" title="${skill2.description}">${skill2.name}</span>
                            </div>
                        </div>
                    `;
                } else {
                    slot.className = 'slot enemy';
                    slot.textContent = `空位 ${i + 1}`;
                }
            });
        }

        // 更新计数
        const playerCountEl = document.getElementById('player-selected-count');
        const enemyCountEl = document.getElementById('enemy-selected-count');
        const startBtn = document.getElementById('start-game');
        
        if (playerCountEl) {
            playerCountEl.textContent = `我方: ${this.selectedPlayers.length}/${this.maxSelection}`;
        }
        if (enemyCountEl) {
            enemyCountEl.textContent = `敌方: ${this.selectedEnemies.length}/${this.maxSelection}`;
        }
        
        if (startBtn) {
            startBtn.disabled = !(this.selectedPlayers.length === this.maxSelection && this.selectedEnemies.length === this.maxSelection);
        }
    }

    bindEvents() {
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        
        const backBtn = document.getElementById('back-to-home');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    }

    startGame() {
        localStorage.setItem('selectedTeam', JSON.stringify(this.selectedPlayers));
        localStorage.setItem('selectedEnemies', JSON.stringify(this.selectedEnemies));
        window.location.href = 'battle.html';
    }
}

const select = new CharacterSelect();
