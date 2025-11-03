$bytes = New-Object byte[] 32
$rng = New-Object Security.Cryptography.RNGCryptoServiceProvider
$rng.GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)
Write-Output $secret
