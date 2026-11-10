#!/usr/bin/env bash
# Bande-son de la bande-annonce : musique synthétisée + impacts + pièces + voix + gimmicks de Franck
set -e
cd "$(dirname "$0")/out"
A=../../assets
D=30
# --- musique (120 BPM) : grosse caisse, caisse claire, charleston, basse
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "aevalsrc='\
0.95*sin(2*PI*55*mod(t,0.5)*exp(-mod(t,0.5)*5))*exp(-mod(t,0.5)*7)\
+0.35*(random(0)*2-1)*exp(-mod(t-0.5,1)*16)*gte(mod(t,1),0.5)\
+0.12*(random(1)*2-1)*exp(-mod(t+0.25,0.5)*45)\
+0.28*sin(2*PI*(55*if(lt(mod(t,8),2),1,if(lt(mod(t,8),4),1.335,if(lt(mod(t,8),6),1.19,0.89))))*t)*(0.6+0.4*sin(2*PI*2*t))\
+0.08*sin(2*PI*(440*if(lt(mod(t,8),2),1,if(lt(mod(t,8),4),1.335,if(lt(mod(t,8),6),1.19,0.89))))*t)*exp(-mod(t,0.25)*10)\
':s=44100:d=$D" -af "highpass=f=30,lowpass=f=9000,volume=0.55,afade=t=in:d=0.4,afade=t=out:st=28.6:d=1.4" music.wav
# --- impact (boum + souffle) et pièce (ding)
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "aevalsrc='0.9*sin(2*PI*48*t*exp(-t*3))*exp(-t*5)+0.4*(random(0)*2-1)*exp(-t*14)':s=44100:d=0.9" impact.wav
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "aevalsrc='0.35*(sin(2*PI*1975*t)+0.6*sin(2*PI*2637*t))*exp(-t*9)*lt(t,0.09)+0.35*(sin(2*PI*2637*t)+0.5*sin(2*PI*3951*t))*exp(-(t-0.09)*7)*gte(t,0.09)':s=44100:d=0.8" coin.wav
# --- whoosh de transition
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "anoisesrc=d=0.5:c=pink:a=0.6" -af "bandpass=f=1800:w=1500,afade=t=in:d=0.3,afade=t=out:st=0.3:d=0.2" whoosh.wav
# --- placement : [fichier, temps (s), volume]
EVENTS=(
  "$A/franck-salut.mp3 0.30 1.0"
  "whoosh.wav 2.75 0.8"
  "impact.wav 3.00 0.9" "v_rachete.wav 3.10 1.0"
  "impact.wav 4.25 0.7" "v_custom.wav 4.30 1.0"
  "impact.wav 5.55 0.9" "v_revends.wav 5.60 1.0" "coin.wav 5.62 0.9" "coin.wav 5.80 0.7" "coin.wav 6.00 0.6"
  "whoosh.wav 6.60 0.8" "$A/franck-salut.mp3 6.80 1.0"
  "impact.wav 8.95 1.0" "$A/voix/vache.mp3 8.95 1.3"
  "whoosh.wav 10.80 0.8"
  "impact.wav 13.35 1.0" "$A/franck-salut.mp3 13.20 0.95" "coin.wav 13.40 0.6"
  "whoosh.wav 14.80 0.8" "v_parade.wav 15.30 1.0"
  "whoosh.wav 19.80 0.8" "v_feats.wav 20.30 1.0" "impact.wav 20.60 0.7" "coin.wav 20.65 0.7" "impact.wav 21.80 0.6" "coin.wav 21.85 0.8"
  "whoosh.wav 24.80 0.8" "impact.wav 25.35 0.9" "$A/franck-salut.mp3 25.10 1.0"
  "v_end.wav 27.60 1.0" "coin.wav 28.10 0.5"
)
IN=(-i music.wav)
F=""
i=1
for e in "${EVENTS[@]}"; do
  set -- $e
  IN+=(-i "$1")
  ms=$(awk "BEGIN{printf \"%d\", $2*1000}")
  F+="[$i:a]aresample=44100,aformat=channel_layouts=stereo,volume=$3,adelay=${ms}|${ms}[a$i];"
  i=$((i+1))
done
MIX="[0:a]aformat=channel_layouts=stereo,volume=0.42[m];"
LABELS="[m]"
for ((k=1;k<i;k++)); do LABELS+="[a$k]"; done
ffmpeg -hide_banner -loglevel error -y "${IN[@]}" -filter_complex "${F}${MIX}${LABELS}amix=inputs=$i:normalize=0:dropout_transition=0,atrim=0:$D,alimiter=limit=0.95,loudnorm=I=-14:TP=-1.2:LRA=9" -ar 48000 soundtrack.wav
echo "bande-son ok"
