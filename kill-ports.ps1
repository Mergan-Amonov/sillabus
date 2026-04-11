foreach ($port in @(3000, 3001, 3002, 3003)) {
  $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
  if ($conn) {
    $pids = $conn.OwningProcess | Sort-Object -Unique
    foreach ($p in $pids) {
      $proc = Get-Process -Id $p -ErrorAction SilentlyContinue
      Write-Host "Port $port : PID=$p Name=$($proc.Name) - killing..."
      Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
  }
}
Write-Host "Done."
