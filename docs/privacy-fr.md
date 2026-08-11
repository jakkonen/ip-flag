# Politique de confidentialité d’IP Flag

Date d’entrée en vigueur : 11 août 2026.

[English](privacy.html) · [Русский](privacy-ru.html)

IP Flag est une extension de navigateur qui affiche localement la manière dont le navigateur apparaît sur Internet : ses adresses IPv4/IPv6 publiques, le pays de sortie et l’organisation réseau.

## Données traitées

L’extension contacte des services externes afin de déterminer les adresses IPv4 et IPv6 publiques du navigateur. Elle transmet ensuite ces adresses à un service GeoIP afin de déterminer le pays et l’organisation réseau.

La version actuelle utilise `api.ipify.org` pour l’IPv4 publique, `api6.ipify.org` pour l’IPv6 publique et `api.ipapi.is` pour le pays, l’ASN et l’organisation réseau.

## Données non collectées

IP Flag ne demande ni n’accède à l’historique de navigation, aux URL visitées, au contenu des pages, aux cookies, aux requêtes de recherche, aux mots de passe, aux données de compte ou à la localisation précise de l’appareil.

L’extension n’utilise ni analytique, ni publicité, ni télémétrie, ni synchronisation cloud, ni backend exploité par le développeur.

## Stockage local et transfert

L’état réseau actuel, le style de drapeau sélectionné et un petit cache GeoIP sont stockés uniquement dans le stockage local de l’extension. Le cache est conservé jusqu’à 24 heures et contient au plus 50 adresses IP.

Une adresse IP publique est envoyée aux services indiqués uniquement pour fournir la fonction principale de l’extension, via HTTPS.

## Modifications de cette politique

Cette page sera mise à jour avec une nouvelle version de l’extension si le traitement des données change de manière significative.
