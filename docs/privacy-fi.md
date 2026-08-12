# IP Flagin tietosuojakäytäntö

Voimassa 11. elokuuta 2026 alkaen.

[English](privacy.html) · [Русский](privacy-ru.html)

IP Flag on selainlaajennus, joka näyttää paikallisesti, miltä selain näkyy internetissä: sen julkiset IPv4/IPv6-osoitteet, internet-yhteyden lähtömaan ja verkko-organisaation.

## Käsiteltävät tiedot

Laajennus ottaa yhteyden ulkoisiin palveluihin selaimen julkisten IPv4- ja IPv6-osoitteiden selvittämiseksi. Tämän jälkeen osoitteet lähetetään GeoIP-palvelulle maan ja verkko-organisaation selvittämistä varten.

Nykyinen versio käyttää seuraavia palveluita:

- `api.ipify.org` julkiselle IPv4-osoitteelle;
- `api6.ipify.org` julkiselle IPv6-osoitteelle;
- `api.ipapi.is` maalle, ASN:lle ja verkko-organisaatiolle.
- `ipwho.is` valinnaiseen alueen ja kaupungin hakuun vain, kun käyttäjä ottaa asetuksen käyttöön.

## Tiedot, joita ei kerätä

IP Flag ei pyydä tai käytä selaushistoriaa, vierailtuja URL-osoitteita, sivujen sisältöä, evästeitä, hakukyselyitä, salasanoja, tilitietoja tai laitteen tarkkaa sijaintia.

Laajennus ei käytä analytiikkaa, mainontaa, telemetriaa, pilvisynkronointia tai kehittäjän ylläpitämää palvelinta.

## Paikallinen tallennus

Nykyinen verkkotila, valitut asetukset ja pieni GeoIP-välimuisti tallennetaan vain selaimen laajennuksen paikalliseen tallennustilaan. GeoIP-välimuistia säilytetään enintään kolme päivää ja siinä on enintään 50 IP-osoitetta.

## Tietojen siirto

Julkinen IP-osoite lähetetään yllä luetelluille palveluille vain laajennuksen ydintoiminnon toteuttamiseksi. Siirrot käyttävät HTTPS:ää.

## Muutokset tähän käytäntöön

Tämä sivu päivitetään uuden laajennusversion yhteydessä, jos tietojen käsittely muuttuu olennaisesti.
