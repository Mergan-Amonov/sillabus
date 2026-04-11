$conns = Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue
foreach ($c in $conns) {
    $p = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
    "$($c.LocalPort) PID=$($c.OwningProcess) $($p.Name) $($p.Path)" | Out-File -FilePath "C:\Users\User\Desktop\silabuys\port-info.txt" -Append
    Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
}
"done" | Out-File -FilePath "C:\Users\User\Desktop\silabuys\port-info.txt" -Append
