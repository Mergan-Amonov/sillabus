$out = @()
$conns = Get-NetTCPConnection -LocalPort 3000,3001,3002 -State Listen -ErrorAction SilentlyContinue
foreach ($c in $conns) {
    $p = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
    $out += "Port=$($c.LocalPort) PID=$($c.OwningProcess) Name=$($p.Name)"
    Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
    $out += "Killed $($c.OwningProcess)"
}
if ($out.Count -eq 0) { $out += "Nothing found on 3000/3001/3002" }
$out | Set-Content "C:\Users\User\Desktop\silabuys\kill3000.log" -Encoding UTF8
