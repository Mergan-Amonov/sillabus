$result = Get-Process node -ErrorAction SilentlyContinue
if ($result) {
    $result | Select-Object Id, CPU, StartTime | ConvertTo-Json | Set-Content "C:\Users\User\Desktop\silabuys\findnode.log" -Encoding UTF8
    $result | Stop-Process -Force
    "Killed" | Add-Content "C:\Users\User\Desktop\silabuys\findnode.log" -Encoding UTF8
} else {
    "No node process found" | Set-Content "C:\Users\User\Desktop\silabuys\findnode.log" -Encoding UTF8
}
