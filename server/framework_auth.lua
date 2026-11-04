local vRP = nil
local QBCore = nil
local ESX = nil
local detectedFramework = "Standalone (ACE)"

-- Inicialização silenciosa e segura (pcall) de qualquer framework presente no servidor
CreateThread(function()
    Wait(500)

    -- 1. Tenta detectar QBox (qbx_core)
    if GetResourceState('qbx_core') == 'started' then
        detectedFramework = "QBox (qbx_core)"
    end

    -- 2. Tenta detectar QBCore (qb-core)
    if GetResourceState('qb-core') == 'started' then
        local ok, obj = pcall(function()
            return exports['qb-core']:GetCoreObject()
        end)
        if ok and obj then
            QBCore = obj
            if detectedFramework == "Standalone (ACE)" then
                detectedFramework = "QBCore"
            end
        end
    end

    -- 3. Tenta detectar ESX (es_extended)
    if GetResourceState('es_extended') == 'started' then
        local ok, obj = pcall(function()
            return exports['es_extended']:getSharedObject()
        end)
        if ok and obj then
            ESX = obj
            if detectedFramework == "Standalone (ACE)" then
                detectedFramework = "ESX"
            end
        end
    end

    -- 4. Tenta detectar vRP / vRPex / Creative / TNet
    if GetResourceState('vrp') == 'started' then
        local ok, err = pcall(function()
            local utils = LoadResourceFile('vrp', 'lib/utils.lua')
            if utils then
                local fn = load(utils, '@vrp/lib/utils.lua')
                if fn then
                    fn()
                    if Proxy and Proxy.getInterface then
                        vRP = Proxy.getInterface('vRP')
                        detectedFramework = "vRP / vRPex / Creative / TNet"
                    end
                end
            end
        end)
    end
end)

-- Função exportada para o motor Node.js (scanner.js) verificar se o jogador tem permissão
exports('GetDetectedFramework', function()
    return detectedFramework
end)

exports('IsPlayerAdmin', function(source, acePerms, adminIds, vrpPerms, fwGroups)
    local src = tonumber(source)
    if not src or src == 0 then
        return true -- Console / txAdmin tem acesso total
    end

    -- 1. Verifica Permissões ACE Nativas do FiveM (Standalone)
    if type(acePerms) == 'table' then
        for _, ace in ipairs(acePerms) do
            if IsPlayerAceAllowed(src, tostring(ace)) then
                return true
            end
        end
    end

    -- 2. Verifica Lista de Identificadores Diretos (license, discord, steam, fivem)
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

    -- 3. Verifica QBox (qbx_core)
    if GetResourceState('qbx_core') == 'started' and type(fwGroups) == 'table' then
        for _, grp in ipairs(fwGroups) do
            local ok, res = pcall(function()
                return exports.qbx_core:HasPermission(src, tostring(grp))
            end)
            if ok and res then
                return true
            end
        end
    end

    -- 4. Verifica QBCore (qb-core)
    if QBCore and QBCore.Functions and QBCore.Functions.HasPermission and type(fwGroups) == 'table' then
        for _, grp in ipairs(fwGroups) do
            local ok, res = pcall(function()
                return QBCore.Functions.HasPermission(src, tostring(grp))
            end)
            if ok and res then
                return true
            end
        end
    end

    -- 5. Verifica ESX (es_extended)
    if ESX and ESX.GetPlayerFromId and type(fwGroups) == 'table' then
        local ok, xPlayer = pcall(function()
            return ESX.GetPlayerFromId(src)
        end)
        if ok and xPlayer and xPlayer.getGroup then
            local playerGroup = tostring(xPlayer.getGroup()):lower()
            for _, grp in ipairs(fwGroups) do
                if playerGroup == tostring(grp):lower() then
                    return true
                end
            end
        end
    end

    -- 6. Verifica vRP / vRPex / Creative (v3, v4, v5, Network) / TNet
    if vRP and type(vrpPerms) == 'table' then
        local userId = nil

        -- Padrão clássico vRP / vRPex / Creative v3-v5
        if vRP.getUserId then
            local ok, id = pcall(function() return vRP.getUserId(src) end)
            if ok and id then userId = id end
        end

        -- Padrão Creative Network / TNet (Passport)
        if not userId and vRP.Passport then
            local ok, id = pcall(function() return vRP.Passport(src) end)
            if ok and id then userId = id end
        end

        if userId then
            for _, perm in ipairs(vrpPerms) do
                local pStr = tostring(perm)

                -- vRP.hasPermission (vRP / vRPex / Creative clássico)
                if vRP.hasPermission then
                    local ok, res = pcall(function() return vRP.hasPermission(userId, pStr) end)
                    if ok and res then return true end
                end

                -- vRP.HasPermission (Creative Network / TNet)
                if vRP.HasPermission then
                    local ok, res = pcall(function() return vRP.HasPermission(userId, pStr) end)
                    if ok and res then return true end
                end

                -- vRP.hasGroup / vRP.HasGroup (grupos diretos)
                if vRP.hasGroup then
                    local ok, res = pcall(function() return vRP.hasGroup(userId, pStr) end)
                    if ok and res then return true end
                end
                if vRP.HasGroup then
                    local ok, res = pcall(function() return vRP.HasGroup(userId, pStr) end)
                    if ok and res then return true end
                end
            end
        end
    end

    return false
end)
