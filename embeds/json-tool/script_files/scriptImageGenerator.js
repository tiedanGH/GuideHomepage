// ========== 剧本图生成相关函数 ==========

function showScriptPreview(dataUrl) {
    const existing = document.getElementById('script-preview-modal');
    if (existing) existing.remove();

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = '剧本图_' + dateStr + '.png';

    const modal = document.createElement('div');
    modal.id = 'script-preview-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:#fff;border-radius:12px;max-width:96vw;max-height:96vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #e2e8f0;flex-shrink:0;">
                <span style="font-size:16px;font-weight:bold;color:#2d3748;">剧本图预览</span>
                <button onclick="this.closest('#script-preview-modal').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#a0aec0;line-height:1;padding:0 4px;">&times;</button>
            </div>
            <div style="overflow:auto;padding:16px;flex:1;display:flex;align-items:flex-start;justify-content:center;">
                <img src="${dataUrl}" style="max-width:100%;height:auto;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,0.1);" alt="剧本图预览">
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;padding:14px 20px;border-top:1px solid #e2e8f0;flex-shrink:0;">
                <button onclick="this.closest('#script-preview-modal').remove()" style="padding:8px 24px;border:1px solid #cbd5e0;border-radius:6px;background:#fff;color:#4a5568;cursor:pointer;font-size:14px;">关闭</button>
                <button id="script-preview-download-btn" data-url="${dataUrl}" data-filename="${fileName}" style="padding:8px 24px;border:none;border-radius:6px;background:linear-gradient(135deg, #e8963a 0%, #e8590c 100%);color:#fff;cursor:pointer;font-size:14px;font-weight:bold;">下载图片</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#script-preview-download-btn').addEventListener('click', function() {
        const link = document.createElement('a');
        link.download = this.dataset.filename;
        link.href = this.dataset.url;
        link.click();
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.remove();
    });
}

function generateScriptImageByScheme() {
    if (window.currentScheme === 'scheme1') {
        generateScriptImage();
    } else if (window.currentScheme === 'scheme2') {
        generateScheme2Image();
    } else if (window.currentScheme === 'scheme3') {
        generateScheme3Image();
    }
}

