Write-Host "Wiping existing mingit installations..."
Remove-Item -Path "C:\Users\Public\mingit*" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Downloading MinGit..."
Start-BitsTransfer -Source "https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/MinGit-2.43.0-64-bit.zip" -Destination "C:\Users\Public\mingit.zip"

Write-Host "Extracting MinGit..."
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory("C:\Users\Public\mingit.zip", "C:\Users\Public\mingit")

$gitPath = "C:\Users\Public\mingit\cmd\git.exe"
Write-Host "Verifying git installation..."
& $gitPath --version

Write-Host "Initializing git repository..."
& $gitPath init

Write-Host "Configuring Git user credentials..."
& $gitPath config user.name "munnarathod222"
& $gitPath config user.email "munnarathod222@gmail.com"
& $gitPath config --global safe.directory '*'

Write-Host "Setting remote origin..."
& $gitPath remote remove origin | Out-Null
$token = "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"
$remoteUrl = "https://oauth2:$($token)@github.com/munnarathod222/my-awesome-website.git"
& $gitPath remote add origin $remoteUrl

Write-Host "Adding files..."
& $gitPath add .

Write-Host "Creating commit..."
& $gitPath commit -m "Deploy complete logistics dashboard and Supabase database sync configurations"

Write-Host "Renaming branch..."
& $gitPath branch -M main

Write-Host "Pushing files to GitHub..."
& $gitPath push -u origin main --force

Write-Host "Cleaning up zip file..."
Remove-Item -Path "C:\Users\Public\mingit.zip" -Force -ErrorAction SilentlyContinue
Write-Host "🎉 Code successfully uploaded to GitHub!"
