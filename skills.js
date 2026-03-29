// ============================================
// 技能配置文件 - 统一配置所有技能
// ============================================

const SkillsConfig = {
    // 技能列表（按编号 0-N）
    // 在角色模板中使用编号引用技能
    skillList: [
        { 
            id: 'fireball', 
            name: '火球术', 
            description: '向敌人投掷火球，造成1.2倍攻击伤害',
            targetType: 'single',
            damageMultiplier: 1.2,
            priority: 1,
            cooldown: 2,
            releaseType: 'active'
        },
        { 
            id: 'heal', 
            name: '治疗术', 
            description: '为己方全体恢复10%生命值',
            targetType: 'allyAll',
            effect: 'heal',
            priority: 2,
            cooldown: 3,
            releaseType: 'active'
        },
        { 
            id: 'shield', 
            name: '护盾', 
            description: '提升自身30%防御力',
            targetType: 'self',
            effect: 'defend',
            priority: 3,
            cooldown: 2,
            releaseType: 'active'
        },
        { 
            id: 'blessing', 
            name: '祝福', 
            description: '为己方全体提升10%攻击和防御',
            targetType: 'allyAll',
            effect: 'blessing',
            priority: 2,
            cooldown: 4,
            releaseType: 'active'
        },
        { 
            id: 'lifesteal', 
            name: '吸血', 
            description: '吸取敌人生命值，恢复自身20%攻击力的生命值',
            targetType: 'single',
            damageMultiplier: 1.0,
            effect: 'lifesteal',
            priority: 1,
            cooldown: 2,
            releaseType: 'active'
        },
        { 
            id: 'warCry', 
            name: '战吼', 
            description: '提升己方全体10%攻击力',
            targetType: 'allyAll',
            effect: 'rally',
            priority: 2,
            cooldown: 3,
            releaseType: 'active'
        },
        { 
            id: 'stoneSkin', 
            name: '石肤', 
            description: '提升自身20%防御力',
            targetType: 'self',
            effect: 'stoneSkin',
            priority: 3,
            cooldown: 2,
            releaseType: 'active'
        },
        { 
            id: 'powerAura', 
            name: '力量光环', 
            description: '只要角色活着，己方全体攻击力+10%',
            targetType: 'allyAll',
            effect: 'rally',
            priority: 1,
            cooldown: 0,
            releaseType: 'aura'
        },
        { 
            id: 'protectiveAura', 
            name: '守护光环', 
            description: '只要角色活着，己方全体防御力+10%',
            targetType: 'allyAll',
            effect: 'stoneSkin',
            priority: 1,
            cooldown: 0,
            releaseType: 'aura'
        },
        { 
            id: 'berserk', 
            name: '狂暴', 
            description: '进入狂暴状态，攻击提升25%但防御降低10%',
            targetType: 'self',
            effect: 'berserk',
            priority: 2,
            cooldown: 3,
            releaseType: 'active'
        },
        { 
            id: 'roar', 
            name: '战吼', 
            description: '发出战吼，攻击提升15%',
            targetType: 'self',
            effect: 'roar',
            priority: 2,
            cooldown: 2,
            releaseType: 'active'
        },
        { 
            id: 'reform', 
            name: '重组', 
            description: '重组身体，恢复15%生命值',
            targetType: 'self',
            effect: 'reform',
            priority: 3,
            cooldown: 2,
            releaseType: 'active'
        },
        { 
            id: 'charm', 
            name: '魅惑', 
            description: '魅惑敌人，使其攻击降低20%',
            targetType: 'single',
            damageMultiplier: 0.8,
            effect: 'charm',
            priority: 1,
            cooldown: 3,
            releaseType: 'active'
        },
        { 
            id: 'shadowStep', 
            name: '暗影步', 
            description: '使用暗影步，速度提升15%，攻击提升10%',
            targetType: 'self',
            effect: 'shadowStep',
            priority: 2,
            cooldown: 2,
            releaseType: 'active'
        },
        { 
            id: 'fortress', 
            name: '铁壁', 
            description: '进入铁壁状态，防御大幅提高40%',
            targetType: 'self',
            effect: 'fortress',
            priority: 3,
            cooldown: 3,
            releaseType: 'active'
        },
        { 
            id: 'reviveSkill', 
            name: '复活术', 
            description: '死亡时自动复活，恢复80%生命值',
            targetType: 'self',
            effect: 'revive',
            effectValue: 0.8,
            priority: 1,
            cooldown: 0,
            releaseType: 'death'
        }
        // 添加新技能在这里...
        // 示例：
        // { 
        //     id: 'thunderStrike', 
        //     name: '雷霆一击', 
        //     description: '召唤雷电攻击敌人，造成1.5倍攻击伤害并降低敌人速度',
        //     targetType: 'single',
        //     damageMultiplier: 1.5,
        //     effect: 'thunderStrike',
        //     priority: 1,
        //     cooldown: 3,
        //     releaseType: 'active'
        // }
    ],

    // 获取技能对象（用于game.js）
    getSkillsObject() {
        const skills = {};
        this.skillList.forEach(skill => {
            skills[skill.id] = skill;
        });
        return skills;
    },

    // 获取技能列表（用于select.js显示）
    getSkillList() {
        return this.skillList.map(skill => ({
            id: skill.id,
            name: skill.name,
            description: skill.description
        }));
    },

    // 根据编号获取技能ID
    getSkillIdByIndex(index) {
        return this.skillList[index] ? this.skillList[index].id : null;
    },

    // 根据编号获取技能名称
    getSkillNameByIndex(index) {
        return this.skillList[index] ? this.skillList[index].name : '未知技能';
    },

    // 获取技能总数
    getSkillCount() {
        return this.skillList.length;
    }
};

// 导出配置（在浏览器环境中直接可用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillsConfig;
}
