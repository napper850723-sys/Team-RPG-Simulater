# Create images directory if it doesn't exist
if (-not (Test-Path "images")) {
    New-Item -ItemType Directory -Path "images" -Force
}

# Image configuration using DiceBear API
$images = @(
    @{filename='hero.png'; seed='hero-warrior'},
    @{filename='wizard.png'; seed='wizard-mage'},
    @{filename='knight.png'; seed='knight-armor'},
    @{filename='archer.png'; seed='archer-bow'},
    @{filename='priest.png'; seed='priest-holy'},
    @{filename='assassin.png'; seed='assassin-dark'},
    @{filename='warrior.png'; seed='warrior-sword'},
    @{filename='witch.png'; seed='witch-magic'},
    @{filename='paladin.png'; seed='paladin-shield'},
    @{filename='goblin.png'; seed='goblin-monster'},
    @{filename='orc.png'; seed='orc-beast'},
    @{filename='skeleton.png'; seed='skeleton-undead'},
    @{filename='zombie.png'; seed='zombie-dead'},
    @{filename='vampire.png'; seed='vampire-dark'},
    @{filename='werewolf.png'; seed='werewolf-wolf'},
    @{filename='gargoyle.png'; seed='gargoyle-stone'},
    @{filename='lich.png'; seed='lich-lichking'},
    @{filename='dragon.png'; seed='dragon-fire'}
)

# Generate and save images using DiceBear API
foreach ($img in $images) {
    try {
        $url = "https://api.dicebear.com/7.x/bottts/png?seed=$($img.seed)&size=200"
        $response = Invoke-WebRequest -Uri $url -ErrorAction Stop -UseBasicParsing
        $imagePath = "images\$($img.filename)"
        $response.Content | Set-Content -Path $imagePath -Encoding Byte
        Write-Host "Generated: $($img.filename)"
    } catch {
        Write-Host "Error generating $($img.filename): $($_.Exception.Message)"
    }
}

Write-Host "`nImage generation complete!"