-- ============================================================================
-- PIERCER KILLDOOR - AUTO-ADAPTAÇÃO MULTI-FRAMEWORK VIA FRAMEZERO_BRIDGE
-- Compatível nativamente com: vRP, vRPex, Creative (todas as versões),
-- TNet, QBCore, Qbox, ESX, OxCore, NDCore e Standalone (ACE).
-- ============================================================================

local detectedFramework = "Inicializando framezero_bridge..."

CreateThread(function()
    -- Aguarda a bridge carregar e detectar automaticamente o framework da base
    if framezero and framezero.WaitReady then
        local ready = framezero.WaitReady(15000)
        if ready then
            local info = (framezero.Info and framezero.Info()) or {}
            local fw = info.framework or "Desconhecido"
            local flavor = info.vrpFlavor and (" · " .. tostring(info.vrpFlavor)) or ""
            local notifyType = info.notify and (" | Notificação: " .. tostring(info.notify)) or ""
            detectedFramework = string.format("%s%s%s", fw:upper(), flavor, notifyType)
            print(string.format("^5[Piercer KillDoor]^7 Base auto-adaptada via ^3framezero_bridge^7: ^2%s^7", detectedFramework))
        else
            detectedFramework = "Standalone (ACE)"
        end
    else
        detectedFramework = "Standalone (ACE)"
    end
end)

-- Retorna a base detectada pelo framezero_bridge
exports('GetDetectedFramework', function()
    return detectedFramework
end)

-- Envia notificação adaptada ao sistema da base através do framezero_bridge
exports('NotifyPlayer', function(source, message, kind)
    local src = tonumber(source)
    if not src or src <= 0 then return end

    local k = 'info'
    if kind == 'danger' or kind == 'error' then
        k = 'error'
    elseif kind == 'accent' or kind == 'success' then
        k = 'success'
    elseif kind == 'warn' or kind == 'warning' then
        k = 'warning'
    end

    if framezero and framezero.Notify then
        local ok = pcall(framezero.Notify, src, k, tostring(message), 6000)
        if ok then return end
    end

    TriggerClientEvent('piercer_killdoor:notify', src, tostring(message), kind)
end)

-- Verificação unificada de permissão de administrador
exports('IsPlayerAdmin', function(source, acePerms, adminIds, vrpPerms, fwGroups)
    local src = tonumber(source)
    if not src or src == 0 then
        return true -- Console do servidor / txAdmin sempre permitido
    end

    -- 1. ACE nativo do FiveM (ex: killdoor.admin, command, admin)
    if type(acePerms) == 'table' then
        for _, ace in ipairs(acePerms) do
            if IsPlayerAceAllowed(src, tostring(ace)) then
                return true
            end
        end
    end

    -- 2. Identificadores liberados diretamente no config (license, discord, fivem)
    if type(adminIds) == 'table' and #adminIds > 0 then
        local playerIds = GetPlayerIdentifiers(src)
        for _, pId in ipairs(playerIds) do
            for _, allowedId in ipairs(adminIds) do
                if string.lower(pId) == string.lower(tostring(allowedId)) then
                    return true
                end
            end
        end
    end

    -- 3. Verificação com auto-adaptação pela framezero_bridge
    if framezero and framezero.HasPermission then
        -- Permissões / Grupos de vRP / Creative / TNet
        if type(vrpPerms) == 'table' then
            for _, perm in ipairs(vrpPerms) do
                local ok, has = pcall(framezero.HasPermission, src, tostring(perm))
                if ok and has then
                    return true
                end
            end
        end

        -- Grupos de QBCore / Qbox / ESX / OxCore
        if type(fwGroups) == 'table' then
            for _, grp in ipairs(fwGroups) do
                local ok, has = pcall(framezero.HasPermission, src, tostring(grp))
                if ok and has then
                    return true
                end
            end
        end
    end

    -- 4. Fallback de contingência direta caso a bridge ainda esteja ligando
    if GetResourceState('qbx_core') == 'started' and type(fwGroups) == 'table' then
        for _, grp in ipairs(fwGroups) do
            local ok, res = pcall(function()
                return exports.qbx_core:HasPermission(src, tostring(grp))
            end)
            if ok and res then return true end
        end
    end

    if GetResourceState('qb-core') == 'started' and type(fwGroups) == 'table' then
        local ok, obj = pcall(function() return exports['qb-core']:GetCoreObject() end)
        if ok and obj and obj.Functions and obj.Functions.HasPermission then
            for _, grp in ipairs(fwGroups) do
                local okP, res = pcall(function() return obj.Functions.HasPermission(src, tostring(grp)) end)
                if okP and res then return true end
            end
        end
    end

    if GetResourceState('es_extended') == 'started' and type(fwGroups) == 'table' then
        local ok, obj = pcall(function() return exports['es_extended']:getSharedObject() end)
        if ok and obj and obj.GetPlayerFromId then
            local okX, xPlayer = pcall(function() return obj.GetPlayerFromId(src) end)
            if okX and xPlayer and xPlayer.getGroup then
                local playerGroup = tostring(xPlayer.getGroup()):lower()
                for _, grp in ipairs(fwGroups) do
                    if playerGroup == tostring(grp):lower() then return true end
                end
            end
        end
    end

    return false
end)
