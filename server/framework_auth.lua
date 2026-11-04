local vRP = nil
local QBCore = nil
local ESX = nil
local detectedFramework = "Standalone (ACE)"

CreateThread(function()
    Wait(500)

    if GetResourceState('qbx_core') == 'started' then
        detectedFramework = "QBox (qbx_core)"
    end

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

exports('GetDetectedFramework', function()
    return detectedFramework
end)

exports('IsPlayerAdmin', function(source, acePerms, adminIds, vrpPerms, fwGroups)
    local src = tonumber(source)
    if not src or src == 0 then
        return true 
    end

    if type(acePerms) == 'table' then
        for _, ace in ipairs(acePerms) do
            if IsPlayerAceAllowed(src, tostring(ace)) then
                return true
            end
        end
    end

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

    if vRP and type(vrpPerms) == 'table' then
        local userId = nil

        if vRP.getUserId then
            local ok, id = pcall(function() return vRP.getUserId(src) end)
            if ok and id then userId = id end
        end

        if not userId and vRP.Passport then
            local ok, id = pcall(function() return vRP.Passport(src) end)
            if ok and id then userId = id end
        end

        if userId then
            for _, perm in ipairs(vrpPerms) do
                local pStr = tostring(perm)

                if vRP.hasPermission then
                    local ok, res = pcall(function() return vRP.hasPermission(userId, pStr) end)
                    if ok and res then return true end
                end

                if vRP.HasPermission then
                    local ok, res = pcall(function() return vRP.HasPermission(userId, pStr) end)
                    if ok and res then return true end
                end

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