// ========== 方案一：A4专业排版剧本图 ==========
function generateScriptImage() {
    const selectedRoles = getSelectedRoles();
    if (selectedRoles.length === 0) {
        alert('请先选择角色！');
        return;
    }

    const config = getScriptConfig();

    const teamNames = { 
        'townsfolk': config.townsfolkName, 
        'outsider': config.outsiderName, 
        'minion': config.minionName, 
        'demon': config.demonName, 
        'traveller': '旅行者', 
        'fabled': '传奇角色' 
    };
    
    const teamColors = {
        'townsfolk': config.townsfolkColor,
        'outsider': config.outsiderColor,
        'minion': config.minionColor,
        'demon': config.demonColor
    };

    const bootleggerInput = document.getElementById('bootlegger');
    const bootleggerText = bootleggerInput ? bootleggerInput.value.trim() : '';

    const twilightRole = { id: 'twilight', name: '黄昏', firstNight: 0, otherNight: 0, image: 'images/dusk-CLd-DXn-QC.png' };
    const minionInfoRole = { id: 'minioninfo', name: '爪牙信息', firstNight: 2000, otherNight: 0, image: 'images/180px-Mi.png' };
    const demonInfoRole = { id: 'demoninfo', name: '恶魔信息', firstNight: 3000, otherNight: 0, image: 'images/180px-Di.png' };
    const dawnRole = { id: 'dawn', name: '黎明', firstNight: 9999, otherNight: 9999, image: 'images/dawn.png' };
    
    const getNightOrderFromPanel = (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return [];
        
        const buttons = container.querySelectorAll('.draggable-button');
        const roleIds = Array.from(buttons)
            .map(btn => btn.getAttribute('data-role-id'))
            .filter(id => id && id.trim() !== '');
        
        return roleIds.map(roleId => {
            if (roleId === 'twilight') return twilightRole;
            if (roleId === 'minioninfo') return minionInfoRole;
            if (roleId === 'demoninfo') return demonInfoRole;
            if (roleId === 'dawn') return dawnRole;
            
            const role = selectedRoles.find(r => r.id === roleId);
            if (role) return role;
            const dirRole = window.dirRolesJson.find(r => r.id === roleId);
            return dirRole || null;
        }).filter(r => r !== null);
    };
    
    let firstNightRoles = getNightOrderFromPanel('first-night-buttons-container');
    let otherNightRoles = getNightOrderFromPanel('other-night-buttons-container');
    
    if (firstNightRoles.length === 0) {
        firstNightRoles = selectedRoles
            .filter(r => r.firstNight > 0)
            .sort((a, b) => a.firstNight - b.firstNight);
        firstNightRoles = [twilightRole, ...firstNightRoles, minionInfoRole, demonInfoRole, dawnRole];
    }
    if (otherNightRoles.length === 0) {
        otherNightRoles = selectedRoles
            .filter(r => r.otherNight > 0)
            .sort((a, b) => a.otherNight - b.otherNight);
        otherNightRoles = [twilightRole, ...otherNightRoles, dawnRole];
    }

    function buildNightOrderIcons(roles, containerHeight = 500, fixedSize = 48) {
        if (!roles || roles.length === 0) return '';
        
        const iconCount = roles.length;
        const spacing = 8;
        const size = fixedSize.toFixed(1);
        
        let html = '';
        roles.forEach((role, index) => {
            const imgSrc = role.image || '';
            html += `<div style="text-align:center;margin-bottom:${index < iconCount - 1 ? spacing + 'px' : '0'};">`;
            if (imgSrc) {
                html += `<img src="${imgSrc}" style="width:${size}px;height:${size}px;border-radius:4px;object-fit:cover;display:block;margin:0 auto;" title="${role.name}" onerror="this.style.display='none'">`;
            } else {
                html += `<div style="width:${size}px;height:${size}px;border-radius:4px;background:#e2e8f0;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:${Math.max(6, size * 0.15)}px;color:#a0aec0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${role.name}</div>`;
            }
            html += `</div>`;
        });
        return html;
    }

    const totalHeight = 1123;
    const topPadding = 110;
    const bottomPadding = 100;
    const availableHeight = totalHeight - topPadding - bottomPadding;
    
    const maxRoleCount = Math.max(firstNightRoles.length, otherNightRoles.length);
    
    function calculateNightIconSize(roleCount, containerHeight, minSize = 24, maxSize = 48) {
        if (roleCount <= 0) return maxSize;
        const spacing = 8;
        return Math.min(
            maxSize,
            Math.max(
                minSize,
                (containerHeight - (roleCount - 1) * spacing) / roleCount * 0.9
            )
        );
    }
    
    const iconSize = calculateNightIconSize(maxRoleCount, availableHeight);
    
    const firstNightIcons = buildNightOrderIcons(firstNightRoles, availableHeight, iconSize);
    const otherNightIcons = buildNightOrderIcons(otherNightRoles, availableHeight, iconSize);
    
    function calculateRoleScale(roleCount) {
        if (roleCount <= 8) return 1.50;
        if (roleCount <= 12) return 1.35;
        if (roleCount <= 16) return 1.20;
        if (roleCount <= 22) return 1.10;
        if (roleCount <= 28) return 1.00;
        if (roleCount <= 34) return 0.90;
        return 0.80;
    }
    
    const totalRoleCount = selectedRoles.length;
    const roleScale = calculateRoleScale(totalRoleCount);
    
    const baseImgSize = 52;
    const baseNameSize = 11;
    const baseAbilitySize = 8.5;
    const baseJinxSize = 7;
    const baseTeamTitleSize = 11;
    const baseGap = 6;
    const baseColumnGap = 10;
    const baseCardGap = 4;
    const baseJinxImgSize = 12;
    
    const imgSize = Math.round(baseImgSize * roleScale);
    const nameSize = Math.round(baseNameSize * roleScale * 10) / 10;
    const abilitySize = Math.round(baseAbilitySize * roleScale * 10) / 10;
    const jinxSize = Math.round(baseJinxSize * roleScale * 10) / 10;
    const teamTitleSize = Math.round(baseTeamTitleSize * roleScale * 10) / 10;
    const gap = Math.round(baseGap * roleScale);
    const columnGap = Math.round(baseColumnGap * roleScale);
    const cardGap = Math.round(baseCardGap * roleScale);
    const jinxImgSize = Math.round(baseJinxImgSize * roleScale);

    function buildRoleCard(role, jinxesForRole, teamColor) {
        const imgSrc = role.image || '';
        const nameColor = teamColor || '#c1121f';
        let html = `<div style="display:flex;align-items:flex-start;gap:${gap}px;margin-bottom:0;width:100%;">`;
        if (imgSrc) {
            html += `<img src="${imgSrc}" style="width:${imgSize}px;height:${imgSize}px;border-radius:3px;flex-shrink:0;object-fit:cover;" onerror="this.style.display='none'">`;
        }
        html += `<div style="flex:1;min-width:0;">`;
        html += `<div style="font-weight:bold;font-size:${nameSize}px;color:${nameColor};margin-bottom:1px;letter-spacing:0.3px;">${role.name}</div>`;
        html += `<div style="font-size:${abilitySize}px;color:#1a1a1a;line-height:1.5;">${role.ability || ''}</div>`;
        
        if (jinxesForRole && jinxesForRole.length > 0) {
            html += `<div style="font-size:${jinxSize}px;color:#718096;margin-top:2px;line-height:1.4;">`;
            jinxesForRole.forEach(jinx => {
                const role2 = selectedRoles.find(r => r.name === jinx.jinxRole2);
                const role2Img = role2 ? role2.image : '';
                if (role2Img) {
                    html += `<div style="margin-bottom:1px;display:flex;align-items:center;gap:2px;">`;
                    html += `<img src="${role2Img}" style="width:${jinxImgSize}px;height:${jinxImgSize}px;border-radius:2px;object-fit:cover;flex-shrink:0;" onerror="this.style.display='none'">`;
                    html += `<span>${jinx.jinxRule}</span>`;
                    html += `</div>`;
                } else {
                    html += `<div style="margin-bottom:1px;">${jinx.jinxRule}</div>`;
                }
            });
            html += `</div>`;
        }
        
        html += `</div></div>`;
        return html;
    }

    function buildTeamSection(team, allJinxes, customTeamInfo = null) {
        const occupiedRoleIds = typeof getCustomTeams === 'function' ? 
            getCustomTeams().flatMap(t => t.roleIds || []) : [];
        
        let roles;
        if (customTeamInfo && customTeamInfo.roleIds) {
            roles = selectedRoles.filter(r => customTeamInfo.roleIds.includes(r.id));
        } else {
            roles = selectedRoles.filter(r => r.team === team && !occupiedRoleIds.includes(r.id));
        }
        if (!roles || roles.length === 0) return '';
        
        let teamColor, teamDisplayName;
        if (customTeamInfo) {
            teamColor = customTeamInfo.color;
            teamDisplayName = customTeamInfo.name;
        } else {
            teamColor = teamColors[team] || ((team === 'townsfolk' || team === 'outsider') ? scriptConfig.goodColor : scriptConfig.evilColor);
            teamDisplayName = teamNames[team] || team;
        }
        
        const isHorizontal = document.getElementById('roles-horizontal')?.checked || false;
        
        let html = `<div style="margin-bottom: ${Math.round(12 * roleScale)}px; display: flex; flex-direction: column;">`;
        html += `<div style="display:flex;align-items:center;margin-bottom:${Math.round(4 * roleScale)}px;">`;
        html += `<span style="color:${teamColor};font-size:${teamTitleSize}px;font-weight:bold;flex-shrink:0;letter-spacing:1px;">${teamDisplayName}</span>`;
        html += `<div style="flex:1;height:1px;background:#c0c0c0;margin-left:8px;"></div>`;
        html += `</div>`;
        
        if (isHorizontal) {
            html += `<div style="display:flex;gap:${columnGap}px;flex-wrap:wrap;">`;
            roles.forEach(role => {
                const jinxesForRole = allJinxes.filter(jinx => jinx.jinxRole1 === role.name);
                html += `<div style="flex-shrink:0;">`;
                html += buildRoleCard(role, jinxesForRole, teamColor);
                html += `</div>`;
            });
            html += `</div>`;
        } else {
            const halfLength = Math.ceil(roles.length / 2);
            const leftColumnRoles = roles.slice(0, halfLength);
            const rightColumnRoles = roles.slice(halfLength);
            
            html += `<div style="display:flex;gap:${columnGap}px;flex:1;">`;
            html += `<div style="flex:1;display:flex;flex-direction:column;gap:${cardGap}px;">`;
            leftColumnRoles.forEach(role => {
                const jinxesForRole = allJinxes.filter(jinx => jinx.jinxRole1 === role.name);
                html += buildRoleCard(role, jinxesForRole, teamColor);
            });
            html += `</div>`;
            html += `<div style="flex:1;display:flex;flex-direction:column;gap:${cardGap}px;">`;
            rightColumnRoles.forEach(role => {
                const jinxesForRole = allJinxes.filter(jinx => jinx.jinxRole1 === role.name);
                html += buildRoleCard(role, jinxesForRole, teamColor);
            });
            html += `</div>`;
            html += `</div>`;
        }
        html += `</div>`;
        return html;
    }

    const scriptConfig = config;

    const scriptTitle = (metaInfoJson && metaInfoJson.name && metaInfoJson.name.trim()) ? metaInfoJson.name.trim() : '未知剧本';
    const authorText = (metaInfoJson && metaInfoJson.author && metaInfoJson.author.trim()) ? metaInfoJson.author.trim() : '';
    
    const qrcodeImageSrc = scriptConfig.qrcodeImage || '';
    const showQrCode = qrcodeImageSrc && (qrcodeImageSrc.startsWith('data:image') || qrcodeImageSrc.startsWith('http') || qrcodeImageSrc.startsWith('images/'));

    const selectedRoleNames = selectedRoles.map(r => r.name);
    const allJinxes = scriptConfig.showJinxRules ? getDeduplicatedJinxes(selectedRoleNames) : [];

    const container = document.getElementById('script-image-render');
    container.innerHTML = `
        <div style="width: 794px; height: 1123px; background: ${scriptConfig.bgColor}; font-family: 'Microsoft YaHei', 'SimSun', 'PingFang SC', sans-serif; color: #1a1a1a; position: relative; display: flex; flex-direction: row; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            
            ${scriptConfig.showNightOrder ? `
            <div style="width: 70px; display: flex; flex-direction: column; align-items: center; padding-top: 110px; padding-bottom: 100px; position: relative;">
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                    ${firstNightIcons}
                </div>
                <div style="position: absolute; right: -5px; top: 50%; transform: translateY(-50%) translateX(50%); writing-mode: vertical-rl; text-orientation: mixed; font-size: 9px; font-weight: bold; color: #3d4852; letter-spacing: 4px; background: ${scriptConfig.bgColor}; padding: 2px 4px; z-index: 10;">FIRST NIGHT</div>
            </div>
            ` : ''}

            <div style="flex: 1; display: flex; flex-direction: column; padding: 0; position: relative;">
                <div style="padding: 12px 22px 4px 22px;">
                    <div style="display: flex; align-items: flex-start; justify-content: space-between;">
                        <div style="flex: 1;">
                            ${scriptConfig.titleImage ? `<img src="${scriptConfig.titleImage}" style="max-width:300px;max-height:60px;height:auto;" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'font-size:30px;font-weight:bold;color:${scriptConfig.titleColor};font-family:SimSun,STSong,serif;letter-spacing:5px;line-height:1.2;\\'>${scriptTitle}</div>';" alt="${scriptTitle}">` : `<div style="font-size: 30px; font-weight: bold; color: ${scriptConfig.titleColor}; font-family: 'SimSun', 'STSong', serif; letter-spacing: 5px; line-height: 1.2;">${scriptTitle}</div>`}
                            ${authorText ? `<div style="font-size: 10px; color: #6b7280; margin-top: 2px; letter-spacing: 1px;">${authorText}</div>` : ''}
                        </div>
                        ${showQrCode ? `
                        <div style="display: flex; align-items: center; justify-content: center;">
                            <img src="${qrcodeImageSrc}" style="max-width: 120px; max-height: 120px; height: auto; border: 1px solid #e0e0e0; border-radius: 4px;" onerror="this.style.display='none'" alt="二维码">
                        </div>
                        ` : ''}
                        <div style="display: flex; align-items: flex-start; gap: 8px;">
                            ${scriptConfig.showPlayerConfig ? `
                            <div style="width: 310px;">
                                <img src="images/playercount.png" style="width: 100%; height: auto;" onerror="this.style.display='none'">
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <div style="flex: 1; padding: 0 22px 8px 22px; position: relative; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; overflow-y: auto;">
                    ${buildTeamSection('townsfolk', allJinxes)}
                    ${buildTeamSection('outsider', allJinxes)}
                    ${buildTeamSection('minion', allJinxes)}
                    ${buildTeamSection('demon', allJinxes)}
                    ${(() => {
                        const activeCustomTeams = typeof getCustomTeams === 'function' ? getCustomTeams() : [];
                        let html = '';
                        activeCustomTeams.forEach(team => {
                            html += buildTeamSection(team.id, allJinxes, { name: team.name, color: team.color, roleIds: team.roleIds });
                        });
                        return html;
                    })()}
                </div>

                ${(() => {
                    let statesData = [];
                    
                    const basicStates = [];
                    
                    const drunkPoisonedChecked = document.querySelector('input[name="state-type"][value="drunk_poisoned"]')?.checked;
                    const madnessChecked = document.querySelector('input[name="state-type"][value="madness"]')?.checked;
                    
                    if (drunkPoisonedChecked) {
                        basicStates.push({ name: '醉酒与中毒', description: '醉酒或中毒的玩家会失去能力，但会认为自己仍具有能力，说书人会做出这些玩家仍然具有能力的行为。如果醉酒或中毒玩家的角色能力会给他提供信息，说书人可能会给出错误信息。醉酒或中毒的玩家不会得知自己醉酒或中毒。' });
                    }
                    if (madnessChecked) {
                        basicStates.push({ name: '疯狂', description: '当一名玩家需要"疯狂"疯狂地证明某件事情时，意味着他应该去努力说服其他玩家那件事情是真的。' });
                    }
                    
                    statesData = [...basicStates];
                    
                    const jsonEditor = document.getElementById('json-editor-textarea');
                    if (jsonEditor && jsonEditor.value) {
                        try {
                            const jsonData = JSON.parse(jsonEditor.value);
                            const meta = Array.isArray(jsonData) ? jsonData.find(item => item.id === '_meta') : jsonData._meta;
                            if (meta && meta.states) {
                                const jsonStates = Array.isArray(meta.states) ? meta.states : [];
                                jsonStates.forEach(state => {
                                    const stateName = state.name || state.stateName || '';
                                    const stateDesc = state.description || state.stateDescription || state.stateDesc || '';
                                    if (stateName && stateDesc) {
                                        const exists = statesData.some(s => s.name === stateName);
                                        if (!exists) {
                                            statesData.push({ name: stateName, description: stateDesc });
                                        }
                                    }
                                });
                            }
                        } catch(e) {}
                    }
                    
                    const stateInputGroups = document.querySelectorAll('#state-container .state-input-group');
                    stateInputGroups.forEach(group => {
                        const stateName = group.querySelector('input[type="text"]')?.value.trim();
                        const stateDesc = group.querySelector('textarea')?.value.trim();
                        if (stateName && stateDesc) {
                            const exists = statesData.some(s => s.name === stateName);
                            if (!exists) {
                                statesData.push({ name: stateName, description: stateDesc });
                            }
                        }
                    });
                    
                    if (statesData.length === 0 && !bootleggerText) {
                        return '';
                    }
                    
                    let html = '<div style="padding: 12px 22px 16px 22px;">';
                    html += '<div style="display: flex; align-items: center; margin-bottom: 8px;">';
                    html += '<span style="font-weight: bold; color: #c1121f; font-size: 8px; letter-spacing: 1px;">异常状态</span>';
                    html += '<div style="flex: 1; height: 1px; background: #c1121f; margin-left: 8px;"></div>';
                    html += '</div>';
                    html += '<div style="font-size: 7px; line-height: 1.5; color: #4a5568;">';
                    
                    statesData.forEach(state => {
                        let stateColor = '#dd6b20';
                        if (state.name.includes('疯狂')) {
                            stateColor = '#7c3aed';
                        } else if (state.name.includes('醉酒') || state.name.includes('中毒')) {
                            stateColor = '#c1121f';
                        }
                        html += `<div style="margin-bottom: 4px;"><strong style="color: ${stateColor};">${state.name}</strong></div>`;
                        html += `<div style="padding-left: 6px;">${state.description}</div>`;
                    });
                    
                    if (bootleggerText) {
                        html += '<div style="margin-bottom: 4px;"><strong style="color: #d97706;">私货商人</strong></div>';
                        html += '<div style="padding-left: 6px;">' + bootleggerText.replace(/\n/g, '<br>') + '</div>';
                    }
                    
                    html += '</div></div>';
                    return html;
                })()}
            </div>

            <div style="width: 70px; display: flex; flex-direction: column; align-items: center; padding-top: 110px; padding-bottom: 100px; position: relative;">
                <div style="position: absolute; top: 12px; display: flex; flex-direction: column; gap: 3px;">
                    ${(() => {
                        const travellerRoles = selectedRoles.filter(r => r.team === 'traveller');
                        const fabledRoles = selectedRoles.filter(r => r.team === 'fabled');
                        let html = '';
                        
                        travellerRoles.forEach(role => {
                            const imgSrc = role.image || '';
                            if (imgSrc) {
                                html += `<img src="${imgSrc}" style="width: 32px; height: 32px; border-radius: 3px; object-fit: cover;" title="${role.name}" onerror="this.style.display='none'">`;
                            }
                        });
                        
                        fabledRoles.forEach(role => {
                            const imgSrc = role.image || '';
                            if (imgSrc) {
                                html += `<img src="${imgSrc}" style="width: 32px; height: 32px; border-radius: 3px; object-fit: cover;" title="${role.name}" onerror="this.style.display='none'">`;
                            }
                        });
                        
                        return html;
                    })()}
                </div>
                
                ${scriptConfig.showNightOrder ? `
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                    ${otherNightIcons}
                </div>
                <div style="position: absolute; left: 4px; top: 50%; transform: translateY(-50%) translateX(-50%); writing-mode: vertical-rl; text-orientation: mixed; font-size: 9px; font-weight: bold; color: #3d4852; letter-spacing: 4px; background: ${scriptConfig.bgColor}; padding: 2px 4px; z-index: 10;">OTHER NIGHTS</div>
                ` : ''}
            </div>

            <div style="position: absolute; bottom: 12px; right: 12px; font-size: 9px; color: #6b7280;">*代表非首个夜晚</div>

        </div>
    `;

    const images = container.querySelectorAll('img');
    let loadedCount = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
        captureAndDownload();
        return;
    }

    images.forEach(img => {
        if (img.complete) {
            loadedCount++;
            if (loadedCount === totalImages) captureAndDownload();
        } else {
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) captureAndDownload();
            };
            img.onerror = () => {
                img.style.display = 'none';
                loadedCount++;
                if (loadedCount === totalImages) captureAndDownload();
            };
        }
    });

    function captureAndDownload() {
        const innerEl = container.firstElementChild;
        const origMinH = innerEl.style.minHeight;
        const origOverflow = innerEl.style.overflow;
        innerEl.style.minHeight = 'auto';
        innerEl.style.overflow = 'visible';

        html2canvas(innerEl, {
            backgroundColor: scriptConfig.bgColor,
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false
        }).then(fullCanvas => {
            innerEl.style.minHeight = origMinH;
            innerEl.style.overflow = origOverflow;

            const A4_W = 794 * 2;
            const A4_H = 1123 * 2;
            const a4Canvas = document.createElement('canvas');
            a4Canvas.width = A4_W;
            a4Canvas.height = A4_H;
            const ctx = a4Canvas.getContext('2d');

            ctx.fillStyle = scriptConfig.bgColor;
            ctx.fillRect(0, 0, A4_W, A4_H);

            const scale = Math.min(1, A4_W / fullCanvas.width, A4_H / fullCanvas.height);
            const drawW = Math.round(fullCanvas.width * scale);
            const drawH = Math.round(fullCanvas.height * scale);
            const offsetX = Math.round((A4_W - drawW) / 2);
            const offsetY = Math.round((A4_H - drawH) / 2);

            ctx.drawImage(fullCanvas, offsetX, offsetY, drawW, drawH);

            const dataUrl = a4Canvas.toDataURL('image/png');
            showScriptPreview(dataUrl);
        }).catch(err => {
            console.error('生成剧本图失败:', err);
            alert('生成失败，请重试。');
        });
    }
}

