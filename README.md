# Vendez Votre Caisse !

Idle / incrémental parodique : Franck rachète toutes les voitures, les retape, les customise et les revend de plus en plus cher. Jeu de fan non officiel, marques inventées.

## Jouer en ligne
https://swanca.github.io/vendez-votre-caisse/ — jouable sur mobile, plein écran, installable (Options → Installer le jeu), hors ligne après le premier chargement.

## Lancer en local
Depuis le dossier parent (`C:\Dev\Idle game`) :

```bash
node serve.js
```

Puis ouvre http://localhost:8080/vendez-votre-caisse/

## Bande-annonce (dossier `video/`)
- `trailer.html` : les scènes animées (1080×1920), calculées image par image (`seek(t)`) ; `?play` pour l'aperçu en direct.
- `voices.sh` : voix off naturelle (voix neuronale « Rémy » via edge-tts : `py -m pip install edge-tts`).
- `audio.sh` : musique synthétisée, effets, voix et gimmicks de Franck mixés.
- `render.js` : rendu des 900 images avec Chrome headless ; puis ffmpeg assemble `bande-annonce.mp4`.

## Boucle de jeu
1. **Tourner une pub** (gros bouton orange) → des clients appellent pour vendre leur voiture.
2. **Racheter** l'offre (à la main au début, avec le gimmick audio ; automatique après le « Standard téléphonique »).
3. L'**atelier** (mécaniciens) répare et applique le pack de customisation, puis la voiture passe en **vitrine**, où les vendeurs la vendent.
4. On réinvestit : pubs, équipe, améliorations, nouveaux lieux (du parking de la cité au Nexus du multivers), nouvelles gammes de marques (épaves → hypercars → voitures volantes → soucoupes → prototypes générés à l'infini).
5. **Atelier perso** : on customise soi-même une voiture (peinture, jantes, kit, aileron, stickers, néons, vitres, moteur, intérieur, sono) → pièce unique +15 %. Les **commandes spéciales** de clients exigent une couleur et des options précises (récompense ×3).
6. **Notoriété** : nouvelle saison de pubs = prestige, étoiles (+5 % chacune) et talents permanents.
7. **Le pré de Franck** (tout début de partie) : vache, âne, zèbre, cheval, puis le bœuf secret quand on a un animal de chaque. Chaque achat : gimmick + voix énervée (« C'EST UNE VACHE ! »).

## Systèmes avancés
- **Négociation** : mini-jeu de timing sur chaque offre manuelle (-40 % à +15 %).
- **Vices cachés** : certaines voitures demandent beaucoup plus de travail ; l'Expert automobile réduit le risque.
- **Tendances du marché** : toutes les 5 min, deux styles de carrosserie se vendent plus cher, un autre moins.
- **Coups de Franck** : 5 compétences actives avec temps de recharge (Spot choc, Coup de clé, Grande liquidation, Poignée de main, Franck en direct).
- **Enchères** : régulièrement, une édition limitée (parfois d'une gamme pas encore débloquée) contre des enchérisseurs IA.
- **Musée** : exposer des voitures donne un bonus permanent, gardé entre les saisons.
- **Collection** : chaque modèle vendu (+0,5 %) et chaque marque complète (+2 %), gardés entre les saisons.
- **Défis de Franck** : 3 objectifs tournants avec récompense.
- **Franchises** (après la 1re saison) : 12 villes jusqu'à Andromède, +10 % par niveau, gardées entre les saisons.
- Franck surprise cliquable (évènements), commandes spéciales, ~100 succès (+2 % chacun).

## Son
- `assets/franck-complet.mp3` : joué au tout premier lancement.
- `assets/franck-salut.mp3` : les 2,65 premières secondes, jouées à chaque achat (gimmick).
- `assets/voix/*.mp3` : « C'est une vache ! », etc. (voix neuronale naturelle), qui coupent Franck sur la fin de « Leboeuf » (départ 2,15 s après le début du gimmick, en Web Audio).

## Fichiers
| Fichier | Rôle |
|---|---|
| `js/data.js` | Répliques, marques, lieux, pubs, équipe, customisation, améliorations, talents, succès |
| `js/art.js` | Franck (caricature SVG), voitures et vache en SVG |
| `js/engine.js` | Simulation, achats, prestige, sauvegarde, hors-ligne |
| `js/sound.js` | Clips audio et voix de synthèse |
| `js/ui.js`, `css/style.css` | Interface |
