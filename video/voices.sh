#!/usr/bin/env bash
# Voix off de la bande-annonce : voix neuronale naturelle (edge-tts, « Rémy »)
# Prérequis : py -m pip install edge-tts
set -e
cd "$(dirname "$0")"
mkdir -p out
V=fr-FR-RemyMultilingualNeural
gen() { # fichier, vitesse, texte
  py -m edge_tts --voice "$V" --rate="$2" --pitch="-4Hz" --text "$3" --write-media "out/$1.mp3" >/dev/null
  ffmpeg -hide_banner -loglevel error -y -i "out/$1.mp3" -af "silenceremove=start_periods=1:start_threshold=-40dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,acompressor=threshold=-20dB:ratio=3:makeup=3,loudnorm=I=-14:TP=-1.5" -ar 44100 "out/$1.wav"
  echo "ok $1 $(ffprobe -v error -show_entries format=duration -of csv=p=0 "out/$1.wav")s"
}
gen v_rachete "+5%" "Rachète."
gen v_custom "+5%" "Customise."
gen v_revends "+5%" "Revends."
gen v_parade "+5%" "Des épaves... aux soucoupes volantes."
gen v_feats "+10%" "Enchères, coffres, musée... franchises."
gen v_end "+5%" "Vendez Votre Caisse ! Gratuit."
# la vache : même fichier que dans le jeu (assets/voix/vache.mp3)