function generateScheme2Image() {
    const selectedRoles = getSelectedRoles();
    
    // 根据角色数量计算缩放比例（与方案一相同的策略）
    // <= 8个角色: 150% (大幅放大)
    // 9-12个角色: 135% (较大放大)
    // 13-16个角色: 120% (中等放大)
    // 17-22个角色: 110% (轻微放大)
    // 23-28个角色: 100% (基准)
    // 29-34个角色: 90%
    // > 34个角色: 80%
    const totalRoleCount = selectedRoles.length;
    let roleScale = 1.00;
    if (totalRoleCount <= 8) roleScale = 1.50;
    else if (totalRoleCount <= 12) roleScale = 1.35;
    else if (totalRoleCount <= 16) roleScale = 1.20;
    else if (totalRoleCount <= 22) roleScale = 1.10;
    else if (totalRoleCount <= 28) roleScale = 1.00;
    else if (totalRoleCount <= 34) roleScale = 0.90;
    else roleScale = 0.80;
    
    // 基准尺寸
    const baseImgSize = 42;
    const baseNameSize = 12.5;
    const baseAbilitySize = 10;
    const baseCardGap = 10;
    const baseColumnGap = 10;
    const baseTeamLabelWidth = 35;
    const baseNightIconSize = 30;
    const baseNightLabelSize = 11;
    
    // 计算实际尺寸
    const imgSize = Math.round(baseImgSize * roleScale);
    const nameSize = Math.round(baseNameSize * roleScale * 10) / 10;
    const abilitySize = Math.round(baseAbilitySize * roleScale * 10) / 10;
    const cardGap = Math.round(baseCardGap * roleScale);
    const columnGap = Math.round(baseColumnGap * roleScale);
    const teamLabelWidth = Math.round(baseTeamLabelWidth * roleScale);
    const nightIconSize = Math.round(baseNightIconSize * roleScale);
    const nightLabelSize = Math.round(baseNightLabelSize * roleScale * 10) / 10;
    
    // 使用统一的配置获取函数
    const config = getScriptConfig();
    
    // 团队配置 - 从配置读取
    const teamConfig = {
        'townsfolk': { 
            label: config.townsfolkName, 
            barColor: config.townsfolkColor, 
            nameColor: config.townsfolkColor 
        },
        'outsider': { 
            label: config.outsiderName, 
            barColor: config.outsiderColor, 
            nameColor: config.outsiderColor 
        },
        'minion': { 
            label: config.minionName, 
            barColor: config.minionColor, 
            nameColor: config.minionColor 
        },
        'demon': { 
            label: config.demonName, 
            barColor: config.demonColor, 
            nameColor: config.demonColor 
        }
    };
    
    // 获取标题 - 优先从metaInfoJson获取，与buildParchmentMainSection保持一致
    let scriptTitle = (typeof metaInfoJson !== 'undefined' && metaInfoJson && metaInfoJson.name && metaInfoJson.name.trim()) ? metaInfoJson.name.trim() : '';
    if (!scriptTitle && window.currentScriptName) scriptTitle = window.currentScriptName;
    if (!scriptTitle) scriptTitle = '未知剧本';
    
    // 获取用户配置的背景颜色
    const bgColor = config.bgColor;
    
    // 使用已获取的配置
    const scriptConfig = config;
    
    // 获取二维码图片
    const qrcodeImageSrc = scriptConfig.qrcodeImage || '';
    const showQrCode = qrcodeImageSrc && (qrcodeImageSrc.startsWith('data:image') || qrcodeImageSrc.startsWith('http') || qrcodeImageSrc.startsWith('images/'));
    
    // 获取状态信息 - 同时从JSON编辑器和UI表单获取
    let statesData = [];
    
    // 根据复选框状态添加基础状态
    const basicStates = [];
    
    const drunkPoisonedChecked = document.querySelector('input[name="state-type"][value="drunk_poisoned"]')?.checked;
    const madnessChecked = document.querySelector('input[name="state-type"][value="madness"]')?.checked;
    
    if (drunkPoisonedChecked) {
        basicStates.push({ name: '醉酒与中毒', description: '醉酒或中毒的玩家会失去能力，但会认为自己仍具有能力，说书人会做出这些玩家仍然具有能力的行为。如果醉酒或中毒玩家的角色能力会给他提供信息，说书人可能会给出错误信息。醉酒或中毒的玩家不会得知自己醉酒或中毒。' });
    }
    if (madnessChecked) {
        basicStates.push({ name: '疯狂', description: '当一名玩家需要"疯狂"疯狂地证明某件事情时，意味着他应该去努力说服其他玩家那件事情是真的。' });
    }
    
    // 先添加基础状态
    statesData = [...basicStates];
    
    // 从JSON编辑器获取自定义状态
    const jsonEditor = document.getElementById('json-editor-textarea');
    if (jsonEditor && jsonEditor.value) {
        try {
            const jsonData = JSON.parse(jsonEditor.value);
            const meta = Array.isArray(jsonData) ? jsonData.find(item => item.id === '_meta') : jsonData._meta;
            if (meta && meta.states) {
                const jsonStates = Array.isArray(meta.states) ? meta.states : [];
                jsonStates.forEach(state => {
                    const stateName = state.name || state.stateName || '';
                    const stateDesc = state.description || state.stateDescription || state.stateDesc || '';
                    if (stateName && stateDesc) {
                        const exists = statesData.some(s => s.name === stateName);
                        if (!exists) {
                            statesData.push({ name: stateName, description: stateDesc });
                        }
                    }
                });
            }
        } catch(e) {}
    }
    
    // 从UI表单获取自定义状态（兼容用户未保存到JSON的情况）
    const stateInputGroups = document.querySelectorAll('#state-container .state-input-group');
    stateInputGroups.forEach(group => {
        const stateName = group.querySelector('input[type="text"]')?.value.trim();
        const stateDesc = group.querySelector('textarea')?.value.trim();
        if (stateName && stateDesc) {
            const exists = statesData.some(s => s.name === stateName);
            if (!exists) {
                statesData.push({ name: stateName, description: stateDesc });
            }
        }
    });
    
    // 获取夜间顺序
    const getNightOrderFromPanel = (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return [];
        const buttons = container.querySelectorAll('.draggable-button');
        const roleIds = Array.from(buttons).map(btn => btn.getAttribute('data-role-id')).filter(id => id);
        return roleIds.map(roleId => {
            if (roleId === 'twilight') return { name: '黄昏', image: 'images/dusk-CLd-DXn-QC.png' };
            if (roleId === 'minioninfo') return { name: '爪牙信息', image: 'images/180px-Mi.png' };
            if (roleId === 'demoninfo') return { name: '恶魔信息', image: 'images/180px-Di.png' };
            if (roleId === 'dawn') return { name: '黎明', image: 'images/dawn.png' };
            return selectedRoles.find(r => r.id === roleId) || null;
        }).filter(r => r);
    };
    
    let firstNightRoles = getNightOrderFromPanel('first-night-buttons-container');
    let otherNightRoles = getNightOrderFromPanel('other-night-buttons-container');
    
    if (firstNightRoles.length === 0) {
        firstNightRoles = selectedRoles.filter(r => r.firstNight > 0).sort((a, b) => a.firstNight - b.firstNight);
    }
    if (otherNightRoles.length === 0) {
        otherNightRoles = selectedRoles.filter(r => r.otherNight > 0).sort((a, b) => a.otherNight - b.otherNight);
    }
    
    // 构建夜间顺序图标（合并首夜和他夜，左侧首夜数字，右侧他夜数字）
    function buildNightIconsCombined() {
        // 获取所有夜间行动的角色，合并首夜和他夜
        const allNightRoles = [];
        
        // 创建角色到他夜顺序的映射
        const otherNightOrder = {};
        
        firstNightRoles.forEach((role) => {
            if (role.id || role.name) {
                const key = role.id || role.name;
                if (!allNightRoles.find(r => (r.id || r.name) === key)) {
                    allNightRoles.push(role);
                }
            }
        });
        
        otherNightRoles.forEach((role, index) => {
            if (role.id || role.name) {
                const key = role.id || role.name;
                otherNightOrder[key] = index + 1;
                if (!allNightRoles.find(r => (r.id || r.name) === key)) {
                    allNightRoles.push(role);
                }
            }
        });
        
        if (allNightRoles.length === 0) return '';
        
        const numberSize = Math.round(10 * roleScale);
        const labelSize = Math.round(10 * roleScale);
        
        // 两列布局：左侧图标列（包含注释），右侧他夜列
        let html = `<div style="display:flex;gap:2px;">`;
        
        // 左侧图标列
        html += `<div style="display:flex;flex-direction:column;align-items:center;">`;
        html += `<div style="display:flex;flex-direction:column;align-items:center;font-size:${labelSize}px;font-weight:bold;color:#4a5568;margin-bottom:${Math.round(8 * roleScale)}px;"><div>首</div><div>夜</div></div>`;
        allNightRoles.forEach(role => {
            const imgSrc = role.image || '';
            if (imgSrc) {
                html += `<div style="height:${nightIconSize}px;display:flex;align-items:center;justify-content:center;">`;
                html += `<img src="${imgSrc}" style="width:${nightIconSize}px;height:${nightIconSize}px;border-radius:3px;object-fit:cover;" title="${role.name}" onerror="this.style.display='none'">`;
                html += `</div>`;
            }
        });
        // *代表非首个夜晚注释（垂直排列）
        html += `<div style="display:flex;flex-direction:column;align-items:center;margin-top:${Math.round(4 * roleScale)}px;">`;
        html += `<span style="font-size:${labelSize}px;font-weight:bold;color:#000000;">*</span>`;
        html += `<span style="font-size:${labelSize}px;color:#000000;">代</span>`;
        html += `<span style="font-size:${labelSize}px;color:#000000;">表</span>`;
        html += `<span style="font-size:${labelSize}px;color:#000000;">非</span>`;
        html += `<span style="font-size:${labelSize}px;color:#000000;">首</span>`;
        html += `<span style="font-size:${labelSize}px;color:#000000;">个</span>`;
        html += `<span style="font-size:${labelSize}px;color:#000000;">夜</span>`;
        html += `<span style="font-size:${labelSize}px;color:#000000;">晚</span>`;
        html += `</div>`;
        html += `</div>`;
        
        // 右侧他夜列
        html += `<div style="display:flex;flex-direction:column;align-items:center;">`;
        html += `<div style="font-size:${labelSize}px;font-weight:bold;color:#c53030;margin-bottom:${Math.round(8 * roleScale)}px;writing-mode:vertical-rl;text-orientation:mixed;">他夜</div>`;
        allNightRoles.forEach(role => {
            const key = role.id || role.name;
            const otherOrder = otherNightOrder[key];
            html += `<div style="font-size:${numberSize}px;font-weight:bold;color:#c53030;width:${Math.round(22 * roleScale)}px;text-align:center;height:${nightIconSize}px;display:flex;align-items:center;justify-content:center;">${otherOrder || ''}</div>`;
        });
        html += `</div>`;
        
        html += `</div>`;
        return html;
    }
    
    // 关键词高亮
    function highlightAbility(text) {
        if (!text) return '';
        const keywords = [
            { word: '善良角色', color: '#3182ce' },
            { word: '邪恶角色', color: '#e53e3e' },
            { word: '镇民角色', color: '#3182ce' },
            { word: '外来者角色', color: '#38a169' },
            { word: '爪牙角色', color: '#dd6b20' },
            { word: '恶魔角色', color: '#e53e3e' },
            { word: '镇民', color: '#3182ce' },
            { word: '外来者', color: '#38a169' },
            { word: '爪牙', color: '#dd6b20' },
            { word: '恶魔', color: '#e53e3e' },
            { word: '存活', color: '#e53e3e' },
            { word: '死亡', color: '#e53e3e' },
            { word: '中毒', color: '#e53e3e' },
            { word: '醉酒', color: '#e53e3e' },
            { word: '处决', color: '#e53e3e' },
            { word: '提名', color: '#e53e3e' },
            { word: '邪恶', color: '#e53e3e' },
            { word: '善良', color: '#3182ce' },
        ];
        keywords.sort((a, b) => b.word.length - a.word.length);
        let result = text;
        keywords.forEach(kw => {
            const escaped = kw.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escaped, 'g');
            result = result.replace(regex, '<span style="color:' + kw.color + ';font-weight:bold;">' + kw.word + '</span>');
        });
        return result;
    }
    
    // 状态描述关键词高亮（学习方案一）
    function highlightStateDescription(text) {
        if (!text) return '';
        const keywords = [
            { word: '努力说服', color: '#2563eb' },
            { word: '可能正确可能错误', color: '#2563eb' },
            { word: '错误信息', color: '#2563eb' },
            { word: '失去能力', color: '#e53e3e' },
            { word: '不会得知', color: '#e53e3e' },
        ];
        keywords.sort((a, b) => b.word.length - a.word.length);
        let result = text;
        keywords.forEach(kw => {
            const escaped = kw.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escaped, 'g');
            result = result.replace(regex, '<span style="color:' + kw.color + ';font-weight:bold;">' + kw.word + '</span>');
        });
        return result;
    }

    // 构建角色卡片
    function buildParchmentRoleCard(role, teamColor) {
        const imgSrc = role.image || '';
        return `
            <div style="display:flex;align-items:flex-start;gap:${Math.round(6 * roleScale)}px;margin-bottom:${cardGap}px;">
                ${imgSrc ? `<img src="${imgSrc}" style="width:${imgSize}px;height:${imgSize}px;border-radius:3px;object-fit:cover;flex-shrink:0;" onerror="this.style.display='none'">` : ''}
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:bold;font-size:${nameSize}px;color:${teamColor};font-family:SimHei,Heiti SC,sans-serif;line-height:1.3;">${role.name}</div>
                    <div style="font-size:${abilitySize}px;color:#4a5568;line-height:1.5;margin-top:1px;">${highlightAbility(role.ability || '')}</div>
                </div>
            </div>
        `;
    }
    
    // 获取相克规则（根据配置决定是否获取）
    const allJinxes = scriptConfig.showJinxRules !== false ? getDeduplicatedJinxes(selectedRoles.map(r => r.name)) : [];

    // 构建阵营区块
    function buildTeamSection(teamId, customConfig = null) {
        // 获取所有被自定义阵营占用的角色ID
        const occupiedRoleIds = typeof getCustomTeams === 'function' ? 
            getCustomTeams().flatMap(t => t.roleIds || []) : [];
        
        let roles;
        if (customConfig && customConfig.roleIds) {
            // 自定义阵营：根据roleIds筛选角色
            roles = selectedRoles.filter(r => customConfig.roleIds.includes(r.id));
        } else {
            // 标准阵营：根据team属性筛选，并排除已被自定义阵营占用的角色
            roles = selectedRoles.filter(r => r.team === teamId && !occupiedRoleIds.includes(r.id));
        }
        if (!roles || roles.length === 0) return '';
        
        const config = customConfig || teamConfig[teamId];
        const halfLength = Math.ceil(roles.length / 2);
        const leftRoles = roles.slice(0, halfLength);
        const rightRoles = roles.slice(halfLength);
        
        const borderTop = customConfig ? '' : (teamId !== 'townsfolk' ? `border-top:2px solid ${config.barColor};` : '');
        
        let html = `<div style="display:flex;${borderTop}">`;
        
        // 左侧彩色条
        html += `<div style="width:${teamLabelWidth}px;background:${config.barColor};display:flex;align-items:center;justify-content:center;flex-shrink:0;">`;
        html += `<span style="writing-mode:vertical-rl;text-orientation:upright;font-size:${Math.round(11 * roleScale)}px;font-weight:bold;color:white;font-family:SimHei,Heiti SC,sans-serif;letter-spacing:1px;">${config.label}</span>`;
        html += `</div>`;
        
        // 右侧内容区域
        html += `<div style="flex:1;display:flex;flex-direction:column;">`;
        
        // 角色区域（两列）
        html += `<div style="display:flex;gap:${columnGap}px;padding:${Math.round(4 * roleScale)}px ${Math.round(8 * roleScale)}px;">`;
        html += `<div style="flex:1;display:flex;flex-direction:column;">`;
        leftRoles.forEach(role => { html += buildParchmentRoleCard(role, config.nameColor); });
        html += `</div>`;
        html += `<div style="flex:1;display:flex;flex-direction:column;">`;
        rightRoles.forEach(role => { html += buildParchmentRoleCard(role, config.nameColor); });
        html += `</div>`;
        html += `</div>`;
        
        // 恶魔区域特殊：包含相克规则和状态
        if (teamId === 'demon') {
            // 相克规则
            if (scriptConfig.showJinxRules !== false && allJinxes && allJinxes.length > 0) {
                html += `<div style="padding:${Math.round(6 * roleScale)}px ${Math.round(8 * roleScale)}px;border-top:2px solid #e2e8f0;">`;
                html += `<div style="font-size:${abilitySize}px;color:#4a5568;line-height:1.6;">`;
                allJinxes.forEach(jinx => {
                    const role1 = selectedRoles.find(r => r.name === jinx.jinxRole1);
                    const role2 = selectedRoles.find(r => r.name === jinx.jinxRole2);
                    html += `<div style="display:flex;align-items:center;gap:3px;margin-bottom:3px;">`;
                    if (role1 && role1.image) html += `<img src="${role1.image}" style="width:14px;height:14px;border-radius:2px;" onerror="this.style.display='none'">`;
                    html += `<span style="font-weight:bold;color:#e53e3e;">${jinx.jinxRole1}</span>`;
                    html += `<span style="color:#a0aec0;">×</span>`;
                    if (role2 && role2.image) html += `<img src="${role2.image}" style="width:14px;height:14px;border-radius:2px;" onerror="this.style.display='none'">`;
                    html += `<span style="font-weight:bold;color:#e53e3e;">${jinx.jinxRole2}</span>`;
                    html += `<span style="margin-left:3px;">${jinx.jinxRule}</span>`;
                    html += `</div>`;
                });
                html += `</div>`;
                html += `</div>`;
            }
            
            // 状态信息
            if (statesData && statesData.length > 0) {
                html += `<div style="padding:${Math.round(6 * roleScale)}px ${Math.round(8 * roleScale)}px;border-top:2px solid #e2e8f0;">`;
                html += `<div style="font-size:${abilitySize}px;color:#4a5568;line-height:1.6;">`;
                statesData.forEach(state => {
                    const stateName = state.name || state.stateName || '';
                    let stateDesc = state.description || state.stateDescription || state.stateDesc || '';
                    if (stateName && stateDesc) {
                        html += `<div style="margin-bottom:4px;">`;
                        
                        // 根据状态名称设置颜色（学习方案一）
                        let stateColor = '#dd6b20'; // 默认橙色
                        if (stateName.includes('疯狂')) {
                            stateColor = '#7c3aed'; // 紫色
                        } else if (stateName.includes('醉酒') || stateName.includes('中毒')) {
                            stateColor = '#c1121f'; // 红色
                        }
                        
                        html += `<span style="font-weight:bold;color:${stateColor};">${stateName}</span>`;
                        
                        // 对状态描述进行关键词高亮
                        stateDesc = highlightStateDescription(stateDesc);
                        
                        html += `<span style="margin-left:4px;">${stateDesc}</span>`;
                        html += `</div>`;
                    }
                });
                html += `</div>`;
                html += `</div>`;
            }
        }
        
        html += `</div>`;
        html += `</div>`;
        return html;
    }

    // 构建主体区域
    function buildParchmentMainSection() {
        let html = `<div style="flex:1;display:flex;flex-direction:column;">`;
        
        const travellerRoles = selectedRoles.filter(r => r.team === 'traveller');
        const fabledRoles = selectedRoles.filter(r => r.team === 'fabled');
        
        // 顶部区域：标题 + 配置表 + 旅行者/传奇角色
        html += `<div style="display:flex;align-items:flex-start;">`;
        
        // 左侧：标题区域（镇民条 + 标题 + 二维码 + 配置表）
        html += `<div style="flex:1;display:flex;">`;
        html += `<div style="width:${teamLabelWidth}px;background:${config.townsfolkColor};display:flex;align-items:center;justify-content:center;flex-shrink:0;">`;
        html += `</div>`;
        html += `<div style="flex:1;display:flex;align-items:flex-start;padding:${Math.round(10 * roleScale)}px ${Math.round(8 * roleScale)}px;">`;
        html += `<div style="flex:1;">`;
        html += `${scriptConfig.titleImage ? `<img src="${scriptConfig.titleImage}" style="max-width:300px;max-height:60px;height:auto;" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'font-size:${Math.round(24 * roleScale)}px;font-weight:bold;color:#2d3748;font-family:SimHei,Heiti SC,sans-serif;\\'>${scriptTitle}</div>';" alt="${scriptTitle}">` : `<div style="font-size:${Math.round(24 * roleScale)}px;font-weight:bold;color:#2d3748;font-family:SimHei,Heiti SC,sans-serif;">${scriptTitle}</div>`}`;
        html += `</div>`;
        if (showQrCode) {
            html += `<div style="display:flex;align-items:center;justify-content:center;">`;
            html += `<img src="${qrcodeImageSrc}" style="max-width:${Math.round(120 * roleScale)}px;max-height:${Math.round(120 * roleScale)}px;height:auto;border:1px solid #e0e0e0;border-radius:4px;" onerror="this.style.display='none'" alt="二维码">`;
            html += `</div>`;
        }
        if (scriptConfig.showPlayerConfig !== false) {
            html += `<div style="width:${Math.round(220 * roleScale)}px;flex-shrink:0;">`;
            html += `<img src="images/playercount.png" style="width:100%;height:auto;" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'font-size:10px;color:#999;\\'>配置表加载失败</div>';">`;
            html += `</div>`;
        }
        html += `</div>`;
        html += `</div>`;
        
        // 右侧：旅行者和传奇角色图片（竖着排列，在顺序正上方）
        const showTraveller = scriptConfig.showTraveller !== false;
        const showFabled = scriptConfig.showFabled !== false;
        const hasTravelOrFabled = (showTraveller && travellerRoles.length > 0) || (showFabled && fabledRoles.length > 0);
        
        if (hasTravelOrFabled) {
            html += `<div style="width:${Math.round(80 * roleScale)}px;flex-shrink:0;">`;
            html += `<div style="display:flex;flex-direction:column;align-items:center;">`;
            
            if (showTraveller) {
                travellerRoles.forEach(role => {
                    if (role.image) {
                        html += `<img src="${role.image}" style="width:${nightIconSize}px;height:${nightIconSize}px;border-radius:3px;object-fit:cover;margin-bottom:2px;" title="${role.name}" onerror="this.style.display='none'">`;
                    }
                });
            }
            
            if (showFabled) {
                fabledRoles.forEach(role => {
                    if (role.image) {
                        html += `<img src="${role.image}" style="width:${nightIconSize}px;height:${nightIconSize}px;border-radius:3px;object-fit:cover;margin-bottom:2px;" title="${role.name}" onerror="this.style.display='none'">`;
                    }
                });
            }
            
            html += `</div>`;
        }
        html += `</div>`;
        
        html += `</div>`;
        
        // 第二行：角色区域 + 夜间顺序
        html += `<div style="display:flex;gap:${Math.round(6 * roleScale)}px;">`;
        
        // 角色区域（镇民角色 + 其他阵营）
        html += `<div style="flex:1;display:flex;flex-direction:column;">`;
        
        ['townsfolk', 'outsider', 'minion', 'demon'].forEach(teamId => {
            html += buildTeamSection(teamId);
        });
        
        // 添加自定义阵营
        const activeCustomTeams = typeof getCustomTeams === 'function' ? getCustomTeams() : [];
        activeCustomTeams.forEach(team => {
            html += buildTeamSection(team.id, { label: team.name, barColor: team.color, nameColor: team.color, roleIds: team.roleIds });
        });
        
        html += `</div>`;
        
        // 夜间顺序（与图片右侧对齐）
        if (scriptConfig.showNightOrder !== false) {
            html += `<div style="width:${Math.round(80 * roleScale)}px;flex-shrink:0;display:flex;justify-content:flex-end;">`;
            html += buildNightIconsCombined();
            html += `</div>`;
        }
        
        html += `</div>`;
        
        html += `</div>`;
        
        return html;
    }
    
    // 创建容器
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
    document.body.appendChild(container);
    
    container.innerHTML = `
        <div style="width:794px;background:${bgColor};font-family:SimSun,STSong,serif;color:#2d3748;position:relative;display:flex;flex-direction:column;">
            <!-- 内容区域 -->
            <div style="flex:1;display:flex;flex-direction:column;padding:0 12px 12px 0;">
                <!-- 主体区域 -->
                ${buildParchmentMainSection()}
            </div>
        </div>
    `;
    
    // 等待图片加载后截图
    const images = container.querySelectorAll('img');
    let loadedCount = 0;
    const totalImages = images.length;
    
    function captureAndDownload() {
        const innerEl = container.firstElementChild;
        html2canvas(innerEl, {
            backgroundColor: bgColor,
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false
        }).then(fullCanvas => {
            const A4_W = 794 * 2;
            const A4_H = 1123 * 2;
            const a4Canvas = document.createElement('canvas');
            a4Canvas.width = A4_W;
            a4Canvas.height = A4_H;
            const ctx = a4Canvas.getContext('2d');
            
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, A4_W, A4_H);
            
            const scale = Math.min(1, A4_W / fullCanvas.width, A4_H / fullCanvas.height);
            const drawW = Math.round(fullCanvas.width * scale);
            const drawH = Math.round(fullCanvas.height * scale);
            const offsetX = Math.round((A4_W - drawW) / 2);
            const offsetY = 0;
            
            ctx.drawImage(fullCanvas, offsetX, offsetY, drawW, drawH);
            
            const dataUrl = a4Canvas.toDataURL('image/png');
            showScriptPreview(dataUrl);
            container.remove();
        }).catch(err => {
            console.error('生成方案二剧本图失败:', err);
            alert('生成失败，请重试。');
            container.remove();
        });
    }
    
    if (totalImages === 0) {
        captureAndDownload();
        return;
    }
    
    images.forEach(img => {
        if (img.complete) {
            loadedCount++;
            if (loadedCount === totalImages) captureAndDownload();
        } else {
            img.onload = () => { loadedCount++; if (loadedCount === totalImages) captureAndDownload(); };
            img.onerror = () => { img.style.display = 'none'; loadedCount++; if (loadedCount === totalImages) captureAndDownload(); };
        }
    });
}

        // ========== 方案三生成函数（完全照搬方案一） ==========
        function generateScheme3Image() {
            const selectedRoles = getSelectedRoles();
            if (selectedRoles.length === 0) {
                alert('请先选择角色！');
                return;
            }

            // 使用统一的配置获取函数
            const config = getScriptConfig();

            // 团队中文映射（方案三专用：带阵营前缀）
            const teamNames = { 
                'townsfolk': '善良阵营·镇民', 
                'outsider': '善良阵营·外来者', 
                'minion': '邪恶阵营·爪牙', 
                'demon': '邪恶阵营·恶魔', 
                'traveller': '旅行者', 
                'fabled': '传奇角色' 
            };
            
            // 阵营颜色映射（从配置读取）
            const teamColors = {
                'townsfolk': config.townsfolkColor,
                'outsider': config.outsiderColor,
                'minion': config.minionColor,
                'demon': config.demonColor,
                'traveller': '#7c3aed',
                'fabled': '#d4a017'
            };

            // 获取自制规则（方案三专用）
            const bootleggerInput = document.getElementById('bootlegger');
            const bootleggerText = bootleggerInput ? bootleggerInput.value.trim() : '';

            // 从夜序面板获取夜间顺序（优先使用用户自定义的顺序）
            // 特殊角色定义
            const twilightRole = { id: 'twilight', name: '黄昏', firstNight: 0, otherNight: 0, image: 'images/dusk-CLd-DXn-QC.png' };
            const minionInfoRole = { id: 'minioninfo', name: '爪牙信息', firstNight: 2000, otherNight: 0, image: 'images/180px-Mi.png' };
            const demonInfoRole = { id: 'demoninfo', name: '恶魔信息', firstNight: 3000, otherNight: 0, image: 'images/180px-Di.png' };
            const dawnRole = { id: 'dawn', name: '黎明', firstNight: 9999, otherNight: 9999, image: 'images/dawn.png' };
            
            const getNightOrderFromPanel = (containerId) => {
                const container = document.getElementById(containerId);
                if (!container) return [];
                
                const buttons = container.querySelectorAll('.draggable-button');
                const roleIds = Array.from(buttons)
                    .map(btn => btn.getAttribute('data-role-id'))
                    .filter(id => id && id.trim() !== '');
                
                // 根据角色ID获取角色信息（包括特殊角色）
                return roleIds.map(roleId => {
                    // 检查是否是特殊角色
                    if (roleId === 'twilight') return twilightRole;
                    if (roleId === 'minioninfo') return minionInfoRole;
                    if (roleId === 'demoninfo') return demonInfoRole;
                    if (roleId === 'dawn') return dawnRole;
                    
                    const role = selectedRoles.find(r => r.id === roleId);
                    if (role) return role;
                    // 如果在selectedRoles中找不到，可能是自制角色
                    const dirRole = window.dirRolesJson.find(r => r.id === roleId);
                    return dirRole || null;
                }).filter(r => r !== null);
            };
            
            // 获取夜间顺序角色（优先使用面板设置）
            let firstNightRoles = getNightOrderFromPanel('first-night-buttons-container');
            let otherNightRoles = getNightOrderFromPanel('other-night-buttons-container');
            
            // 如果面板中没有设置，则使用默认顺序
            if (firstNightRoles.length === 0) {
                firstNightRoles = selectedRoles
                    .filter(r => r.firstNight > 0)
                    .sort((a, b) => a.firstNight - b.firstNight);
                // 添加特殊角色
                firstNightRoles = [twilightRole, ...firstNightRoles, minionInfoRole, demonInfoRole, dawnRole];
            }
            if (otherNightRoles.length === 0) {
                otherNightRoles = selectedRoles
                    .filter(r => r.otherNight > 0)
                    .sort((a, b) => a.otherNight - b.otherNight);
                // 添加特殊角色
                otherNightRoles = [twilightRole, ...otherNightRoles, dawnRole];
            }

            // 构建夜间行动顺序图标列（方案三专用：垂直间距为0）
            function buildNightOrderIcons(roles, containerHeight = 500, fixedSize = 48) {
                if (!roles || roles.length === 0) return '';
                
                const iconCount = roles.length;
                const spacing = 0; // 图标之间的间距
                const size = fixedSize.toFixed(1);
                
                let html = '';
                roles.forEach((role, index) => {
                    const imgSrc = role.image || '';
                    html += `<div style="text-align:center;margin-bottom:${index < iconCount - 1 ? spacing + 'px' : '0'};">`;
                    if (imgSrc) {
                        html += `<img src="${imgSrc}" style="width:${size}px;height:${size}px;border-radius:4px;object-fit:cover;display:block;margin:0 auto;" title="${role.name}" onerror="this.style.display='none'">`;
                    } else {
                        html += `<div style="width:${size}px;height:${size}px;border-radius:4px;background:#e2e8f0;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:${Math.max(6, size * 0.15)}px;color:#a0aec0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${role.name}</div>`;
                    }
                    html += `</div>`;
                });
                return html;
            }

            // 计算夜间顺序区域的可用高度（总高度 - 顶部padding - 底部padding）
            const totalHeight = 1123;
            const topPadding = 110;
            const bottomPadding = 100;
            const availableHeight = totalHeight - topPadding - bottomPadding;
            
            // 计算图标大小，两侧使用相同的尺寸（取两侧角色数量的较大值）
            const maxRoleCount = Math.max(firstNightRoles.length, otherNightRoles.length);
            const iconSize = calculateNightIconSize(maxRoleCount, availableHeight);
            
            const firstNightIcons = buildNightOrderIcons(firstNightRoles, availableHeight, iconSize);
            const otherNightIcons = buildNightOrderIcons(otherNightRoles, availableHeight, iconSize);
            
            // 计算图标大小的辅助函数（方案三专用：间距为0）
            function calculateNightIconSize(roleCount, containerHeight, minSize = 24, maxSize = 48) {
                if (roleCount <= 0) return maxSize;
                const spacing = 0;
                return Math.min(
                    maxSize,
                    Math.max(
                        minSize,
                        (containerHeight - (roleCount - 1) * spacing) / roleCount * 0.9
                    )
                );
            }

            // 根据角色数量计算缩放比例
            // 角色数量与缩放比例映射：
            // <= 8个角色: 150% (大幅放大)
            // 9-12个角色: 135% (较大放大)
            // 13-16个角色: 120% (中等放大)
            // 17-22个角色: 110% (轻微放大)
            // 23-28个角色: 100% (基准)
            // 29-34个角色: 90%
            // > 34个角色: 80%
            function calculateRoleScale(roleCount) {
                if (roleCount <= 8) return 1.50;
                if (roleCount <= 12) return 1.35;
                if (roleCount <= 16) return 1.20;
                if (roleCount <= 22) return 1.10;
                if (roleCount <= 28) return 1.00;
                if (roleCount <= 34) return 0.90;
                return 0.80;
            }
            
            const totalRoleCount = selectedRoles.length;
            const roleScale = calculateRoleScale(totalRoleCount);
            
            // 基准尺寸
            const baseImgSize = 52;
            const baseNameSize = 11;
            const baseAbilitySize = 8.5;
            const baseJinxSize = 7;
            const baseTeamTitleSize = 11;
            const baseGap = 6;
            const baseColumnGap = 10;
            const baseCardGap = 4;
            const baseJinxImgSize = 12;
            
            // 计算实际尺寸
            const imgSize = Math.round(baseImgSize * roleScale);
            const nameSize = Math.round(baseNameSize * roleScale * 10) / 10;
            const abilitySize = Math.round(baseAbilitySize * roleScale * 10) / 10;
            const jinxSize = Math.round(baseJinxSize * roleScale * 10) / 10;
            const teamTitleSize = Math.round(baseTeamTitleSize * roleScale * 10) / 10;
            const gap = Math.round(baseGap * roleScale);
            const columnGap = Math.round(baseColumnGap * roleScale);
            const cardGap = Math.round(baseCardGap * roleScale);
            const jinxImgSize = Math.round(baseJinxImgSize * roleScale);

            // 构建角色卡片 HTML
            function buildRoleCard(role, jinxesForRole, teamColor) {
                const imgSrc = role.image || '';
                // 默认颜色为红色
                const nameColor = teamColor || '#c1121f';
                let html = `<div style="display:flex;align-items:flex-start;gap:${gap}px;margin-bottom:0;width:100%;">`;
                if (imgSrc) {
                    html += `<img src="${imgSrc}" style="width:${imgSize}px;height:${imgSize}px;border-radius:3px;flex-shrink:0;object-fit:cover;" onerror="this.style.display='none'">`;
                }
                html += `<div style="flex:1;min-width:0;">`;
                html += `<div style="font-weight:bold;font-size:${nameSize}px;color:${nameColor};margin-bottom:1px;letter-spacing:0.3px;">${role.name}</div>`;
                html += `<div style="font-size:${abilitySize}px;color:#1a1a1a;line-height:1.5;">${role.ability || ''}</div>`;
                
                // 如果该角色有相克规则，显示在角色下面
                if (jinxesForRole && jinxesForRole.length > 0) {
                    html += `<div style="font-size:${jinxSize}px;color:#1a1a1a;margin-top:2px;line-height:1.4;background-color:rgb(197,184,172);border-radius:4px;padding:3px 4px;">`;
                    jinxesForRole.forEach(jinx => {
                        // 找到角色2的图片
                        const role2 = selectedRoles.find(r => r.name === jinx.jinxRole2);
                        const role2Img = role2 ? role2.image : '';
                        if (role2Img) {
                            html += `<div style="margin-bottom:1px;display:flex;align-items:center;gap:2px;">`;
                            html += `<img src="${role2Img}" style="width:${jinxImgSize}px;height:${jinxImgSize}px;border-radius:2px;object-fit:cover;flex-shrink:0;" onerror="this.style.display='none'">`;
                            html += `<span>${jinx.jinxRule}</span>`;
                            html += `</div>`;
                        } else {
                            html += `<div style="margin-bottom:1px;">${jinx.jinxRule}</div>`;
                        }
                    });
                    html += `</div>`;
                }
                
                html += `</div></div>`;
                return html;
            }

            // 构建阵营角色列表
            function buildTeamSection(team, allJinxes, customTeamInfo = null) {
                // 获取所有被自定义阵营占用的角色ID
                const occupiedRoleIds = typeof getCustomTeams === 'function' ? 
                    getCustomTeams().flatMap(t => t.roleIds || []) : [];
                
                // 使用全局 selectedRoles 的顺序（已选角色已按规则排序或用户自定义排序）
                let roles;
                if (customTeamInfo && customTeamInfo.roleIds) {
                    // 自定义阵营：根据roleIds筛选角色
                    roles = selectedRoles.filter(r => customTeamInfo.roleIds.includes(r.id));
                } else {
                    // 标准阵营：根据team属性筛选，并排除已被自定义阵营占用的角色
                    roles = selectedRoles.filter(r => r.team === team && !occupiedRoleIds.includes(r.id));
                }
                if (!roles || roles.length === 0) return '';
                
                // 根据阵营类型设置颜色（使用用户配置或自定义阵营信息）
                let teamColor, teamDisplayName;
                if (customTeamInfo) {
                    teamColor = customTeamInfo.color;
                    teamDisplayName = customTeamInfo.name;
                } else {
                    teamColor = teamColors[team] || ((team === 'townsfolk' || team === 'outsider') ? scriptConfig.goodColor : scriptConfig.evilColor);
                    teamDisplayName = teamNames[team] || team;
                }
                
                // 获取角色横向排列设置
                const isHorizontal = document.getElementById('roles-horizontal')?.checked || false;
                
                // 使用固定的 margin-bottom 控制阵营间距，移除基于角色数量的 flex 值
                let html = `<div style="margin-bottom: ${Math.round(12 * roleScale)}px; display: flex; flex-direction: column;">`;
                // 阵营标题 + 分隔线
                html += `<div style="display:flex;align-items:center;margin-bottom:${Math.round(4 * roleScale)}px;">`;
                html += `<span style="color:${teamColor};font-size:${teamTitleSize}px;font-weight:bold;flex-shrink:0;letter-spacing:1px;">${teamDisplayName}</span>`;
                html += `<div style="flex:1;height:1px;background:#c0c0c0;margin-left:8px;"></div>`;
                html += `</div>`;
                
                if (isHorizontal) {
                    // 横向排列 - 所有角色在一行
                    html += `<div style="display:flex;gap:${columnGap}px;flex-wrap:wrap;">`;
                    roles.forEach(role => {
                        const jinxesForRole = allJinxes.filter(jinx => jinx.jinxRole1 === role.name);
                        html += `<div style="flex-shrink:0;">`;
                        html += buildRoleCard(role, jinxesForRole, teamColor);
                        html += `</div>`;
                    });
                    html += `</div>`;
                } else {
                    // 角色列表 - 双列竖向排列（先填完第一列再填第二列）
                    const halfLength = Math.ceil(roles.length / 2);
                    const leftColumnRoles = roles.slice(0, halfLength);
                    const rightColumnRoles = roles.slice(halfLength);
                    
                    // 使用flex创建两列，先填充左列再填充右列
                    html += `<div style="display:flex;gap:${columnGap}px;flex:1;">`;
                    // 左列
                    html += `<div style="flex:1;display:flex;flex-direction:column;gap:${cardGap}px;">`;
                    leftColumnRoles.forEach(role => {
                        const jinxesForRole = allJinxes.filter(jinx => jinx.jinxRole1 === role.name);
                        html += buildRoleCard(role, jinxesForRole, teamColor);
                    });
                    html += `</div>`;
                    // 右列
                    html += `<div style="flex:1;display:flex;flex-direction:column;gap:${cardGap}px;">`;
                    rightColumnRoles.forEach(role => {
                        const jinxesForRole = allJinxes.filter(jinx => jinx.jinxRole1 === role.name);
                        html += buildRoleCard(role, jinxesForRole, teamColor);
                    });
                    html += `</div>`;
                    html += `</div>`;
                }
                html += `</div>`;
                return html;
            }

            // 使用已获取的配置
            const scriptConfig = config;
            console.log('titleImage:', scriptConfig.titleImage ? '已设置（长度：' + scriptConfig.titleImage.length + '）' : '未设置');

            // 剧本名
            const scriptTitle = (metaInfoJson && metaInfoJson.name && metaInfoJson.name.trim()) ? metaInfoJson.name.trim() : '未知剧本';
            const authorText = (metaInfoJson && metaInfoJson.author && metaInfoJson.author.trim()) ? metaInfoJson.author.trim() : '';
            
            // 获取二维码图片
            const qrcodeImageSrc = scriptConfig.qrcodeImage || '';
            const showQrCode = qrcodeImageSrc && (qrcodeImageSrc.startsWith('data:image') || qrcodeImageSrc.startsWith('http') || qrcodeImageSrc.startsWith('images/'));

            // 获取去重后的相克规则（根据配置决定是否获取）
            const selectedRoleNames = selectedRoles.map(r => r.name);
            const allJinxes = scriptConfig.showJinxRules ? getDeduplicatedJinxes(selectedRoleNames) : [];

            // 构建完整剧本图 HTML - A4专业排版
            const container = document.getElementById('script-image-render');
            container.innerHTML = `
                <div style="width: 794px; height: 1123px; background: ${scriptConfig.bgColor}; font-family: 'Microsoft YaHei', 'SimSun', 'PingFang SC', sans-serif; color: #1a1a1a; position: relative; display: flex; flex-direction: row; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <!-- 四个角落装饰图片 -->
                    <img src="images/10002.png" style="position: absolute; top: -60px; left: -40px; width: 150px; height: auto; transform: rotate(180deg); z-index: 10; pointer-events: none;" onerror="this.style.display='none'" alt="左上角装饰">
                    <img src="images/10003.png" style="position: absolute; top: 0; right: 0; width: 150px; height: auto; z-index: 10; pointer-events: none;" onerror="this.style.display='none'" alt="右上角装饰">
                    <img src="images/10004.png" style="position: absolute; bottom: 0; left: 0; width: 150px; height: auto; z-index: 10; pointer-events: none;" onerror="this.style.display='none'" alt="左下角装饰">
                    <img src="images/10002.png" style="position: absolute; bottom: 0; right: 0; width: 150px; height: auto; z-index: 10; pointer-events: none;" onerror="this.style.display='none'" alt="右下角装饰">
                    
                    ${scriptConfig.showNightOrder ? `
                    <!-- ===== 左侧：首夜顺序 ===== -->
                    <div style="width: 65px; display: flex; flex-direction: column; align-items: center; padding-top: 110px; padding-bottom: 100px; position: relative; background-color: rgb(14, 41, 60);">
                        <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                            <!-- 顶部文字：首个夜晚 -->
                            <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 8px;">
                                <span style="font-size: 12px; font-weight: bold; color: white; letter-spacing: 2px;">首个</span>
                                <span style="font-size: 12px; font-weight: bold; color: white; letter-spacing: 2px;">夜晚</span>
                            </div>
                            ${firstNightIcons}
                        </div>
                    </div>
                    <!-- 左侧夜间顺序右侧色条 -->
                    <div style="width: 5px; background-color: rgb(3, 115, 173);"></div>
                    ` : ''}

                    <!-- ===== 中间主体 ===== -->
                    <div style="flex: 1; display: flex; flex-direction: column; padding: 0; position: relative; background-color: rgb(238, 226, 213);">
                        <!-- 顶部：标题区域 -->
                        <div style="padding: 12px 22px 4px 22px;">
                            <div style="display: flex; align-items: flex-start; justify-content: space-between;">
                                <div style="flex: 1;">
                                    ${scriptConfig.titleImage ? `<img src="${scriptConfig.titleImage}" style="max-width:300px;max-height:60px;height:auto;" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'font-size:30px;font-weight:bold;color:${scriptConfig.titleColor};font-family:SimSun,STSong,serif;letter-spacing:5px;line-height:1.2;\\'>${scriptTitle}</div>';" alt="${scriptTitle}">` : `<div style="font-size: 30px; font-weight: bold; color: ${scriptConfig.titleColor}; font-family: 'SimSun', 'STSong', serif; letter-spacing: 5px; line-height: 1.2;">${scriptTitle}</div>`}
                                    ${authorText ? `<div style="font-size: 10px; color: #6b7280; margin-top: 2px; letter-spacing: 1px;">${authorText}</div>` : ''}
                                </div>
                                ${showQrCode ? `
                                <div style="display: flex; align-items: center; justify-content: center;">
                                    <img src="${qrcodeImageSrc}" style="max-width: 120px; max-height: 120px; height: auto; border: 1px solid #e0e0e0; border-radius: 4px;" onerror="this.style.display='none'" alt="二维码">
                                </div>
                                ` : ''}
                                <div style="display: flex; align-items: flex-start; gap: 8px;">
                                    ${scriptConfig.showPlayerConfig ? `
                                    <div style="width: 310px; position: relative;">
                                        <img src="${bootleggerText ? 'images/sihuoshangren.png' : 'images/playercount.png'}" style="width: 100%; height: auto;" onerror="this.style.display='none'">
                                        ${bootleggerText ? `
                                        <div style="position: absolute; top: 55%; left: 10%; width: 80%; text-align: left; color: #333; line-height: 1.5; font-size: ${Math.max(6, 10 - bootleggerText.length / 40)}px;">
                                            ${bootleggerText.replace(/\n/g, '<br>')}
                                        </div>
                                        ` : ''}
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>

                        <!-- 角色区域（带左右边框线） -->
                        <div style="flex: 1; padding: 0 22px 0 22px; position: relative; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; overflow-y: auto;">
                            ${buildTeamSection('townsfolk', allJinxes)}
                            ${buildTeamSection('outsider', allJinxes)}
                            ${buildTeamSection('minion', allJinxes)}
                            ${buildTeamSection('demon', allJinxes)}
                            ${(() => {
                                // 添加旅行者阵营
                                const showTraveller = scriptConfig.showTraveller !== false;
                                const travellerRoles = selectedRoles.filter(r => r.team === 'traveller');
                                if (showTraveller && travellerRoles.length > 0) {
                                    return buildTeamSection('traveller', allJinxes);
                                }
                                return '';
                            })()}
                            ${(() => {
                                // 添加传奇角色阵营
                                const showFabled = scriptConfig.showFabled !== false;
                                const fabledRoles = selectedRoles.filter(r => r.team === 'fabled');
                                if (showFabled && fabledRoles.length > 0) {
                                    return buildTeamSection('fabled', allJinxes);
                                }
                                return '';
                            })()}
                            ${(() => {
                                // 添加自定义阵营
                                const activeCustomTeams = typeof getCustomTeams === 'function' ? getCustomTeams() : [];
                                let html = '';
                                activeCustomTeams.forEach(team => {
                                    html += buildTeamSection(team.id, allJinxes, { name: team.name, color: team.color, roleIds: team.roleIds });
                                });
                                return html;
                            })()}
                            
                            ${(() => {
                                // 获取状态信息 - 同时从JSON编辑器和UI表单获取（与方案二一致）
                                let statesData = [];
                                
                                const basicStates = [];
                                
                                const drunkPoisonedChecked = document.querySelector('input[name="state-type"][value="drunk_poisoned"]')?.checked;
                                const madnessChecked = document.querySelector('input[name="state-type"][value="madness"]')?.checked;
                                
                                if (drunkPoisonedChecked) {
                                    basicStates.push({ name: '醉酒与中毒', description: '醉酒或中毒的玩家会失去能力，但会认为自己仍具有能力，说书人会做出这些玩家仍然具有能力的行为。如果醉酒或中毒玩家的角色能力会给他提供信息，说书人可能会给出错误信息。醉酒或中毒的玩家不会得知自己醉酒或中毒。' });
                                }
                                if (madnessChecked) {
                                    basicStates.push({ name: '疯狂', description: '当一名玩家需要"疯狂"疯狂地证明某件事情时，意味着他应该去努力说服其他玩家那件事情是真的。' });
                                }
                                
                                statesData = [...basicStates];
                                
                                const jsonEditor = document.getElementById('json-editor-textarea');
                                if (jsonEditor && jsonEditor.value) {
                                    try {
                                        const jsonData = JSON.parse(jsonEditor.value);
                                        const meta = Array.isArray(jsonData) ? jsonData.find(item => item.id === '_meta') : jsonData._meta;
                                        if (meta && meta.states) {
                                            const jsonStates = Array.isArray(meta.states) ? meta.states : [];
                                            jsonStates.forEach(state => {
                                                const stateName = state.name || state.stateName || '';
                                                const stateDesc = state.description || state.stateDescription || state.stateDesc || '';
                                                if (stateName && stateDesc) {
                                                    const exists = statesData.some(s => s.name === stateName);
                                                    if (!exists) {
                                                        statesData.push({ name: stateName, description: stateDesc });
                                                    }
                                                }
                                            });
                                        }
                                    } catch(e) {}
                                }
                                
                                const stateInputGroups = document.querySelectorAll('#state-container .state-input-group');
                                stateInputGroups.forEach(group => {
                                    const stateName = group.querySelector('input[type="text"]')?.value.trim();
                                    const stateDesc = group.querySelector('textarea')?.value.trim();
                                    if (stateName && stateDesc) {
                                        const exists = statesData.some(s => s.name === stateName);
                                        if (!exists) {
                                            statesData.push({ name: stateName, description: stateDesc });
                                        }
                                    }
                                });
                                
                                // 获取自制规则
                                const bootleggerInput = document.getElementById('bootlegger');
                                const bootleggerText = bootleggerInput ? bootleggerInput.value.trim() : '';
                                
                                // 如果没有任何状态且没有自制规则，不显示异常状态区域
                                if (statesData.length === 0 && !bootleggerText) {
                                    return '';
                                }
                                
                                // 方案三：状态栏改为角色卡片大小，居中显示，用圆角矩形包围
                                let html = '<div style="display: flex; justify-content: center; padding-top: 8px;">';
                                html += '<div style="display: flex; align-items: flex-start; gap: ' + gap + 'px; max-width: 50%; background-color: rgb(197, 184, 172); border-radius: 8px; padding: ' + gap + 'px;">';
                                html += '<img src="images/state-icon.png" style="width: ' + imgSize + 'px; height: ' + imgSize + 'px; border-radius: 3px; flex-shrink: 0; object-fit: cover; background: #e2e8f0;" onerror="this.style.display=\'none\'">';
                                html += '<div style="flex: 1; min-width: 0;">';
                                html += '<div style="font-size: ' + abilitySize + 'px; color: #1a1a1a; line-height: 1.5;">';
                                
                                statesData.forEach(state => {
                                    let stateColor = '#dd6b20';
                                    if (state.name.includes('疯狂')) {
                                        stateColor = '#7c3aed';
                                    } else if (state.name.includes('醉酒') || state.name.includes('中毒')) {
                                        stateColor = '#c1121f';
                                    }
                                    html += `<strong style="color: ${stateColor};">${state.name}</strong>：${state.description}<br>`;
                                });
                                
                                // 自制规则
                                if (bootleggerText) {
                                    html += '<strong style="color: #d97706;">私货商人</strong>：' + bootleggerText.replace(/\n/g, '<br>');
                                }
                                
                                html += '</div>';
                                html += '</div>';
                                html += '</div>';
                                html += '</div>';
                                return html;
                            })()}
                        </div>

                        <!-- 底部装饰图片 -->
                        <div style="display: flex; justify-content: center; margin-top: auto;">
                            <img src="images/dibu.png" style="width: 100%; height: auto; max-height: 60px; object-fit: contain;" onerror="this.style.display='none'" alt="底部装饰">
                        </div>
                    </div>

                    <!-- 右侧夜间顺序左侧色条 -->
                    <div style="width: 5px; background-color: rgb(3, 115, 173);"></div>

                    <!-- ===== 右侧：其他夜晚顺序 ===== -->
                    <div style="width: 65px; display: flex; flex-direction: column; align-items: center; padding-top: 20px; padding-bottom: 100px; position: relative; background-color: rgb(14, 41, 60);">
                        ${scriptConfig.showNightOrder ? `
                        <!-- 其他夜晚顺序（与首夜顺序平齐） -->
                        <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                            <!-- 顶部文字：其他夜晚 -->
                            <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 8px;">
                                <span style="font-size: 12px; font-weight: bold; color: white; letter-spacing: 2px;">其他</span>
                                <span style="font-size: 12px; font-weight: bold; color: white; letter-spacing: 2px;">夜晚</span>
                            </div>
                            ${otherNightIcons}
                        </div>
                        ` : ''}
                    </div>

                </div>
            `;

            // 等待图片加载后截图
            const images = container.querySelectorAll('img');
            let loadedCount = 0;
            const totalImages = images.length;

            if (totalImages === 0) {
                captureAndDownload();
                return;
            }

            images.forEach(img => {
                if (img.complete) {
                    loadedCount++;
                    if (loadedCount === totalImages) captureAndDownload();
                } else {
                    img.onload = () => {
                        loadedCount++;
                        if (loadedCount === totalImages) captureAndDownload();
                    };
                    img.onerror = () => {
                        img.style.display = 'none';
                        loadedCount++;
                        if (loadedCount === totalImages) captureAndDownload();
                    };
                }
            });

            function captureAndDownload() {
                const innerEl = container.firstElementChild;
                // 临时解除高度限制，让内容完全撑开
                const origMinH = innerEl.style.minHeight;
                const origOverflow = innerEl.style.overflow;
                innerEl.style.minHeight = 'auto';
                innerEl.style.overflow = 'visible';

                html2canvas(innerEl, {
                    backgroundColor: scriptConfig.bgColor,
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    logging: false
                }).then(fullCanvas => {
                    // 恢复原始样式
                    innerEl.style.minHeight = origMinH;
                    innerEl.style.overflow = origOverflow;

                    // A4 @ 2x = 1588 × 2246
                    const A4_W = 794 * 2;
                    const A4_H = 1123 * 2;
                    const a4Canvas = document.createElement('canvas');
                    a4Canvas.width = A4_W;
                    a4Canvas.height = A4_H;
                    const ctx = a4Canvas.getContext('2d');

                    // 使用配置的背景色
                    ctx.fillStyle = scriptConfig.bgColor;
                    ctx.fillRect(0, 0, A4_W, A4_H);

                    // 等比缩放：取最小缩放比，确保全部内容不超出 A4
                    const scale = Math.min(1, A4_W / fullCanvas.width, A4_H / fullCanvas.height);
                    const drawW = Math.round(fullCanvas.width * scale);
                    const drawH = Math.round(fullCanvas.height * scale);
                    const offsetX = Math.round((A4_W - drawW) / 2);
                    const offsetY = Math.round((A4_H - drawH) / 2);

                    ctx.drawImage(fullCanvas, offsetX, offsetY, drawW, drawH);

                    const dataUrl = a4Canvas.toDataURL('image/png');
                    showScriptPreview(dataUrl);
                }).catch(err => {
                    console.error('生成剧本图失败:', err);
                    alert('生成失败，请重试。');
                });
            }

        }

// ========== 细节图生成函数 ==========
function generateDetailImage() {
    const selectedRoles = getSelectedRoles();
    if (selectedRoles.length === 0) {
        alert('请先选择角色！');
        return;
    }

    const teamNames = { 'townsfolk': '镇民', 'outsider': '外来者', 'minion': '爪牙', 'demon': '恶魔', 'traveller': '旅行者', 'fabled': '传奇角色' };

    const twilightRole = { id: 'twilight', name: '黄昏', firstNight: 0, otherNight: 0, image: 'images/dusk-CLd-DXn-QC.png' };
    const minionInfoRole = { id: 'minioninfo', name: '爪牙信息', firstNight: 2000, otherNight: 0, image: 'images/180px-Mi.png' };
    const demonInfoRole = { id: 'demoninfo', name: '恶魔信息', firstNight: 3000, otherNight: 0, image: 'images/180px-Di.png' };
    const dawnRole = { id: 'dawn', name: '黎明', firstNight: 9999, otherNight: 9999, image: 'images/dawn.png' };

    const getNightOrderFromPanel = (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return [];
        const buttons = container.querySelectorAll('.draggable-button');
        const roleIds = Array.from(buttons)
            .map(btn => btn.getAttribute('data-role-id'))
            .filter(id => id && id.trim() !== '');
        return roleIds.map(roleId => {
            if (roleId === 'twilight') return twilightRole;
            if (roleId === 'minioninfo') return minionInfoRole;
            if (roleId === 'demoninfo') return demonInfoRole;
            if (roleId === 'dawn') return dawnRole;
            const role = selectedRoles.find(r => r.id === roleId);
            if (role) return role;
            const dirRole = window.dirRolesJson.find(r => r.id === roleId);
            return dirRole || null;
        }).filter(r => r !== null);
    };

    let firstNightRoles = getNightOrderFromPanel('first-night-buttons-container');
    let otherNightRoles = getNightOrderFromPanel('other-night-buttons-container');

    if (firstNightRoles.length === 0) {
        firstNightRoles = selectedRoles.filter(r => r.firstNight > 0).sort((a, b) => a.firstNight - b.firstNight);
        firstNightRoles = [twilightRole, ...firstNightRoles, minionInfoRole, demonInfoRole, dawnRole];
    }
    if (otherNightRoles.length === 0) {
        otherNightRoles = selectedRoles.filter(r => r.otherNight > 0).sort((a, b) => a.otherNight - b.otherNight);
        otherNightRoles = [twilightRole, ...otherNightRoles, dawnRole];
    }

    const fabledRoles = selectedRoles.filter(r => r.team === 'fabled');
    const travellerRoles = selectedRoles.filter(r => r.team === 'traveller');

    const getDeduplicatedJinxes = (selectedRoleNames) => {
        const jinxData = (typeof window.jinxes !== 'undefined') ? window.jinxes : jinxes;
        const relevantJinxes = jinxData.filter(jinx => {
            return selectedRoleNames.includes(jinx.jinxRole1) && selectedRoleNames.includes(jinx.jinxRole2);
        });
        const uniqueJinxes = [];
        const seenRules = new Set();
        relevantJinxes.forEach(jinx => {
            const ruleKey = `${jinx.jinxRole1}-${jinx.jinxRole2}-${jinx.jinxRule}`;
            if (!seenRules.has(ruleKey)) {
                seenRules.add(ruleKey);
                uniqueJinxes.push(jinx);
            }
        });
        return uniqueJinxes;
    };
    const allJinxes = getDeduplicatedJinxes(selectedRoles.map(r => r.name));

    const scriptConfig = getScriptConfig();
    const scriptTitle = (scriptConfig && scriptConfig.title) ? scriptConfig.title.trim() : '未知剧本';
    const authorText = (scriptConfig && scriptConfig.author) ? scriptConfig.author.trim() : '';

    function buildNightOrderColumn(roles) {
        if (!roles || roles.length === 0) return '';
        let html = `<div style="display: flex; flex-direction: column; align-items: center;">`;
        roles.forEach((role, index) => {
            const imgSrc = role.image || '';
            html += `<div style="margin-bottom: 6px;">`;
            if (imgSrc) {
                html += `<img src="${imgSrc}" style="width:36px;height:36px;border-radius:4px;object-fit:cover;" title="${role.name}" onerror="this.style.display='none'">`;
            }
            html += `</div>`;
        });
        html += `</div>`;
        return html;
    }

    function buildSimpleRoleCard(role, color = '#666') {
        const imgSrc = role.image || '';
        let html = `<div style="display: flex; align-items: center; gap: 6px; padding: 4px 8px; background: #f8f9fa; border-radius: 4px;">`;
        if (imgSrc) {
            html += `<img src="${imgSrc}" style="width:28px;height:28px;border-radius:3px;object-fit:cover;" onerror="this.style.display='none'">`;
        }
        html += `<span style="font-size: 10px; font-weight: bold; color: ${color};">${role.name}</span>`;
        html += `</div>`;
        return html;
    }

    function buildJinxSection(jinxes) {
        if (!jinxes || jinxes.length === 0) return '';
        let html = `<div style="margin-top: 16px;">`;
        html += `<div style="display: flex; align-items: center; margin-bottom: 8px;">`;
        html += `<span style="font-size: 12px; font-weight: bold; color: #c1121f;">相克规则</span>`;
        html += `<div style="flex: 1; height: 1px; background: #c1121f; margin-left: 8px;"></div>`;
        html += `</div>`;
        html += `<div style="font-size: 9px; color: #4a5568; line-height: 1.6;">`;
        jinxes.forEach((jinx, index) => {
            const role1 = selectedRoles.find(r => r.name === jinx.jinxRole1);
            const role2 = selectedRoles.find(r => r.name === jinx.jinxRole2);
            html += `<div style="margin-bottom: 6px;">`;
            html += `<div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">`;
            if (role1 && role1.image) {
                html += `<img src="${role1.image}" style="width:18px;height:18px;border-radius:2px;object-fit:cover;" onerror="this.style.display='none'">`;
            }
            html += `<span style="font-weight: bold; color: #c1121f;">${jinx.jinxRole1}</span>`;
            html += `<span style="color: #a0aec0; margin: 0 4px;">×</span>`;
            if (role2 && role2.image) {
                html += `<img src="${role2.image}" style="width:18px;height:18px;border-radius:2px;object-fit:cover;" onerror="this.style.display='none'">`;
            }
            html += `<span style="font-weight: bold; color: #c1121f;">${jinx.jinxRole2}</span>`;
            html += `</div>`;
            html += `<div style="padding-left: 22px;">${jinx.jinxRule}</div>`;
            html += `</div>`;
        });
        html += `</div></div>`;
        return html;
    }

    function buildPlayerConfigAndRoles() {
        let html = `<div style="margin-top: 16px;">`;
        html += `<div style="width: 100%;">`;
        html += `<img src="images/playercount.png" style="width: 100%; height: auto;" alt="玩家配置图" onerror="this.style.display='none'">`;
        html += `</div>`;
        html += `<div style="margin-top: 8px; width: 100%;">`;
        const sortedRoles = [...selectedRoles].sort((a, b) => {
            const order = { townsfolk: 0, outsider: 1, minion: 2, demon: 3, traveller: 4, fabled: 5 };
            return (order[a.team] || 99) - (order[b.team] || 99);
        });
        html += `<div style="display: flex; justify-content: center; gap: 4px; flex-wrap: wrap;">`;
        sortedRoles.forEach(role => {
            const imgSrc = role.image || '';
            if (imgSrc) {
                html += `<img src="${imgSrc}" style="width: 32px; height: 32px; border-radius: 4px; object-fit: cover;" title="${role.name}" onerror="this.style.display='none'">`;
            }
        });
        html += `</div></div></div>`;
        return html;
    }

    const tempContainer = document.createElement('div');
    tempContainer.id = 'detail-image-container';
    tempContainer.style.cssText = 'position: fixed; top: -9999px; left: -9999px; width: 800px; background: #fff;';
    tempContainer.innerHTML = `
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'SimSun', 'STSong', serif; background: #fff; }
        </style>
        <div style="width: 100%; max-width: 800px; margin: 0 auto; padding: 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="font-size: 42px; font-weight: bold; color: #c1121f; letter-spacing: 8px;">${scriptTitle}</div>
                ${authorText ? `<div style="font-size: 12px; color: #6b7280; margin-top: 8px;">${authorText}</div>` : ''}
            </div>
            <div style="display: flex; gap: 24px;">
                <div style="flex-shrink: 0;">
                    ${buildNightOrderColumn(firstNightRoles)}
                </div>
                <div style="flex: 1;">
                    ${fabledRoles.length > 0 ? `
                    <div>
                        <div style="display: flex; align-items: center; margin-bottom: 12px;">
                            <img src="images/fabled.png" style="width:20px;height:20px;border-radius:3px;" onerror="this.style.display='none'">
                            <span style="font-size: 14px; font-weight: bold; color: #805ad5; margin-left: 6px;">传奇角色</span>
                            <div style="flex: 1; height: 1px; background: #805ad5; margin-left: 8px;"></div>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${fabledRoles.map(r => buildSimpleRoleCard(r, '#805ad5')).join('')}
                        </div>
                    </div>
                    ` : ''}
                    ${travellerRoles.length > 0 ? `
                    <div style="margin-top: 16px;">
                        <div style="display: flex; align-items: center; margin-bottom: 12px;">
                            <img src="images/traveller.png" style="width:20px;height:20px;border-radius:3px;" onerror="this.style.display='none'">
                            <span style="font-size: 14px; font-weight: bold; color: #9f7aea; margin-left: 6px;">旅行者</span>
                            <div style="flex: 1; height: 1px; background: #9f7aea; margin-left: 8px;"></div>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${travellerRoles.map(r => buildSimpleRoleCard(r, '#9f7aea')).join('')}
                        </div>
                    </div>
                    ` : ''}
                    ${buildJinxSection(allJinxes)}
                </div>
                <div style="flex-shrink: 0;">
                    ${buildNightOrderColumn(otherNightRoles)}
                </div>
            </div>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                ${buildPlayerConfigAndRoles()}
            </div>
        </div>
    `;
    document.body.appendChild(tempContainer);

    html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        const dataUrl = canvas.toDataURL('image/png');
        document.body.removeChild(tempContainer);
        showDetailPreview(dataUrl);
    }).catch(err => {
        if (document.getElementById('detail-image-container')) {
            document.body.removeChild(tempContainer);
        }
        console.error('生成细节图失败:', err);
        alert('生成失败，请重试。');
    });
}

