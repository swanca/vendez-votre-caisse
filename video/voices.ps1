# Génère les voix off de la bande-annonce (voix Windows « Hortense », fr-FR)
Add-Type -AssemblyName System.Speech
$out = Join-Path $PSScriptRoot "out"
New-Item -ItemType Directory -Force $out | Out-Null
$lines = @(
  @{ f = "v_rachete"; ssml = '<prosody rate="+5%" pitch="-5%">Rachète.</prosody>' },
  @{ f = "v_custom"; ssml = '<prosody rate="+5%" pitch="-5%">Customise.</prosody>' },
  @{ f = "v_revends"; ssml = '<prosody rate="+5%" pitch="-5%">Revends.</prosody>' },
  @{ f = "v_vache"; ssml = '<prosody rate="+25%" pitch="-45%" volume="x-loud">C''EST UNE VACHE !</prosody>' },
  @{ f = "v_parade"; ssml = '<prosody rate="+8%">Des épaves… <break time="150ms"/> aux soucoupes volantes.</prosody>' },
  @{ f = "v_feats"; ssml = '<prosody rate="+12%">Enchères, coffres, musée… <break time="100ms"/> franchises.</prosody>' },
  @{ f = "v_end"; ssml = '<prosody rate="+5%" pitch="-5%">Vendez Votre Caisse ! <break time="120ms"/> Gratuit.</prosody>' }
)
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SelectVoice("Microsoft Hortense Desktop")
foreach ($l in $lines) {
  $path = Join-Path $out ($l.f + ".wav")
  $s.SetOutputToWaveFile($path)
  $s.SpeakSsml('<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="fr-FR">' + $l.ssml + '</speak>')
  $s.SetOutputToNull()
  Write-Output ("ok " + $l.f)
}
$s.Dispose()
