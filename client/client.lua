-- ============================================================================
-- PIERCER KILLDOOR - PONTE CLIENT-SIDE E STREAMING EM TEMPO REAL PARA A NUI
-- ============================================================================

local isUiOpen = false

RegisterNetEvent('piercer_killdoor:openUI', function(state)
    isUiOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'open',
        state = state
    })
end)

RegisterNetEvent('piercer_killdoor:updateState', function(state)
    if isUiOpen then
        SendNUIMessage({
            action = 'updateState',
            state = state
        })
    end
end)

RegisterNetEvent('piercer_killdoor:liveLog', function(entry)
    if isUiOpen then
        SendNUIMessage({
            action = 'liveLog',
            entry = entry
        })
    end
end)

RegisterNetEvent('piercer_killdoor:liveProgress', function(data)
    if isUiOpen then
        SendNUIMessage({
            action = 'liveProgress',
            data = data
        })
    end
end)

RegisterNetEvent('piercer_killdoor:reportSaved', function(reportData)
    if isUiOpen then
        SendNUIMessage({
            action = 'reportSaved',
            report = reportData
        })
    end
end)

RegisterNetEvent('piercer_killdoor:notify', function(msg, level)
    BeginTextCommandThefeedPost('STRING')
    AddTextComponentSubstringPlayerName('[Piercer KillDoor] ' .. tostring(msg))
    EndTextCommandThefeedPostTicker(false, true)
end)

RegisterNUICallback('close', function(_, cb)
    isUiOpen = false
    SetNuiFocus(false, false)
    TriggerServerEvent('piercer_killdoor:uiClosed')
    cb({ ok = true })
end)

RegisterNUICallback('startScan', function(data, cb)
    TriggerServerEvent('piercer_killdoor:startScan', data)
    cb({ ok = true })
end)

RegisterNUICallback('cleanSingle', function(data, cb)
    if data and data.id then
        TriggerServerEvent('piercer_killdoor:cleanSingle', data.id)
    end
    cb({ ok = true })
end)

RegisterNUICallback('restoreSingle', function(data, cb)
    if data and data.quarantineId then
        TriggerServerEvent('piercer_killdoor:restoreSingle', data.quarantineId)
    end
    cb({ ok = true })
end)

RegisterNUICallback('saveReport', function(_, cb)
    TriggerServerEvent('piercer_killdoor:saveReport')
    cb({ ok = true })
end)