function showDetailPreview(dataUrl) {
    const existing = document.getElementById('detail-preview-modal');
    if (existing) existing.remove();

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = '细节图_' + dateStr + '.png';

    const modal = document.createElement('div');
    modal.id = 'detail-preview-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:#fff;border-radius:12px;max-width:96vw;max-height:96vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #e2e8f0;flex-shrink:0;">
                <span style="font-size:16px;font-weight:bold;color:#2d3748;">细节图预览</span>
                <button onclick="this.closest('#detail-preview-modal').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#a0aec0;line-height:1;padding:0 4px;">&times;</button>
            </div>
            <div style="overflow:auto;padding:16px;flex:1;display:flex;align-items:flex-start;justify-content:center;">
                <img src="${dataUrl}" style="max-width:100%;height:auto;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,0.1);" alt="细节图预览">
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;padding:14px 20px;border-top:1px solid #e2e8f0;flex-shrink:0;">
                <button onclick="this.closest('#detail-preview-modal').remove()" style="padding:8px 24px;border:1px solid #cbd5e0;border-radius:6px;background:#fff;color:#4a5568;cursor:pointer;font-size:14px;">关闭</button>
                <button id="detail-preview-download-btn" data-url="${dataUrl}" data-filename="${fileName}" style="padding:8px 24px;border:none;border-radius:6px;background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:#fff;cursor:pointer;font-size:14px;font-weight:bold;">下载图片</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#detail-preview-download-btn').addEventListener('click', function() {
        const link = document.createElement('a');
        link.download = this.dataset.filename;
        link.href = this.dataset.url;
        link.click();
    });
}